# 📋 Single-file-page Tab 系统设计方案

## 🎯 核心需求分析

1. **新增 Tab 类型**: `single-file-page` (PDF 阅读器)
2. **点击论文项触发**: 左侧树形/扁平视图 + 右侧论文列表
3. **Tab 去重逻辑**: 同一 `paperId` 只创建一个 Tab,重复点击则聚焦
4. **PDF 渲染**: 使用 PDF.js 显示 PDF 内容

---

## 📐 架构设计

### 🔄 **数据流与状态机**

**完整数据链**:
```
Vue 组件 (SingleFilePage)
    ↓ 调用 Store Actions
Pinia Store (usePaperReaderStore)
    ↓ 调用 DataSource 方法
DataSource 接口 (PaperReaderDataSource)
    ↓ 具体实现
├─ Mock 实现 (PaperReaderMockDataSource) - Web 调试
└─ Electron 实现 (PaperReaderElectronDataSource) - 生产环境
    ↓ IPC 调用
Electron Main Process (PDF 文件读取)
```

**用户操作流程**:
```
用户点击论文
    ↓
usePaperReaderStore.openPaper()
    ↓
检查 Tab 是否存在 (通过 paperId)
    ├─ 存在 → setActiveTab() 聚焦
    └─ 不存在 → 创建新 Tab
         ↓
    设置 Tab metadata (paperId, libraryId, pdfPath)
         ↓
    初始化 PaperReaderState (currentPage, zoomLevel, etc.)
         ↓
    DataSource.loadPDF(pdfPath) 加载 PDF 数据
         ↓
    SingleFilePage 组件渲染
         ↓
    PDF.js 加载并显示 PDF
```

**状态机流转**:
```
[IDLE] → [LOADING] → [LOADED] → [READY]
   ↓         ↓           ↓          ↓
  关闭    加载失败    页面切换   缩放/翻页
   ↓         ↓           ↓          ↓
[CLOSED]  [ERROR]    [READY]    [READY]
```

### 1️⃣ **类型定义扩展**

```typescript
// apps/client/src/renderer/composables/page-navigation/index.ts

/** Tab 类型 - 新增 single-file-page */
export type TabType = 
  | 'home' 
  | 'project' 
  | 'new-tab' 
  | 'settings'
  | 'single-file-page'  // 🆕 PDF 阅读器 Tab

/** Tab 项定义 - 扩展 metadata */
export interface TabItem {
  id: string
  type: TabType
  title: string
  metadata?: TabMetadata  // 🆕 Tab 元数据
}

/** Tab 元数据 */
export interface TabMetadata {
  paperId?: string      // 论文 ID
  libraryId?: string    // 所属论文库 ID
  pdfPath?: string      // PDF 文件路径
  [key: string]: any    // 其他扩展字段
}
```

---

### 2️⃣ **DataSource 统一接口**

#### **DataSource 主文件**: `paper-reader.datasource.ts`

```typescript
// apps/client/src/renderer/stores/paper-reader/paper-reader.datasource.ts

import { isElectron } from '@/core/utils/env'
import { PaperReaderMockDataSource } from './paper-reader.mock'
import { PaperReaderElectronDataSource } from './paper-reader.electron'

/** PDF 数据 */
export interface PDFData {
  arrayBuffer: ArrayBuffer  // PDF 文件的二进制数据
  fileSize: number          // 文件大小(字节)
  fileName: string          // 文件名
}

/** 论文阅读器数据源接口 */
export interface IPaperReaderDataSource {
  /** 加载 PDF 文件 */
  loadPDF(pdfPath: string): Promise<PDFData>
  
  /** 获取 PDF 文件信息 */
  getPDFInfo(pdfPath: string): Promise<{ size: number; name: string }>
}

/** 
 * 🎯 DataSource 工厂类
 * 根据环境自动选择 Mock 或 Electron 实现
 */
class PaperReaderDataSourceFactory {
  private static instance: IPaperReaderDataSource | null = null
  
  static getInstance(): IPaperReaderDataSource {
    if (!this.instance) {
      if (isElectron()) {
        console.log('[PaperReaderDataSource] 使用 Electron 实现')
        this.instance = new PaperReaderElectronDataSource()
      } else {
        console.log('[PaperReaderDataSource] 使用 Mock 实现')
        this.instance = new PaperReaderMockDataSource()
      }
    }
    return this.instance
  }
}

/** 导出单例 DataSource */
export const PaperReaderDataSource = PaperReaderDataSourceFactory.getInstance()
```

---

### 3️⃣ **Mock DataSource 实现**

#### **Mock 实现**: `paper-reader.mock.ts`

```typescript
// apps/client/src/renderer/stores/paper-reader/paper-reader.mock.ts

import type { IPaperReaderDataSource, PDFData } from './paper-reader.datasource'

export class PaperReaderMockDataSource implements IPaperReaderDataSource {
  async loadPDF(pdfPath: string): Promise<PDFData> {
    // 模拟网络延迟
    await this.delay(500)
    
    // 返回模拟的 PDF 数据
    // 实际应用中可以加载一个示例 PDF 文件
    console.log('[Mock] 加载 PDF:', pdfPath)
    
    // 这里返回空的 ArrayBuffer,实际使用时可以加载真实的示例 PDF
    return {
      arrayBuffer: new ArrayBuffer(0),
      fileSize: 1024 * 1024 * 2, // 模拟 2MB
      fileName: pdfPath.split('/').pop() || 'sample.pdf'
    }
  }
  
  async getPDFInfo(pdfPath: string): Promise<{ size: number; name: string }> {
    await this.delay(100)
    return {
      size: 1024 * 1024 * 2,
      name: pdfPath.split('/').pop() || 'sample.pdf'
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

---

### 4️⃣ **Electron DataSource 实现**

#### **Electron 实现**: `paper-reader.electron.ts`

```typescript
// apps/client/src/renderer/stores/paper-reader/paper-reader.electron.ts

import type { IPaperReaderDataSource, PDFData } from './paper-reader.datasource'

export class PaperReaderElectronDataSource implements IPaperReaderDataSource {
  async loadPDF(pdfPath: string): Promise<PDFData> {
    // 通过 IPC 调用主进程读取 PDF 文件
    const arrayBuffer = await window.electron.ipcRenderer.invoke('pdf:read', pdfPath)
    const info = await this.getPDFInfo(pdfPath)
    
    return {
      arrayBuffer,
      fileSize: info.size,
      fileName: info.name
    }
  }
  
  async getPDFInfo(pdfPath: string): Promise<{ size: number; name: string }> {
    return window.electron.ipcRenderer.invoke('pdf:getInfo', pdfPath)
  }
}
```

---

### 5️⃣ **Pinia Store 设计**

#### **Store 结构**: `paper-reader.store.ts`

```typescript
// apps/client/src/renderer/stores/paper-reader/paper-reader.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTabManager } from '@composables/page-navigation'
import type { TabItem, TabMetadata } from '@composables/page-navigation'
import { PaperReaderDataSource } from './paper-reader.datasource'
import type { PDFData } from './paper-reader.datasource'

/** 论文阅读器状态 */
export interface PaperReaderState {
  paperId: string
  libraryId: string
  pdfPath: string
  title: string
  currentPage: number
  totalPages: number
  zoomLevel: number
  isLoading: boolean
  pdfData: PDFData | null  // PDF 数据
}

export const usePaperReaderStore = defineStore('paper-reader', () => {
  const tabManager = useTabManager()
  
  // ============================================================
  // 状态
  // ============================================================
  
  /** 所有打开的论文阅读器状态 (key: paperId) */
  const readerStates = ref<Map<string, PaperReaderState>>(new Map())
  
  /** 当前激活的 paperId */
  const activePaperId = computed(() => {
    const activeTab = tabManager.activeTab.value
    if (activeTab?.type === 'single-file-page') {
      return activeTab.metadata?.paperId
    }
    return null
  })
  
  /** 当前激活的阅读器状态 */
  const activeReaderState = computed(() => {
    if (!activePaperId.value) return null
    return readerStates.value.get(activePaperId.value) ?? null
  })
  
  // ============================================================
  // Actions
  // ============================================================
  
  /**
   * 打开论文 PDF
   * @param paperId 论文 ID
   * @param libraryId 论文库 ID
   * @param pdfPath PDF 文件路径
   * @param title 论文标题
   */
  function openPaper(
    paperId: string,
    libraryId: string,
    pdfPath: string,
    title: string
  ) {
    // 1. 检查是否已存在该论文的 Tab
    const existingTab = tabManager.tabs.value.find(
      tab => tab.type === 'single-file-page' && tab.metadata?.paperId === paperId
    )
    
    if (existingTab) {
      // 已存在,直接聚焦
      tabManager.setActiveTab(existingTab.id)
      return existingTab.id
    }
    
    // 2. 创建新 Tab
    const tabId = tabManager.addTab('single-file-page', title)
    
    // 3. 设置 Tab 元数据
    tabManager.updateTab(tabId, {
      metadata: {
        paperId,
        libraryId,
        pdfPath
      }
    })
    
    // 4. 初始化阅读器状态
    readerStates.value.set(paperId, {
      paperId,
      libraryId,
      pdfPath,
      title,
      currentPage: 1,
      totalPages: 0,
      zoomLevel: 1.0,
      isLoading: true,
      pdfData: null  // 🆕 初始为 null
    })
    
    // 5. 通过 DataSource 加载 PDF 数据
    loadPDFData(paperId, pdfPath)
    
    return tabId
  }
  
  /**
   * 加载 PDF 数据
   * @param paperId 论文 ID
   * @param pdfPath PDF 文件路径
   */
  async function loadPDFData(paperId: string, pdfPath: string) {
    try {
      setLoading(paperId, true)
      // DataSource 会自动根据环境选择 Mock 或 Electron 实现
      const pdfData = await PaperReaderDataSource.loadPDF(pdfPath)
      updateReaderState(paperId, { pdfData, isLoading: false })
    } catch (error) {
      console.error('[PaperReaderStore] 加载 PDF 失败:', error)
      updateReaderState(paperId, { isLoading: false })
    }
  }
  
  /**
   * 关闭论文 Tab
   * @param paperId 论文 ID
   */
  function closePaper(paperId: string) {
    // 1. 查找对应的 Tab
    const tab = tabManager.tabs.value.find(
      t => t.type === 'single-file-page' && t.metadata?.paperId === paperId
    )
    
    if (!tab) return
    
    // 2. 关闭 Tab
    tabManager.closeTab(tab.id)
    
    // 3. 清理阅读器状态
    readerStates.value.delete(paperId)
  }
  
  /**
   * 更新阅读器状态
   * @param paperId 论文 ID
   * @param updates 状态更新
   */
  function updateReaderState(
    paperId: string,
    updates: Partial<PaperReaderState>
  ) {
    const state = readerStates.value.get(paperId)
    if (state) {
      Object.assign(state, updates)
    }
  }
  
  /**
   * 设置当前页码
   */
  function setCurrentPage(paperId: string, page: number) {
    updateReaderState(paperId, { currentPage: page })
  }
  
  /**
   * 设置缩放级别
   */
  function setZoomLevel(paperId: string, zoom: number) {
    updateReaderState(paperId, { zoomLevel: zoom })
  }
  
  /**
   * 设置总页数
   */
  function setTotalPages(paperId: string, total: number) {
    updateReaderState(paperId, { totalPages: total })
  }
  
  /**
   * 设置加载状态
   */
  function setLoading(paperId: string, loading: boolean) {
    updateReaderState(paperId, { isLoading: loading })
  }
  
  return {
    // State
    readerStates,
    activePaperId,
    activeReaderState,
    
    // Actions
    openPaper,
    closePaper,
    loadPDFData,
    updateReaderState,
    setCurrentPage,
    setZoomLevel,
    setTotalPages,
    setLoading
  }
})
```

---

### 6️⃣ **架构优势**

**✅ 职责清晰**:
- **DataSource 层**: 负责环境检测和数据获取
- **Store 层**: 负责状态管理和业务逻辑
- **Vue 组件**: 负责 UI 渲染

**✅ 自动环境切换**:
```typescript
// Store 中无需关心环境,直接使用
const pdfData = await PaperReaderDataSource.loadPDF(pdfPath)

// DataSource 内部自动判断:
// - Electron 环境 → 使用 PaperReaderElectronDataSource
// - Web 环境 → 使用 PaperReaderMockDataSource
```

**✅ 单例模式**:
- DataSource 使用单例,避免重复创建实例
- 环境检测只执行一次,提高性能

---

### 7️⃣ **文件结构**

```
apps/client/src/renderer/
├── composables/
│   └── page-navigation/
│       └── index.ts                         [修改] 扩展 TabType 和 TabItem
├── stores/
│   └── paper-reader/
│       ├── paper-reader.datasource.ts       [新增] DataSource 接口定义
│       ├── paper-reader.mock.ts             [新增] Mock 数据源实现
│       ├── paper-reader.electron.ts         [新增] Electron 数据源实现
│       ├── paper-reader.store.ts            [新增] 论文阅读器 Store
│       └── paper-reader.type.ts             [新增] 阅读器类型定义(可选)
└── views/
    └── MainPage/
        └── content/
            └── single-file-page/
                └── index.vue                [新增] PDF 阅读器页面组件
```

---

### 8️⃣ **点击事件集成**

#### **左侧树形视图** ([homepage.left-sidebar/homepage.content/index.vue](cci:7://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Prisim--PaperLib/apps/client/src/renderer/views/MainPage/content/home-page/homepage.left-sidebar/homepage.content/index.vue:0:0-0:0))

```vue
<script setup lang="ts">
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'

const paperReaderStore = usePaperReaderStore()

// 点击论文节点
function handlePaperClick(paper: Paper, projectId: string) {
  paperReaderStore.openPaper(
    paper.id,
    projectId,
    paper.pdfPath,
    paper.title
  )
}
</script>

<template>
  <!-- 论文子节点 -->
  <div class="paper-node" @click="handlePaperClick(paper, project.id)">
    <svg class="paper-icon">...</svg>
    <span class="paper-title">{{ paper.title }}</span>
  </div>
</template>
```

#### **右侧论文列表** ([homepage.right-sidebar/homepage.content/index.vue](cci:7://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Prisim--PaperLib/apps/client/src/renderer/views/MainPage/content/home-page/homepage.right-sidebar/homepage.content/index.vue:0:0-0:0))

```vue
<script setup lang="ts">
import { usePaperReaderStore } from '@stores/paper-reader/paper-reader.store'

const paperReaderStore = usePaperReaderStore()

// 点击论文项
function handlePaperClick(paper: Paper) {
  if (!store.selectedCard) return
  
  paperReaderStore.openPaper(
    paper.id,
    store.selectedCard.id,
    paper.pdfPath,
    paper.title
  )
}
</script>

<template>
  <div class="paper-item" @click="handlePaperClick(paper)">
    <!-- 论文内容 -->
  </div>
</template>
```

---

### 9️⃣ **Tab 内容渲染**

#### **MainPage 主路由** (`views/MainPage/index.vue`)

```vue
<script setup lang="ts">
import { useTabManager } from '@composables/page-navigation'
import HomePage from './content/home-page/index.vue'
import SingleFilePage from './content/single-file-page/index.vue'

const { activeTab } = useTabManager()
</script>

<template>
  <div class="main-content">
    <!-- 根据 Tab 类型渲染不同页面 -->
    <HomePage v-if="activeTab?.type === 'home'" />
    <SingleFilePage v-else-if="activeTab?.type === 'single-file-page'" />
    <!-- 其他 Tab 类型... -->
  </div>
</template>
```

---

## 🔍 核心特性

### ✅ **去重逻辑**
- 通过 `paperId` 查找已存在的 Tab
- 存在则 [setActiveTab()](cci:1://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Prisim--PaperLib/apps/client/src/renderer/composables/page-navigation/index.ts:113:4-116:5),不存在则 [addTab()](cci:1://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Prisim--PaperLib/apps/client/src/renderer/composables/page-navigation/index.ts:48:2-59:3)

### ✅ **状态隔离**
- 每个 `paperId` 独立维护阅读器状态
- 支持多个 PDF 同时打开,状态互不干扰

### ✅ **Tab 元数据**
- 通过 `metadata` 存储 `paperId`、`libraryId`、`pdfPath`
- 便于 Tab 关闭时清理对应状态

### ✅ **响应式绑定**
- `activePaperId` 自动跟随 `activeTab` 变化
- `activeReaderState` 自动获取当前激活的阅读器状态

---

## 📝 类型定义文件

```typescript
// apps/client/src/renderer/stores/paper-reader/paper-reader.type.ts

/** 论文阅读器状态 */
export interface PaperReaderState {
  paperId: string
  libraryId: string
  pdfPath: string
  title: string
  currentPage: number
  totalPages: number
  zoomLevel: number
  isLoading: boolean
}

/** 打开论文参数 */
export interface OpenPaperParams {
  paperId: string
  libraryId: string
  pdfPath: string
  title: string
}
```

---

## 🎨 命名规范检查

✅ **Store**: `paper-reader.store.ts` (符合 `[业务域]-[功能].store.ts`)  
✅ **类型**: `paper-reader.type.ts` (符合 `[业务域]-[功能].type.ts`)  
✅ **组件**: `SingleFilePage` (符合 PascalCase)  
✅ **目录**: `paper-reader/` (符合 kebab-case)

---

## 🚀 下一步实现计划

1. **修改 [page-navigation/index.ts](cci:7://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Prisim--PaperLib/apps/client/src/renderer/composables/page-navigation/index.ts:0:0-0:0)** - 扩展 TabType 和 TabItem
2. **创建 `paper-reader.store.ts`** - 实现阅读器状态管理
3. **创建 `single-file-page/index.vue`** - PDF 阅读器页面组件
4. **集成点击事件** - 左侧树形视图 + 右侧论文列表
5. **实现 PDF.js 渲染** - 在 SingleFilePage 中集成 PDF.js

---
