import type { Columns } from './columns'

export class Column {
  elements: HTMLElement[]
  minWidth: number
  width: number = 0
  idx: number
  columns: Columns
  
  constructor(
    elements: HTMLElement[],
    columns: Columns,
    minWidth = 50
  ) {
    this.elements = elements
    this.columns = columns
    this.idx = columns.columns.length
    this.minWidth = minWidth
    this.getWidth()
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
    const avgClientWidth = this.elements[0].clientWidth
      // .map(el => el.clientWidth)
      // .reduce((a, b) => a + b, 0) / this.elements.length
    this.width = avgClientWidth
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
}
