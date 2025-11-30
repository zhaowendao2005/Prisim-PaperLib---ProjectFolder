/**
 * System API
 * 暴露给渲染进程的系统级功能接口
 */
import { ipcRenderer } from 'electron'
import type { AppConfig, AppPaths, ConfigKey, SystemApi } from '@client&electron.share/types/system/system.type'

export const systemApi: SystemApi = {
  // ===== 配置管理 =====

  /** 获取完整配置 */
  getConfig: () => ipcRenderer.invoke('system:getConfig') as Promise<AppConfig>,

  /** 获取单个配置项 */
  getConfigValue: <T>(key: ConfigKey) => ipcRenderer.invoke('system:getConfigValue', key) as Promise<T>,

  /** 设置单个配置项 */
  setConfigValue: <T>(key: ConfigKey, value: T) => ipcRenderer.invoke('system:setConfigValue', key, value),

  /** 重置配置 */
  resetConfig: () => ipcRenderer.invoke('system:resetConfig'),

  // ===== 路径信息 =====

  /** 获取路径配置 */
  getPaths: () => ipcRenderer.invoke('system:getPaths') as Promise<AppPaths>,

  /** 获取默认路径 */
  getDefaultPaths: () => ipcRenderer.invoke('system:getDefaultPaths') as Promise<AppPaths>,

  // ===== 文件操作 =====

  /** 选择目录 */
  selectDirectory: (title?: string) => ipcRenderer.invoke('system:selectDirectory', title) as Promise<string | null>,

  /** 在文件管理器中打开 */
  openInExplorer: (path: string) => ipcRenderer.invoke('system:openInExplorer', path),

  /** 确保目录存在 */
  ensureDirectory: (path: string) => ipcRenderer.invoke('system:ensureDirectory', path) as Promise<boolean>
}
