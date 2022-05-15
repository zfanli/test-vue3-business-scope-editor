<script setup>
import { computed } from '@vue/reactivity'

const props = defineProps({
  keyword: String,
  text: String,
})

const highlighted = computed(() => {
  const tags = []
  props.text.split(props.keyword).forEach((item) => {
    tags.push({ val: item })
    tags.push({ val: props.keyword, highlight: true })
  })
  tags.pop()
  return tags
})
</script>

<template>
  <span>
    <span
      v-for="(item, idx) in highlighted"
      :key="idx"
      :class="{
        ' rounded-sm bg-yellow-200 ': item.highlight,
      }"
    >
      {{ item.val }}
    </span>
  </span>
</template>
