<script setup>
import { nextTick, ref } from 'vue'

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

const input = ref(null)

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

const updateValue = () => {
  toggleEditing(false)
  const newVal = input.value.textContent
  if (props.value !== newVal) emits('update', newVal)
}

const deleteTag = () => emits('delete')
</script>

<template>
  <div class="group relative inline-block">
    <span
      ref="input"
      :class="[
        'relative inline-block  px-2 text-base outline-none',
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
      @keyup.enter="updateValue()"
      @keypress.enter.prevent=""
    >
      {{ value }}
    </span>

    <span
      v-if="editing"
      class="absolute -top-1 -right-1 z-10 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-green-400 text-base text-white group-hover:flex"
      @click="updateValue()"
    >
      O
    </span>
    <span
      v-else
      class="absolute -top-1 -right-1 z-10 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-red-400 text-base text-white group-hover:flex"
      @click="deleteTag()"
    >
      x
    </span>
  </div>
</template>
