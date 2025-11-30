/**
 * Utils API 类型定义
 */

/** Utils API 接口 */
export interface UtilsApi {
  /** 获取拖放文件的本地路径 */
  getPathForFile: (file: File) => string
}
