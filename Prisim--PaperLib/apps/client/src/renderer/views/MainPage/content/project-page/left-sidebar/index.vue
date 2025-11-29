<script setup lang="ts">
/**
 * 左侧边栏组件
 * 包含：搜索框、导航、论文列表、用户资料
 */
import { ref } from 'vue'

// 临时模拟数据
const papers = ref([
  { id: 1, title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, journal: 'NIPS', abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...' },
  { id: 2, title: 'Deep Residual Learning for Image Recognition', authors: 'He et al.', year: 2016, journal: 'CVPR', abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework...' },
  { id: 3, title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', year: 2019, journal: 'NAACL', abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations...' },
  { id: 4, title: 'Graph Attention Networks', authors: 'Veličković et al.', year: 2018, journal: 'ICLR', abstract: 'We present graph attention networks (GATs), novel neural network architectures that operate on graph-structured data...' }
])

const selectedPaper = ref(papers.value[0])

function selectPaper(paper: typeof papers.value[0]) {
  selectedPaper.value = paper
}
</script>

<template>
  <aside class="left-sidebar">
    <!-- Search -->
    <div class="search-wrapper">
      <div class="search-box">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search..." class="search-input" />
        <div class="search-shortcut">
          <svg class="shortcut-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span>K</span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div class="nav-label">Library</div>
      <div class="nav-item active">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span>All Papers</span>
      </div>
      <div class="nav-item">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Recent</span>
      </div>
      <div class="nav-item">
        <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <span>iCloud Drive</span>
      </div>
    </nav>

    <!-- Paper List -->
    <div class="paper-list custom-scrollbar">
      <div class="nav-label">Papers</div>
      <div
        v-for="paper in papers"
        :key="paper.id"
        class="paper-card"
        :class="{ selected: selectedPaper.id === paper.id }"
        @click="selectPaper(paper)"
      >
        <div v-if="selectedPaper.id === paper.id" class="paper-indicator" />
        <div class="paper-title">{{ paper.title }}</div>
        <div class="paper-meta">
          <span>{{ paper.authors.split(' ')[0] }} et al.</span>
          <span class="paper-journal">{{ paper.journal }}</span>
        </div>
      </div>
    </div>

    <!-- User Profile -->
    <div class="user-profile">
      <div class="user-avatar" />
      <div class="user-info">
        <span class="user-name">Dr. User</span>
        <span class="user-plan">Pro Plan</span>
      </div>
      <svg class="settings-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  </aside>
</template>

<style scoped>
/* ========== Left Sidebar ========== */
.left-sidebar {
  width: 256px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-light);
  background-color: var(--color-bg-sidebar);
  backdrop-filter: blur(24px);
  transition: all 0.3s;
}

/* Search */
.search-wrapper {
  padding: 16px 16px 8px;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background-color: var(--color-bg-input);
  transition: all 0.2s;
}
.search-box:focus-within {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.search-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-text-muted);
  margin-right: 8px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: var(--color-text-primary);
}
.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-shortcut {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  opacity: 0.6;
}
.shortcut-icon {
  width: 10px;
  height: 10px;
  margin-right: 2px;
}
.search-shortcut span {
  font-size: 10px;
}

/* Navigation */
.sidebar-nav {
  padding: 0 12px;
  margin-bottom: 16px;
  user-select: none;
}

.nav-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--color-text-secondary);
}
.nav-item:hover {
  background-color: var(--color-bg-hover);
}
.nav-item.active {
  background-color: var(--color-accent);
  color: white;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-right: 12px;
}

.nav-item span {
  font-size: 12px;
}
.nav-item.active span {
  font-weight: 500;
}

/* Paper List */
.paper-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.paper-card {
  position: relative;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  margin-bottom: 8px;
  transition: all 0.2s;
}
.paper-card:hover {
  background-color: var(--color-bg-hover);
}
.paper-card.selected {
  background-color: var(--color-bg-card);
  border-color: var(--color-border-light);
  box-shadow: var(--shadow-md);
}

.paper-indicator {
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 4px;
  background-color: var(--color-accent);
  border-radius: 0 4px 4px 0;
}

.paper-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
}
.paper-card.selected .paper-title {
  color: var(--color-accent);
}

.paper-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--color-text-muted);
}

.paper-journal {
  padding: 2px 8px;
  border-radius: 6px;
  background-color: var(--color-bg-input);
}

/* User Profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin: 8px 12px 12px;
  border-radius: 12px;
  background-color: var(--color-bg-hover);
  transition: background-color 0.2s;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 12px;
  font-weight: 600;
}

.user-plan {
  font-size: 10px;
  opacity: 0.5;
}

.settings-icon {
  width: 14px;
  height: 14px;
  margin-left: auto;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.2s;
}
.settings-icon:hover {
  opacity: 1;
}

/* Custom Scrollbar */
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
