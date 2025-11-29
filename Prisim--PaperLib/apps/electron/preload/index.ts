/**
 * Electron Preload 入口
 * 通过 contextBridge 安全地暴露 API 给渲染进程
 */
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { api } from './apis/api.aggregate'

// 通过 contextBridge 暴露 API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
