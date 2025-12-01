/**
 * MinerU 服务
 * 管理 MinerU OCR API 调用、任务轮询、结果下载
 */
import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync, createWriteStream } from 'fs'
import { randomUUID } from 'crypto'
import type {
  MineruConfig,
  MineruTask,
  MineruTaskState,
  MineruTaskProgress,
  SubmitOcrTaskParams
} from '@client&electron.share/types/mineru/mineru.type'
import { DEFAULT_MINERU_CONFIG } from '@client&electron.share/types/mineru/mineru.type'
import * as SystemService from '../system/system.service'

// ===== 常量 =====

/** MinerU API 基础 URL */
const MINERU_API_BASE = 'https://mineru.net/api/v4'

/** 任务缓存文件名 */
const TASKS_CACHE_FILE = '.mineru-tasks.json'

/** 轮询间隔限制 */
const MIN_POLLING_INTERVAL_SEC = 5
const MAX_POLLING_INTERVAL_SEC = 60

// ===== 内存状态 =====

/** 任务表：localId -> MineruTask */
const taskMap = new Map<string, MineruTask>()

/** 轮询定时器 */
let pollingTimer: NodeJS.Timeout | null = null

/** 当前轮询间隔（毫秒） */
let currentPollingIntervalMs = DEFAULT_MINERU_CONFIG.pollingIntervalSec * 1000

// ===== 配置管理 =====

/**
 * 获取 MinerU 配置
 */
export function getMineruConfig(): MineruConfig {
  const config = SystemService.getConfig()
  return config.extensions?.mineru ?? { ...DEFAULT_MINERU_CONFIG }
}

/**
 * 保存 MinerU 配置
 */
export function saveMineruConfig(mineruConfig: MineruConfig): void {
  const config = SystemService.getConfig()
  if (!config.extensions) {
    config.extensions = {}
  }
  config.extensions.mineru = mineruConfig
  SystemService.setConfigValue('extensions.mineru', mineruConfig)
  
  // 更新轮询间隔
  const newInterval = Math.max(
    MIN_POLLING_INTERVAL_SEC,
    Math.min(MAX_POLLING_INTERVAL_SEC, mineruConfig.pollingIntervalSec)
  ) * 1000
  if (newInterval !== currentPollingIntervalMs) {
    currentPollingIntervalMs = newInterval
    // 如果轮询器正在运行，重启以应用新间隔
    if (pollingTimer) {
      stopPolling()
      startPolling()
    }
  }
}

// ===== HTTP 请求封装 =====

/**
 * 发送 MinerU API 请求
 */
async function mineruFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; code?: string }> {
  const config = getMineruConfig()
  
  if (!config.apiKey) {
    return { success: false, error: '未配置 MinerU API Key' }
  }

  const url = `${MINERU_API_BASE}${endpoint}`
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const json = await response.json() as {
      code: string
      msg: string
      data?: T
    }

    if (json.code === '0' || json.code === 'ok') {
      return { success: true, data: json.data }
    } else {
      return { success: false, error: json.msg, code: json.code }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '网络请求失败'
    console.error('[MineruService] API 请求失败:', message)
    return { success: false, error: message }
  }
}

/**
 * 上传文件到预签名 URL
 */
async function uploadFileToUrl(filePath: string, uploadUrl: string): Promise<boolean> {
  try {
    const fileBuffer = readFileSync(filePath)
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'application/pdf'
      }
    })

    return response.ok
  } catch (err) {
    console.error('[MineruService] 文件上传失败:', err)
    return false
  }
}

// ===== 任务管理 =====

/**
 * 提交本地 PDF OCR 任务
 */
export async function submitLocalOcrTask(params: SubmitOcrTaskParams): Promise<MineruTask> {
  const { paperId, pdfPath, fileName } = params
  const config = getMineruConfig()

  // 生成本地任务 ID
  const localId = randomUUID()
  const dataId = localId

  // 创建初始任务
  const task: MineruTask = {
    localId,
    paperId,
    fileName,
    pdfPath,
    batchId: '',
    dataId,
    state: 'uploading',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  // 加入任务表
  taskMap.set(localId, task)
  broadcastTaskUpdate([task])

  // 1. 请求预签名上传 URL
  const fileUrlsResult = await mineruFetch<{
    batch_id: string
    file_urls: string[]
  }>('/file-urls/batch', {
    method: 'POST',
    body: JSON.stringify({
      files: [{ name: fileName, data_id: dataId }],
      model_version: config.modelVersion,
      enable_ocr: config.enableOcr,
      enable_formula: config.enableFormula,
      enable_table: config.enableTable,
      language: config.language
    })
  })

  if (!fileUrlsResult.success || !fileUrlsResult.data) {
    task.state = 'failed'
    task.errorMsg = fileUrlsResult.error ?? '获取上传 URL 失败'
    task.updatedAt = Date.now()
    broadcastTaskUpdate([task])
    saveTasksCache()
    return task
  }

  const { batch_id, file_urls } = fileUrlsResult.data
  task.batchId = batch_id

  // 2. 上传文件
  const uploadSuccess = await uploadFileToUrl(pdfPath, file_urls[0])
  
  if (!uploadSuccess) {
    task.state = 'failed'
    task.errorMsg = '文件上传失败'
    task.updatedAt = Date.now()
    broadcastTaskUpdate([task])
    saveTasksCache()
    return task
  }

  // 3. 上传成功，等待 MinerU 处理
  task.state = 'pending'
  task.updatedAt = Date.now()
  broadcastTaskUpdate([task])
  saveTasksCache()

  // 启动轮询器（如果尚未启动）
  startPolling()

  return task
}

/**
 * 获取所有任务快照
 */
export function getTasksSnapshot(): MineruTask[] {
  return Array.from(taskMap.values())
}

/**
 * 手动触发结果下载
 */
export async function downloadResult(localId: string): Promise<void> {
  const task = taskMap.get(localId)
  if (!task || task.state !== 'done' || !task.resultZipUrl) {
    return
  }

  await downloadResultZip(task)
}

/**
 * 测试 API 连接
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  const config = getMineruConfig()
  
  if (!config.apiKey) {
    return { success: false, message: '未配置 API Key' }
  }

  // 发送一个简单的请求来验证 API Key
  // 使用 file-urls/batch 接口，但不实际上传
  try {
    const response = await fetch(`${MINERU_API_BASE}/file-urls/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [],
        model_version: 'vlm'
      })
    })

    const json = await response.json() as { code: string; msg: string }
    
    // 即使返回错误（因为 files 为空），只要不是认证错误就说明 API Key 有效
    if (json.code === 'A0202' || json.code === 'A0211') {
      return { success: false, message: 'API Key 无效或已过期' }
    }
    
    return { success: true, message: '连接成功' }
  } catch (err) {
    const message = err instanceof Error ? err.message : '网络连接失败'
    return { success: false, message }
  }
}

// ===== 轮询逻辑 =====

/**
 * 启动轮询器
 */
function startPolling(): void {
  if (pollingTimer) return

  const hasActiveTasks = Array.from(taskMap.values()).some(
    t => t.state === 'pending' || t.state === 'running'
  )

  if (!hasActiveTasks) return

  console.log('[MineruService] 启动轮询器，间隔:', currentPollingIntervalMs, 'ms')
  
  pollingTimer = setInterval(() => {
    pollActiveBatches().catch(err => {
      console.error('[MineruService] 轮询出错:', err)
    })
  }, currentPollingIntervalMs)

  // 立即执行一次
  pollActiveBatches().catch(err => {
    console.error('[MineruService] 首次轮询出错:', err)
  })
}

/**
 * 停止轮询器
 */
function stopPolling(): void {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    console.log('[MineruService] 停止轮询器')
  }
}

/**
 * 轮询所有活跃批次
 */
async function pollActiveBatches(): Promise<void> {
  // 收集活跃的 batchId
  const activeBatchIds = new Set<string>()
  for (const task of taskMap.values()) {
    if ((task.state === 'pending' || task.state === 'running') && task.batchId) {
      activeBatchIds.add(task.batchId)
    }
  }

  if (activeBatchIds.size === 0) {
    stopPolling()
    return
  }

  // 轮询每个 batch
  const updatedTasks: MineruTask[] = []

  for (const batchId of activeBatchIds) {
    const result = await mineruFetch<{
      extract_result: Array<{
        data_id?: string
        file_name: string
        state: string
        full_zip_url?: string
        err_msg?: string
        extract_progress?: {
          extracted_pages: number
          total_pages: number
          start_time: string
        }
      }>
    }>(`/extract-results/batch/${batchId}`)

    if (!result.success || !result.data) {
      console.warn('[MineruService] 轮询批次失败:', batchId, result.error)
      continue
    }

    // 更新对应任务
    for (const extractResult of result.data.extract_result) {
      // 通过 data_id 或 file_name 匹配任务
      const task = Array.from(taskMap.values()).find(
        t => t.batchId === batchId && 
             (t.dataId === extractResult.data_id || t.fileName === extractResult.file_name)
      )

      if (!task) continue

      let stateChanged = false

      // 映射 MinerU 状态到本地状态
      const mineruState = extractResult.state.toLowerCase()
      let newState: MineruTaskState = task.state

      if (mineruState === 'running' || mineruState === 'processing') {
        newState = 'running'
      } else if (mineruState === 'done' || mineruState === 'success') {
        newState = 'done'
      } else if (mineruState === 'failed' || mineruState === 'error') {
        newState = 'failed'
      } else if (mineruState === 'pending' || mineruState === 'waiting') {
        newState = 'pending'
      }

      if (newState !== task.state) {
        task.state = newState
        stateChanged = true
      }

      // 更新进度
      if (extractResult.extract_progress) {
        const progress: MineruTaskProgress = {
          extractedPages: extractResult.extract_progress.extracted_pages,
          totalPages: extractResult.extract_progress.total_pages,
          startTime: extractResult.extract_progress.start_time
        }
        task.progress = progress
        stateChanged = true
      }

      // 更新结果 URL
      if (extractResult.full_zip_url && !task.resultZipUrl) {
        task.resultZipUrl = extractResult.full_zip_url
        stateChanged = true
      }

      // 更新错误信息
      if (extractResult.err_msg && !task.errorMsg) {
        task.errorMsg = extractResult.err_msg
        stateChanged = true
      }

      if (stateChanged) {
        task.updatedAt = Date.now()
        updatedTasks.push(task)
      }

      // 如果任务完成且有结果 URL，自动下载
      if (task.state === 'done' && task.resultZipUrl && !task.resultLocalPath) {
        downloadResultZip(task).catch(err => {
          console.error('[MineruService] 自动下载结果失败:', err)
        })
      }
    }
  }

  if (updatedTasks.length > 0) {
    broadcastTaskUpdate(updatedTasks)
    saveTasksCache()
  }

  // 检查是否还有活跃任务
  const stillActive = Array.from(taskMap.values()).some(
    t => t.state === 'pending' || t.state === 'running'
  )
  if (!stillActive) {
    stopPolling()
  }
}

// ===== 结果下载 =====

/**
 * 下载结果 zip 文件
 */
async function downloadResultZip(task: MineruTask): Promise<void> {
  if (!task.resultZipUrl) return

  const paths = SystemService.getPaths()
  const resultDir = join(paths.appData, 'MineruResults', task.paperId, task.localId)
  const resultPath = join(resultDir, 'result.zip')

  try {
    // 确保目录存在
    if (!existsSync(resultDir)) {
      mkdirSync(resultDir, { recursive: true })
    }

    // 下载文件
    const response = await fetch(task.resultZipUrl)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    writeFileSync(resultPath, Buffer.from(buffer))

    // 更新任务
    task.resultLocalPath = resultPath
    task.updatedAt = Date.now()
    broadcastTaskUpdate([task])
    saveTasksCache()

    console.log('[MineruService] 结果下载完成:', resultPath)
  } catch (err) {
    console.error('[MineruService] 下载结果失败:', err)
    task.errorMsg = '结果下载失败，可稍后重试'
    task.updatedAt = Date.now()
    broadcastTaskUpdate([task])
  }
}

// ===== 持久化 =====

/**
 * 获取任务缓存文件路径
 */
function getTasksCachePath(): string {
  const paths = SystemService.getPaths()
  return join(paths.appData, TASKS_CACHE_FILE)
}

/**
 * 保存任务缓存
 */
function saveTasksCache(): void {
  try {
    const tasks = Array.from(taskMap.values())
    const cachePath = getTasksCachePath()
    writeFileSync(cachePath, JSON.stringify(tasks, null, 2), 'utf-8')
  } catch (err) {
    console.error('[MineruService] 保存任务缓存失败:', err)
  }
}

/**
 * 加载任务缓存
 */
function loadTasksCache(): void {
  try {
    const cachePath = getTasksCachePath()
    if (!existsSync(cachePath)) return

    const content = readFileSync(cachePath, 'utf-8')
    const tasks = JSON.parse(content) as MineruTask[]

    for (const task of tasks) {
      taskMap.set(task.localId, task)
    }

    console.log('[MineruService] 加载任务缓存:', tasks.length, '个任务')
  } catch (err) {
    console.error('[MineruService] 加载任务缓存失败:', err)
  }
}

// ===== 广播更新 =====

/**
 * 向渲染进程广播任务更新
 */
function broadcastTaskUpdate(tasks: MineruTask[]): void {
  const windows = BrowserWindow.getAllWindows()
  for (const win of windows) {
    win.webContents.send('mineru:taskUpdate', tasks)
  }
}

// ===== 初始化 =====

/**
 * 初始化 MinerU 服务
 * 应用启动时调用
 */
export function initializeMineruService(): void {
  // 加载配置
  const config = getMineruConfig()
  currentPollingIntervalMs = Math.max(
    MIN_POLLING_INTERVAL_SEC,
    Math.min(MAX_POLLING_INTERVAL_SEC, config.pollingIntervalSec)
  ) * 1000

  // 加载任务缓存
  loadTasksCache()

  // 如果有未完成的任务，启动轮询
  const hasActiveTasks = Array.from(taskMap.values()).some(
    t => t.state === 'pending' || t.state === 'running'
  )
  if (hasActiveTasks) {
    startPolling()
  }

  // 应用退出时保存缓存
  app.on('before-quit', () => {
    saveTasksCache()
    stopPolling()
  })

  console.log('[MineruService] 初始化完成')
}
