<script setup lang="ts">
/**
 * 右侧边栏组件
 * 包含：分段控制、Notes 标签页、AI 标签页
 */
import { ref } from 'vue'

const rightTab = ref<'notes' | 'ai'>('notes')

// 临时模拟数据
const selectedPaper = ref({
  title: 'Attention Is All You Need',
  journal: 'NIPS',
  year: 2017
})
</script>

<template>
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
</template>

<style scoped>
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
