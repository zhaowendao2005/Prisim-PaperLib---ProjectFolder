<script setup lang="ts">
/**
 * PDF 阅读器组件
 * 包含工具栏和页面渲染
 */

import { computed, ref } from 'vue'
import { PdfToolbar, PdfPage } from '@components/index'
import { usePaperStore, useUIStore } from '@stores/index'

const paperStore = usePaperStore()
const uiStore = useUIStore()

const isDark = computed(() => uiStore.isDark)
const scale = computed(() => uiStore.pdfScale)
const currentPaper = computed(() => paperStore.currentPaper)

const currentPage = ref(1)
const totalPages = ref(3)

function prevPage(): void {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage(): void {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function onHighlight(): void {
  // TODO: 实现高亮功能
  console.log('Highlight clicked')
}
</script>

<template>
  <div class="flex-1 flex flex-col relative overflow-hidden rounded-2xl bg-transparent">
    <!-- Floating Toolbar -->
    <PdfToolbar
      :current-page="currentPage"
      :total-pages="totalPages"
      :scale="scale"
      :is-dark="isDark"
      @prev-page="prevPage"
      @next-page="nextPage"
      @zoom-in="uiStore.zoomIn"
      @zoom-out="uiStore.zoomOut"
      @highlight="onHighlight"
    />

    <!-- Reader Content -->
    <div class="flex-1 overflow-y-auto px-4 pt-20 pb-10 text-center custom-scrollbar">
      <PdfPage
        v-for="page in totalPages"
        :key="page"
        :page-num="page"
        :scale="scale"
        :paper="currentPaper"
        :is-dark="isDark"
      />
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
