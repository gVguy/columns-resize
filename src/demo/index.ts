import Columns from '../main'
import './index.css'

const columns = new Columns(
  document.querySelector('#wrapper')!,
  {
    defaultMinWidth: 70,
    minWidthByColumnId: {
      name: 50
    },
    autoResizeHandles: true
  }
)

document.getElementById('disconnect')!.onclick = () => {
  columns.disconnect()
}
document.getElementById('reconnect')!.onclick = () => {
  columns.reconnect()
}
document.getElementById('reset')!.onclick = () => {
  columns.reset()
}

document.getElementById('colors-cbx')!.onchange = () => {
  document.getElementById('wrapper')!.classList.toggle('colors')
}
