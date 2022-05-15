import { ref } from 'vue'
import { debounce } from 'lodash'

export function useSelection({
  onSelecting = null,
  onSelectStart = null,
  onSelectEnd = null,
}) {
  const container = ref(null)
  const selection = ref(null)
  const tagBounding = ref([])

  const withPixels = (n) => n + 'px'
  const markSelectable = { 'data-selectable': true }

  let selectionStartedTimer = null

  const calculateSelection = (range, target) => {
    const { x: minX, y: minY, width, height } = range
    const { x: tMinX, y: tMinY, width: tWidth, height: tHeight } = target
    const maxX = minX + width
    const maxY = minY + height
    const tMaxX = tMinX + tWidth
    const tMaxY = tMinY + tHeight
    const result =
      maxX >= tMinX && maxY >= tMinY && minX <= tMaxX && minY <= tMaxY
    return result
  }

  const handleMouseDown = (evt) => {
    selectionStartedTimer = setTimeout(() => {
      const containerEl = container.value.$el
      if (evt.target !== containerEl && !evt.target.dataset.selectable) return

      const rectangle = selection.value
      rectangle.classList.add('selection-active')

      rectangle.dataset.originX = evt.clientX
      rectangle.dataset.originY = evt.clientY

      rectangle.style.width = 0
      rectangle.style.height = 0
      rectangle.style.left = withPixels(evt.clientX)
      rectangle.style.top = withPixels(evt.clientY)

      const bounding = []

      for (const tag of containerEl.querySelectorAll('.tag-item')) {
        bounding.push({
          index: Number(tag.dataset.index),
          rect: tag.getBoundingClientRect(),
        })
      }

      tagBounding.value = bounding
      onSelectStart && onSelectStart()
    }, 100)
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

      rectangle.style.width = withPixels(pos.width)
      rectangle.style.height = withPixels(pos.height)
      rectangle.style.left = withPixels(pos.x)
      rectangle.style.top = withPixels(pos.y)

      const result = tagBounding.value.map((tag) => ({
        activated: calculateSelection(pos, tag.rect),
        idx: tag.index,
      }))

      onSelecting && onSelecting(result)
    },
    16,
    { maxWait: 16 }
  )

  const handleMouseUp = () => {
    clearTimeout(selectionStartedTimer)
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
