<script setup lang="ts">
/**
 * HomePage 右侧栏 - 水平导航栏
 */
const emit = defineEmits<{
  collapse: []
}>()
</script>

<template>
  <nav class="right-navbar">
    <button class="tab-btn active">概览</button>
    <button class="tab-btn">统计</button>
    <button class="tab-btn">活动</button>
    <button class="tab-btn toggle-btn" @click="emit('collapse')">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7" />
      </svg>
    </button>
  </nav>
</template>

<style scoped>
.right-navbar {
  display: flex;
  gap: 4px;
  padding: 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.tab-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.tab-btn.toggle-btn {
  margin-left: auto;
  padding: 6px;
}

.tab-btn.toggle-btn svg {
  width: 14px;
  height: 14px;
}
</style>
