/**
 * 文件监听服务
 * 使用 chokidar 监听 _imports/ 目录，检测新文件并通知前端
 */
import { watch, type FSWatcher } from 'chokidar'
import { join, extname } from 'path'
import { existsSync, statSync } from 'fs'
import { BrowserWindow } from 'electron'

// ===== 类型定义 =====

/** 导入请求 */
export interface ImportRequest {
  /** 数据库 ID */
  databaseId: string
  /** 数据库名称 */
  databaseName: string
  /** 待导入文件路径列表 */
  filePaths: string[]
  /** 优先级 */
  priority: 'HIGH' | 'NORMAL'
  /** 来源 */
  source: 'drag-drop' | 'file-dialog' | 'imports-folder'
  /** 创建时间 */
  createdAt: number
}

/** 监听器状态 */
interface WatcherState {
  watcher: FSWatcher | null
  databaseId: string
  databaseName: string
  databasePath: string
  importsPath: string
}

// ===== 常量 =====

const IMPORTS_DIR = '_imports'
const DEBOUNCE_MS = 500 // 防抖时间
const SUPPORTED_EXTENSIONS = ['.pdf']

// ===== 内部状态 =====

/** 活跃的监听器 */
const activeWatchers = new Map<string, WatcherState>()

/** 导入队列 */
const importQueue: ImportRequest[] = []

/** 是否正在处理队列 */
let isProcessingQueue = false

/** 当前显示的确认对话框对应的请求 */
let currentConfirmRequest: ImportRequest | null = null

/** 防抖计时器 */
const debounceTimers = new Map<string, NodeJS.Timeout>()

/** 待处理文件缓冲区（用于批量收集） */
const pendingFiles = new Map<string, Set<string>>()

// ===== 工具函数 =====

/** 检查是否为支持的文件类型 */
function isSupportedFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase()
  return SUPPORTED_EXTENSIONS.includes(ext)
}

/** 向渲染进程发送事件 */
function sendToRenderer(channel: string, data: unknown): void {
  const windows = BrowserWindow.getAllWindows()
  for (const win of windows) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, data)
    }
  }
}

// ===== 队列管理 =====

/** 添加导入请求到队列 */
export function enqueueImportRequest(request: ImportRequest): void {
  // 按优先级插入
  if (request.priority === 'HIGH') {
    // 高优先级插入到队首（但在其他高优先级之后）
    const lastHighIndex = importQueue.findIndex(r => r.priority === 'NORMAL')
    if (lastHighIndex === -1) {
      importQueue.push(request)
    } else {
      importQueue.splice(lastHighIndex, 0, request)
    }
  } else {
    importQueue.push(request)
  }

  console.log(`[Watcher] 入队: ${request.source}, 文件数: ${request.filePaths.length}, 优先级: ${request.priority}`)
  
  // 触发队列处理
  processQueue()
}

/** 处理队列 */
async function processQueue(): Promise<void> {
  // 如果已经在处理或队列为空或有对话框在显示，直接返回
  if (isProcessingQueue || importQueue.length === 0 || currentConfirmRequest) {
    return
  }

  isProcessingQueue = true

  try {
    // 取出队首请求
    const request = importQueue.shift()
    if (!request) return

    currentConfirmRequest = request

    // 发送确认请求到渲染进程
    sendToRenderer('library:confirmImport', {
      databaseId: request.databaseId,
      databaseName: request.databaseName,
      filePaths: request.filePaths,
      fileCount: request.filePaths.length,
      source: request.source
    })

    console.log(`[Watcher] 请求确认: ${request.databaseName}, 文件数: ${request.filePaths.length}`)
  } finally {
    isProcessingQueue = false
  }
}

/** 处理用户确认结果 */
export function handleConfirmResult(confirmed: boolean): void {
  if (!currentConfirmRequest) {
    console.warn('[Watcher] 没有待确认的请求')
    return
  }

  const request = currentConfirmRequest
  currentConfirmRequest = null

  console.log(`[Watcher] 用户${confirmed ? '确认' : '拒绝'}导入: ${request.databaseName}`)

  // 通知渲染进程处理结果
  sendToRenderer('library:confirmImportResult', {
    databaseId: request.databaseId,
    filePaths: request.filePaths,
    confirmed
  })

  // 继续处理队列
  processQueue()
}

// ===== 监听器管理 =====

/** 启动监听 */
export function startWatching(databaseId: string, databaseName: string, databasePath: string): void {
  // 如果已经在监听，先停止
  if (activeWatchers.has(databaseId)) {
    stopWatching(databaseId)
  }

  const importsPath = join(databasePath, IMPORTS_DIR)

  // 确保目录存在
  if (!existsSync(importsPath)) {
    console.log(`[Watcher] _imports 目录不存在: ${importsPath}`)
    return
  }

  console.log(`[Watcher] 开始监听: ${importsPath}`)

  // 初始化待处理文件集合
  pendingFiles.set(databaseId, new Set())

  // 创建监听器
  const watcher = watch(importsPath, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: false, // 启动时检查已有文件
    depth: 0, // 只监听一层
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  })

  // 监听添加事件
  watcher.on('add', (filePath: string) => {
    if (!isSupportedFile(filePath)) return

    console.log(`[Watcher] 检测到文件: ${filePath}`)

    // 添加到待处理集合
    const pending = pendingFiles.get(databaseId)
    if (pending) {
      pending.add(filePath)
    }

    // 防抖处理
    const existingTimer = debounceTimers.get(databaseId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      debounceTimers.delete(databaseId)
      flushPendingFiles(databaseId, databaseName)
    }, DEBOUNCE_MS)

    debounceTimers.set(databaseId, timer)
  })

  // 监听错误
  watcher.on('error', (error: Error) => {
    console.error(`[Watcher] 监听错误: ${databaseId}`, error)
  })

  // 保存状态
  activeWatchers.set(databaseId, {
    watcher,
    databaseId,
    databaseName,
    databasePath,
    importsPath
  })
}

/** 刷新待处理文件，创建导入请求 */
function flushPendingFiles(databaseId: string, databaseName: string): void {
  const pending = pendingFiles.get(databaseId)
  if (!pending || pending.size === 0) return

  const filePaths = Array.from(pending)
  pending.clear()

  // 过滤掉不存在的文件
  const validPaths = filePaths.filter(p => {
    try {
      return existsSync(p) && statSync(p).isFile()
    } catch {
      return false
    }
  })

  if (validPaths.length === 0) return

  // 创建导入请求
  const request: ImportRequest = {
    databaseId,
    databaseName,
    filePaths: validPaths,
    priority: 'NORMAL',
    source: 'imports-folder',
    createdAt: Date.now()
  }

  enqueueImportRequest(request)
}

/** 停止监听 */
export function stopWatching(databaseId: string): void {
  const state = activeWatchers.get(databaseId)
  if (!state) return

  console.log(`[Watcher] 停止监听: ${state.importsPath}`)

  // 清理防抖计时器
  const timer = debounceTimers.get(databaseId)
  if (timer) {
    clearTimeout(timer)
    debounceTimers.delete(databaseId)
  }

  // 清理待处理文件
  pendingFiles.delete(databaseId)

  // 关闭监听器
  if (state.watcher) {
    state.watcher.close()
  }

  activeWatchers.delete(databaseId)
}

/** 停止所有监听 */
export function stopAllWatching(): void {
  for (const databaseId of activeWatchers.keys()) {
    stopWatching(databaseId)
  }
}

/** 获取活跃监听器数量 */
export function getActiveWatcherCount(): number {
  return activeWatchers.size
}

/** 检查是否正在监听 */
export function isWatching(databaseId: string): boolean {
  return activeWatchers.has(databaseId)
}
