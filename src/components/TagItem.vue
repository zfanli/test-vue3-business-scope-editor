<script setup>
import { nextTick } from 'vue'

const props = defineProps({
  value: String,
  activated: Boolean,
  editing: Boolean,
  dragging: Boolean,
})

const emits = defineEmits(['update', 'toggleActivated', 'toggleEditing'])

const toggleEditing = (editing) => emits('toggleEditing', editing)
const toggleActivated = (evt) => {
  if (props.editing) return
  emits('toggleActivated', {
    value: !props.activated,
    isMultiple: evt.ctrKey || evt.metaKey,
  })
}

const becomeEditing = (evt) => {
  toggleEditing(true)
  nextTick(() => evt.target.focus())
}

const updateValue = (evt) => {
  toggleEditing(false)
  const newVal = evt.target.textContent
  if (props.value !== newVal) emits('update', newVal)
}
</script>

<template>
  <span
    :class="[
      'inline-block bg-blue-200 text-lg px-2 outline-none',
      'rounded-sm border-2 border-blue-200 cursor-pointer',
      {
        'bg-blue-500 border-blue-500 text-white': !editing && activated,
        'bg-white border-2 border-blue-500': editing,
        'opacity-50': dragging,
      },
    ]"
    :draggable="!editing"
    :contenteditable="editing"
    @click="toggleActivated($event)"
    @dblclick="becomeEditing($event)"
    @keyup.enter="updateValue($event)"
    @keypress.enter.prevent=""
  >
    {{ value }}
  </span>
</template>
