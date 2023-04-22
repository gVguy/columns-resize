import { Column,  } from './column'

export class Columns {
  columns: Column[] = []
  private rootElement: HTMLElement
  private opts?: ColumnsOpts
  private targetColumn?: Column
  private lastResizeEventX: number = 0

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
      sizeUnit = 'px'
    } = this.opts || {}

    this.columns = []

    const allColumnElements = [
      ...this.rootElement.querySelectorAll('[data-column-id]')
    ] as HTMLElement[]
    const allColumnIds = new Set(allColumnElements.map(el => el.dataset.columnId!))

    allColumnIds.forEach(id => {
      this.columns.push(new Column(
        allColumnElements.filter(el => el.dataset.columnId == id),
        this,
        id in minWidthByColumnId ? minWidthByColumnId[id] : defaultMinWidth,
        sizeUnit
      ))
    })
  }

  private prepare() {
    this.columns.forEach(col => {
      col.elements.forEach(el => {
        el.style.boxSizing = 'border-box'
        el.style.overflow = 'hidden'
        el.style.minWidth = col.minWidth + 'px'
      })
      requestAnimationFrame(() => {
        col.getWidth()
        col.setWidthDiff(0)
      })
    })
  }

  connect(isConnect = true) {
    this.columns.forEach(col => {
      col.elements.forEach(el => {
        const handleEl = el.querySelector<HandleEl>('[data-resize-handle]')
        if (!handleEl) return
        handleEl.targetColumn = col
        if (isConnect) {
          handleEl.addEventListener('pointerdown', this.onPointerDown)
        } else {
          handleEl.removeEventListener('pointerdown', this.onPointerDown)
        }
      })
    })
  }

  disconnect() {
    this.onPointerUp()
    this.connect(false)
  }

  reconnect() {
    this.disconnect()
    this.init()
    this.prepare()
    this.connect()
  }

  private onPointerDown = (e: PointerEvent) => {
    this.columns.forEach(col => {
      col.getWidth()
      col.setWidthDiff(0)
    })
    this.lastResizeEventX = e.clientX
    this.targetColumn = (e.target as HandleEl).targetColumn
    document.addEventListener('pointerup', this.onPointerUp, { once: true })
    document.addEventListener('pointermove', this.onPointerMove)
  }
  private onPointerUp = () => {
    document.removeEventListener('pointermove', this.onPointerMove)
  }
  private onPointerMove = (e: PointerEvent) => {
    const diff = e.clientX - this.lastResizeEventX
    const diffAbs = Math.abs(diff)
    let shrinkingCol, growingCol
    if (diff < 0) {
      shrinkingCol = this.targetColumn?.selfOrPreviousShrinkable
      growingCol = this.targetColumn?.next
    } else {
      shrinkingCol = this.targetColumn?.nextShrinkable
      growingCol = this.targetColumn
    }
    if (!shrinkingCol || !growingCol) return
    shrinkingCol.setWidthDiff(-diffAbs)
    growingCol.setWidthDiff(diffAbs)
    this.lastResizeEventX = e.clientX
  }
}

type ColumnsOpts = {
  defaultMinWidth?: number,
  minWidthByColumnId?: {
    [key: string]: number
  }
  sizeUnit?: SizeUnit
}

type HandleEl = HTMLElement & { targetColumn: Column }

export type SizeUnit = 'px'|'vw'
