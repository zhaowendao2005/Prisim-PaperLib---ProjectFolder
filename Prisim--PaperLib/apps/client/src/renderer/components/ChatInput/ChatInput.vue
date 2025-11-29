<script setup lang="ts">
/**
 * 聊天输入框组件
 */

import { ref, computed } from 'vue'

interface Props {
  placeholder?: string
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Ask something...',
  isDark: false
})

const emit = defineEmits<{
  send: [message: string]
}>()

const inputValue = ref('')

const containerClass = computed(() =>
  props.isDark
    ? 'bg-black/20 border-white/10 focus-within:bg-black/40'
    : 'bg-white border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100'
)

function onSend(): void {
  if (inputValue.value.trim()) {
    emit('send', inputValue.value.trim())
    inputValue.value = ''
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    onSend()
  }
}
</script>

<template>
  <div class="flex items-center p-2 pr-2 pl-4 rounded-full border shadow-sm transition-colors" :class="containerClass">
    <input
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="flex-1 bg-transparent border-none outline-none text-xs"
      @keydown="onKeydown"
    />
    <button
      class="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-700 transition-transform active:scale-95 flex items-center justify-center"
      @click="onSend"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>
