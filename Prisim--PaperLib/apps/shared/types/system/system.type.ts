/**
 * System API 类型定义
 * 系统级功能：配置管理、路径管理、文件对话框等
 */

/** 应用配置 - System.config.json 结构 */
export interface AppConfig {
  /** 存储路径配置 */
  paths: {
    /** 应用数据根目录（空字符串表示使用默认） */
    appData: string
    /** 论文库目录（相对于 appData 或绝对路径） */
    library: string
  }
  /** 外观配置 */
  appearance: {
    /** 主题：system | light | dark */
    theme: 'system' | 'light' | 'dark'
    /** 侧边栏图标大小 */
    iconSize: 'small' | 'medium' | 'large'
  }
  /** 启动配置 */
  startup: {
    /** 启动时打开上次阅读的论文 */
    openLastPaper: boolean
    /** 自动检查更新 */
    autoCheckUpdate: boolean
  }
}

/** 应用路径信息（解析后的完整路径） */
export interface AppPaths {
  /** 应用数据根目录 */
  appData: string
  /** 论文库目录（配置值，可能是相对路径） */
  library: string
  /** 论文库完整路径（解析后的绝对路径） */
  libraryResolved: string
}

/** 配置键路径，支持嵌套访问 */
export type ConfigKey = 
  | 'paths.appData'
  | 'paths.library'
  | 'appearance.theme'
  | 'appearance.iconSize'
  | 'startup.openLastPaper'
  | 'startup.autoCheckUpdate'

/** System API */
export interface SystemApi {
  // ===== 配置管理 =====
  /** 获取完整配置 */
  getConfig: () => Promise<AppConfig>

  /** 获取单个配置项 */
  getConfigValue: <T>(key: ConfigKey) => Promise<T>

  /** 设置单个配置项 */
  setConfigValue: <T>(key: ConfigKey, value: T) => Promise<void>

  /** 重置配置为默认值 */
  resetConfig: () => Promise<void>

  // ===== 路径信息 =====
  /** 获取解析后的路径信息 */
  getPaths: () => Promise<AppPaths>

  /** 获取默认路径 */
  getDefaultPaths: () => Promise<AppPaths>

  // ===== 文件操作 =====
  /** 打开目录选择对话框 */
  selectDirectory: (title?: string) => Promise<string | null>

  /** 在文件管理器中打开路径 */
  openInExplorer: (path: string) => Promise<void>

  /** 确保目录存在（不存在则创建） */
  ensureDirectory: (path: string) => Promise<boolean>
}
