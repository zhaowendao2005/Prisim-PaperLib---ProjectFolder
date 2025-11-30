/**
 * 环境检测工具
 */

export function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.api !== 'undefined'
}

export function isWeb(): boolean {
  return !isElectron()
}

export function isDev(): boolean {
  return import.meta.env.DEV
}

/** 强制使用 Mock 数据（即使在 Electron 中） */
export function forceMock(): boolean {
  return import.meta.env.VITE_FORCE_MOCK === 'true'
}
