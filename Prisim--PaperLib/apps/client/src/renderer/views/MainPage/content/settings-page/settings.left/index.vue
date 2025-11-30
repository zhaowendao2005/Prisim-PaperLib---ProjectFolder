<script setup lang="ts">
/**
 * 设置页面 - 侧边栏导航
 */

defineProps<{
  activeTab: string
  searchQuery: string
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
  'update:searchQuery': [value: string]
}>()

/** 导航项配置 */
const navItems = [
  { id: 'general', label: '通用', icon: 'monitor' },
  { id: 'reader', label: '阅读器', icon: 'book' },
  { id: 'library', label: '文献库', icon: 'library' },
  { id: 'notes', label: '笔记与摘要', icon: 'edit' }
]

const navItemsSecondary = [
  { id: 'sync', label: '云同步', icon: 'cloud' },
  { id: 'account', label: '账户', icon: 'user' }
]

const navItemsTertiary = [
  { id: 'fonts', label: '字体管理', icon: 'type' }
]
</script>

<template>
  <div class="sidebar">
    <div class="app-logo">
      <div class="logo-icon">P</div>
      <div class="logo-text">
        <h1>PaperFlow</h1>
        <span>v2.4.1 (Pro)</span>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-container">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        :value="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索设置..."
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="nav-list">
      <!-- 主导航 -->
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeTab === item.id }"
        @click="emit('update:activeTab', item.id)"
      >
        <!-- Monitor 图标 -->
        <svg v-if="item.icon === 'monitor'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
        <!-- Book 图标 -->
        <svg v-else-if="item.icon === 'book'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <!-- Library 图标 -->
        <svg v-else-if="item.icon === 'library'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m16 6 4 14" />
          <path d="M12 6v14" />
          <path d="M8 8v12" />
          <path d="M4 4v16" />
        </svg>
        <!-- Edit 图标 -->
        <svg v-else-if="item.icon === 'edit'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        {{ item.label }}
      </button>

      <div class="nav-divider" />

      <!-- 次级导航 -->
      <button
        v-for="item in navItemsSecondary"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeTab === item.id }"
        @click="emit('update:activeTab', item.id)"
      >
        <!-- Cloud 图标 -->
        <svg v-if="item.icon === 'cloud'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19" />
          <path d="M17.5 19c.7 0 3.5-.5 3.5-5 0-2.3-1-3.6-2.5-4.5" />
          <path d="M6.5 19c-.7 0-3.5-.5-3.5-5 0-2.3 1-3.6 2.5-4.5" />
          <path d="M12 13.5V4l5 5" />
          <path d="M12 4 7 9" />
        </svg>
        <!-- User 图标 -->
        <svg v-else-if="item.icon === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {{ item.label }}
      </button>

      <div class="nav-divider" />

      <!-- 第三级导航 -->
      <button
        v-for="item in navItemsTertiary"
        :key="item.id"
        class="nav-item"
        :class="{ active: activeTab === item.id }"
        @click="emit('update:activeTab', item.id)"
      >
        <!-- Type 图标 -->
        <svg v-if="item.icon === 'type'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" x2="15" y1="20" y2="20" />
          <line x1="12" x2="12" y1="4" y2="20" />
        </svg>
        {{ item.label }}
      </button>
    </div>

    <div class="sidebar-footer">
      © 2024 PaperFlow Inc.
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background: rgba(249, 250, 251, 0.5);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  padding: 12px;
  flex-shrink: 0;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 16px 8px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #4f46e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.logo-text h1 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.logo-text span {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.search-container {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 14px;
  height: 14px;
}

.search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 6px;
  padding: 6px 8px 6px 28px;
  font-size: 12px;
  color: var(--color-text-primary);
  transition: all 0.2s;
  height: 32px;
}

.search-input:focus {
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
}

.nav-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.nav-item.active {
  background: var(--color-accent);
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 8px 12px;
}

.sidebar-footer {
  margin-top: auto;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  padding-bottom: 8px;
}
</style>
