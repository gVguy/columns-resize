import Columns from '../main'
import './index.css'

new Columns(
  document.querySelector('#wrapper')!,
  {
    defaultMinWidth: 70,
    minWidthByColumnId: {
      name: 40
    }
  }
)
