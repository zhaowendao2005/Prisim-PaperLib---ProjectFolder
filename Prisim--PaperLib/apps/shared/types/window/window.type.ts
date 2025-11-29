/**
 * 窗口控制 API 类型定义
 * 跨 Electron 主进程、Preload、渲染进程共享
 */

/** 窗口控制 API */
export interface WindowApi {
  /** 最小化窗口 */
  minimize: () => void
  /** 最大化/还原窗口 */
  maximize: () => void
  /** 关闭窗口 */
  close: () => void
  /** 查询窗口是否最大化 */
  isMaximized: () => Promise<boolean>
}
