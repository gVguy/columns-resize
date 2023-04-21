import type { Columns } from './columns'

export class Column {
  elements: HTMLElement[]
  private idx: number
  private columns: Columns
  private minWidth: number = 0
  private width: number = 0
  
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
  getWidth() {
    this.width = this.elements[0].clientWidth
  }
  setWidthDiff(diff: number) {
    this.width += diff
    this.elements.forEach(el => {
      el.style.flex = `0 0 ${this.width}px`
    })
  }
}
