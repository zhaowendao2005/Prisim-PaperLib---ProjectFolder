/**
 * IPC API 类型定义
 * Client 与 Electron 之间通信的 API 接口聚合
 */
import type { WindowApi } from '../window/window.type'
import type { SystemApi } from '../system/system.type'
import type { LibraryApi } from '../library/library.type'

/** IPC API 聚合类型（Client ↔ Electron 通信） */
export interface IpcApi {
  window: WindowApi
  system: SystemApi
  library: LibraryApi
}
