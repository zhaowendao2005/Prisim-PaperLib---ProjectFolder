/**
 * System IPC 处理器
 * 处理系统级功能的 IPC 请求
 */
import { ipcMain } from 'electron'
import * as systemService from '../../services/system/system.service'
import type { ConfigKey } from '@client&electron.share/types/system/system.type'

/**
 * 注册 System 相关的 IPC 处理器
 */
export function registerSystemIpcHandlers(): void {
  // ===== 配置管理 =====
  
  // 获取完整配置
  ipcMain.handle('system:getConfig', () => {
    return systemService.getConfig()
  })

  // 获取单个配置项
  ipcMain.handle('system:getConfigValue', (_event, key: ConfigKey) => {
    return systemService.getConfigValue(key)
  })

  // 设置单个配置项
  ipcMain.handle('system:setConfigValue', (_event, key: ConfigKey, value: unknown) => {
    systemService.setConfigValue(key, value)
  })

  // 重置配置
  ipcMain.handle('system:resetConfig', () => {
    systemService.resetConfig()
  })

  // ===== 路径信息 =====

  // 获取路径配置
  ipcMain.handle('system:getPaths', () => {
    return systemService.getPaths()
  })

  // 获取默认路径
  ipcMain.handle('system:getDefaultPaths', () => {
    return systemService.getDefaultPaths()
  })

  // ===== 文件操作 =====

  // 选择目录
  ipcMain.handle('system:selectDirectory', (_event, title?: string) => {
    return systemService.selectDirectory(title)
  })

  // 在文件管理器中打开
  ipcMain.handle('system:openInExplorer', (_event, path: string) => {
    return systemService.openInExplorer(path)
  })

  // 确保目录存在
  ipcMain.handle('system:ensureDirectory', (_event, path: string) => {
    return systemService.ensureDirectory(path)
  })
}
