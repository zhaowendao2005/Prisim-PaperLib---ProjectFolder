/**
 * Paper Electron 数据源实现（生产模式）
 */

import type { PaperDataSource } from './paper.datasource'
import type { Paper, PaperFilter, PaperCreateInput } from '@core/types/paper'

export class PaperElectronDataSource implements PaperDataSource {
  async getList(filter?: PaperFilter): Promise<Paper[]> {
    return window.electron.ipcRenderer.invoke('paper:getList', filter)
  }

  async getById(id: string): Promise<Paper | null> {
    return window.electron.ipcRenderer.invoke('paper:getById', id)
  }

  async create(input: PaperCreateInput): Promise<Paper> {
    return window.electron.ipcRenderer.invoke('paper:create', input)
  }

  async update(id: string, input: Partial<PaperCreateInput>): Promise<Paper> {
    return window.electron.ipcRenderer.invoke('paper:update', id, input)
  }

  async delete(id: string): Promise<void> {
    return window.electron.ipcRenderer.invoke('paper:delete', id)
  }

  async search(query: string): Promise<Paper[]> {
    return window.electron.ipcRenderer.invoke('paper:search', query)
  }
}
