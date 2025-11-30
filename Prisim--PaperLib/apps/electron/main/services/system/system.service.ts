/**
 * System 服务
 * 管理应用配置、路径、目录操作等系统级功能
 */
import { app, shell, dialog } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import type { AppConfig, AppPaths, ConfigKey } from '@client&electron.share/types/system/system.type'

/** 配置文件名 */
const CONFIG_FILE = 'System.config.json'

/** 默认论文库相对路径 */
const DEFAULT_LIBRARY_RELATIVE = './Documents'

/** 默认配置 */
function getDefaultConfig(): AppConfig {
  return {
    paths: {
      appData: '',  // 空字符串表示使用默认路径
      library: DEFAULT_LIBRARY_RELATIVE
    },
    appearance: {
      theme: 'system',
      iconSize: 'medium'
    },
    startup: {
      openLastPaper: true,
      autoCheckUpdate: true
    }
  }
}

/**
 * 获取应用数据根目录（默认）
 * Windows: %APPDATA%/PaperFlow/Data
 * macOS: ~/Library/Application Support/PaperFlow/Data
 * Linux: ~/.config/PaperFlow/Data
 */
function getDefaultAppDataPath(): string {
  return join(app.getPath('userData'), 'Data')
}

/**
 * 获取配置文件路径
 */
function getConfigFilePath(): string {
  const config = loadConfigRaw()
  const appDataPath = config.paths.appData || getDefaultAppDataPath()
  return join(appDataPath, CONFIG_FILE)
}

/**
 * 获取用户数据目录下的初始配置路径（用于首次启动）
 */
function getInitialConfigPath(): string {
  return join(app.getPath('userData'), CONFIG_FILE)
}

/**
 * 解析论文库路径（处理相对路径）
 */
function resolveLibraryPath(appDataPath: string, libraryPath: string): string {
  if (libraryPath.startsWith('./') || libraryPath.startsWith('.\\')) {
    return join(appDataPath, libraryPath.slice(2))
  }
  return libraryPath
}

/**
 * 加载配置（原始，不处理默认值）
 */
function loadConfigRaw(): AppConfig {
  // 先尝试从用户数据目录读取（兼容旧配置位置）
  const initialPath = getInitialConfigPath()
  if (existsSync(initialPath)) {
    try {
      const content = readFileSync(initialPath, 'utf-8')
      const config = JSON.parse(content) as Partial<AppConfig>
      return mergeWithDefaults(config)
    } catch (err) {
      console.error('[SystemService] 读取配置失败:', err)
    }
  }
  return getDefaultConfig()
}

/**
 * 合并用户配置与默认配置
 */
function mergeWithDefaults(partial: Partial<AppConfig>): AppConfig {
  const defaults = getDefaultConfig()
  return {
    paths: {
      ...defaults.paths,
      ...partial.paths
    },
    appearance: {
      ...defaults.appearance,
      ...partial.appearance
    },
    startup: {
      ...defaults.startup,
      ...partial.startup
    }
  }
}

/**
 * 保存配置
 */
function saveConfig(config: AppConfig): void {
  const appDataPath = config.paths.appData || getDefaultAppDataPath()
  const configPath = join(appDataPath, CONFIG_FILE)

  try {
    // 确保目录存在
    if (!existsSync(appDataPath)) {
      mkdirSync(appDataPath, { recursive: true })
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    
    // 同时保存到用户数据目录（作为备份/引导）
    const initialPath = getInitialConfigPath()
    const parentDir = join(initialPath, '..')
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true })
    }
    writeFileSync(initialPath, JSON.stringify(config, null, 2), 'utf-8')
  } catch (err) {
    console.error('[SystemService] 保存配置失败:', err)
  }
}

// ===== 配置管理 API =====

/**
 * 获取完整配置
 */
export function getConfig(): AppConfig {
  return loadConfigRaw()
}

/**
 * 获取单个配置项
 */
export function getConfigValue<T>(key: ConfigKey): T {
  const config = loadConfigRaw()
  const [section, field] = key.split('.') as [keyof AppConfig, string]
  return (config[section] as Record<string, unknown>)[field] as T
}

/**
 * 设置单个配置项
 */
export function setConfigValue<T>(key: ConfigKey, value: T): void {
  const config = loadConfigRaw()
  const [section, field] = key.split('.') as [keyof AppConfig, string]
  ;(config[section] as Record<string, unknown>)[field] = value
  saveConfig(config)
}

/**
 * 重置配置为默认值
 */
export function resetConfig(): void {
  saveConfig(getDefaultConfig())
}

// ===== 路径信息 API =====

/**
 * 获取默认路径
 */
export function getDefaultPaths(): AppPaths {
  const appData = getDefaultAppDataPath()
  const library = DEFAULT_LIBRARY_RELATIVE
  return {
    appData,
    library,
    libraryResolved: resolveLibraryPath(appData, library)
  }
}

/**
 * 获取当前路径配置（解析后）
 */
export function getPaths(): AppPaths {
  const config = loadConfigRaw()
  const appData = config.paths.appData || getDefaultAppDataPath()
  const library = config.paths.library || DEFAULT_LIBRARY_RELATIVE

  return {
    appData,
    library,
    libraryResolved: resolveLibraryPath(appData, library)
  }
}

// ===== 文件操作 API =====

/**
 * 打开目录选择对话框
 */
export async function selectDirectory(title?: string): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    title: title || '选择目录',
    properties: ['openDirectory', 'createDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
}

/**
 * 在文件管理器中打开路径
 */
export async function openInExplorer(path: string): Promise<void> {
  if (existsSync(path)) {
    await shell.openPath(path)
  } else {
    const parentDir = join(path, '..')
    if (existsSync(parentDir)) {
      await shell.openPath(parentDir)
    }
  }
}

/**
 * 确保目录存在
 */
export function ensureDirectory(path: string): boolean {
  try {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true })
    }
    return true
  } catch (err) {
    console.error('[SystemService] 创建目录失败:', err)
    return false
  }
}

/**
 * 初始化应用数据目录
 * 应用启动时调用，确保必要目录和配置文件存在
 */
export function initializeAppDirectories(): void {
  const paths = getPaths()

  // 确保应用数据目录存在
  ensureDirectory(paths.appData)

  // 确保论文库目录存在
  ensureDirectory(paths.libraryResolved)

  // 确保配置文件存在
  const configPath = join(paths.appData, CONFIG_FILE)
  if (!existsSync(configPath)) {
    saveConfig(getConfig())
  }

  console.log('[SystemService] 应用初始化完成:')
  console.log('  - AppData:', paths.appData)
  console.log('  - Library:', paths.libraryResolved)
  console.log('  - Config:', configPath)
}
