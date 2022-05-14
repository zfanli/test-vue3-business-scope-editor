<script setup>
import { ref } from 'vue'

import { useDnD } from './dnd'
import { useSelection } from './mouse'
import TagItem from './TagItem.vue'

const {
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
} = useDnD()

const tagBounding = ref([])
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

const {
  container,
  selection,
  markSelectable,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} = useSelection({
  onSelectStart: () => {
    const containerEl = container.value.$el
    const bounding = []

    for (const tag of containerEl.querySelectorAll('.tag-item')) {
      bounding.push({
        index: Number(tag.dataset.index),
        rect: tag.getBoundingClientRect(),
      })
    }

    tagBounding.value = bounding
    tags.value.forEach((tag) => (tag.activated = false))
  },

  onSelecting: ({ x, y, width, height }) => {
    const result = tagBounding.value.map((tag) => ({
      activated: calculateSelection({ x, y, width, height }, tag.rect),
      idx: tag.index,
    }))
    handleRangeSelect(result)
  },

  onSelectEnd: () => {
    handleRangeSelect([], true)
  },
})
</script>

<template>
  <div
    class="relative h-screen w-screen flex flex-col items-center justify-center mx-auto"
    @mousedown.passive="handleMouseDown($event)"
    @mousemove.passive="handleMouseMove($event)"
    @mouseup.passive="handleMouseUp($event)"
  >
    <TransitionGroup
      ref="container"
      name="fade"
      tag="div"
      class="flex flex-wrap gap-1 p-12 m-10 relative select-none bg-blue-50"
    >
      <span
        key="start"
        class="inline-block w-5 h-7 -ml-6"
        @dragenter="handleDragOver($event, true)"
        @dragleave="handleDragOver($event, false)"
        @drop="handleDrop($event, -Infinity)"
        @dragover.prevent=""
      >
      </span>

      <div class="wrapper" v-for="(item, idx) in tags" :key="item.id">
        <TagItem
          class="tag-item"
          :data-index="idx"
          :value="item.label"
          :activated="item.activated"
          :editing="item.editing"
          :dragging="item.dragging"
          @update="handleUpdate('label', $event, idx)"
          @toggleActivated="handleUpdate('activated', $event, idx)"
          @toggleEditing="handleUpdate('editing', $event, idx)"
          @dragstart="handleDrag($event, idx)"
          @dragend="handleDragEnd($event)"
        />

        <span
          v-if="idx !== tags.length - 1"
          class="px-2 scale-150 inline-block"
          v-bind="markSelectable"
          @dragenter="handleDragOver($event, true)"
          @dragleave="handleDragOver($event, false)"
          @drop="handleDrop($event, idx)"
          @dragover.prevent=""
        >
          ,
        </span>
      </div>

      <span
        key="end"
        class="inline-block w-5 h-7"
        @dragenter="handleDragOver($event, true)"
        @dragleave="handleDragOver($event, false)"
        @drop="handleDrop($event, Infinity)"
        @dragover.prevent=""
      >
      </span>
    </TransitionGroup>

    <button class="px-2 mx-2" @click="handleUndo">UNDO</button>
    <button class="px-2 mx-2" @click="handleRedo">REDO</button>

    <button class="px-2 mx-2" @click="handleAddRandom()">Add to Start</button>
    <button class="px-2 mx-2" @click="handleAddRandom(false)">
      Add to End
    </button>

    <div ref="selection" class="selection"></div>
  </div>
</template>

<style scoped>
.drag-over {
  @apply scale-150 bg-blue-500 text-transparent;
}

.selection {
  @apply opacity-30 bg-blue-100 fixed border-dashed border-2 border-blue-400 hidden;
}

.selection-active {
  @apply block;
}

/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(0, 30px);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
