<script setup lang="ts">
/**
 * 主页面 - 布局容器
 */
import { ref } from 'vue'
import { useTabManager } from '@composables/page-navigation'

import Topbar from './topbar/index.vue'
import Tabbar from './tabbar/index.vue'
import HomePage from './content/home-page/index.vue'
import ProjectPage from './content/project-page/index.vue'
import NewTabPage from './content/new-tab-page/index.vue'
import SettingsPage from './content/settings-page/index.vue'

const isDark = ref(false)
const { activeTab } = useTabManager()
</script>

<template>
  <!-- 根容器 -->
  <div class="app-container" :class="{ dark: isDark }">
    <!-- 1. Title Bar -->
    <Topbar />

    <!-- 2. Tab Bar -->
    <Tabbar />

    <!-- 3. Main Layout -->
    <main class="main-layout">
      <HomePage v-if="activeTab?.type === 'home'" />
      <ProjectPage v-else-if="activeTab?.type === 'project'" />
      <NewTabPage v-else-if="activeTab?.type === 'new-tab'" />
      <SettingsPage v-else-if="activeTab?.type === 'settings'" />
    </main>
  </div>
</template>

<style scoped>
/* ========== 根容器 ========== */
.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: background-color 0.5s, color 0.5s;
}

/* ========== Main Layout ========== */
.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
