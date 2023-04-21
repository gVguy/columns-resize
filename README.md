# columns-resize

A tiny dependency-free library to create flex-based table-like layouts, which can be resized by user
<p align="center">
  🚀 <a href="https://gvguy.github.io/columns-resize/">Live demo</a> 🚀 
</p>
<p align="center">
  <img src="https://i.imgur.com/QfyUfun.gif" width="400">
</p>
This library can be used alongside any framework as well as vanilla Javascript

## Installation

### npm
```sh
npm i columns-resize
```
```js
import ColumnsResize from 'columns-resize'
```
### CDN
```html
<script src="https://unpkg.com/columns-resize@latest"></script>
```

## Usage

### Structure

The layout consists of **rows** (which must have `display:flex` style)

Rows contain **columns** that can be resized. When one column is resized, all columns with the same id are resized with it.

Columns contain some information and a **resize handle** that can be dragged to make adjustments to column size. Resize handles are optional: not all columns must have them, but if a resize handle is present, it *must be nested within a column*

### Markup

This library relies on use of data-attributes.

There are two kinds of data attributes that are important for us:

* `data-column-id="some-id"` - this attribute must be present on every column in your layout. The id must be unique *for each column*
* `data-resize-handle` - this attribute indicates elements that are used as handle bars which can be dragged to resize columns

```html
<!-- 
  row is the container of columns.
  each row must have display:flex
-->
<div class="row">
  <!--
    data-column-id must provide an id unique for each column
  -->
  <div class="column" data-column-id="name">
    Godric Gryffindor
    <!--
      data-resize-handle indicates the handlebar element,
      that can be dragged to resize columns.
      such element must be nested inside of the column element
    -->
    <div data-resize-handle></div>
  </div>
  
  <div class="column" data-column-id="faculty">
    Gryffindor
    <div data-resize-handle></div>
  </div>
  
  <div class="column" data-column-id="long-number">
    9847362594654783295483726543782
    <!--
      this is the last column in the row,
      so it doesn't have a resize handle
    -->
  </div>
  
</div>
```

### Initialization

You need to provide the root element to limit the scope of each column set. This is the element from which the querySelector's fire, searching for all the data-attributed elements.

If you don't care about scope, or only have a single use case, feel free to provide `document.body` as root

```js
const rootElement = document.getElementById('wrapper')

const columns = new ColumnsResize(rootElement)
```

### Options

Along with the root element you can provide an options object

```js
const columns = new ColumnsResize(rootElement, {
  defaultMinWidth: 50,
  minWidthByColumnId: {
    'name': 100
  }
})
```

#### options.defaultMinWidth

type: `number`

default: `50`

A min width for each column unless a different min width is specified by `minWidthByColumnId`

The column will not shrink past its min width. If the user keeps resizing in the direction of a column that has reached its minimal width, the next column will start to shrink until there's no shrinkable columns left.

#### options.minWidthByColumnId

type: `{ [key: string]: number }`

default: `{}`

Min widths for specific columns

### Reconnect

If the DOM tree is updated - for example, new rows are added, you need to reconnect the instance

```js
columns.reconnect()
```

### Disconnect

If for any reason at some point you need to disable the resizability of your layout

```js
columns.disconnect()
```

### Styles

Every row must be a flexbox

```css
.row {
  display: flex;
}
```

It is recommended for columns to have these two properties, however it depends on implementation

```css
.column {
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

Feel free to set the initial sizes of the columns
```css
.column {
  flex: 1 1 33%;
}
.column:nth-child(2) {
  flex: 0 0 120px;
}
```

**Note** that evey element with `data-column-id` on it will automatically get these styles:
```css
overflow: hidden;
box-sizing: border-box;
```
