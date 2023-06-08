import { Column } from './column'
import * as ClassNames from './class-names'

export class Columns {
  columns: Column[] = []
  totalWidth: number = 0
  private rootElement: HTMLElement
  private opts?: ColumnsOpts
  private targetColumn?: Column
  private lastResizeEventX: number = 0
  private lastGrowingColumn?: Column|null
  private lastShrinkingColumn?: Column|null
  private initialWidths = new Map<string, number>()
  private lastWidths = new Map<string, number>()
  private isPointerDown = false
  private pendingCallbacks: [string, Function][] = []
  private isInit = false

  constructor(rootElement: HTMLElement, opts?: ColumnsOpts) {
    this.rootElement = rootElement
    this.opts = opts
    this.init()
  }

  private async init() {
    this.logger?.log('init runs')
    this.isInit = false

    const {
      minWidthByColumnId = {},
      defaultMinWidth = 50,
      autoResizeHandles = false,
      minWidthFormat = 'px'
    } = this.opts || {}

    this.columns = []

    const allColumnElements = [
      ...this.rootElement.querySelectorAll('[data-column-id]')
    ] as HTMLElement[]
    const allColumnIds = new Set(allColumnElements.map(el => el.dataset.columnId!))

    allColumnIds.forEach(id => {
      this.columns.push(new Column(
        id,
        allColumnElements.filter(el => el.dataset.columnId == id),
        this,
        id in minWidthByColumnId ? minWidthByColumnId[id] : defaultMinWidth,
        autoResizeHandles,
        id in minWidthByColumnId ? minWidthFormat : 'px'
      ))
    })

    await this.prepare()
    this.connect()

    this.isInit = true
    this.logger?.log('init done')

    this.callPendingCallbacks()
  }

  private async callPendingCallbacks() {
    const pendingCallbacks = this.pendingCallbacks
    if (!pendingCallbacks.length) return
    this.pendingCallbacks = []
    this.logger?.log('calling pending callbacks')
    for (const [_id, cb] of pendingCallbacks) {
      await cb()
    }
  }

  private addDedupedPendingCallback(id: string, cb: Function) {
    if (this.isInit) {
      cb()
      return
    }
    this.pendingCallbacks = this.pendingCallbacks.filter(([pendingId]) => (
      id !== pendingId
    ))
    this.pendingCallbacks.push([id, cb])
    this.logger?.log('added pending callback "'+id+'" to run after init (deduped)', this.pendingCallbacks.map(([id]) => id))
  }

  private trackColumnsChange() {
    const columnsKeys = this.columns.map(col => col.id)
    return (
      this.initialWidths.size != columnsKeys.length ||
      !columnsKeys.every(key => this.initialWidths.has(key))
    )
  }

  private overwriteWidthsMap(map: Map<string, number>) {
    map.clear()
    this.columns.forEach(col => {
      map.set(col.id, col.width)
    })
  }

  private calculateTotalWidth() {
    this.totalWidth = this.columns.reduce((a,b) => a + b.width, 0)
  }

  private async prepare() {
    const columnsChanged = this.trackColumnsChange()
    this.calculateTotalWidth()
    await Promise.all(
      this.columns.map(col => new Promise<void>(resolve => {
        col.elements.forEach(el => {
          el.style.boxSizing = 'border-box'
          el.style.overflow = 'hidden'
          el.style.minWidth = col.minWidth + 'px'
        })
        requestAnimationFrame(() => {
          if (columnsChanged) {
            col.getWidth()
          } else {
            col.width = this.lastWidths.get(col.id)!
          }
          col.setWidthDiff(0, true)
          resolve()
        })
      }))
    ).then(() => {
      if (columnsChanged) {
        this.overwriteWidthsMap(this.initialWidths)
      }
    })
  }

  private connect() {
    this.columns.forEach(col => col.connectHandlebars())
    this.rootElement.classList.add(ClassNames.CONNECTED)
  }

  disconnect() {
    this.logger?.log('disconnect called')
    this.addDedupedPendingCallback('disconnect', () => {
      this.logger?.log('disconnect runs')
      if (this.isPointerDown) {
        this.onPointerUp()
      }
      this.overwriteWidthsMap(this.lastWidths)
      this.columns.forEach(col => col.disconnectHandlebars())
      this.rootElement.classList.remove(ClassNames.CONNECTED)
      this.logger?.log('disconnect done')
    })
  }

  reconnect() {
    this.logger?.log('reconnect called')
    this.addDedupedPendingCallback('reconnect', async () => {
      this.logger?.log('reconnect runs')
      this.disconnect()
      await this.init()
      this.logger?.log('reconnect done')
    })
  }

  reset() {
    this.columns.forEach(col => {
      col.width = this.initialWidths.get(col.id)!
      col.setWidthDiff(0, true)
    })
  }

  onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true
    this.columns.forEach(col => {
      col.getWidth()
      col.setWidthDiff(0)
    })
    this.calculateTotalWidth()
    this.lastResizeEventX = e.clientX
    this.targetColumn = (e.target as HandleEl).targetColumn
    document.addEventListener('pointerup', this.onPointerUp, { once: true })
    document.addEventListener('pointermove', this.onPointerMove)
    this.rootElement.classList.add(ClassNames.ACTIVE)
    this.targetColumn.addHandlebarsClass(ClassNames.ACTIVE)
    this.opts?.onResizeStart?.()
  }

  private onPointerUp = () => {
    this.isPointerDown = false
    this.columns.forEach(col => col.setWidthDiff(0, true))
    document.removeEventListener('pointermove', this.onPointerMove)
    this.rootElement.classList.remove(ClassNames.ACTIVE)
    this.targetColumn?.removeHandlebarsClass(ClassNames.ACTIVE)
    this.handleColumnsClasses(null, null)
    this.opts?.onResizeEnd?.()
  }

  private onPointerMove = (e: PointerEvent) => {
    const diff = e.clientX - this.lastResizeEventX
    let shrinkingCol, growingCol
    if (diff < 0) {
      shrinkingCol = this.targetColumn?.selfOrPreviousShrinkable
      growingCol = this.targetColumn?.next
    } else {
      shrinkingCol = this.targetColumn?.nextShrinkable
      growingCol = this.targetColumn
    }
    if (!shrinkingCol || !growingCol) return
    const diffAbs = Math.min(
      Math.abs(diff),
      shrinkingCol.width - shrinkingCol.minWidth
    )
    shrinkingCol.setWidthDiff(-diffAbs)
    growingCol.setWidthDiff(diffAbs)
    this.handleColumnsClasses(growingCol, shrinkingCol)
    this.lastResizeEventX = e.clientX
  }
  
  private handleColumnsClasses(growingCol: Column|null, shrinkingCol: Column|null) {
    if (this.lastGrowingColumn != growingCol) {
      growingCol?.addElementsClass(ClassNames.ACTIVE)
      growingCol?.addElementsClass(ClassNames.GROWING)
      this.lastGrowingColumn?.removeElementsClass(ClassNames.GROWING)
      if (this.lastGrowingColumn != shrinkingCol) {
        this.lastGrowingColumn?.removeElementsClass(ClassNames.ACTIVE)
      }
    }
    if (this.lastShrinkingColumn != shrinkingCol) {
      shrinkingCol?.addElementsClass(ClassNames.ACTIVE)
      shrinkingCol?.addElementsClass(ClassNames.SHRINKING)
      this.lastShrinkingColumn?.removeElementsClass(ClassNames.SHRINKING)
      if (this.lastShrinkingColumn != growingCol) {
        this.lastShrinkingColumn?.removeElementsClass(ClassNames.ACTIVE)
      }
    }
    this.lastGrowingColumn = growingCol
    this.lastShrinkingColumn = shrinkingCol
  }

  get logger() {
    if (!this.opts?.logs) return
    return console
  }
}

type ColumnsOpts = {
  defaultMinWidth?: number,
  minWidthByColumnId?: {
    [key: string]: number
  },
  minWidthFormat?: MinWidthFormat
  autoResizeHandles?: boolean
  onResizeStart?: () => void
  onResizeEnd?: () => void
  logs?: boolean
}

export type MinWidthFormat = 'px'|'0-1'

type HandleEl = HTMLElement & { targetColumn: Column }
