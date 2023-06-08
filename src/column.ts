import type { Columns, MinWidthFormat } from './columns'
import * as ClassNames from './class-names'

export class Column {
  elements: HTMLElement[]
  minWidthRaw: number
  width: number = 0
  idx: number
  columns: Columns
  handleElements: (HandleEl)[] = []
  id: string
  autoResizeHandles: boolean
  isHover = false
  minWidthFormat: MinWidthFormat
  
  constructor(
    id: string,
    elements: HTMLElement[],
    columns: Columns,
    minWidth: number,
    autoResizeHandles: boolean,
    minWidthFormat: MinWidthFormat
  ) {
    this.id = id
    this.elements = elements
    this.columns = columns
    this.idx = columns.columns.length
    this.minWidthRaw = minWidth
    this.autoResizeHandles = autoResizeHandles
    this.minWidthFormat = minWidthFormat
  }

  get next() {
    return this.columns.columns[this.idx + 1]
  }
  get previous() {
    return this.columns.columns[this.idx - 1]
  }
  get minWidth() {
    if (this.minWidthFormat == 'px') {
      return this.minWidthRaw
    } else {
      return this.minWidthRaw * this.columns.totalWidth
    }
  }
  get canShrink() {
    return this.width > this.minWidth
  }
  get nextShrinkable() {
    let col: Column = this.next
    while (col) {
      if (col.canShrink) break
      col = col.next
    }
    return col
  }
  get selfOrPreviousShrinkable() {
    let col: Column = this
    while (col) {
      if (col.canShrink) break
      col = col.previous
    }
    return col
  }
  get isLast() {
    return this.idx == this.columns.columns.length - 1
  }
  getWidth() {
    const allClientWidths = this.elements.map(el => el.clientWidth)
    const avgColWidth = allClientWidths.reduce((p,c) => p + c, 0) / allClientWidths.length
    this.width = avgColWidth
  }
  setWidthDiff(diff: number, allowGrow = false) {
    this.width += diff
    const shrink = allowGrow ? (this.canShrink ? '1' : '0') : '0'
    const grow = allowGrow ? '1' : '0'
    const basis = `${this.width}px`
    this.elements.forEach(el => {
      el.style.flex = `${grow} ${shrink} ${basis}`
    })
  }

  createHandlebars() {
    if (this.idx == this.columns.columns.length - 1) return
    this.elements.forEach(el => {
      if (el.closest('[data-no-auto-resize-handles]')) return
      if (el.querySelector('[data-resize-handle]')) return
      const handleEl = document.createElement('div') as unknown as HandleEl
      handleEl.targetColumn = this
      handleEl.setAttribute('data-resize-handle', '')
      el.append(handleEl)
    })
  }
  connectHandlebars() {
    this.handleElements = []
    if (this.autoResizeHandles) {
      this.createHandlebars() 
    }
    this.elements.forEach(el => {
      const handleEl = el.querySelector<HandleEl>('[data-resize-handle]')
      if (!handleEl) return
      handleEl.targetColumn = this
      this.handleElements.push(handleEl)
    })
    this.handleElements.forEach(handleEl => {
      handleEl.addEventListener('pointerdown', this.columns.onPointerDown)
      handleEl.addEventListener('pointerenter', this.onPointerEnter)
      handleEl.addEventListener('pointerleave', this.onPointerLeave)
    })
    this.addElementsClass(ClassNames.CONNECTED)
    this.addHandlebarsClass(ClassNames.CONNECTED)
  }
  disconnectHandlebars() {
    this.handleElements.forEach(handleEl => {
      handleEl.removeEventListener('pointerdown', this.columns.onPointerDown)
      handleEl.removeEventListener('pointerenter', this.onPointerEnter)
      handleEl.removeEventListener('pointerleave', this.onPointerLeave)
    })
    this.removeElementsClass(ClassNames.CONNECTED)
    this.removeHandlebarsClass(ClassNames.CONNECTED)
  }

  addElementsClass(className: string) {
    this.elements.forEach(el => {
      el.classList.add(className)
    })
  }
  removeElementsClass(className: string) {
    this.elements.forEach(el => {
      el.classList.remove(className)
    })
  }
  addHandlebarsClass(className: string) {
    this.handleElements.forEach(el => {
      el.classList.add(className)
    })
  }
  removeHandlebarsClass(className: string) {
    this.handleElements.forEach(el => {
      el.classList.remove(className)
    })
  }

  onPointerEnter = () => {
    this.addHandlebarsClass(ClassNames.HOVER)
  }
  onPointerLeave = () => {
    this.removeHandlebarsClass(ClassNames.HOVER)
  }
}

type HandleEl = HTMLElement & { targetColumn: Column }
