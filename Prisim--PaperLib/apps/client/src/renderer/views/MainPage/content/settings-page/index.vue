<script setup lang="ts">
/**
 * 设置页面 - macOS 风格
 */
import { ref, reactive } from 'vue'

// 当前激活的设置 Tab
const activeTab = ref('general')

// 搜索查询
const searchQuery = ref('')

// 设置状态
const settings = reactive({
  theme: 'system',
  darkMode: false,
  autoSave: true,
  pdfEngine: 'native',
  citationStyle: 'apa',
  syncEnabled: true,
  autoFetchMeta: true,
  openInNewWindow: false,
  openLast: true,
  highlightColor: 'yellow'
})

// 高亮颜色选项
const highlightColors = [
  { value: 'yellow', hex: '#fde047' },
  { value: 'green', hex: '#86efac' },
  { value: 'blue', hex: '#93c5fd' },
  { value: 'red', hex: '#fca5a5' },
  { value: 'purple', hex: '#d8b4fe' }
]

// 主题选项
const themeOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' }
]

// 图标大小选项
const iconSizeOptions = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

// 缩放比例选项
const zoomOptions = [
  { value: 'fit', label: '自适应宽度' },
  { value: '100', label: '100%' },
  { value: '150', label: '150%' }
]

// PDF 引擎选项
const pdfEngineOptions = [
  { value: 'native', label: '系统原生 (WebKit)' },
  { value: 'custom', label: '内置渲染器 (PDF.js)' }
]

// 引用格式选项
const citationStyleOptions = [
  { value: 'apa', label: 'APA 7th' },
  { value: 'mla', label: 'MLA 8th' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'gb7714', label: 'GB/T 7714' }
]
</script>

<template>
  <div class="settings-page">
    <!-- 侧边栏 -->
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
        <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索设置...">
      </div>

      <div class="nav-list">
        <button class="nav-item" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
          </svg>
          通用
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'reader' }" @click="activeTab = 'reader'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          阅读器
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'library' }" @click="activeTab = 'library'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m16 6 4 14" />
            <path d="M12 6v14" />
            <path d="M8 8v12" />
            <path d="M4 4v16" />
          </svg>
          文献库
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'notes' }" @click="activeTab = 'notes'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          笔记与摘要
        </button>

        <div class="nav-divider" />

        <button class="nav-item" :class="{ active: activeTab === 'sync' }" @click="activeTab = 'sync'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19" />
            <path d="M17.5 19c.7 0 3.5-.5 3.5-5 0-2.3-1-3.6-2.5-4.5" />
            <path d="M6.5 19c-.7 0-3.5-.5-3.5-5 0-2.3 1-3.6 2.5-4.5" />
            <path d="M12 13.5V4l5 5" />
            <path d="M12 4 7 9" />
          </svg>
          云同步
        </button>
        <button class="nav-item" :class="{ active: activeTab === 'account' }" @click="activeTab = 'account'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          账户
        </button>

        <div class="nav-divider" />

        <button class="nav-item" :class="{ active: activeTab === 'fonts' }" @click="activeTab = 'fonts'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" x2="15" y1="20" y2="20" />
            <line x1="12" x2="12" y1="4" y2="20" />
          </svg>
          字体管理
        </button>
      </div>

      <div class="sidebar-footer">
        © 2024 PaperFlow Inc.
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <div class="content-wrapper">
        <!-- General Tab -->
        <div v-if="activeTab === 'general'">
          <div class="page-header">
            <h2 class="page-title">通用</h2>
            <p class="page-desc">自定义应用的外观和基本行为。</p>
          </div>

          <div class="setting-group">
            <div class="group-title">外观</div>
            <div class="group-container">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">应用主题</div>
                  <div class="setting-desc">跟随系统自动切换深色/浅色模式</div>
                </div>
                <div class="setting-control">
                  <div class="select-wrapper">
                    <select v-model="settings.theme" class="mac-select">
                      <option v-for="opt in themeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">侧边栏图标大小</div>
                </div>
                <div class="setting-control">
                  <div class="select-wrapper">
                    <select class="mac-select">
                      <option v-for="opt in iconSizeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-group">
            <div class="group-title">启动</div>
            <div class="group-container">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">启动时打开上次阅读的论文</div>
                </div>
                <div class="setting-control">
                  <button class="mac-switch" :class="{ checked: settings.openLast }" @click="settings.openLast = !settings.openLast">
                    <div class="switch-handle" />
                  </button>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">自动检查更新</div>
                </div>
                <div class="setting-control">
                  <button class="mac-switch checked">
                    <div class="switch-handle" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reader Tab -->
        <div v-if="activeTab === 'reader'">
          <div class="page-header">
            <h2 class="page-title">阅读器</h2>
            <p class="page-desc">调整 PDF 阅读体验和标注工具。</p>
          </div>

          <div class="setting-group">
            <div class="group-title">显示</div>
            <div class="group-container">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">默认缩放比例</div>
                </div>
                <div class="setting-control">
                  <div class="select-wrapper">
                    <select class="mac-select">
                      <option v-for="opt in zoomOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">PDF 渲染引擎</div>
                  <div class="setting-desc">如果遇到显示问题，请尝试切换引擎</div>
                </div>
                <div class="setting-control">
                  <div class="select-wrapper">
                    <select v-model="settings.pdfEngine" class="mac-select">
                      <option v-for="opt in pdfEngineOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-group">
            <div class="group-title">标注</div>
            <div class="group-container">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">默认高亮颜色</div>
                </div>
                <div class="setting-control">
                  <div class="color-options">
                    <div
                      v-for="color in highlightColors"
                      :key="color.value"
                      class="color-btn"
                      :style="{ backgroundColor: color.hex }"
                      :class="{ selected: settings.highlightColor === color.value }"
                      @click="settings.highlightColor = color.value"
                    />
                  </div>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">自动保存标注</div>
                </div>
                <div class="setting-control">
                  <button class="mac-switch" :class="{ checked: settings.autoSave }" @click="settings.autoSave = !settings.autoSave">
                    <div class="switch-handle" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Library Tab -->
        <div v-if="activeTab === 'library'">
          <div class="page-header">
            <h2 class="page-title">文献库</h2>
            <p class="page-desc">管理文件存储路径和元数据抓取。</p>
          </div>

          <div class="setting-group">
            <div class="group-title">元数据</div>
            <div class="group-container">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">自动抓取元数据</div>
                  <div class="setting-desc">通过 DOI 或 PDF 内容自动补全论文信息</div>
                </div>
                <div class="setting-control">
                  <button class="mac-switch" :class="{ checked: settings.autoFetchMeta }" @click="settings.autoFetchMeta = !settings.autoFetchMeta">
                    <div class="switch-handle" />
                  </button>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">首选引用格式</div>
                  <div class="setting-desc">复制引用时使用的默认格式</div>
                </div>
                <div class="setting-control">
                  <div class="select-wrapper">
                    <select v-model="settings.citationStyle" class="mac-select">
                      <option v-for="opt in citationStyleOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                    <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-group">
            <div class="group-title">存储</div>
            <div class="group-container">
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">文件重命名规则</div>
                </div>
                <div class="setting-control">
                  <span class="filename-badge">{Author}_{Year}_{Title}.pdf</span>
                </div>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">整理库文件夹</div>
                  <div class="setting-desc">自动将 PDF 移动到指定文件夹结构中</div>
                </div>
                <div class="setting-control">
                  <button class="btn-action">立即整理</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Placeholder for other tabs -->
        <div v-if="['sync', 'account', 'fonts', 'notes'].includes(activeTab)" class="placeholder-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <p>该设置板块正在开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 设置页面主容器 */
.settings-page {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--color-bg-primary);
}

/* 侧边栏 */
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

/* 搜索框 */
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

/* 导航列表 */
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

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.4);
}

.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 设置组 */
.setting-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  margin-left: 4px;
}

.group-container {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.setting-desc {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* Switch 开关 */
.mac-switch {
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
  border: none;
  padding: 2px;
}

.mac-switch.checked {
  background: var(--color-accent);
}

.switch-handle {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
}

.mac-switch.checked .switch-handle {
  transform: translateX(20px);
}

/* Select 下拉框 */
.select-wrapper {
  position: relative;
  min-width: 120px;
}

.mac-select {
  appearance: none;
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 6px 32px 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: right;
  text-align-last: right;
  transition: all 0.2s;
}

.mac-select:hover {
  background: #f3f4f6;
}

.mac-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.select-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
  width: 14px;
  height: 14px;
}

/* 颜色选择器 */
.color-options {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-btn.selected::after {
  content: '';
  width: 6px;
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

/* 按钮 */
.btn-action {
  font-size: 13px;
  color: #2563eb;
  background: #eff6ff;
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-action:hover {
  background: #dbeafe;
}

/* 文件名 Badge */
.filename-badge {
  font-family: monospace;
  font-size: 12px;
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

/* 占位内容 */
.placeholder-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
}

.placeholder-content svg {
  width: 64px;
  height: 64px;
}

.placeholder-content p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
