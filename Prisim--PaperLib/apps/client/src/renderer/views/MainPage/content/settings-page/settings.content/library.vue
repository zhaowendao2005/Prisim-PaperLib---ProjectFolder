<script setup lang="ts">
/**
 * 设置页面 - 文献库设置
 */
import { reactive } from 'vue'

const settings = reactive({
  autoFetchMeta: true,
  citationStyle: 'apa'
})

// 引用格式选项
const citationStyleOptions = [
  { value: 'apa', label: 'APA 7th' },
  { value: 'mla', label: 'MLA 8th' },
  { value: 'ieee', label: 'IEEE' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'gb7714', label: 'GB/T 7714' }
]

/** 整理库文件夹 */
function organizeLibrary() {
  // TODO: 调用后端整理逻辑
  console.log('[Settings] 整理库文件夹')
}
</script>

<template>
  <div class="settings-library">
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
            <button class="btn-action" @click="organizeLibrary">立即整理</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-library {
  width: 100%;
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

/* Select */
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

/* Switch */
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
</style>
