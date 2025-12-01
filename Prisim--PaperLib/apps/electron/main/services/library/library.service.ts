/**
 * Library 服务
 * 管理论文库/数据库的核心业务逻辑
 */
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, unlinkSync, statSync, readdirSync, rmSync } from 'fs'
import { randomUUID } from 'crypto'
import type {
  PaperDatabase,
  PaperMeta,
  PaperIndex,
  Tag,
  TagIndex,
  FileChangeEvent,
  PdfContentType
} from '@client&electron.share/types/library/library.type'
import { getPaths } from '../system/system.service'
import { detectPdfContentType } from './pdf-type-detector'
// 注意：文件监听由 IPC 层（library.ipc.ts）独立管理

// ===== 常量 =====

const METADATA_DIR = '.metadata'
const PAPERS_DIR = 'papers'
const IMPORTS_DIR = '_imports'
const INDEX_FILE = 'index.json'
const TAGS_FILE = 'tags.json'
const META_FILE = 'meta.json'
const INDEX_VERSION = '1.0.0'

// ===== 内部状态 =====

/** 已打开的数据库列表 */
const openedDatabases = new Map<string, PaperDatabase>()

/** 文件变更监听器 */
const fileChangeListeners: Array<(event: FileChangeEvent) => void> = []

// ===== 工具函数 =====

/** 生成 8 位短 UUID */
function generateShortId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 8)
}

/** 确保目录存在 */
function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

/** 计算论文 PDF 完整路径 */
function getPaperPdfPath(databasePath: string, meta: PaperMeta): string {
  return join(databasePath, PAPERS_DIR, meta.dirname, meta.filename)
}

/** 为 PaperMeta 填充 pdfPath */
function fillPdfPath(databasePath: string, meta: PaperMeta): PaperMeta {
  return {
    ...meta,
    pdfPath: getPaperPdfPath(databasePath, meta)
  }
}

/** 从文件名提取标题（去掉扩展名） */
function extractTitleFromFilename(filename: string): string {
  return filename.replace(/\.pdf$/i, '').trim()
}

/** 获取数据库根路径 */
function getDatabasesRootPath(): string {
  const paths = getPaths()
  return paths.libraryResolved
}

/** 获取数据库配置文件路径 */
function getDatabasesConfigPath(): string {
  const paths = getPaths()
  return join(paths.appData, 'databases.json')
}

/** 读取数据库列表配置 */
function loadDatabasesConfig(): PaperDatabase[] {
  const configPath = getDatabasesConfigPath()
  if (!existsSync(configPath)) {
    return []
  }
  try {
    const content = readFileSync(configPath, 'utf-8')
    return JSON.parse(content) as PaperDatabase[]
  } catch {
    return []
  }
}

/** 保存数据库列表配置 */
function saveDatabasesConfig(databases: PaperDatabase[]): void {
  const configPath = getDatabasesConfigPath()
  ensureDir(join(configPath, '..'))
  writeFileSync(configPath, JSON.stringify(databases, null, 2), 'utf-8')
}

// ===== 索引操作 =====

/** 获取索引文件路径 */
function getIndexPath(databasePath: string): string {
  return join(databasePath, METADATA_DIR, INDEX_FILE)
}

/** 获取标签索引文件路径 */
function getTagsPath(databasePath: string): string {
  return join(databasePath, METADATA_DIR, TAGS_FILE)
}

/** 读取论文索引 */
function loadIndex(databasePath: string): PaperIndex {
  const indexPath = getIndexPath(databasePath)
  if (!existsSync(indexPath)) {
    return {
      version: INDEX_VERSION,
      lastUpdated: Date.now(),
      papers: {}
    }
  }
  try {
    const content = readFileSync(indexPath, 'utf-8')
    return JSON.parse(content) as PaperIndex
  } catch {
    return {
      version: INDEX_VERSION,
      lastUpdated: Date.now(),
      papers: {}
    }
  }
}

/** 保存论文索引 */
function saveIndex(databasePath: string, index: PaperIndex): void {
  const indexPath = getIndexPath(databasePath)
  ensureDir(join(indexPath, '..'))
  index.lastUpdated = Date.now()
  writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8')
}

/** 读取标签索引 */
function loadTags(databasePath: string): TagIndex {
  const tagsPath = getTagsPath(databasePath)
  if (!existsSync(tagsPath)) {
    return {
      version: INDEX_VERSION,
      tags: {}
    }
  }
  try {
    const content = readFileSync(tagsPath, 'utf-8')
    return JSON.parse(content) as TagIndex
  } catch {
    return {
      version: INDEX_VERSION,
      tags: {}
    }
  }
}

/** 保存标签索引 */
function saveTags(databasePath: string, tags: TagIndex): void {
  const tagsPath = getTagsPath(databasePath)
  ensureDir(join(tagsPath, '..'))
  writeFileSync(tagsPath, JSON.stringify(tags, null, 2), 'utf-8')
}

// ===== 数据库管理 =====

/** 获取所有数据库（带校验，移除不存在的数据库） */
export function getDatabases(): PaperDatabase[] {
  const databases = loadDatabasesConfig()
  
  // 校验每个数据库目录是否存在
  const validDatabases = databases.filter(db => {
    if (!existsSync(db.path)) {
      console.log(`[Library] 数据库目录不存在，移除: ${db.name} (${db.path})`)
      return false
    }
    return true
  })
  
  // 如果有移除，保存更新后的配置
  if (validDatabases.length !== databases.length) {
    saveDatabasesConfig(validDatabases)
  }
  
  return validDatabases
}

/** 创建数据库 */
export function createDatabase(name: string, customPath?: string): PaperDatabase {
  const id = generateShortId()
  const rootPath = customPath || getDatabasesRootPath()
  const databasePath = join(rootPath, name)

  // 创建目录结构
  ensureDir(join(databasePath, METADATA_DIR))
  ensureDir(join(databasePath, PAPERS_DIR))
  ensureDir(join(databasePath, IMPORTS_DIR))

  // 初始化索引
  saveIndex(databasePath, {
    version: INDEX_VERSION,
    lastUpdated: Date.now(),
    papers: {}
  })

  // 初始化标签
  saveTags(databasePath, {
    version: INDEX_VERSION,
    tags: {}
  })

  const database: PaperDatabase = {
    id,
    name,
    path: databasePath,
    createdAt: Date.now(),
    lastOpenedAt: Date.now(),
    paperCount: 0
  }

  // 保存到配置
  const databases = loadDatabasesConfig()
  databases.push(database)
  saveDatabasesConfig(databases)

  return database
}

/** 打开数据库 */
export function openDatabase(id: string): void {
  const databases = loadDatabasesConfig()
  const db = databases.find(d => d.id === id)
  if (!db) {
    throw new Error(`Database not found: ${id}`)
  }

  // 更新最后打开时间
  db.lastOpenedAt = Date.now()
  saveDatabasesConfig(databases)

  // 标记为已打开
  openedDatabases.set(id, db)
  // 注意：文件监听由 IPC 层独立管理，不在此处启动
}

/** 关闭数据库 */
export function closeDatabase(id: string): void {
  openedDatabases.delete(id)
  // 注意：文件监听由 IPC 层独立管理，不在此处停止
}

/** 删除数据库 */
export function removeDatabase(id: string, deleteFiles = false): void {
  const databases = loadDatabasesConfig()
  const index = databases.findIndex(d => d.id === id)
  if (index === -1) {
    throw new Error(`Database not found: ${id}`)
  }

  const db = databases[index]

  // 关闭数据库
  closeDatabase(id)

  // 删除文件（如果需要）
  if (deleteFiles && existsSync(db.path)) {
    rmSync(db.path, { recursive: true, force: true })
  }

  // 从配置中移除
  databases.splice(index, 1)
  saveDatabasesConfig(databases)
}

// ===== 论文操作 =====

/** 获取数据库路径 */
function getDatabasePath(databaseId: string): string {
  const databases = loadDatabasesConfig()
  const db = databases.find(d => d.id === databaseId)
  if (!db) {
    throw new Error(`Database not found: ${databaseId}`)
  }
  return db.path
}

/** 获取论文列表 */
export function getPapers(databaseId: string): PaperMeta[] {
  const databasePath = getDatabasePath(databaseId)
  const index = loadIndex(databasePath)
  // 为每个论文填充完整的 pdfPath
  return Object.values(index.papers).map(meta => fillPdfPath(databasePath, meta))
}

/** 获取单篇论文 */
export function getPaper(databaseId: string, paperId: string): PaperMeta | null {
  const databasePath = getDatabasePath(databaseId)
  const index = loadIndex(databasePath)
  const meta = index.papers[paperId]
  // 填充完整的 pdfPath
  return meta ? fillPdfPath(databasePath, meta) : null
}

/** 导入论文（异步，支持 PDF 类型检测） */
export async function importPapers(databaseId: string, filePaths: string[]): Promise<PaperMeta[]> {
  const databasePath = getDatabasePath(databaseId)
  const index = loadIndex(databasePath)
  const importedPapers: PaperMeta[] = []

  for (const filePath of filePaths) {
    // 只处理 PDF 文件
    if (!filePath.toLowerCase().endsWith('.pdf')) {
      continue
    }

    if (!existsSync(filePath)) {
      continue
    }

    const stat = statSync(filePath)
    const filename = filePath.split(/[\\/]/).pop() || 'unknown.pdf'
    const title = extractTitleFromFilename(filename)
    const id = generateShortId()
    const dirname = `${title}.${id}`
    const paperDir = join(databasePath, PAPERS_DIR, dirname)

    // 创建论文目录
    ensureDir(paperDir)

    // 复制 PDF 文件
    const destPath = join(paperDir, filename)
    copyFileSync(filePath, destPath)

    // 检测 PDF 内容类型
    let pdfContentType: PdfContentType = 'text-based'
    try {
      pdfContentType = await detectPdfContentType(destPath)
    } catch (error) {
      console.error('[LibraryService] PDF 类型检测失败:', error)
    }

    // 删除原文件（如果在 _imports 目录中）
    if (filePath.includes(IMPORTS_DIR)) {
      try {
        unlinkSync(filePath)
      } catch {
        // 忽略删除失败
      }
    }

    // 创建元数据（包含 pdfContentType）
    const now = Date.now()
    const meta: PaperMeta = {
      id,
      dirname,
      filename,
      title,
      authors: [],
      tags: [],
      fileSize: stat.size,
      addedAt: now,
      updatedAt: now,
      pdfContentType
    }

    // 保存 meta.json (不包含 pdfPath,因为是运行时计算的)
    writeFileSync(join(paperDir, META_FILE), JSON.stringify(meta, null, 2), 'utf-8')

    // 更新索引
    index.papers[id] = meta
    // 返回时填充完整的 pdfPath
    importedPapers.push(fillPdfPath(databasePath, meta))
  }

  // 保存索引
  saveIndex(databasePath, index)

  // 更新数据库论文数量
  updateDatabasePaperCount(databaseId, Object.keys(index.papers).length)

  // 通知前端 (带完整 pdfPath)
  notifyFileChange({
    type: 'batch-add',
    databaseId,
    items: importedPapers
  })

  return importedPapers
}

/** 删除论文 */
export function removePaper(databaseId: string, paperId: string, deleteFile = true): void {
  const databasePath = getDatabasePath(databaseId)
  const index = loadIndex(databasePath)
  const paper = index.papers[paperId]

  if (!paper) {
    throw new Error(`Paper not found: ${paperId}`)
  }

  // 删除文件
  if (deleteFile) {
    const paperDir = join(databasePath, PAPERS_DIR, paper.dirname)
    if (existsSync(paperDir)) {
      rmSync(paperDir, { recursive: true, force: true })
    }
  }

  // 从索引中移除
  delete index.papers[paperId]
  saveIndex(databasePath, index)

  // 更新数据库论文数量
  updateDatabasePaperCount(databaseId, Object.keys(index.papers).length)

  // 通知前端
  notifyFileChange({
    type: 'remove',
    databaseId,
    items: [paper]
  })
}

/** 更新论文元数据 */
export function updatePaperMeta(databaseId: string, paperId: string, updates: Partial<PaperMeta>): void {
  const databasePath = getDatabasePath(databaseId)
  const index = loadIndex(databasePath)
  const paper = index.papers[paperId]

  if (!paper) {
    throw new Error(`Paper not found: ${paperId}`)
  }

  // 更新元数据
  const updatedPaper: PaperMeta = {
    ...paper,
    ...updates,
    id: paper.id, // 保护不可变字段
    dirname: paper.dirname,
    filename: paper.filename,
    updatedAt: Date.now()
  }

  // 更新索引
  index.papers[paperId] = updatedPaper
  saveIndex(databasePath, index)

  // 更新 meta.json
  const paperDir = join(databasePath, PAPERS_DIR, paper.dirname)
  writeFileSync(join(paperDir, META_FILE), JSON.stringify(updatedPaper, null, 2), 'utf-8')

  // 通知前端
  notifyFileChange({
    type: 'update',
    databaseId,
    items: [updatedPaper]
  })
}

/** 更新数据库论文数量 */
function updateDatabasePaperCount(databaseId: string, count: number): void {
  const databases = loadDatabasesConfig()
  const db = databases.find(d => d.id === databaseId)
  if (db) {
    db.paperCount = count
    saveDatabasesConfig(databases)
  }
}

// ===== 标签操作 =====

/** 获取标签列表 */
export function getTags(databaseId: string): Tag[] {
  const databasePath = getDatabasePath(databaseId)
  const tagIndex = loadTags(databasePath)
  return Object.values(tagIndex.tags)
}

/** 创建标签 */
export function createTag(databaseId: string, name: string, color?: string): Tag {
  const databasePath = getDatabasePath(databaseId)
  const tagIndex = loadTags(databasePath)

  const id = generateShortId()
  const tag: Tag = {
    id,
    name,
    color,
    count: 0
  }

  tagIndex.tags[id] = tag
  saveTags(databasePath, tagIndex)

  return tag
}

/** 更新标签 */
export function updateTag(databaseId: string, tagId: string, updates: Partial<Tag>): void {
  const databasePath = getDatabasePath(databaseId)
  const tagIndex = loadTags(databasePath)
  const tag = tagIndex.tags[tagId]

  if (!tag) {
    throw new Error(`Tag not found: ${tagId}`)
  }

  tagIndex.tags[tagId] = {
    ...tag,
    ...updates,
    id: tag.id // 保护 ID
  }
  saveTags(databasePath, tagIndex)
}

/** 删除标签 */
export function deleteTag(databaseId: string, tagId: string): void {
  const databasePath = getDatabasePath(databaseId)
  const tagIndex = loadTags(databasePath)

  if (!tagIndex.tags[tagId]) {
    throw new Error(`Tag not found: ${tagId}`)
  }

  delete tagIndex.tags[tagId]
  saveTags(databasePath, tagIndex)

  // TODO: 从所有论文中移除该标签
}

// ===== 索引管理 =====

/** 重建索引 */
export function rebuildIndex(databaseId: string): void {
  const databasePath = getDatabasePath(databaseId)
  const papersDir = join(databasePath, PAPERS_DIR)

  if (!existsSync(papersDir)) {
    return
  }

  const newIndex: PaperIndex = {
    version: INDEX_VERSION,
    lastUpdated: Date.now(),
    papers: {}
  }

  // 扫描所有论文目录
  const dirs = readdirSync(papersDir, { withFileTypes: true })
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const metaPath = join(papersDir, dir.name, META_FILE)
    if (!existsSync(metaPath)) continue

    try {
      const content = readFileSync(metaPath, 'utf-8')
      const meta = JSON.parse(content) as PaperMeta
      newIndex.papers[meta.id] = meta
    } catch {
      // 跳过损坏的元数据
    }
  }

  saveIndex(databasePath, newIndex)
  updateDatabasePaperCount(databaseId, Object.keys(newIndex.papers).length)
}

// ===== 事件通知 =====

/** 添加文件变更监听器 */
export function addFileChangeListener(listener: (event: FileChangeEvent) => void): () => void {
  fileChangeListeners.push(listener)
  return () => {
    const index = fileChangeListeners.indexOf(listener)
    if (index > -1) {
      fileChangeListeners.splice(index, 1)
    }
  }
}

/** 通知文件变更 */
function notifyFileChange(event: FileChangeEvent): void {
  for (const listener of fileChangeListeners) {
    try {
      listener(event)
    } catch (e) {
      console.error('[LibraryService] Error in file change listener:', e)
    }
  }
}
