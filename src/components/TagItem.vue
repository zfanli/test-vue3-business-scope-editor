<script setup>
import { nextTick } from 'vue'

const props = defineProps({
  value: String,
  activated: Boolean,
  editing: Boolean,
  dragging: Boolean,
})

const emits = defineEmits([
  'update',
  'delete',
  'toggleActivated',
  'toggleEditing',
])

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

const deleteTag = () => emits('delete')
</script>

<template>
  <div class="group relative inline-block">
    <span
      :class="[
        'relative inline-block  px-2 text-lg outline-none',
        'cursor-pointer rounded-sm border-2 ',
        {
          'border-blue-200 bg-blue-200': !activated,
          'border-blue-500 bg-blue-500 text-white': !editing && activated,
          'border-2 border-blue-500 bg-white': editing,
          'opacity-50': dragging,
        },
      ]"
      :draggable="!editing"
      @click="toggleActivated($event)"
      @dblclick="becomeEditing($event)"
      :contenteditable="editing"
      @keyup.enter="updateValue($event)"
      @keypress.enter.prevent=""
    >
      {{ value }}
    </span>

    <span
      class="absolute -top-1 -right-1 z-10 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-red-400 text-base text-white group-hover:flex"
      @click="deleteTag()"
    >
      x
    </span>
  </div>
</template>
