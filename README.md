# columns-resize

A tiny dependency-free library to create flex-based table-like layouts, which can be resized by user
<p align="center">
  🚀 <a href="https://gvguy.github.io/columns-resize/">Live demo</a> 🚀 
</p>
<p align="center">
  <img src="https://i.imgur.com/R79HQTt.gif" width="400">
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

## Structure

The layout consists of **rows** (which must have `display:flex` style)

Rows contain **columns** that can be resized. When one column is resized, all columns with the same id are resized with it.

Columns contain some information and a **resize handle** that can be dragged to make adjustments to column size. Resize handles are optional: not all columns must have them, but if a resize handle is present, it *must be nested within a column*

## Markup

This library relies on use of data-attributes.

Here's a list of data attributes that are important for us:

* `data-column-id="some-id"` - this attribute must be present on every column in your layout. The id must be unique *for each column*
* `data-resize-handle` - this attribute indicates elements that are used as handle bars which can be dragged to resize columns. Can be auto generated with [`autoResizeHandles` option](#optionsautoresizehandles)
* `data-no-auto-resize-handles` - this optional data attribute can be used along with [`autoResizeHandles` option](#optionsautoresizehandles) to exclude rows from automatic handles generation

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

## Initialization

You need to provide the root element to limit the scope of each column set. This is the element from which the querySelector's fire, searching for all the data-attributed elements.

If you don't care about scope, or only have a single use case, feel free to provide `document.body` as root

```js
const rootElement = document.getElementById('wrapper')

const columns = new ColumnsResize(rootElement)
```

## Options

Along with the root element you can provide an options object

```js
const columns = new ColumnsResize(rootElement, {
  defaultMinWidth: 50,
  minWidthByColumnId: {
    'name': 100
  },
  autoResizeHandles: true,
  onResizeStart: () => console.log('resize start'),
  onResizeEnd: () => console.log('resize end'),
  logs: true
})
```

### options.defaultMinWidth

type: `number`

default: `50`

A min width for each column unless a different min width is specified by `minWidthByColumnId`

The column will not shrink past its min width. If the user keeps resizing in the direction of a column that has reached its minimal width, the next column will start to shrink until there's no shrinkable columns left.

### options.minWidthByColumnId

type: `{ [key: string]: number }`

default: `{}`

Min widths for specific columns

### options.autoResizeHandles

type: `boolean`

default: `false`

Automatically create resize handles for every column (except the last one)

**Note** that [positioning and styling](#resize-handles) of auto-generated handles is up to you (no styles are applied by default to the created elements)

If you need to exclude some rows from automatic resize handle generation, use `data-no-auto-resize-handles` on that row

```html
<div class="row" data-no-auto-resize-handles>
  <!-- No resize handles in this row -->
  <div class="column" data-column-id="name">John</div>
  <div class="column" data-column-id="surname">Doe</div>
  <div class="column" data-column-id="age">28</div>
</div>
<div class="row">
  <div class="column" data-column-id="name">
    Mary
    <!-- Resize handle will be created here -->
  </div>
  <div class="column" data-column-id="surname">
    Perry
    <!-- And here -->
  </div>
  <div class="column" data-column-id="age">
    27
    <!-- But not here -->
  </div>
</div>
```

### options.onResizeStart

type: `() => void`

default: `undefined`

Callback to be called when resize action is initiated

### options.onResizeEnd

type: `() => void`

default: `undefined`

Callback to be called when resize action has ended

### options.logs

type: `boolean`

default: `false`

Whether or not to print logs (could be useful for debugging)

## Methods

### reconnect()

If the DOM tree is updated - for example, new rows are added, you need to reconnect the instance

```js
columns.reconnect()
```

### disconnect()

If for any reason at some point you need to disable the resizability of your layout

```js
columns.disconnect()
```

### reset()

If at some point you need to reset column widths to their initial values

```js
columns.reset()
```

**Note** that initial widths are measured at the initialization of instance and are not affected by disconnect / reconnect *unless* new columns are added (or removed). In that case, initial widths get overwritten

## Classes

Conditional classes are applied to the key elements for styling purposes

See <a href="https://gvguy.github.io/columns-resize/">Live demo</a> (with color coding enabled) for better understanding of how the classes are applied

Here's the list of classes and the elements they're applied to:

| Class name | Element(s) | Meaning |
|---|---|---|
| `columns-resize-connected` | Root, all columns, all handlebars | Instance is connected, columns resizable |
| `columns-resize-active` | Root, columns currently being resized, handlebar currently being dragged | Resize action is happening right now, and this element is taking active part in it. You can expect exactly 1 handlebar and 2 columns to be active at any moment during every resize |
| `columns-resize-growing` | Column currently growing | This column is active & its size is being increased |
| `columns-resize-shrinking` | Column currently shrinking | This column is active & its size is being decreased |

## Style Requirements & Recommendations

### Rows

Every row must be a flexbox

```css
.row {
  display: flex;
}
```

### Columns

It is recommended for columns to have these two properties, however it depends on implementation

```css
.column {
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

Feel free to set the initial sizes of the columns with flex property
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

### Resize Handles

Positioning and styling of the resize handles is up to you regardless of whether they're createdted automatically or marked up manually

It is recommended that each resize handle is positioned in the far-right part of the column, for example, like this:

```css
[data-resize-handle] {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 2px;
  cursor: col-resize;
}
```

You may find it useful to increase the size of the handle to make it more clickable, while keeping the line itself thinner for *aesthetics*. Then you'll need to get a bit tricky, but one possible solution is to style a line as an `::after` element, while keeping the wider `[data-resize-handle]` element transparent:
```css
[data-resize-handle] {
  width: 10px;
  display: flex;
  justify-content: center;
}
[data-resize-handle]::after {
  display: block;
  content: '';
  width: 2px;
  height: 100%;
  background: black;
}
[data-resize-handle].columns-resize-active::after {
  background: red;
}
```

### Cursor

You may want to set cursor to `grabbing` (for example) on the entire page while the resize is in progress. This can be acheived by conditionally toggling a class on the body:

```js
new ColumnsResize(rootElement, {
  onResizeStart() {
    document.body.classList.add('grabbing')
  },
  onResizeEnd() {
    document.body.classList.remove('grabbing')
  }
})
```
```css
body.grabbing * {
  cursor: grabbing;
}
```
