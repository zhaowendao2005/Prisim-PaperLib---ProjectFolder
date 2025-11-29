<script setup lang="ts">
/**
 * 新建 Tab 页面 - 快速操作入口
 * 点击 + 按钮时显示的页面
 */
</script>

<template>
  <div class="new-tab-page">
    <div class="new-tab-content">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <h1 class="welcome-title">Welcome to PaperMind</h1>
        <p class="welcome-subtitle">Your intelligent research companion</p>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <div class="action-card">
          <div class="action-icon import">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span class="action-label">Import Paper</span>
        </div>
        <div class="action-card">
          <div class="action-icon search">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span class="action-label">Search Library</span>
        </div>
        <div class="action-card">
          <div class="action-icon ai">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="action-label">AI Assistant</span>
        </div>
      </section>

      <!-- Recent Papers -->
      <section class="recent-section">
        <h2 class="section-title">Recent Papers</h2>
        <div class="recent-list">
          <div class="recent-item">
            <div class="recent-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="recent-info">
              <span class="recent-title">Attention Is All You Need</span>
              <span class="recent-meta">Vaswani et al. · 2017</span>
            </div>
          </div>
          <div class="recent-item">
            <div class="recent-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="recent-info">
              <span class="recent-title">Deep Residual Learning for Image Recognition</span>
              <span class="recent-meta">He et al. · 2016</span>
            </div>
          </div>
          <div class="recent-item">
            <div class="recent-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="recent-info">
              <span class="recent-title">BERT: Pre-training of Deep Bidirectional Transformers</span>
              <span class="recent-meta">Devlin et al. · 2019</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.new-tab-page {
  flex: 1;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  padding: 40px 20px;
}

.new-tab-content {
  width: 100%;
  max-width: 800px;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--color-text-muted);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 48px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  border-radius: 16px;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-icon svg {
  width: 24px;
  height: 24px;
}

.action-icon.import {
  background: linear-gradient(135deg, #10b981, #059669);
}

.action-icon.search {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.action-icon.ai {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Recent Section */
.recent-section {
  background-color: var(--color-bg-card);
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  padding: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recent-item:hover {
  background-color: var(--color-bg-hover);
}

.recent-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: var(--color-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  flex-shrink: 0;
}

.recent-icon svg {
  width: 18px;
  height: 18px;
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.recent-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-meta {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
