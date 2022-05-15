<script setup>
import { useDnD } from './useDnD'
import { useSelection } from './useSelection'
import { useSearch } from './useSearch'
import { useShortcuts } from './useShortcuts'

import TagItem from './TagItem.vue'
import TextHighlighted from './TextHighlighted.vue'

const {
  tags,
  handleDrag,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  handleAdd,
  handleUndo,
  handleRedo,
  handleUpdate,
  handleDelete,
  handleMerge,
  handleClear,
  handleReset,
  handleRangeDelete,
  handleRangeSelect,
} = useDnD()

const {
  container,
  selection,
  markSelectable,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} = useSelection({
  onSelectStart: () => {
    tags.value.forEach((tag) => (tag.activated = false))
  },
  onSelecting: (result) => {
    handleRangeSelect(result)
  },
  onSelectEnd: () => {
    handleRangeSelect([], true)
  },
})

const {
  searchLoading,
  searchOptions,
  searchValues,
  searchQuery,
  handleAddToEnd,
  handleAddToStart,
  handleRemoteSearch,
} = useSearch({
  handleAdd,
})

const { shortcuts } = useShortcuts({ handleUndo, handleRedo })
</script>

<template>
  <div
    class="relative mx-auto flex h-screen w-screen flex-col items-center justify-center"
  >
    <div class="w-3/4">
      <div class="mx-2 mb-2 px-2">Tag Editor</div>
    </div>
    <TransitionGroup
      ref="container"
      name="fade"
      tag="div"
      class="relative mb-4 flex h-60 w-3/4 select-none flex-wrap items-start gap-1 overflow-y-auto border-4 border-blue-100 bg-blue-50 p-10"
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
        class="-mr-6 inline-block h-7 w-5"
        @dragenter="handleDragOver($event, true)"
        @dragleave="handleDragOver($event, false)"
        @drop="handleDrop($event, Infinity)"
        @dragover.prevent=""
      >
      </span>

      <div key="selection" ref="selection" class="selection"></div>
    </TransitionGroup>

    <div class="relative mb-4 flex w-3/4 items-center">
      <span class="mx-2 inline-block px-2">Group Operations</span>

      <el-button plain class="mx-2 px-2" @click="handleUndo()">Undo</el-button>
      <el-button plain class="mx-2 px-2" @click="handleRedo()">Redo</el-button>
      <el-button plain class="mx-2 px-2" @click="handleRangeDelete()">
        Delete
      </el-button>
      <el-button plain class="mx-2 px-2" @click="handleMerge()">
        Merge
      </el-button>
      <el-button plain class="mx-2 px-2" @click="handleClear()">
        Clear
      </el-button>
      <el-button plain class="mx-2 px-2" @click="handleReset()">
        Reset
      </el-button>
    </div>

    <div class="relative mb-4 flex w-3/4 items-center">
      <span class="mx-2 inline-block px-2">Search</span>
      <el-select
        v-model="searchValues"
        multiple
        filterable
        clearable
        remote
        allow-create
        default-first-option
        placeholder="Type to search..."
        class="mx-2 flex-grow px-2"
        popper-class="search-options"
        :loading="searchLoading"
        :remote-method="handleRemoteSearch"
      >
        <el-option
          v-for="(opt, idx) in searchOptions"
          :key="idx"
          :value="opt.name"
        >
          <TextHighlighted
            class="mr-2 inline-block"
            :text="opt.name"
            :keyword="searchQuery"
          />
          <TextHighlighted
            class="inline-block overflow-hidden text-ellipsis text-gray-400"
            :text="opt.desc"
            :keyword="searchQuery"
          />
        </el-option>
      </el-select>

      <el-button plain class="mx-2 px-2" @click="handleAddToStart()">
        Add to Start
      </el-button>
      <el-button plain class="mx-2 px-2" @click="handleAddToEnd()">
        Add to End
      </el-button>
    </div>

    <div class="mb-4 w-3/4">
      <div class="mx-2 mb-2 px-2">Result Preview</div>
      <div class="bg-gray-100 p-4">
        {{ tags.map((item) => item.label).join('；') + '。' }}
      </div>
    </div>

    <div class="w-3/4">
      <div class="mx-2 mb-2 px-2">Shortcuts</div>
      <div class="mb-2 flex">
        <div
          class="ml-4 mr-2 mb-2 px-2"
          v-for="(item, idx) in shortcuts"
          :key="idx"
        >
          <span class="mr-4">{{ item.name }}</span>
          <span>
            <code
              v-for="(key, idx) in item.keys"
              :key="idx"
              class="key key-combined"
            >
              {{ key }}
            </code>
          </span>
        </div>
      </div>
    </div>

    <div class="w-3/4">
      <div class="mx-2 mb-2 px-2">Guide</div>
      <div class="bg-orange-50 p-4">
        <div class="ml-4 mr-2">1. Tag Editor 内可以选中标签进行拖拽排序。</div>
        <div class="ml-4 mr-2">
          2. 按住
          <code class="key">ctrl</code>
          可以进行多选，在空白处拖拽鼠标可以使用选区进行多选，可以同时拖拽排序多个标签。
        </div>
        <div class="ml-4 mr-2">
          3. 多选时还可以通过按钮进行删除 <code class="key">Delete</code>、合并
          <code class="key">Merge</code> 操作。
        </div>
        <div class="ml-4 mr-2">4. 对标签进行双击可以修改标签内容。</div>
        <div class="ml-4 mr-2">5. 标签内容修改后，按回车可以完成保存。</div>
        <div class="ml-4 mr-2">
          6. 光标在标签上悬停显示删除图标，可以删除当前的标签。
        </div>
        <div class="ml-4 mr-2">
          7. 对标签的操作可以通过按钮 <code class="key">Undo</code> 和
          <code class="key">Redo</code> 进行撤销和重做，也支持快捷键操作。
        </div>
        <div class="ml-4 mr-2">
          8.
          在搜索栏输入关键字触发搜索（尝试用“食品”搜索），从搜索结果中选择标签，添加到开头或结尾，可以多选。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.key {
  @apply relative mx-1  rounded bg-gray-500 py-1 px-2 text-xs text-white;
}

.key-combined {
  @apply mr-5 after:absolute after:-right-4 after:text-base after:text-gray-500 after:content-['+'] last:after:hidden;
}

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

<style lang="less">
.search-options {
  @apply max-w-3xl;

  .el-select-dropdown__item {
    @apply flex;
  }
}
</style>
