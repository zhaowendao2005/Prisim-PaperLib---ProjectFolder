/**
 * UI Mock 数据源实现（Web 调试模式）
 */

import type { UIDataSource, UISettings } from './ui.datasource'

const STORAGE_KEY = 'prisim-ui-settings'

const defaultSettings: UISettings = {
  isDark: false,
  rightTab: 'notes',
  pdfScale: 1.0,
  sidebarCollapsed: false
}

export class UIMockDataSource implements UIDataSource {
  async getSettings(): Promise<UISettings> {
    await this.delay(50)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) }
      }
    } catch {
      // ignore parse error
    }
    return { ...defaultSettings }
  }

  async saveSettings(settings: Partial<UISettings>): Promise<void> {
    await this.delay(50)
    const current = await this.getSettings()
    const merged = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
