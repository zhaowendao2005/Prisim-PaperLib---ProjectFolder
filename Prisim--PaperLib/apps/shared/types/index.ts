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

// Library API（论文库系统）
export type {
  PaperDatabase,
  DatabaseFilter,
  DatabaseCreateInput,
  PaperMeta,
  PaperIndex,
  Tag,
  TagIndex,
  FileChangeType,
  FileChangeEvent,
  ImportConfirmRequest,
  ImportConfirmResult,
  LibraryApi
} from './library/library.type'

// Utils API
export type { UtilsApi } from './utils/utils.type'
