<script setup lang="ts">
/**
 * 设置页面 - 通用设置
 */
import { reactive, onMounted } from 'vue'
import type { AppConfig } from '@client&electron.share/types'

// 设置状态
const settings = reactive({
  // 路径
  appDataPath: '',
  libraryPath: '',
  defaultAppDataPath: '',
  defaultLibraryPath: './Documents',
  // 外观
  theme: 'system' as AppConfig['appearance']['theme'],
  iconSize: 'medium' as AppConfig['appearance']['iconSize'],
  // 启动
  openLastPaper: true,
  autoCheckUpdate: true
})

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

/** 加载配置 */
async function loadConfig() {
  try {
    // 加载完整配置
    const config = await window.api.system.getConfig()
    const paths = await window.api.system.getPaths()
    const defaults = await window.api.system.getDefaultPaths()

    // 路径（都使用解析后的绝对路径）
    settings.appDataPath = paths.appData
    settings.libraryPath = paths.libraryResolved  // 使用解析后的绝对路径
    settings.defaultAppDataPath = defaults.appData
    settings.defaultLibraryPath = defaults.libraryResolved  // 使用解析后的绝对路径

    // 外观
    settings.theme = config.appearance.theme
    settings.iconSize = config.appearance.iconSize

    // 启动
    settings.openLastPaper = config.startup.openLastPaper
    settings.autoCheckUpdate = config.startup.autoCheckUpdate
  } catch (err) {
    console.error('[Settings] 加载配置失败:', err)
  }
}

/** 选择应用数据目录 */
async function selectAppDataPath() {
  try {
    const selected = await window.api.system.selectDirectory('选择应用数据存储目录')
    if (selected) {
      settings.appDataPath = selected
      await window.api.system.setConfigValue('paths.appData', selected)
      await window.api.system.ensureDirectory(selected)
    }
  } catch (err) {
    console.error('[Settings] 选择目录失败:', err)
  }
}

/** 选择论文库目录 */
async function selectLibraryPath() {
  try {
    const selected = await window.api.system.selectDirectory('选择论文库存储目录')
    if (selected) {
      settings.libraryPath = selected
      await window.api.system.setConfigValue('paths.library', selected)
      await window.api.system.ensureDirectory(selected)
    }
  } catch (err) {
    console.error('[Settings] 选择目录失败:', err)
  }
}

/** 打开目录 */
async function openPath(path: string) {
  if (!path) return
  try {
    await window.api.system.openInExplorer(path)
  } catch (err) {
    console.error('[Settings] 打开目录失败:', err)
  }
}

/** 判断是否为默认路径 */
function isDefaultPath(type: 'appData' | 'library'): boolean {
  if (type === 'appData') {
    return settings.appDataPath === settings.defaultAppDataPath
  }
  return settings.libraryPath === settings.defaultLibraryPath
}

/** 更新主题设置 */
async function updateTheme(value: AppConfig['appearance']['theme']) {
  settings.theme = value
  await window.api.system.setConfigValue('appearance.theme', value)
}

/** 更新图标大小设置 */
async function updateIconSize(value: AppConfig['appearance']['iconSize']) {
  settings.iconSize = value
  await window.api.system.setConfigValue('appearance.iconSize', value)
}

/** 更新启动时打开上次论文设置 */
async function updateOpenLastPaper(value: boolean) {
  settings.openLastPaper = value
  await window.api.system.setConfigValue('startup.openLastPaper', value)
}

/** 更新自动检查更新设置 */
async function updateAutoCheckUpdate(value: boolean) {
  settings.autoCheckUpdate = value
  await window.api.system.setConfigValue('startup.autoCheckUpdate', value)
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="settings-general">
    <div class="page-header">
      <h2 class="page-title">通用</h2>
      <p class="page-desc">自定义应用的外观和基本行为。</p>
    </div>

    <!-- 存储路径 -->
    <div class="setting-group">
      <div class="group-title">存储路径</div>
      <div class="group-container">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">应用数据存储路径</div>
            <div class="setting-desc">应用配置、缓存等数据的存储位置</div>
          </div>
          <div class="setting-control path-control">
            <div class="path-display">
              <span class="path-text" :title="settings.appDataPath">{{ settings.appDataPath || '加载中...' }}</span>
              <span v-if="isDefaultPath('appData')" class="path-default">(默认)</span>
              <button class="btn-open" title="打开目录" @click.stop="openPath(settings.appDataPath)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
              </button>
            </div>
            <button class="btn-browse" @click="selectAppDataPath">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              浏览
            </button>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">论文库存储路径</div>
            <div class="setting-desc">论文 PDF 文件及元数据的存储位置（相对于应用数据目录）</div>
          </div>
          <div class="setting-control path-control">
            <div class="path-display">
              <span class="path-text" :title="settings.libraryPath">{{ settings.libraryPath || '加载中...' }}</span>
              <span v-if="isDefaultPath('library')" class="path-default">(默认)</span>
              <button class="btn-open" title="打开目录" @click.stop="openPath(settings.libraryPath)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
              </button>
            </div>
            <button class="btn-browse" @click="selectLibraryPath">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              浏览
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 外观 -->
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
              <select :value="settings.theme" class="mac-select" @change="updateTheme(($event.target as HTMLSelectElement).value as AppConfig['appearance']['theme'])">
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
              <select :value="settings.iconSize" class="mac-select" @change="updateIconSize(($event.target as HTMLSelectElement).value as AppConfig['appearance']['iconSize'])">
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

    <!-- 启动 -->
    <div class="setting-group">
      <div class="group-title">启动</div>
      <div class="group-container">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">启动时打开上次阅读的论文</div>
          </div>
          <div class="setting-control">
            <button class="mac-switch" :class="{ checked: settings.openLastPaper }" @click="updateOpenLastPaper(!settings.openLastPaper)">
              <div class="switch-handle" />
            </button>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">自动检查更新</div>
          </div>
          <div class="setting-control">
            <button class="mac-switch" :class="{ checked: settings.autoCheckUpdate }" @click="updateAutoCheckUpdate(!settings.autoCheckUpdate)">
              <div class="switch-handle" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-general {
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

/* 路径控制 */
.path-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.path-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px 4px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s;
  width: 480px; /* 固定宽度，两个路径保持一致 */
  flex-shrink: 0;
}

.path-display:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.path-text {
  flex: 1;
  font-size: 12px;
  font-family: monospace;
  color: #374151;
  overflow: hidden;
  white-space: nowrap;
  /* 使用 direction: rtl 实现从右往左显示，溢出时左侧省略 */
  direction: rtl;
  text-align: left;
}

/* 使用伪元素实现中间省略效果 */
.path-text::before {
  content: '\200E'; /* LTR mark，确保路径分隔符正确显示 */
}

.path-default {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
  direction: ltr;
}

.btn-open {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-open:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-open svg {
  width: 14px;
  height: 14px;
}

.btn-browse {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-browse:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-browse svg {
  width: 14px;
  height: 14px;
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
</style>
