<script setup lang="ts">
/**
 * 导航项组件
 */

import { computed } from 'vue'

interface Props {
  label: string
  icon?: string
  isActive?: boolean
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'folder',
  isActive: false,
  isDark: false
})

const emit = defineEmits<{
  click: []
}>()

const itemClass = computed(() => {
  if (props.isActive) {
    return props.isDark ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-900'
  }
  return props.isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-black/5 text-gray-500'
})

const textClass = computed(() => (props.isActive ? 'font-medium' : ''))
</script>

<template>
  <div
    class="flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors"
    :class="itemClass"
    @click="emit('click')"
  >
    <!-- Folder icon -->
    <svg v-if="icon === 'folder'" class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
    <!-- Clock icon -->
    <svg v-else-if="icon === 'clock'" class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <!-- Cloud icon -->
    <svg v-else-if="icon === 'cloud'" class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
    <!-- Default icon -->
    <svg v-else class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>

    <span class="text-xs" :class="textClass">{{ label }}</span>
  </div>
</template>
