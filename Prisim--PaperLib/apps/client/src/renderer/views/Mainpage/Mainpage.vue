<script setup lang="ts">
/**
 * 主页面
 * 组合 TitleBar、LeftSidebar、PdfViewer、RightSidebar
 */

import { computed, onMounted } from 'vue'
import { TitleBar } from '@components/index'
import { useUIStore, usePaperStore } from '@stores/index'
import LeftSidebar from './LeftSidebar.vue'
import PdfViewer from './PdfViewer.vue'
import RightSidebar from './RightSidebar.vue'

const uiStore = useUIStore()
const paperStore = usePaperStore()

const isDark = computed(() => uiStore.isDark)

const containerClass = computed(() => (isDark.value ? 'bg-[#0f0f12] text-slate-300' : 'bg-[#F5F5F7] text-slate-700'))

const currentTitle = computed(() => paperStore.currentPaper?.title ?? '')

onMounted(() => {
  void uiStore.init()
})
</script>

<template>
  <div class="h-screen w-full flex flex-col overflow-hidden transition-colors duration-500" :class="containerClass">
    <!-- Title Bar -->
    <TitleBar
      :is-dark="isDark"
      title="PaperMind"
      :subtitle="currentTitle"
      @toggle-theme="uiStore.toggleTheme"
      @toggle-maximized="uiStore.toggleMaximized"
    />

    <!-- Main Layout -->
    <div class="flex flex-1 overflow-hidden pt-2 pb-3 px-3 gap-3">
      <!-- Left Sidebar -->
      <LeftSidebar />

      <!-- PDF Viewer -->
      <PdfViewer />

      <!-- Right Sidebar -->
      <RightSidebar />
    </div>
  </div>
</template>
