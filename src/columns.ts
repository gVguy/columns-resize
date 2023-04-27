import { Column } from './column'
import * as ClassNames from './class-names'

export class Columns {
  columns: Column[] = []
  private rootElement: HTMLElement
  private opts?: ColumnsOpts
  private targetColumn?: Column
  private lastResizeEventX: number = 0
  private lastGrowingColumn?: Column|null
  private lastShrinkingColumn?: Column|null
  private initialWidths = new Map<string, number>()
  private isPointerDown = false

  constructor(rootElement: HTMLElement, opts?: ColumnsOpts) {
    this.rootElement = rootElement
    this.opts = opts
    this.init()
    this.prepare()
    this.connect()
  }

  private init() {
    const {
      minWidthByColumnId = {},
      defaultMinWidth = 50,
      autoResizeHandles = false
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
        autoResizeHandles
      ))
    })
  }

  private trackColumnsChange() {
    const columnsKeys = this.columns.map(col => col.id)
    return (
      this.initialWidths.size != columnsKeys.length ||
      !columnsKeys.every(key => this.initialWidths.has(key))
    )
  }
  private overwriteInitialWidths() {
    this.initialWidths.clear()
    this.columns.forEach(col => {
      this.initialWidths.set(col.id, col.width)
    })
  }

  private prepare() {
    const columnsChanged = this.trackColumnsChange()
    Promise.all(
      this.columns.map(col => new Promise<void>(resolve => {
        col.elements.forEach(el => {
          el.style.boxSizing = 'border-box'
          el.style.overflow = 'hidden'
          el.style.minWidth = col.minWidth + 'px'
        })
        if (columnsChanged) {
          requestAnimationFrame(() => {
            col.getWidth()
            col.setWidthDiff(0, true)
            resolve()
          })
        } else {
          resolve()
        }
      }))
    ).then(() => {
      if (columnsChanged) {
        this.overwriteInitialWidths()
      }
    })
  }

  connect() {
    this.columns.forEach(col => col.connectHandlebars())
    this.rootElement.classList.add(ClassNames.CONNECTED)
  }

  disconnect() {
    if (this.isPointerDown) {
      this.onPointerUp()
    }
    this.columns.forEach(col => col.disconnectHandlebars())
    this.rootElement.classList.remove(ClassNames.CONNECTED)
  }

  reconnect() {
    this.disconnect()
    this.init()
    this.prepare()
    this.connect()
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
}

type ColumnsOpts = {
  defaultMinWidth?: number,
  minWidthByColumnId?: {
    [key: string]: number
  }
  autoResizeHandles?: boolean
  onResizeStart?: () => void
  onResizeEnd?: () => void
}

type HandleEl = HTMLElement & { targetColumn: Column }
