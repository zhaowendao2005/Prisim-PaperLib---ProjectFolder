<script setup lang="ts">
/**
 * 左侧栏组件
 * 包含搜索、导航、论文列表、用户信息
 */

import { computed, onMounted } from 'vue'
import { SearchBox, NavItem, PaperCard, UserProfile } from '@components/index'
import { usePaperStore, useUIStore } from '@stores/index'

const paperStore = usePaperStore()
const uiStore = useUIStore()

const isDark = computed(() => uiStore.isDark)

const containerClass = computed(() =>
  isDark.value ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white/60'
)

function onSearch(query: string): void {
  void paperStore.searchPapers(query)
}

onMounted(() => {
  void paperStore.fetchPapers()
})
</script>

<template>
  <div
    class="w-64 flex flex-col rounded-2xl border backdrop-blur-xl shadow-sm transition-all duration-300"
    :class="containerClass"
  >
    <!-- Search -->
    <div class="p-4 pb-2">
      <SearchBox :is-dark="isDark" placeholder="Search..." @search="onSearch" />
    </div>

    <!-- Navigation -->
    <div class="px-3 space-y-0.5 mb-4 select-none">
      <div class="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-wider">Library</div>
      <NavItem label="All Papers" icon="folder" :is-active="true" :is-dark="isDark" />
      <NavItem label="Recent" icon="clock" :is-dark="isDark" />
      <NavItem label="iCloud Drive" icon="cloud" :is-dark="isDark" />
    </div>

    <!-- Paper List -->
    <div class="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar pb-3">
      <div class="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">Papers</div>

      <div v-if="paperStore.loading" class="text-center text-xs text-gray-400 py-4">Loading...</div>

      <template v-else>
        <PaperCard
          v-for="paper in paperStore.papers"
          :key="paper.id"
          :paper="paper"
          :is-selected="paperStore.currentPaper?.id === paper.id"
          :is-dark="isDark"
          @select="paperStore.selectPaper"
        />
      </template>
    </div>

    <!-- User Profile -->
    <UserProfile name="Dr. User" plan="Pro Plan" :is-dark="isDark" />
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
