<script setup lang="ts">
/**
 * 设置页面 - 阅读器设置
 */
import { reactive } from 'vue'

const settings = reactive({
  zoom: 'fit',
  pdfEngine: 'native',
  highlightColor: 'yellow',
  autoSave: true
})

// 高亮颜色选项
const highlightColors = [
  { value: 'yellow', hex: '#fde047' },
  { value: 'green', hex: '#86efac' },
  { value: 'blue', hex: '#93c5fd' },
  { value: 'red', hex: '#fca5a5' },
  { value: 'purple', hex: '#d8b4fe' }
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
</script>

<template>
  <div class="settings-reader">
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
              <select v-model="settings.zoom" class="mac-select">
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
</template>

<style scoped>
.settings-reader {
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
</style>
