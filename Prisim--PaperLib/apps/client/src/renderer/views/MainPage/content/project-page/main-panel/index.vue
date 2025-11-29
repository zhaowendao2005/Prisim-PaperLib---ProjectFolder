<script setup lang="ts">
/**
 * 主面板组件 - PDF 阅读器
 * 包含：PDF 工具栏、PDF 内容区
 */
import { ref } from 'vue'

const scale = ref(1.0)

// 临时模拟数据
const selectedPaper = ref({
  title: 'Attention Is All You Need',
  authors: 'Vaswani et al.',
  year: 2017,
  abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...'
})
</script>

<template>
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
</template>

<style scoped>
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

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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

.font-serif {
  font-family: 'Noto Serif', serif;
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
