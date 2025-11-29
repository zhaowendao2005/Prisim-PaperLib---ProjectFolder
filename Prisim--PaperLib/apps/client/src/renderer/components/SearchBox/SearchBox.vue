<script setup lang="ts">
/**
 * 搜索框组件
 */

import { ref } from 'vue'

interface Props {
  isDark?: boolean
  placeholder?: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false,
  placeholder: 'Search...',
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
}>()

const inputValue = ref(props.modelValue)

function onInput(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  inputValue.value = value
  emit('update:modelValue', value)
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    emit('search', inputValue.value)
  }
}
</script>

<template>
  <div
    class="flex items-center px-3 py-2 rounded-xl border transition-colors"
    :class="
      isDark
        ? 'bg-black/20 border-white/5 focus-within:bg-black/40'
        : 'bg-gray-100/50 border-transparent focus-within:bg-white focus-within:shadow-sm focus-within:border-blue-200'
    "
  >
    <svg class="w-3.5 h-3.5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      :placeholder="placeholder"
      :value="inputValue"
      class="bg-transparent border-none outline-none w-full text-xs placeholder-gray-400"
      @input="onInput"
      @keydown="onKeydown"
    />
    <div class="flex items-center">
      <svg class="w-2.5 h-2.5 text-gray-300 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
      <span class="text-[10px] text-gray-300">K</span>
    </div>
  </div>
</template>
