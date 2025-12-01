<script setup lang="ts">
/**
 * SingleFile Right Sidebar Topbar - 右侧栏标签栏
 * 用于切换不同的面板（概览、笔记等）
 */

export interface TabItem {
  id: string
  label: string
}

const props = defineProps<{
  activeTab: string
  tabs: TabItem[]
}>()

const emit = defineEmits<{
  'update:activeTab': [tabId: string]
}>()
</script>

<template>
  <nav class="single-pdf-right-sidebar-topbar">
    <button 
      v-for="tab in props.tabs" 
      :key="tab.id"
      class="single-pdf-right-sidebar-topbar__tab"
      :class="{ 'single-pdf-right-sidebar-topbar__tab--active': props.activeTab === tab.id }"
      @click="emit('update:activeTab', tab.id)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<style scoped>
.single-pdf-right-sidebar-topbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
  background-color: var(--color-bg-card);
}

.single-pdf-right-sidebar-topbar__tab {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.single-pdf-right-sidebar-topbar__tab:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
}

.single-pdf-right-sidebar-topbar__tab--active {
  color: var(--color-accent);
  background-color: var(--color-accent-light);
}

.single-pdf-right-sidebar-topbar__tab--active:hover {
  background-color: var(--color-accent-light);
}
</style>
