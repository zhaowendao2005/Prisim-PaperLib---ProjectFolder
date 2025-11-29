<script setup lang="ts">
/**
 * 分段控制器组件
 */

import { computed } from 'vue'

interface Segment {
  key: string
  label: string
}

interface Props {
  segments: Segment[]
  modelValue: string
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerClass = computed(() => (props.isDark ? 'bg-black/40' : 'bg-gray-200/60'))

function getSegmentClass(key: string): string {
  if (key === props.modelValue) {
    return props.isDark ? 'bg-gray-700 text-white shadow' : 'bg-white text-gray-800 shadow'
  }
  return 'text-gray-500 hover:text-gray-700'
}
</script>

<template>
  <div class="flex p-1 rounded-lg" :class="containerClass">
    <button
      v-for="segment in segments"
      :key="segment.key"
      class="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all shadow-sm flex justify-center items-center"
      :class="getSegmentClass(segment.key)"
      @click="emit('update:modelValue', segment.key)"
    >
      {{ segment.label }}
    </button>
  </div>
</template>
