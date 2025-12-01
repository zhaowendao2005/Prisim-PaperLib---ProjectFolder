# DataSource 规范 - Web/Electron 双模式数据源设计

## 概述

为了支持 **Web 端调试**（方便 LLM 查看实际内容、快速迭代 UI）和 **Electron 端运行**（完整功能），我们采用 DataSource 模式来隔离数据获取逻辑。

## 核心原则

**职责分离**:
- **Vue 组件**: 负责 UI 渲染和用户交互
- **Pinia Store**: 负责状态管理和业务逻辑
- **DataSource**: 负责环境检测和数据获取

**架构流程**:
```
┌─────────────────────────────────────────────────────────────┐
│                        Vue 组件                              │
│                           │                                  │
│                           ▼                                  │
│                    useXxxStore() (Pinia)                     │
│                     (纯状态管理)                              │
│                           │                                  │
│                           ▼                                  │
│                    XxxDataSource                             │
│                  (环境检测 + 工厂模式)                         │
│              ┌────────────┴────────────┐                     │
│              ▼                         ▼                     │
│     XxxMockDataSource          XxxElectronDataSource         │
│     (Web 调试模式)              (Electron 生产模式)           │
│              │                         │                     │
│              ▼                         ▼                     │
│         模拟数据                   IPC / 本地数据库            │
└─────────────────────────────────────────────────────────────┘
```

**关键设计**:
- ✅ **环境检测在 DataSource 层**: 通过工厂模式自动选择实现
- ✅ **Store 层无环境逻辑**: Store 只负责状态管理,不关心数据来源
- ✅ **单例模式**: DataSource 使用单例,避免重复创建

## 目录结构

```
apps/client/src/renderer/stores/
└── paper/
    ├── paper.store.ts            # Pinia Store（使用 DataSource）
    ├── paper.datasource.ts       # DataSource 接口定义
    ├── paper.mock.ts             # Mock 数据源实现（Web 调试）
    └── paper.electron.ts         # Electron 数据源实现（生产）

apps/client/src/core/
├── types/
│   └── paper/
│       └── index.ts              # Paper 相关类型定义
│
└── utils/
    └── env/
        └── index.ts              # 环境检测工具
```

## 环境检测

```typescript
// core/utils/env/index.ts

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.electron !== 'undefined'
}

export const isWeb = (): boolean => !isElectron()

export const isDev = (): boolean => import.meta.env.DEV

// 强制使用 Mock 数据（即使在 Electron 中）
export const forceMock = (): boolean => {
  return import.meta.env.VITE_FORCE_MOCK === 'true'
}
```

## DataSource 接口定义与工厂实现

```typescript
// renderer/stores/paper/paper.datasource.ts

import { isElectron, forceMock } from '@/core/utils/env'
import { PaperMockDataSource } from './paper.mock'
import { PaperElectronDataSource } from './paper.electron'
import type { Paper, PaperFilter, PaperCreateInput } from '@core/types/paper'

/**
 * Paper 数据源接口
 * Mock 和 Electron 实现都必须遵循此接口
 */
export interface IPaperDataSource {
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

/**
 * 🎯 DataSource 工厂类
 * 负责环境检测并自动选择 Mock 或 Electron 实现
 */
class PaperDataSourceFactory {
  private static instance: IPaperDataSource | null = null
  
  static getInstance(): IPaperDataSource {
    if (!this.instance) {
      // 环境检测逻辑在这里
      if (forceMock() || !isElectron()) {
        console.log('[PaperDataSource] 使用 Mock 实现')
        this.instance = new PaperMockDataSource()
      } else {
        console.log('[PaperDataSource] 使用 Electron 实现')
        this.instance = new PaperElectronDataSource()
      }
    }
    return this.instance
  }
}

/**
 * 导出单例 DataSource
 * Store 直接使用此实例,无需关心环境检测
 */
export const PaperDataSource = PaperDataSourceFactory.getInstance()
```

## Mock 数据源实现

```typescript
// renderer/stores/paper/paper.mock.ts

import type { IPaperDataSource } from './paper.datasource'
import type { Paper, PaperFilter, PaperCreateInput } from '@core/types/paper'

/** 模拟数据 */
const mockPapers: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Vaswani, A.', 'Shazeer, N.'],
    year: 2017,
    abstract: 'The dominant sequence transduction models...',
    tags: ['transformer', 'nlp'],
    pdfPath: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // ... 更多模拟数据
]

export class PaperMockDataSource implements IPaperDataSource {
  private papers = [...mockPapers]

  async getList(filter?: PaperFilter): Promise<Paper[]> {
    // 模拟网络延迟
    await this.delay(200)
    
    let result = [...this.papers]
    if (filter?.tag) {
      result = result.filter(p => p.tags.includes(filter.tag!))
    }
    return result
  }

  async getById(id: string): Promise<Paper | null> {
    await this.delay(100)
    return this.papers.find(p => p.id === id) ?? null
  }

  async create(input: PaperCreateInput): Promise<Paper> {
    await this.delay(300)
    const paper: Paper = {
      id: String(Date.now()),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.papers.push(paper)
    return paper
  }

  async update(id: string, input: Partial<PaperCreateInput>): Promise<Paper> {
    await this.delay(200)
    const index = this.papers.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Paper not found')
    
    this.papers[index] = {
      ...this.papers[index],
      ...input,
      updatedAt: new Date()
    }
    return this.papers[index]
  }

  async delete(id: string): Promise<void> {
    await this.delay(200)
    const index = this.papers.findIndex(p => p.id === id)
    if (index !== -1) {
      this.papers.splice(index, 1)
    }
  }

  async search(query: string): Promise<Paper[]> {
    await this.delay(300)
    const q = query.toLowerCase()
    return this.papers.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.authors.some(a => a.toLowerCase().includes(q))
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

## Electron 数据源实现

```typescript
// renderer/stores/paper/paper.electron.ts

import type { IPaperDataSource } from './paper.datasource'
import type { Paper, PaperFilter, PaperCreateInput } from '@core/types/paper'

export class PaperElectronDataSource implements IPaperDataSource {
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
```

## Pinia Store 中使用 DataSource

**关键点**: Store 只负责状态管理,直接使用 DataSource 单例,无需环境检测逻辑

```typescript
// renderer/stores/paper/paper.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Paper, PaperFilter } from '@core/types/paper'
import { PaperDataSource } from './paper.datasource'  // 直接导入单例

export const usePaperStore = defineStore('paper', () => {
  // ============================================================
  // 状态 (State)
  // ============================================================
  const papers = ref<Paper[]>([])
  const currentPaper = ref<Paper | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // ============================================================
  // 业务逻辑 (Actions)
  // ============================================================
  
  /**
   * 获取论文列表
   * DataSource 会自动根据环境选择 Mock 或 Electron 实现
   */
  async function fetchPapers(filter?: PaperFilter) {
    loading.value = true
    error.value = null
    try {
      papers.value = await PaperDataSource.getList(filter)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function fetchPaper(id: string) {
    loading.value = true
    error.value = null
    try {
      currentPaper.value = await PaperDataSource.getById(id)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  async function searchPapers(query: string) {
    loading.value = true
    error.value = null
    try {
      papers.value = await PaperDataSource.search(query)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    papers,
    currentPaper,
    loading,
    error,
    // Actions
    fetchPapers,
    fetchPaper,
    searchPapers
  }
})
```

**优势**:
- ✅ Store 代码简洁,只关注状态管理
- ✅ 无环境检测代码,职责单一
- ✅ DataSource 自动处理环境切换
- ✅ 易于测试和维护

## 在组件中使用

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { usePaperStore } from '@renderer/stores/paper/paper.store'

const paperStore = usePaperStore()

onMounted(() => {
  paperStore.fetchPapers()
})
</script>

<template>
  <div v-if="paperStore.loading">加载中...</div>
  <div v-else-if="paperStore.error">{{ paperStore.error.message }}</div>
  <ul v-else>
    <li v-for="paper in paperStore.papers" :key="paper.id">
      {{ paper.title }}
    </li>
  </ul>
</template>
```

## 启动 Web 调试模式

### 方式 1：添加 Vite 配置

```typescript
// electron.vite.config.ts 中 renderer 部分已有配置
// 直接访问 http://localhost:5173 即可进入 Web 模式
```

### 方式 2：添加独立的 Web 调试命令

```json
// package.json
{
  "scripts": {
    "dev:web": "vite --config vite.web.config.ts"
  }
}
```

### 方式 3：环境变量强制 Mock

```bash
# .env.development
VITE_FORCE_MOCK=true
```

## 文件命名规范

| 文件类型 | 命名格式 | 位置 | 示例 |
|---------|---------|------|------|
| Pinia Store | `*.store.ts` | `renderer/stores/xxx/` | `paper.store.ts` |
| DataSource 接口 | `*.datasource.ts` | `renderer/stores/xxx/` | `paper.datasource.ts` |
| Mock 实现 | `*.mock.ts` | `renderer/stores/xxx/` | `paper.mock.ts` |
| Electron 实现 | `*.electron.ts` | `renderer/stores/xxx/` | `paper.electron.ts` |
| Service | `*.service.ts` | `core/services/xxx/` | `pdf.service.ts` |

## 注意事项

1. **环境检测在 DataSource 层** - Store 不应包含任何环境检测逻辑
2. **单例模式** - DataSource 使用单例,确保环境检测只执行一次
3. **Mock 数据要真实** - 模拟数据应尽量接近真实数据结构，方便 UI 调试
4. **模拟延迟** - Mock 中加入适当延迟，模拟真实网络环境
5. **错误模拟** - Mock 可以随机抛出错误，测试错误处理逻辑
6. **类型一致** - Mock 和 Electron 实现必须严格遵循同一接口
7. **职责分离** - Store 只负责状态管理,DataSource 负责数据获取

## 后续扩展

- [ ] 添加 `dev:web` 命令，独立启动 Web 调试服务器
- [ ] 添加 Mock 数据管理面板（仅 Web 模式可见）
- [ ] 支持从 JSON 文件加载 Mock 数据
- [ ] 添加请求日志中间件
