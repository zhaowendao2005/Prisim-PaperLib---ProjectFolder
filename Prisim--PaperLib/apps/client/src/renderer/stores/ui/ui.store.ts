/**
 * UI Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { UIDataSource, UISettings } from './ui.datasource'
import { UIMockDataSource } from './ui.mock'
import { UIElectronDataSource } from './ui.electron'
import { isElectron, forceMock } from '@core/utils/env'

/** 创建数据源实例 */
function createDataSource(): UIDataSource {
  if (forceMock() || !isElectron()) {
    console.log('[UIStore] 使用 Mock 数据源')
    return new UIMockDataSource()
  }
  console.log('[UIStore] 使用 Electron 数据源')
  return new UIElectronDataSource()
}

export const useUIStore = defineStore('ui', () => {
  // 数据源
  const dataSource = createDataSource()

  // 状态
  const isDark = ref(false)
  const rightTab = ref<'notes' | 'ai'>('notes')
  const pdfScale = ref(1.0)
  const sidebarCollapsed = ref(false)
  const isMaximized = ref(false)

  // 初始化
  async function init(): Promise<void> {
    try {
      const settings = await dataSource.getSettings()
      isDark.value = settings.isDark
      rightTab.value = settings.rightTab
      pdfScale.value = settings.pdfScale
      sidebarCollapsed.value = settings.sidebarCollapsed
    } catch (e) {
      console.error('[UIStore] 初始化失败:', e)
    }
  }

  // 持久化
  async function persist(): Promise<void> {
    const settings: UISettings = {
      isDark: isDark.value,
      rightTab: rightTab.value,
      pdfScale: pdfScale.value,
      sidebarCollapsed: sidebarCollapsed.value
    }
    await dataSource.saveSettings(settings)
  }

  // Actions
  function toggleTheme(): void {
    isDark.value = !isDark.value
    void persist()
  }

  function setRightTab(tab: 'notes' | 'ai'): void {
    rightTab.value = tab
    void persist()
  }

  function setPdfScale(scale: number): void {
    pdfScale.value = Math.max(0.5, Math.min(2.0, scale))
    void persist()
  }

  function zoomIn(): void {
    setPdfScale(pdfScale.value + 0.1)
  }

  function zoomOut(): void {
    setPdfScale(pdfScale.value - 0.1)
  }

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
    void persist()
  }

  function toggleMaximized(): void {
    isMaximized.value = !isMaximized.value
  }

  return {
    // State
    isDark,
    rightTab,
    pdfScale,
    sidebarCollapsed,
    isMaximized,
    // Actions
    init,
    toggleTheme,
    setRightTab,
    setPdfScale,
    zoomIn,
    zoomOut,
    toggleSidebar,
    toggleMaximized
  }
})
