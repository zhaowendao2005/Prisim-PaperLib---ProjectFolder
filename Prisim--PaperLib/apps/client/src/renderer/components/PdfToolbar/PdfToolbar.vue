<script setup lang="ts">
/**
 * PDF 工具栏组件
 */

import { computed } from 'vue'

interface Props {
  currentPage?: number
  totalPages?: number
  scale?: number
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalPages: 1,
  scale: 1.0,
  isDark: false
})

const emit = defineEmits<{
  prevPage: []
  nextPage: []
  zoomIn: []
  zoomOut: []
  highlight: []
}>()

const containerClass = computed(() =>
  props.isDark ? 'bg-black/60 border-white/10 text-gray-200' : 'bg-white/80 border-white/50'
)

const hoverClass = computed(() => (props.isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'))

const dividerClass = computed(() => (props.isDark ? 'bg-gray-600' : 'bg-gray-300'))

const scalePercent = computed(() => `${Math.round(props.scale * 100)}%`)
</script>

<template>
  <div
    class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-1 px-2 py-1.5 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300"
    :class="containerClass"
  >
    <!-- 翻页 -->
    <button class="p-2 rounded-full transition-colors" :class="hoverClass" @click="emit('prevPage')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <span class="text-xs font-mono font-medium px-2 opacity-60">{{ currentPage }} / {{ totalPages }}</span>
    <button class="p-2 rounded-full transition-colors" :class="hoverClass" @click="emit('nextPage')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div class="w-px h-4 mx-2" :class="dividerClass" />

    <!-- 缩放 -->
    <button class="p-2 rounded-full transition-colors" :class="hoverClass" @click="emit('zoomOut')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
        />
      </svg>
    </button>
    <span class="text-xs w-10 text-center font-mono font-medium">{{ scalePercent }}</span>
    <button class="p-2 rounded-full transition-colors" :class="hoverClass" @click="emit('zoomIn')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
        />
      </svg>
    </button>

    <div class="w-px h-4 mx-2" :class="dividerClass" />

    <!-- 高亮 -->
    <button class="p-2 rounded-full transition-colors" :class="hoverClass" @click="emit('highlight')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </button>
  </div>
</template>
