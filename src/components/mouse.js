import { ref } from 'vue'
import { debounce } from 'lodash'

export function useSelection({
  onSelecting = null,
  onSelectStart = null,
  onSelectEnd = null,
}) {
  const container = ref(null)
  const selection = ref(null)

  const withPixels = (n) => n + 'px'
  const markSelectable = { 'data-selectable': true }

  const handleMouseDown = (evt) => {
    const containerEl = container.value.$el
    if (evt.target !== containerEl && !evt.target.dataset.selectable) return

    onSelectStart && onSelectStart()

    const rectangle = selection.value
    rectangle.classList.add('selection-active')

    rectangle.dataset.originX = evt.clientX
    rectangle.dataset.originY = evt.clientY

    rectangle.style.width = 0
    rectangle.style.height = 0
    rectangle.style.left = withPixels(evt.clientX)
    rectangle.style.top = withPixels(evt.clientY)
  }

  const handleMouseMove = debounce(
    (evt) => {
      const rectangle = selection.value
      const { originX = -1, originY = -1 } = rectangle.dataset
      if (originX < 0) return

      const pos = {
        width: Math.abs(evt.clientX - originX),
        height: Math.abs(evt.clientY - originY),
        x: Math.min(originX, evt.clientX),
        y: Math.min(originY, evt.clientY),
      }

      onSelecting && onSelecting(pos)

      rectangle.style.width = withPixels(pos.width)
      rectangle.style.height = withPixels(pos.height)
      rectangle.style.left = withPixels(pos.x)
      rectangle.style.top = withPixels(pos.y)
    },
    16,
    { maxWait: 16 }
  )

  const handleMouseUp = () => {
    const rectangle = selection.value
    if (Number(rectangle.dataset.originX) === -1) return
    rectangle.classList.remove('selection-active')
    rectangle.dataset.originX = -1
    rectangle.dataset.originY = -1
    rectangle.style.width = 0
    rectangle.style.height = 0
    onSelectEnd && onSelectEnd()
  }

  return {
    container,
    selection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    markSelectable,
  }
}
