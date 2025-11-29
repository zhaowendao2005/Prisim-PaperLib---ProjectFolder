<script setup lang="ts">
/**
 * 顶部标题栏组件
 */
import { ref } from 'vue'

const isMaximized = ref(false)
const isDark = ref(false)

// 临时：selectedPaper 标题显示
const selectedPaperTitle = ref('Attention Is All You Need')
</script>

<template>
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
        <span class="title-filename">{{ selectedPaperTitle }}.pdf</span>
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
</template>

<style scoped>
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
</style>
