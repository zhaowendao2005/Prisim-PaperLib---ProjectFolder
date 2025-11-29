<script setup lang="ts">
/**
 * 主页面 - 严格按照 Mainpage.html 原型
 */
import { ref } from 'vue'

// 模拟数据
const papers = ref([
  { id: 1, title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, journal: 'NIPS', abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...' },
  { id: 2, title: 'Deep Residual Learning for Image Recognition', authors: 'He et al.', year: 2016, journal: 'CVPR', abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework...' },
  { id: 3, title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', year: 2019, journal: 'NAACL', abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations...' },
  { id: 4, title: 'Graph Attention Networks', authors: 'Veličković et al.', year: 2018, journal: 'ICLR', abstract: 'We present graph attention networks (GATs), novel neural network architectures that operate on graph-structured data...' }
])

const selectedPaper = ref(papers.value[0])
const scale = ref(1.0)
const rightTab = ref<'notes' | 'ai'>('notes')
const isMaximized = ref(false)
const isDark = ref(false)
</script>

<template>
  <!-- 根容器 -->
  <div class="app-container" :class="{ dark: isDark }">
    <!-- 1. Title Bar -->
    <header class="title-bar">
      <!-- Traffic Lights -->
      <div class="traffic-lights">
        <button class="traffic-btn close"><span>×</span></button>
        <button class="traffic-btn minimize"><span>-</span></button>
        <button class="traffic-btn maximize" @click="isMaximized = !isMaximized"><span>⤢</span></button>
      </div>

      <!-- Title / Drag Area -->
      <div class="title-drag-area">
        <div class="title-pill">
          <svg class="icon-doc" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="title-text">PaperMind</span>
          <span class="title-sep"> — </span>
          <span class="title-filename">{{ selectedPaper.title }}.pdf</span>
        </div>
      </div>

      <!-- Right Toolbar -->
      <div class="title-toolbar">
        <button class="toolbar-btn" @click="isDark = !isDark">
          <svg v-if="isDark" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        <button class="toolbar-btn">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 2. Main Layout -->
    <main class="main-layout">
      <!-- Left Sidebar -->
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
            @click="selectedPaper = paper"
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

      <!-- Middle: PDF Reader -->
      <section class="pdf-reader">
        <!-- Floating Toolbar -->
        <div class="pdf-toolbar">
          <button class="pdf-toolbar-btn" title="Previous">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="page-indicator">1 / 12</span>
          <button class="pdf-toolbar-btn" title="Next">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div class="toolbar-divider" />
          <button class="pdf-toolbar-btn" title="Zoom Out" @click="scale = Math.max(0.5, scale - 0.1)">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span class="zoom-indicator">{{ (scale * 100).toFixed(0) }}%</span>
          <button class="pdf-toolbar-btn" title="Zoom In" @click="scale = Math.min(2.0, scale + 0.1)">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <div class="toolbar-divider" />
          <button class="pdf-toolbar-btn" title="Highlight">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <!-- Reader Content -->
        <div class="pdf-content custom-scrollbar">
          <div
            v-for="page in [1, 2, 3]"
            :key="page"
            class="pdf-page"
            :style="{ width: (595 * scale) + 'px', minHeight: (842 * scale) + 'px', fontSize: (12 * scale) + 'px', padding: (48 * scale) + 'px' }"
          >
            <div class="page-header">
              <span>PaperMind Reader</span>
              <span>Page {{ page }}</span>
            </div>
            <div class="page-body font-serif">
              <h2 class="page-title">{{ selectedPaper.title }}</h2>
              <div class="page-authors">{{ selectedPaper.authors }} — {{ selectedPaper.year }}</div>
              <div class="page-columns">
                <p class="first-para">
                  {{ selectedPaper.abstract }} The Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution.
                </p>
                <p>In the following sections, we will describe the Transformer, motivate self-attention and discuss its advantages over models such as [17, 18] and [9].</p>
                <div class="formula-box">
                  <strong>Attention(Q, K, V)</strong><br />= softmax(QK^T / √d_k)V
                </div>
                <p>Most competitive neural sequence transduction models have an encoder-decoder structure [5, 2, 35]. Here, the encoder maps an input sequence of symbol representations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Sidebar -->
      <aside class="right-sidebar">
        <!-- Segmented Control -->
        <div class="segment-wrapper">
          <div class="segment-control">
            <button class="segment-btn" :class="{ active: rightTab === 'notes' }" @click="rightTab = 'notes'">Notes</button>
            <button class="segment-btn" :class="{ active: rightTab === 'ai' }" @click="rightTab = 'ai'">AI Assistant</button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content custom-scrollbar">
          <!-- Notes Tab -->
          <div v-if="rightTab === 'notes'" class="notes-tab">
            <div class="metadata-card">
              <div class="metadata-header">
                <div class="status-dot" />
                <span>Metadata</span>
              </div>
              <div class="metadata-grid">
                <span class="meta-label">Journal</span>
                <span class="meta-value">{{ selectedPaper.journal }}</span>
                <span class="meta-label">Year</span>
                <span class="meta-value">{{ selectedPaper.year }}</span>
              </div>
            </div>
            <div class="scratchpad">
              <div class="scratchpad-header">
                <span>Scratchpad</span>
                <svg class="share-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <textarea class="scratchpad-input" placeholder="Write something..."># {{ selectedPaper.title }}

This paper introduces the Transformer model.

Key takeaways:
- Self-attention mechanism
- Parallelizable training</textarea>
            </div>
          </div>

          <!-- AI Tab -->
          <div v-if="rightTab === 'ai'" class="ai-tab">
            <div class="chat-messages">
              <!-- AI Message -->
              <div class="chat-row ai">
                <div class="ai-avatar">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="chat-bubble ai">
                  I've read <strong>{{ selectedPaper.title }}</strong>.
                  <div class="quick-actions">
                    <button class="quick-btn">Summarize</button>
                    <button class="quick-btn">Methods</button>
                  </div>
                </div>
              </div>
              <!-- User Message -->
              <div class="chat-row user">
                <div class="chat-bubble user">What is the main contribution?</div>
              </div>
              <!-- AI Response -->
              <div class="chat-row ai">
                <div class="ai-avatar">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="chat-bubble ai">The main contribution is proposing a model architecture that eschews recurrence and relies entirely on attention.</div>
              </div>
            </div>
            <!-- Chat Input -->
            <div class="chat-input-wrapper">
              <input type="text" class="chat-input" placeholder="Ask PaperMind..." />
              <button class="send-btn">
                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
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

/* ========== Title Bar ========== */
.title-bar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  user-select: none;
  background-color: var(--color-bg-toolbar);
  backdrop-filter: blur(12px);
  z-index: 50;
  transition: background-color 0.3s;
}

/* Traffic Lights */
.traffic-lights {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
  -webkit-app-region: no-drag;
}

.traffic-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s;
}
.traffic-btn:hover { filter: brightness(0.9); }
.traffic-btn span {
  display: none;
  font-size: 8px;
  font-weight: bold;
  color: rgba(0,0,0,0.5);
}
.traffic-btn:hover span { display: block; }

.traffic-btn.close {
  background-color: var(--traffic-close);
  border-color: var(--traffic-close-border);
}
.traffic-btn.minimize {
  background-color: var(--traffic-minimize);
  border-color: var(--traffic-minimize-border);
}
.traffic-btn.maximize {
  background-color: var(--traffic-maximize);
  border-color: var(--traffic-maximize-border);
}
.traffic-btn.maximize span { font-size: 6px; }

/* Title Drag Area */
.title-drag-area {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: drag;
}

.title-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 6px;
  background-color: var(--color-bg-hover);
  transition: background-color 0.2s;
}

.icon-doc {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #007AFF;
}

.title-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.title-sep {
  font-size: 10px;
  opacity: 0.4;
  margin: 0 4px;
}

.title-filename {
  font-size: 12px;
  opacity: 0.6;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Title Toolbar */
.title-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: 80px;
  -webkit-app-region: no-drag;
}

.toolbar-btn {
  color: var(--color-text-muted);
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.toolbar-btn:hover { color: var(--color-text-secondary); }

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ========== Main Layout ========== */
.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 8px 12px 12px;
  gap: 12px;
}

/* ========== Left Sidebar ========== */
.left-sidebar {
  width: 256px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  background-color: var(--color-bg-sidebar);
  backdrop-filter: blur(24px);
  box-shadow: var(--shadow-sm);
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

/* ========== PDF Reader ========== */
.pdf-reader {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.pdf-toolbar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 9999px;
  background-color: var(--color-bg-toolbar);
  border: 1px solid var(--color-border-light);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s;
}

.pdf-toolbar-btn {
  padding: 8px;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background-color 0.2s;
}
.pdf-toolbar-btn:hover {
  background-color: var(--color-bg-hover);
}

.page-indicator {
  font-size: 12px;
  font-family: monospace;
  font-weight: 500;
  padding: 0 8px;
  opacity: 0.6;
}

.zoom-indicator {
  font-size: 12px;
  font-family: monospace;
  font-weight: 500;
  width: 40px;
  text-align: center;
}

.toolbar-divider {
  width: 1px;
  height: 16px;
  margin: 0 8px;
  background-color: var(--color-border);
}

.pdf-content {
  flex: 1;
  overflow-y: auto;
  padding: 80px 16px 40px;
  text-align: center;
}

.pdf-page {
  position: relative;
  margin: 0 auto 40px;
  text-align: left;
  border-radius: 2px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease-out;
  transform-origin: top center;
}

.page-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
  margin-bottom: 24px;
  opacity: 0.4;
  font-size: 0.7em;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.page-body {
  line-height: 1.8;
  text-align: justify;
}

.page-title {
  font-size: 1.8em;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.page-authors {
  font-size: 0.9em;
  font-style: italic;
  color: var(--color-accent);
  opacity: 0.8;
  margin-bottom: 32px;
}

.page-columns {
  columns: 2;
  column-gap: 32px;
  font-size: 0.95em;
}
.page-columns p {
  margin-bottom: 24px;
}

.first-para::first-letter {
  font-size: 3em;
  font-weight: 700;
  float: left;
  margin-right: 12px;
  margin-top: -10px;
  opacity: 0.2;
}

.formula-box {
  padding: 24px;
  margin: 24px 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-bg-hover);
  font-size: 0.85em;
  font-family: monospace;
  text-align: center;
  word-break: break-word;
}

/* ========== Right Sidebar ========== */
.right-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  background-color: var(--color-bg-sidebar);
  backdrop-filter: blur(24px);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.segment-wrapper {
  padding: 16px 16px 8px;
}

.segment-control {
  display: flex;
  padding: 4px;
  border-radius: 8px;
  background-color: var(--color-bg-input);
}

.segment-btn {
  flex: 1;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.segment-btn:hover {
  color: var(--color-text-secondary);
}
.segment-btn.active {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 16px;
}

/* Notes Tab */
.notes-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metadata-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}

.metadata-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
}

.metadata-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 6px;
  font-size: 12px;
}

.meta-label {
  color: var(--color-text-muted);
}

.meta-value {
  font-weight: 500;
}

.scratchpad {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.scratchpad-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.share-icon {
  width: 12px;
  height: 12px;
  cursor: pointer;
  transition: color 0.2s;
}
.share-icon:hover {
  color: var(--color-accent);
}

.scratchpad-input {
  flex: 1;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: all 0.2s;
}
.scratchpad-input:focus {
  background-color: var(--color-bg-secondary);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}
.scratchpad-input::placeholder {
  color: var(--color-text-muted);
}

/* AI Tab */
.ai-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-row {
  display: flex;
  gap: 12px;
}
.chat-row.user {
  flex-direction: row-reverse;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #9333ea);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.icon-sm {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.chat-bubble {
  padding: 14px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 16px;
}
.chat-bubble.ai {
  border-top-left-radius: 4px;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}
.chat-bubble.user {
  border-top-right-radius: 4px;
  background-color: var(--color-accent);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.quick-btn {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}
.quick-btn:hover {
  background-color: var(--color-bg-active);
}

.chat-input-wrapper {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 8px 8px 8px 16px;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}
.chat-input-wrapper:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  color: var(--color-text-primary);
}
.chat-input::placeholder {
  color: var(--color-text-muted);
}

.send-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #1e293b;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.send-btn:hover {
  background-color: #334155;
}
.send-btn:active {
  transform: scale(0.95);
}

/* ========== 通用 ========== */
.font-serif {
  font-family: 'Noto Serif', serif;
}

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
