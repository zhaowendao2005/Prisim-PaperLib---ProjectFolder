<script setup lang="ts">
/**
 * 聊天消息组件
 */

import { computed } from 'vue'

interface Props {
  content: string
  isUser?: boolean
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUser: false,
  isDark: false
})

const containerClass = computed(() => (props.isUser ? 'flex-row-reverse' : ''))

const bubbleClass = computed(() => {
  if (props.isUser) {
    return 'rounded-tr-none bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-none'
  }
  return props.isDark
    ? 'rounded-tl-none bg-white/10 border-white/5 text-gray-200'
    : 'rounded-tl-none bg-white border-gray-100 text-gray-700'
})
</script>

<template>
  <div class="flex gap-3" :class="containerClass">
    <!-- AI Avatar -->
    <div
      v-if="!isUser"
      class="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 dark:shadow-none flex-shrink-0"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    </div>

    <!-- Message Bubble -->
    <div class="p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm border" :class="bubbleClass">
      <slot>{{ content }}</slot>
    </div>
  </div>
</template>
