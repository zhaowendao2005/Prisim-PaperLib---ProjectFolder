/**
 * 论文库存储系统 - 类型定义
 * @description 统一的类型定义，供 Electron 和 Client 共享
 */

// ===== 论文库/数据库 =====

/** 论文库/数据库信息 */
export interface PaperDatabase {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 绝对路径 */
  path: string
  /** 创建时间戳 */
  createdAt: number
  /** 最后打开时间 */
  lastOpenedAt: number
  /** 论文数量（缓存） */
  paperCount: number
}

/** 数据库过滤条件 */
export interface DatabaseFilter {
  /** 按标签筛选 */
  tag?: string
  /** 排序字段 */
  sortBy?: 'name' | 'updatedAt' | 'createdAt' | 'paperCount'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/** 创建数据库输入 */
export interface DatabaseCreateInput {
  /** 数据库名称 */
  name: string
  /** 可选：指定路径 */
  path?: string
}

// ===== 论文 =====

/** PDF 内容类型 */
export type PdfContentType = 'text-based' | 'image-based' | 'structured'

/** 论文元数据 */
export interface PaperMeta {
  /** UUID 短码（8位） */
  id: string
  /** 目录名（如 "Attention Is All You Need.a1b2c3d4"） */
  dirname: string
  /** PDF 文件名（如 "Attention Is All You Need.pdf"） */
  filename: string
  /** PDF 完整路径（运行时由后端填充） */
  pdfPath?: string
  /** 标题（可编辑，默认从文件名提取） */
  title: string
  /** 作者列表 */
  authors: string[]
  /** 发表年份 */
  year?: number
  /** DOI */
  doi?: string
  /** 标签 ID 列表 */
  tags: string[]
  /** 文件大小（字节） */
  fileSize: number
  /** 添加时间戳 */
  addedAt: number
  /** 更新时间戳 */
  updatedAt: number
  /** PDF 内容类型（导入时自动检测，可手动修改） */
  pdfContentType?: PdfContentType

  // UI 临时状态（不持久化）
  /** 新添加标记 */
  _isNew?: boolean
  /** 处理中标记 */
  _isProcessing?: boolean
}

/** 论文索引文件结构 */
export interface PaperIndex {
  /** 索引版本 */
  version: string
  /** 最后更新时间 */
  lastUpdated: number
  /** 论文映射：paperId -> meta */
  papers: Record<string, PaperMeta>
}

// ===== 标签 =====

/** 标签 */
export interface Tag {
  /** 唯一标识 */
  id: string
  /** 标签名 */
  name: string
  /** 颜色（可选） */
  color?: string
  /** 关联论文数 */
  count: number
}

/** 标签索引文件结构 */
export interface TagIndex {
  /** 索引版本 */
  version: string
  /** 标签映射：tagId -> tag */
  tags: Record<string, Tag>
}

// ===== 事件 =====

/** 文件变更事件类型 */
export type FileChangeType = 'add' | 'remove' | 'update' | 'batch-add'

/** 文件变更事件（IPC 推送到前端） */
export interface FileChangeEvent {
  /** 变更类型 */
  type: FileChangeType
  /** 数据库 ID */
  databaseId: string
  /** 变更的论文列表 */
  items: PaperMeta[]
}

/** 导入确认请求（从 _imports/ 检测到文件） */
export interface ImportConfirmRequest {
  /** 数据库 ID */
  databaseId: string
  /** 数据库名称 */
  databaseName: string
  /** 待导入文件路径列表 */
  filePaths: string[]
  /** 文件数量 */
  fileCount: number
  /** 来源 */
  source: 'drag-drop' | 'file-dialog' | 'imports-folder'
}

/** 导入确认结果 */
export interface ImportConfirmResult {
  /** 数据库 ID */
  databaseId: string
  /** 文件路径列表 */
  filePaths: string[]
  /** 是否确认 */
  confirmed: boolean
}

// ===== API 接口 =====

/** 论文库 API 接口定义 */
export interface LibraryApi {
  // ===== 数据库管理 =====
  /** 获取所有数据库 */
  getDatabases: () => Promise<PaperDatabase[]>
  /** 创建数据库 */
  createDatabase: (name: string, path?: string) => Promise<PaperDatabase>
  /** 打开数据库（启动文件监听） */
  openDatabase: (id: string) => Promise<void>
  /** 关闭数据库（停止文件监听） */
  closeDatabase: (id: string) => Promise<void>
  /** 删除数据库 */
  removeDatabase: (id: string, deleteFiles?: boolean) => Promise<void>

  // ===== 论文操作 =====
  /** 获取论文列表 */
  getPapers: (databaseId: string) => Promise<PaperMeta[]>
  /** 获取单篇论文 */
  getPaper: (databaseId: string, paperId: string) => Promise<PaperMeta | null>
  /** 导入论文 */
  importPapers: (databaseId: string, filePaths: string[]) => Promise<PaperMeta[]>
  /** 确认导入论文（用于 _imports/ 检测） */
  confirmImportPapers: (databaseId: string, filePaths: string[], confirm: boolean) => Promise<PaperMeta[] | void>
  /** 删除论文 */
  removePaper: (databaseId: string, paperId: string, deleteFile?: boolean) => Promise<void>
  /** 更新论文元数据 */
  updatePaperMeta: (databaseId: string, paperId: string, updates: Partial<PaperMeta>) => Promise<void>

  // ===== 标签操作 =====
  /** 获取标签列表 */
  getTags: (databaseId: string) => Promise<Tag[]>
  /** 创建标签 */
  createTag: (databaseId: string, name: string, color?: string) => Promise<Tag>
  /** 更新标签 */
  updateTag: (databaseId: string, tagId: string, updates: Partial<Tag>) => Promise<void>
  /** 删除标签 */
  deleteTag: (databaseId: string, tagId: string) => Promise<void>

  // ===== 索引管理 =====
  /** 重建索引 */
  rebuildIndex: (databaseId: string) => Promise<void>

  // ===== 事件订阅 =====
  /** 订阅文件变更事件 */
  onFileChange: (callback: (event: FileChangeEvent) => void) => () => void

  // ===== 导入确认 =====
  /** 订阅导入确认请求 */
  onConfirmImport: (callback: (request: ImportConfirmRequest) => void) => () => void
  /** 订阅导入确认结果 */
  onConfirmImportResult: (callback: (result: ImportConfirmResult) => void) => () => void
  /** 处理用户确认结果 */
  handleConfirmImport: (confirmed: boolean) => Promise<void>
  /** 执行导入（确认后） */
  executeImport: (databaseId: string, filePaths: string[]) => Promise<PaperMeta[]>
}
