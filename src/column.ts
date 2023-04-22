import type { Columns, SizeUnit } from './columns'

export class Column {
  elements: HTMLElement[]
  minWidth: number
  private sizeUnit: SizeUnit
  private idx: number
  private columns: Columns
  private clientWidth: number = 0
  private unitWidth: number = 0
  
  constructor(
    elements: HTMLElement[],
    columns: Columns,
    minWidth = 50,
    sizeUnit: SizeUnit
  ) {
    this.elements = elements
    this.columns = columns
    this.idx = columns.columns.length
    this.minWidth = minWidth
    this.sizeUnit = sizeUnit
    this.getWidth()
  }

  get next() {
    return this.columns.columns[this.idx + 1]
  }
  get previous() {
    return this.columns.columns[this.idx - 1]
  }
  get canShrink() {
    return this.clientWidth > this.minWidth
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
    this.clientWidth = avgClientWidth
    if (this.sizeUnit == 'vw') {
      this.unitWidth = toVw(avgClientWidth)
    } else {
      this.unitWidth = avgClientWidth
    }
  }
  setWidthDiff(diff: number) {
    this.clientWidth += diff
    if (this.sizeUnit == 'vw') {
      this.unitWidth = toVw(this.clientWidth)
    } else {
      this.unitWidth = this.clientWidth
    }
    const shrink = this.canShrink ? '1' : '0'
    const grow = '1'
    const basis = `${this.unitWidth}${this.sizeUnit}`
    this.elements.forEach(el => {
      el.style.flex = `${grow} ${shrink} ${basis}`
    })
  }
}

const toVw = (n: number) => 100 * n / window.innerWidth
