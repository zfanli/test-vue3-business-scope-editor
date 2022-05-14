import { ref } from 'vue'
import { computed } from '@vue/reactivity'
import { cloneDeep, isEqual } from 'lodash'

import initMock from '@/assets/initMock.json'

let id = 0

export function useDnD() {
  initMock.forEach((item, idx) => {
    item.id = id++
    item.editing = false
    item.activated = false
    item.dragging = false
    item._prevSibling = initMock[idx - 1]
  })

  const tags = ref(initMock)

  const history = ref([{ op: 'init', value: cloneDeep(tags.value) }])
  const historyPointer = ref(0)
  const historyLastIndex = computed(() => history.value.length - 1)

  const saveHistory = (op) => {
    console.log('saveHistory', op)

    if (historyPointer.value < historyLastIndex.value)
      // drop undid histories all after the current pointer
      history.value.splice(historyPointer.value + 1)

    const newHistory = cloneDeep(tags.value)
    // cleanup temp status
    newHistory.forEach((item) => (item.dragging = false))

    history.value.push({ op, value: newHistory })
    historyPointer.value++
  }

  const handleUpdate = (key, val, idx) => {
    if (key === 'activated') {
      const activatedCount = tags.value.filter((item) => item.activated).length
      if (!val.isMultiple) tags.value.map((item) => (item.activated = false))
      tags.value[idx].activated = activatedCount > 1 || val.value
    } else {
      tags.value[idx][key] = val
    }

    saveHistory('Updated')
  }

  const handleRangeSelect = (list, selectEnd = false) => {
    for (const tag of list) {
      if (tags.value[tag.idx].activated !== tag.activated) {
        tags.value[tag.idx].activated = tag.activated
      }
    }

    if (
      selectEnd &&
      !isEqual(tags.value, history.value[historyPointer.value].value)
    )
      saveHistory('Range Select')
  }

  const handleUndo = () => {
    if (historyPointer.value === 0) return
    const { value: prevState } = history.value[--historyPointer.value]

    tags.value = cloneDeep(prevState)
  }

  const handleRedo = () => {
    if (historyPointer.value >= historyLastIndex.value) return
    const { value: nextState } = history.value[++historyPointer.value]
    tags.value = cloneDeep(nextState)
  }

  const handleAddRandom = (toStart = true) => {
    const pos = toStart ? 0 : tags.value.length
    tags.value.splice(pos, 0, { label: `test${id + 1}`, id: id++ })
    saveHistory('Add to ' + (toStart ? 'start' : 'end'))
  }

  const handleDrag = (e, idx) => {
    e.dataTransfer.effectAllowed = 'move'
    if (!tags.value[idx].activated)
      handleUpdate('activated', { value: true, isMultiple: false }, idx)

    tags.value
      .filter((item) => item.activated)
      .forEach((item) => (item.dragging = true))
  }

  const handleDragEnd = () => {
    tags.value
      .filter((item) => item.activated)
      .forEach((item) => (item.dragging = false))
  }

  const handleDragOver = (e, enterFlag) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (enterFlag) {
      e.target.classList.add('drag-over')
    } else {
      e.target.classList.remove('drag-over')
    }
  }

  const handleDrop = (e, idx) => {
    e.target.classList.remove('drag-over')

    let anchor = tags.value[idx]
    const activatedTags = []
    const restTags = []

    for (const item of tags.value) {
      if (item.activated) activatedTags.push(item)
      else restTags.push(item)
    }

    let anchorIndex
    while (anchorIndex === undefined) {
      // minus Infinity means the head of the queue
      if (idx === -Infinity) anchorIndex = -Infinity
      // Infinity means the end of the queue
      else if (idx === Infinity) anchorIndex = Infinity
      // no anchor exists means also the head of the queue
      else if (!anchor) anchorIndex = -Infinity

      if (anchorIndex !== undefined) break

      console.log(anchor?._prevSibling?.id)
      const index = restTags.findIndex((item) => item.id === anchor.id)
      if (index > -1) anchorIndex = index
      else anchor = anchor._prevSibling
    }

    restTags.splice(anchorIndex + 1, 0, ...activatedTags)

    if (!isEqual(restTags, tags.value)) {
      restTags.map((item, idx) => (item._prevSibling = restTags[idx - 1]))
      tags.value = restTags
      saveHistory('Dropped')
    }
  }

  return {
    tags,
    handleDrag,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleAddRandom,
    handleUndo,
    handleRedo,
    handleUpdate,
    handleRangeSelect,
  }
}
