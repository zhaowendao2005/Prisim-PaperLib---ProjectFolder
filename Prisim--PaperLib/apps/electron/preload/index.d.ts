/**
 * Preload 全局类型声明
 */
import type { ElectronAPI } from '@electron-toolkit/preload'
import type { Api } from '@client&electron.share/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
