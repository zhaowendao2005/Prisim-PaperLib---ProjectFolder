<script setup lang="ts">
/**
 * 设置页面 - macOS 风格
 * 主入口，整合侧边栏和内容区域
 */
import { ref } from 'vue'
import SettingsLeft from './settings.left/index.vue'
import GeneralSettings from './settings.content/general.vue'
import ReaderSettings from './settings.content/reader.vue'
import LibrarySettings from './settings.content/library.vue'
import PlaceholderSettings from './settings.content/placeholder.vue'

// 当前激活的设置 Tab
const activeTab = ref('general')

// 搜索查询
const searchQuery = ref('')

// Tab 名称映射
const tabNames: Record<string, string> = {
  notes: '笔记与摘要',
  sync: '云同步',
  account: '账户',
  fonts: '字体管理'
}
</script>

<template>
  <div class="settings-page">
    <!-- 侧边栏 -->
    <SettingsLeft
      v-model:active-tab="activeTab"
      v-model:search-query="searchQuery"
    />

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="content-wrapper">
        <GeneralSettings v-if="activeTab === 'general'" />
        <ReaderSettings v-else-if="activeTab === 'reader'" />
        <LibrarySettings v-else-if="activeTab === 'library'" />
        <PlaceholderSettings
          v-else
          :tab-name="tabNames[activeTab] || activeTab"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--color-bg-primary);
}

.content-area {
  flex: 1;
  padding: 32px;
  overflow: auto; /* 水平和垂直都可滚动 */
  background: rgba(255, 255, 255, 0.4);
}

.content-wrapper {
  min-width: 560px; /* 最小宽度，防止组件被压缩 */
  max-width: 920px; /* 最大宽度加宽 */
  margin: 0 auto;
}
</style>
