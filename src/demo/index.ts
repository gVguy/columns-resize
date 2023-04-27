import Columns from '../main'
import './index.css'

const lastRow = document.querySelector('.row:last-child')!.cloneNode(true)
const getCloneRow = () => lastRow.cloneNode(true)

const columns = new Columns(
  document.querySelector('#wrapper')!,
  {
    defaultMinWidth: 70,
    minWidthByColumnId: {
      name: 50
    },
    autoResizeHandles: true,
    onResizeStart() {
      document.body.classList.add('grabbing')
      console.log('resize start')
    },
    onResizeEnd() {
      document.body.classList.remove('grabbing')
      console.log('resize end')
    }
  }
)

document.getElementById('disconnect')!.onclick = () => {
  columns.disconnect()
}
document.getElementById('reconnect')!.onclick = (e) => {
  columns.reconnect()
  ;(e.target as HTMLElement).classList.remove('attention')
}
document.getElementById('reset')!.onclick = () => {
  columns.reset()
}
document.getElementById('add-row')!.onclick = () => {
  document.getElementById('wrapper')!.appendChild(getCloneRow())
  document.getElementById('reconnect')!.classList.add('attention')
}

document.getElementById('colors-cbx')!.onchange = () => {
  document.getElementById('wrapper')!.classList.toggle('colors')
}
