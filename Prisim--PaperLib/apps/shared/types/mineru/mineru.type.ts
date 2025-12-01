/**
 * MinerU API 类型定义
 * MinerU OCR 服务相关的共享类型
 */

// ===== 任务状态枚举 =====

/** MinerU 任务状态 */
export type MineruTaskState =
  | 'uploading'  // 正在上传到 MinerU OSS
  | 'pending'    // MinerU 已接收，等待解析
  | 'running'    // MinerU 正在解析
  | 'done'       // 解析完成
  | 'failed'     // 解析失败

// ===== 配置类型 =====

/** MinerU 配置 */
export interface MineruConfig {
  /** API Key（明文存储） */
  apiKey: string
  /** 模型版本：pipeline（速度快）或 vlm（效果好） */
  modelVersion: 'pipeline' | 'vlm'
  /** 是否启用 OCR（仅 pipeline 模式有效） */
  enableOcr: boolean
  /** 是否启用公式识别（仅 pipeline 模式有效） */
  enableFormula: boolean
  /** 是否启用表格识别（仅 pipeline 模式有效） */
  enableTable: boolean
  /** 语言设置，默认 'ch' */
  language: string
  /** 轮询间隔秒数，用户可配置，限制在 [5, 60] */
  pollingIntervalSec: number
}

/** MinerU 配置默认值 */
export const DEFAULT_MINERU_CONFIG: MineruConfig = {
  apiKey: '',
  modelVersion: 'vlm',
  enableOcr: true,
  enableFormula: true,
  enableTable: true,
  language: 'ch',
  pollingIntervalSec: 10
}

// ===== 任务类型 =====

/** MinerU 任务进度 */
export interface MineruTaskProgress {
  /** 已解析页数 */
  extractedPages: number
  /** 总页数 */
  totalPages: number
  /** 开始时间（ISO 字符串或 MinerU 返回的时间） */
  startTime: string
}

/** MinerU 任务 */
export interface MineruTask {
  /** 本地任务 ID（UUID） */
  localId: string
  /** 关联的论文 ID */
  paperId: string
  /** 文件名 */
  fileName: string
  /** 本地 PDF 路径 */
  pdfPath: string

  /** MinerU 返回的批量任务 ID */
  batchId: string
  /** 自定义的 data_id，用于在结果中匹配 */
  dataId: string

  /** 任务状态 */
  state: MineruTaskState
  /** 解析进度（仅 running 状态有效） */
  progress?: MineruTaskProgress

  /** 结果 zip 下载 URL（done 状态有效） */
  resultZipUrl?: string
  /** 结果本地存储路径（下载后有效） */
  resultLocalPath?: string
  /** 错误信息（failed 状态有效） */
  errorMsg?: string

  /** 创建时间戳 */
  createdAt: number
  /** 更新时间戳 */
  updatedAt: number
}

// ===== API 类型 =====

/** 提交任务参数 */
export interface SubmitOcrTaskParams {
  /** 关联的论文 ID */
  paperId: string
  /** 本地 PDF 路径 */
  pdfPath: string
  /** 文件名 */
  fileName: string
}

/** MinerU API（IPC 通信接口） */
export interface MineruApi {
  /** 提交一个本地 PDF 的 OCR 任务 */
  submitLocalOcrTask: (params: SubmitOcrTaskParams) => Promise<MineruTask>

  /** 获取当前所有任务快照（用于启动后初始化） */
  getTasksSnapshot: () => Promise<MineruTask[]>

  /** 手动触发某个任务的结果下载 */
  downloadResult: (localId: string) => Promise<void>

  /** 测试 API 连接（验证 API Key） */
  testConnection: () => Promise<{ success: boolean; message: string }>

  /** 清除所有任务缓存 */
  clearTasksCache: () => Promise<{ success: boolean; count: number }>

  /** 订阅任务更新事件，返回取消订阅函数 */
  onTaskUpdate: (callback: (updates: MineruTask[]) => void) => () => void
}
