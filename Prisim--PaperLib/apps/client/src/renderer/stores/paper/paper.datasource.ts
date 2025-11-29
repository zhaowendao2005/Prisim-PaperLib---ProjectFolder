/**
 * Paper 数据源接口
 * Mock 和 Electron 实现都必须遵循此接口
 */

import type { Paper, PaperFilter, PaperCreateInput } from '@core/types/paper'

export interface PaperDataSource {
  /** 获取论文列表 */
  getList(filter?: PaperFilter): Promise<Paper[]>

  /** 获取单篇论文 */
  getById(id: string): Promise<Paper | null>

  /** 创建论文 */
  create(input: PaperCreateInput): Promise<Paper>

  /** 更新论文 */
  update(id: string, input: Partial<PaperCreateInput>): Promise<Paper>

  /** 删除论文 */
  delete(id: string): Promise<void>

  /** 搜索论文 */
  search(query: string): Promise<Paper[]>
}
