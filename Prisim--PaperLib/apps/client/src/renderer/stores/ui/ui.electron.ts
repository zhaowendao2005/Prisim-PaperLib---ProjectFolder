/**
 * UI Electron 数据源实现（生产模式）
 */

import type { UIDataSource, UISettings } from './ui.datasource'

export class UIElectronDataSource implements UIDataSource {
  async getSettings(): Promise<UISettings> {
    return window.electron.ipcRenderer.invoke('ui:getSettings')
  }

  async saveSettings(settings: Partial<UISettings>): Promise<void> {
    return window.electron.ipcRenderer.invoke('ui:saveSettings', settings)
  }
}
