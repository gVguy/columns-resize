import type { Columns } from './columns'
import * as ClassNames from './class-names'

export class Column {
  elements: HTMLElement[]
  minWidth: number
  width: number = 0
  idx: number
  columns: Columns
  handleElements: (HandleEl)[] = []
  id: string
  autoResizeHandles: boolean
  
  constructor(
    id: string,
    elements: HTMLElement[],
    columns: Columns,
    minWidth = 50,
    autoResizeHandles: boolean
  ) {
    this.id = id
    this.elements = elements
    this.columns = columns
    this.idx = columns.columns.length
    this.minWidth = minWidth
    this.autoResizeHandles = autoResizeHandles
  }

  get next() {
    return this.columns.columns[this.idx + 1]
  }
  get previous() {
    return this.columns.columns[this.idx - 1]
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
    })
    this.addElementsClass(ClassNames.CONNECTED)
    this.addHandlebarsClass(ClassNames.CONNECTED)
  }
  disconnectHandlebars() {
    this.handleElements.forEach(handleEl => {
      handleEl.removeEventListener('pointerdown', this.columns.onPointerDown)
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
}

type HandleEl = HTMLElement & { targetColumn: Column }
