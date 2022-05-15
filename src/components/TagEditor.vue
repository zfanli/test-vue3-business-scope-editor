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
  handleDelete,
  handleMerge,
  handleRangeDelete,
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
    class="relative mx-auto flex h-screen w-screen flex-col items-center justify-center"
  >
    <TransitionGroup
      ref="container"
      name="fade"
      tag="div"
      class="relative m-2 flex h-60 w-3/4 select-none flex-wrap items-start gap-1 overflow-y-auto bg-blue-50 p-12"
      @mousedown.passive="handleMouseDown($event)"
      @mousemove.passive="handleMouseMove($event)"
      @mouseup.passive="handleMouseUp($event)"
    >
      <span
        key="start"
        class="-ml-6 inline-block h-7 w-5"
        @dragenter="handleDragOver($event, true)"
        @dragleave="handleDragOver($event, false)"
        @drop="handleDrop($event, -Infinity)"
        @dragover.prevent=""
      >
      </span>

      <div class="wrapper" v-for="(item, idx) in tags" :key="item.id">
        <TagItem
          class="tag-item z-10"
          :data-index="idx"
          :value="item.label"
          :activated="item.activated"
          :editing="item.editing"
          :dragging="item.dragging"
          @update="handleUpdate('label', $event, idx)"
          @delete="handleDelete(idx)"
          @toggleActivated="handleUpdate('activated', $event, idx)"
          @toggleEditing="handleUpdate('editing', $event, idx)"
          @dragstart="handleDrag($event, idx)"
          @dragend="handleDragEnd($event)"
        />

        <span
          v-if="idx !== tags.length - 1"
          class="inline-block scale-150 px-2"
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
        class="inline-block h-7 w-5"
        @dragenter="handleDragOver($event, true)"
        @dragleave="handleDragOver($event, false)"
        @drop="handleDrop($event, Infinity)"
        @dragover.prevent=""
      >
      </span>

      <div key="selection" ref="selection" class="selection"></div>
    </TransitionGroup>

    <div class="relative flex w-3/4 items-center">
      <span class="mx-2 inline-block px-2">Group Operations</span>
      <el-button plain class="mx-2 px-2" @click="handleUndo">UNDO</el-button>
      <el-button plain class="mx-2 px-2" @click="handleRedo">REDO</el-button>
      <el-button plain class="mx-2 px-2" @click="handleRangeDelete">
        DELETE
      </el-button>
      <el-button plain class="mx-2 px-2" @click="handleMerge">MERGE</el-button>

      <el-button plain class="mx-2 px-2" @click="handleAddRandom()">
        Add to Start
      </el-button>
      <el-button plain class="mx-2 px-2" @click="handleAddRandom(false)">
        Add to End
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.drag-over {
  @apply scale-150 bg-blue-500 text-transparent;
}

.selection {
  @apply fixed hidden border-4 border-dotted border-blue-600 bg-blue-300 opacity-50;
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
