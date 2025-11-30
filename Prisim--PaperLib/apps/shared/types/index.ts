/**
 * 共享类型导出
 * 聚合所有跨 Client/Electron 层的类型定义
 */

// Window API
export type { WindowApi } from './window/window.type'

// System API
export type { SystemApi, AppConfig, AppPaths, ConfigKey } from './system/system.type'

// IPC API（Client ↔ Electron 通信）
export type { IpcApi } from './ipc-api/ipc-api.type'
