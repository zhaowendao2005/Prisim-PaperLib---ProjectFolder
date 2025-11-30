/**
 * DropZone 组件类型定义
 */

export interface DropZoneProps {
  /** 接受的文件类型，如 ".pdf,.doc" */
  accept?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 遮罩提示文字 */
  overlayText?: string
}

export interface DropZoneEmits {
  /** 文件放下事件 */
  drop: [files: File[]]
  /** 拖拽进入事件 */
  dragenter: []
  /** 拖拽离开事件 */
  dragleave: []
}

export interface DropZoneExpose {
  /** 是否正在拖拽 */
  isDragOver: boolean
}
