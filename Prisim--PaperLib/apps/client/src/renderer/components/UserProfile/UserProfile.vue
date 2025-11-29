<script setup lang="ts">
/**
 * 用户信息组件
 */

import { computed } from 'vue'

interface Props {
  name?: string
  plan?: string
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'User',
  plan: 'Free',
  isDark: false
})

const emit = defineEmits<{
  settings: []
}>()

const containerClass = computed(() => (props.isDark ? 'bg-white/5' : 'bg-white/50'))
</script>

<template>
  <div class="p-4 mx-3 mb-3 mt-2 rounded-xl flex items-center space-x-3 transition-colors" :class="containerClass">
    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 shadow-inner" />
    <div class="flex flex-col">
      <span class="text-xs font-semibold">{{ name }}</span>
      <span class="text-[10px] opacity-50">{{ plan }}</span>
    </div>
    <button class="ml-auto opacity-50 hover:opacity-100 cursor-pointer" @click="emit('settings')">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  </div>
</template>
