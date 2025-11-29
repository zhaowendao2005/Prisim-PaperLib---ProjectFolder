<script setup lang="ts">
/**
 * PDF 页面渲染组件
 * 用于显示单个 PDF 页面的内容
 */

import { computed } from 'vue'
import type { Paper } from '@core/types/paper'

interface Props {
  pageNum?: number
  scale?: number
  paper?: Paper | null
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageNum: 1,
  scale: 1.0,
  paper: null,
  isDark: false
})

const containerClass = computed(() =>
  props.isDark
    ? 'bg-[#1e1e1e] text-gray-400 shadow-2xl shadow-black/50'
    : 'bg-white text-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]'
)

const containerStyle = computed(() => ({
  width: `${595 * props.scale}px`,
  minHeight: `${842 * props.scale}px`,
  fontSize: `${12 * props.scale}px`,
  padding: `${48 * props.scale}px`
}))

const titleClass = computed(() => (props.isDark ? 'text-white/90' : 'text-black/90'))

const codeBlockClass = computed(() =>
  props.isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50/50 border-blue-100'
)

const firstLetterClass = computed(() => (props.isDark ? 'first-letter:text-white/20' : 'first-letter:text-black/20'))
</script>

<template>
  <div
    class="relative mx-auto mb-10 transition-all duration-300 ease-out origin-top rounded-sm text-left"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Header -->
    <div
      class="flex justify-between border-b pb-4 mb-6 border-gray-100 opacity-40 text-[0.7em] uppercase tracking-widest font-semibold"
    >
      <span>PaperMind Reader</span>
      <span>Page {{ pageNum }}</span>
    </div>

    <!-- Content -->
    <div class="space-y-6 text-justify leading-loose font-serif">
      <template v-if="paper">
        <h2 class="font-bold text-[1.8em] leading-tight" :class="titleClass">
          {{ paper.title }}
        </h2>
        <div class="text-[0.9em] italic text-blue-600/80 mb-8">
          {{ paper.authors.join(', ') }} — {{ paper.year }}
        </div>

        <div class="columns-2 gap-8 text-[0.95em]">
          <p
            class="mb-6 first-letter:text-[3em] first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]"
            :class="firstLetterClass"
          >
            {{ paper.abstract }}
          </p>
          <p class="mb-6">
            In the following sections, we will describe the methodology, motivate our approach and discuss its
            advantages over existing methods.
          </p>
          <div class="p-6 my-6 border rounded-xl text-[0.85em] font-mono text-center break-words" :class="codeBlockClass">
            <strong>Attention(Q, K, V)</strong><br />
            = softmax(QK^T / √d_k)V
          </div>
          <p>
            Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder
            maps an input sequence of symbol representations.
          </p>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center justify-center h-64 text-gray-400">
          <span>No paper selected</span>
        </div>
      </template>
    </div>
  </div>
</template>
