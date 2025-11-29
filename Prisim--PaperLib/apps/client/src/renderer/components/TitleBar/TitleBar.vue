<script setup lang="ts">
/**
 * 标题栏组件
 * 包含交通灯按钮、标题、主题切换
 */

import { computed } from 'vue'

interface Props {
  isDark?: boolean
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false,
  title: 'PaperMind',
  subtitle: ''
})

const emit = defineEmits<{
  toggleTheme: []
  toggleMaximized: []
  close: []
  minimize: []
}>()

const bgClass = computed(() =>
  props.isDark ? 'bg-slate-900/80 text-white' : 'bg-white/80 text-slate-800'
)

const pillClass = computed(() => (props.isDark ? 'bg-white/5' : 'bg-black/5'))
</script>

<template>
  <div
    class="h-12 flex items-center justify-between select-none px-4 bg-opacity-80 backdrop-blur-md z-50 transition-colors duration-300"
    :class="bgClass"
  >
    <!-- Traffic Lights -->
    <div class="flex items-center space-x-2 w-20" style="-webkit-app-region: no-drag">
      <div
        class="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] shadow-sm hover:brightness-90 cursor-pointer flex items-center justify-center group"
        @click="emit('close')"
      >
        <span class="hidden group-hover:block text-[8px] text-black/50 font-bold">×</span>
      </div>
      <div
        class="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24] shadow-sm hover:brightness-90 cursor-pointer flex items-center justify-center group"
        @click="emit('minimize')"
      >
        <span class="hidden group-hover:block text-[8px] text-black/50 font-bold">-</span>
      </div>
      <div
        class="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29] shadow-sm hover:brightness-90 cursor-pointer flex items-center justify-center group"
        @click="emit('toggleMaximized')"
      >
        <span class="hidden group-hover:block text-[6px] text-black/50 font-bold">⤢</span>
      </div>
    </div>

    <!-- Title / Drag Area -->
    <div class="flex-1 h-full flex items-center justify-center" style="-webkit-app-region: drag">
      <div class="flex items-center space-x-2 px-3 py-1 rounded-md transition-colors" :class="pillClass">
        <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span class="font-medium text-xs tracking-wide">{{ title }}</span>
        <template v-if="subtitle">
          <span class="text-[10px] opacity-40 mx-2"> — </span>
          <span class="text-xs opacity-60 truncate max-w-[200px]">{{ subtitle }}</span>
        </template>
      </div>
    </div>

    <!-- Right Toolbar -->
    <div class="flex items-center justify-end w-20 space-x-3 text-gray-400" style="-webkit-app-region: no-drag">
      <button class="hover:text-gray-600 transition-colors" @click="emit('toggleTheme')">
        <!-- Sun icon -->
        <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <!-- Moon icon -->
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
      <button class="hover:text-gray-600 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
