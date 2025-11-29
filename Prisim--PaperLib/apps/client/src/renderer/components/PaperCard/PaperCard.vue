<script setup lang="ts">
/**
 * 论文卡片组件
 */

import { computed } from 'vue'
import type { Paper } from '@core/types/paper'

interface Props {
  paper: Paper
  isSelected?: boolean
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isDark: false
})

const emit = defineEmits<{
  select: [paper: Paper]
}>()

const cardClass = computed(() => {
  if (props.isSelected) {
    return props.isDark
      ? 'bg-white/10 border-white/10 shadow-lg'
      : 'bg-white border-white shadow-md shadow-gray-200/50'
  }
  return 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
})

const titleClass = computed(() => {
  return props.isSelected
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-slate-700 dark:text-slate-200'
})

const journalClass = computed(() => (props.isDark ? 'bg-black/30' : 'bg-gray-100'))

/** 格式化作者显示 */
const displayAuthors = computed(() => {
  if (props.paper.authors.length === 0) return ''
  const first = props.paper.authors[0].split(',')[0]
  return props.paper.authors.length > 1 ? `${first} et al.` : first
})
</script>

<template>
  <div
    class="group p-3 rounded-xl cursor-pointer transition-all duration-200 border relative"
    :class="cardClass"
    @click="emit('select', paper)"
  >
    <!-- 选中指示条 -->
    <div v-if="isSelected" class="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full" />

    <!-- 标题 -->
    <div class="font-semibold mb-1 truncate text-[13px]" :class="titleClass">
      {{ paper.title }}
    </div>

    <!-- 作者和期刊 -->
    <div class="flex justify-between items-center text-[11px] text-gray-400">
      <span>{{ displayAuthors }}</span>
      <span v-if="paper.journal" class="px-2 py-0.5 rounded-md" :class="journalClass">
        {{ paper.journal }}
      </span>
    </div>
  </div>
</template>
