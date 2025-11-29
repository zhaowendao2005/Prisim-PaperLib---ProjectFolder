/**
 * UI 数据源接口
 * 用于持久化 UI 状态（如主题、侧边栏状态等）
 */

export interface UISettings {
  isDark: boolean
  rightTab: 'notes' | 'ai'
  pdfScale: number
  sidebarCollapsed: boolean
}

export interface UIDataSource {
  /** 获取 UI 设置 */
  getSettings(): Promise<UISettings>

  /** 保存 UI 设置 */
  saveSettings(settings: Partial<UISettings>): Promise<void>
}
