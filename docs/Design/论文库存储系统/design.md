# 论文库存储系统设计文档

> 版本: 1.0.0  
> 更新时间: 2024-11-30

---

## 1. 设计理念

采用 **"文件即数据库 (File-System as Database)"** 架构，类似 Obsidian、Zotero 等本地优先软件。

**核心原则：**
- **文件系统是唯一真理来源 (Source of Truth)**
- **index.json 只是索引/缓存**，可随时通过扫描目录重建
- **支持外部文件拖入**，自动检测并入库

---

## 2. 目录结构

```
{LibraryPath}/                              # 论文库根目录（默认: {AppData}/Documents）
└── {DatabaseName}/                         # 单个数据库目录
    ├── .metadata/                          # 元数据目录
    │   ├── index.json                      # 论文索引（核心缓存）
    │   └── tags.json                       # 标签索引
    ├── papers/                             # 论文文件存储
    │   ├── {Title}.{id}/                   # 单篇论文目录（如: Attention Is All You Need.a1b2c3d4）
    │   │   ├── {filename}.pdf              # 原始 PDF（保留原文件名）
    │   │   └── meta.json                   # 单篇元数据
    │   └── ...
    └── _imports/                           # 待处理区（监听此目录，处理后删除）
```

### 目录命名规则

论文目录采用 `{Title}.{id}` 格式：
- **Title**: 论文标题（从文件名提取，可编辑）
- **id**: 8位 UUID 短码，保证唯一性

示例：
```
papers/
├── Attention Is All You Need.a1b2c3d4/
│   ├── Attention Is All You Need.pdf
│   └── meta.json
├── BERT Pre-training of Deep Bidirectional.e5f6g7h8/
│   ├── bert-paper.pdf
│   └── meta.json
└── ...
```

---

## 3. 数据结构

### 3.1 论文库信息 (PaperDatabase)

```typescript
interface PaperDatabase {
  id: string              // UUID
  name: string            // 显示名称
  path: string            // 绝对路径
  createdAt: number       // 创建时间戳
  lastOpenedAt: number    // 最后打开时间
  paperCount: number      // 论文数量（缓存）
}
```

### 3.2 论文元数据 (PaperMeta)

```typescript
interface PaperMeta {
  id: string              // UUID 短码（8位）
  dirname: string         // 目录名（如 "Attention Is All You Need.a1b2c3d4"）
  filename: string        // PDF 文件名（如 "Attention Is All You Need.pdf"）
  title: string           // 标题（可编辑，默认从文件名提取）
  authors: string[]       // 作者列表
  year?: number           // 发表年份
  doi?: string            // DOI
  tags: string[]          // 标签 ID 列表
  fileSize: number        // 文件大小（字节）
  addedAt: number         // 添加时间戳
  updatedAt: number       // 更新时间戳
  
  // UI 临时状态（不持久化）
  _isNew?: boolean        // 新添加标记
  _isProcessing?: boolean // 处理中标记
}
```

### 3.3 索引文件 (index.json)

```typescript
interface PaperIndex {
  version: string                       // 索引版本
  lastUpdated: number                   // 最后更新时间
  papers: Record<string, PaperMeta>     // paperId -> meta
}
```

### 3.4 标签 (Tag)

```typescript
interface Tag {
  id: string              // UUID
  name: string            // 标签名
  color?: string          // 颜色（可选）
  count: number           // 关联论文数
}
```

### 3.5 标签索引 (tags.json)

```typescript
interface TagIndex {
  version: string
  tags: Record<string, Tag>
}
```

---

## 4. 数据流架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据流架构                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    文件系统 (Source of Truth)                        │   │
│  │  papers/  ←── 论文目录                                               │   │
│  │  _imports/ ←── 待处理区                                              │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                            │
│              ┌─────────────────┴─────────────────┐                         │
│              │                     │                     │                      │
│              ▼                     ▼                     ▼                      │
│  ┌───────────────────┐               ┌───────────────────┐                 │
│  │  Watcher Service  │               │   用户拖放操作     │                 │
│  │  (chokidar)       │               │   (Electron 窗口)  │                 │
│  │  监听 _imports/   │               │                   │                 │
│  └──────┬───────┘               └──────┬───────┘                 │
│         │                                   │                            │
│         │  检测到新文件                      │  IPC: importPapers        │
│         ▼                                   ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    用户确认对话框                                     │   │
│  │  "检测到 X 个论文文件，是否导入？"                                    │   │
│  │  [是] [否]                                                           │   │
│  │  - 是：执行入库处理                                                   │   │
│  │  - 否：删除 _imports/ 中的文件                                        │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                            │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        入库处理流程                                   │   │
│  │  1. 生成 paperId (UUID 短码)                                         │   │
│  │  2. 创建 papers/{Title}.{id}/ 目录                                   │   │
│  │  3. 移动/复制 PDF 到目录                                              │   │
│  │  4. 生成 meta.json                                                   │   │
│  │  5. 更新 index.json                                                  │   │
│  │  6. 删除 _imports/ 中的原文件                                         │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                            │
│            ┌───────────────────┴───────────────────┐                       │
│            │                                       │                        │
│            ▼                                       ▼                        │
│  ┌───────────────────┐                 ┌───────────────────┐               │
│  │   index.json      │                 │      IPC          │               │
│  │   (索引缓存)       │                 │   通知前端更新     │               │
│  │   可重建          │                 │                   │               │
│  └───────────────────┘                 └─────┬───────┘               │
│                                                  │                          │
│                                                  ▼                          │
│                                        ┌───────────────────┐               │
│                                        │   Pinia Store     │               │
│                                        │   (被动订阅)       │               │
│                                        │   更新 UI         │               │
│                                        └───────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 入库队列与并发控制

### 5.1 队列管理

当同时检测到多个导入源时（如 _imports/ 文件 + 用户拖放），采用**优先级队列**机制：

```
导入源优先级（从高到低）：
1. 用户拖放到 Electron 窗口 (HIGH)
2. 手动文件对话框导入 (HIGH)
3. _imports/ 自动检测 (NORMAL)

处理规则：
- 同一时间只显示一个确认对话框
- 高优先级操作优先处理
- 低优先级操作进入等待队列
- 完成当前操作后，处理队列中的下一个
```

### 5.2 并发冲突处理

```
场景：_imports/ 中有问题文件 + 用户同时拖放新文件

处理流程：
1. Watcher 检测到 _imports/ 文件 → 加入队列（优先级：NORMAL）
2. 用户拖放文件 → 加入队列（优先级：HIGH）
3. 系统处理高优先级操作：
   - 弹出对话框："检测到 X 个论文文件，是否导入到 {DatabaseName}？"
   - 用户选择 [是] 或 [否]
4. 完成后，处理队列中的下一个操作：
   - 弹出对话框："_imports/ 中检测到 Y 个论文文件，是否导入？"
   - 用户选择 [是] 或 [否]
```

---

## 6. 入库状态机

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              入库状态机                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           ┌──────────┐                                      │
│                           │  IDLE    │                                      │
│                           │  空闲    │                                      │
│                           └────┬─────┘                                      │
│                                │                                            │
│          ┌─────────────────────┼─────────────────────┐                     │
│          │                     │                     │                      │
│          ▼                     ▼                     ▼                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ 拖放到窗口    │    │ _imports/    │    │ 手动导入     │                  │
│  │ (Drag&Drop)  │    │ 检测到文件   │    │ (文件对话框) │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                          │
│                             │                                               │
│                             ▼                                               │
│                    ┌──────────────────┐                                    │
│                    │  优先级队列      │                                    │
│                    │  (Priority Queue) │  ← 按优先级排序                   │
│                    └──────┬───────────┘                                    │
│                           │                                                 │
│                           ▼                                                 │
│                    ┌──────────────┐                                        │
│                    │  QUEUING     │                                        │
│                    │  入队等待    │  ← 防抖 500ms，收集批量文件             │
│                    └──────┬───────┘                                        │
│                           │                                                 │
│                           ▼                                                 │
│                    ┌──────────────┐                                        │
│                    │  CONFIRMING  │                                        │
│                    │  等待用户确认 │  ← 弹出对话框                          │
│                    └──────┬───────┘                                        │
│                    ┌──────┴──────┐                                         │
│                    │             │                                         │
│            [用户选择是]   [用户选择否]                                      │
│                    │             │                                         │
│                    ▼             ▼                                         │
│            ┌────────────┐  ┌────────────┐                                 │
│            │ PROCESSING │  │  REJECTED  │ ──▶ 删除 _imports/ 中的文件      │
│            │  处理中    │  │  已拒绝    │                                 │
│            └──────┬─────┘  └────────────┘                                 │
│                    └──────┬───────┘                                        │
│                           │                                                 │
│         ┌─────────────────┼─────────────────┐                              │
│         │                 │                 │                               │
│         ▼                 ▼                 ▼                               │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                          │
│  │ 生成 ID    │   │ 创建目录   │   │ 移动文件   │                          │
│  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘                          │
│        │                │                │                                  │
│        └────────────────┼────────────────┘                                 │
│                         │                                                   │
│                         ▼                                                   │
│                  ┌────────────┐                                            │
│                  │ 写入 meta  │                                            │
│                  │ 更新 index │                                            │
│                  └─────┬──────┘                                            │
│                        │                                                    │
│                        ▼                                                    │
│                 ┌────────────┐                                             │
│                 │  SUCCESS   │ ──▶ IPC 通知前端                            │
│                 │  完成      │                                             │
│                 └────────────┘                                             │
│                        │                                                    │
│                        ▼                                                    │
│                 ┌────────────┐                                             │
│                 │   IDLE     │                                             │
│                 └────────────┘                                             │
│                                                                             │
│  异常处理:                                                                  │
│  ┌────────────┐                                                            │
│  │   ERROR    │ ──▶ 记录日志，通知用户，回滚操作                            │
│  └────────────┘                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 文件变更事件

```typescript
/** 文件变更事件（IPC 推送到前端） */
interface FileChangeEvent {
  type: 'add' | 'remove' | 'update' | 'batch-add'
  databaseId: string
  items: PaperMeta[]
}
```

---

## 8. API 设计

```typescript
interface LibraryApi {
  // ===== 数据库管理 =====
  getDatabases: () => Promise<PaperDatabase[]>
  createDatabase: (name: string, path?: string) => Promise<PaperDatabase>
  openDatabase: (id: string) => Promise<void>       // 启动文件监听
  closeDatabase: (id: string) => Promise<void>      // 停止文件监听
  removeDatabase: (id: string, deleteFiles?: boolean) => Promise<void>

  // ===== 论文操作 =====
  getPapers: (databaseId: string) => Promise<PaperMeta[]>
  getPaper: (databaseId: string, paperId: string) => Promise<PaperMeta>
  importPapers: (databaseId: string, filePaths: string[]) => Promise<PaperMeta[]>
  confirmImportPapers: (databaseId: string, filePaths: string[], confirm: boolean) => Promise<PaperMeta[] | void>
  removePaper: (databaseId: string, paperId: string, deleteFile?: boolean) => Promise<void>
  updatePaperMeta: (databaseId: string, paperId: string, updates: Partial<PaperMeta>) => Promise<void>

  // ===== 标签操作 =====
  getTags: (databaseId: string) => Promise<Tag[]>
  createTag: (databaseId: string, name: string, color?: string) => Promise<Tag>
  updateTag: (databaseId: string, tagId: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (databaseId: string, tagId: string) => Promise<void>

  // ===== 索引管理 =====
  rebuildIndex: (databaseId: string) => Promise<void>

  // ===== 事件订阅 =====
  onFileChange: (callback: (event: FileChangeEvent) => void) => () => void
}
```

---

## 9. 实现优先级

| 优先级 | 模块 | 说明 |
|-------|------|------|
| **P0** | 类型定义 | `shared/types/library/library.type.ts` |
| **P0** | 数据库管理 | 创建/删除/列表数据库 |
| **P1** | 索引服务 | 读写 `index.json` |
| **P1** | 论文导入 | 手动导入 PDF（拖放/对话框） |
| **P1** | 论文列表 | 读取并展示论文 |
| **P1** | 用户确认对话框 | _imports/ 检测到文件时弹出确认 |
| **P2** | 文件监听 | chokidar 监听 `_imports/` |
| **P2** | IPC 事件 | 实时同步前端 |
| **P2** | 标签系统 | 标签 CRUD |
| **P3** | 索引重建 | 容错恢复 |

---

## 10. 实现文件结构修改树

### 10.1 类型迁移说明

原 `home_datacard.datasource.ts` 中的类型需迁移到 `shared/types/library/`，统一管理：

| 原类型 | 迁移后 | 说明 |
|--------|--------|------|
| `Paper` | `PaperMeta` | 论文元数据 |
| `DataCard` | `PaperDatabase` | 数据库/论文库信息 |
| `DataCardFilter` | `DatabaseFilter` | 过滤条件 |
| `FileChangeEvent` | `FileChangeEvent` | 文件变更事件 |

### 10.2 Store/DataSource 职责边界

```
┌─────────────────────────────────────────────────────────────────┐
│                          职责分层                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐                                               │
│   │  Vue 组件   │  ← 只使用 Store，触发 Action                   │
│   └──────┬──────┘                                               │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │   Store     │  ← 只管状态，调用 DataSource 并更新状态        │
│   │  (Pinia)    │     不包含业务逻辑                             │
│   └──────┬──────┘                                               │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │ DataSource  │  ← 所有业务逻辑（获取、导入、监听、过滤等）    │
│   │ Mock/Electron │                                             │
│   └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 文件结构树

```
Prisim--PaperLib/
├── apps/
│   ├── shared/
│   │   └── types/
│   │       ├── library/
│   │       │   └── [新增文件] library.type.ts
│   │       │       └── 内部模块：
│   │       │           - PaperDatabase, PaperMeta, PaperIndex
│   │       │           - Tag, TagIndex, DatabaseFilter
│   │       │           - FileChangeEvent, LibraryApi
│   │       │
│   │       └── index.ts [修改内容]
│   │           └── 内部模块：导出 library 相关类型
│   │
│   ├── electron/
│   │   └── main/
│   │       ├── services/
│   │       │   └── library/
│   │       │       ├── [新增文件] library.service.ts
│   │       │       │   └── 内部模块：数据库管理、论文操作、索引管理
│   │       │       ├── [新增文件] watcher.service.ts
│   │       │       │   └── 内部模块：chokidar 监听、防抖队列、优先级处理
│   │       │       ├── [新增文件] index.service.ts
│   │       │       │   └── 内部模块：读写 index.json、重建索引
│   │       │       └── [新增文件] paper.service.ts
│   │       │           └── 内部模块：PDF 解析、文件操作、元数据生成
│   │       │
│   │       ├── ipc/
│   │       │   └── library/
│   │       │       └── [新增文件] library.ipc.ts
│   │       │           └── 内部模块：注册 IPC 处理器
│   │       │
│   │       └── ipc.register.ts [修改内容]
│   │           └── 内部模块：注册 library IPC 处理器
│   │
│   ├── preload/
│   │   ├── apis/
│   │   │   ├── library/
│   │   │   │   └── [新增文件] library.api.ts
│   │   │   │       └── 内部模块：暴露 LibraryApi 到渲染进程
│   │   │   └── api.aggregate.ts [修改内容]
│   │   │       └── 内部模块：聚合导出 libraryApi
│   │   │
│   │   └── index.d.ts [修改内容]
│   │       └── 内部模块：扩展 Window 接口，添加 api.library
│   │
│   └── client/
│       └── src/
│           ├── core/
│           │   └── utils/
│           │       └── env/
│           │           └── [新增文件] index.ts
│           │               └── 内部模块：
│           │                   - isElectron(), isWeb()
│           │                   - isDev(), forceMock()
│           │
│           └── renderer/
│               ├── components/
│               │   └── [新增目录] drop-zone/
│               │       ├── index.vue
│               │       │   └── 内部模块：
│               │       │       - Props: accept, disabled, overlayText
│               │       │       - Emits: drop(files), dragenter, dragleave
│               │       │       - Slots: default, overlay
│               │       │       - 通用拖放交互，与业务解耦
│               │       │
│               │       └── drop-zone.type.ts
│               │           └── 内部模块：DropZoneProps, DropZoneEmits
│               │
│               ├── stores/
│               │   └── home_datacard/
│               │       ├── home_datacard.datasource.ts [修改内容]
│               │       │   └── 内部模块：
│               │       │       - 删除本地类型定义（改为从 shared 导入）
│               │       │       - DataCardDataSource 接口扩展：
│               │       │           + importPapers(databaseId, filePaths)
│               │       │           + subscribeFileChange(callback)
│               │       │
│               │       ├── home_datacard.mock.ts [修改内容]
│               │       │   └── 内部模块：
│               │       │       - 类型导入改为从 shared 导入
│               │       │       - importPapers() 模拟实现
│               │       │       - subscribeFileChange() 空实现
│               │       │
│               │       ├── [新增文件] home_datacard.electron.ts
│               │       │   └── 内部模块：
│               │       │       - DataCardElectronDataSource 类
│               │       │           - getList() → window.api.library.getDatabases
│               │       │           - importPapers() → window.api.library.importPapers
│               │       │           - subscribeFileChange() → window.api.library.onFileChange
│               │       │
│               │       └── home_datacard.store.ts [修改内容]
│               │           └── 内部模块：
│               │               - 类型导入改为从 shared 导入
│               │               - createDataSource() 根据环境选择数据源
│               │               - Store 只管状态，所有 Action 只调用 dataSource
│               │
│               └── views/
│                   └── MainPage/
│                       └── content/
│                           └── home-page/
│                               └── homepage.main-panel/
│                                   └── ProjectDashboard.vue [修改内容]
│                                       └── 内部模块：
│                                           - 引入 DropZone 组件
│                                           - handleFileDrop(files, cardId)
│                                           - 用 DropZone 包裹卡片
```

### 10.4 公共组件 DropZone 设计

```vue
<!-- components/drop-zone/index.vue -->
<script setup lang="ts">
/**
 * 通用拖放区域组件
 * 与业务解耦，可在任意需要拖放的地方使用
 */
interface Props {
  accept?: string          // 接受的文件类型，如 ".pdf,.doc"
  disabled?: boolean       // 是否禁用
  overlayText?: string     // 遮罩提示文字
}

interface Emits {
  drop: [files: File[]]    // 文件放下事件
  dragenter: []
  dragleave: []
}
</script>

<template>
  <div class="drop-zone" :class="{ 'is-drag-over': isDragOver }">
    <slot />
    <Transition name="fade">
      <div v-if="isDragOver" class="drop-overlay">
        <slot name="overlay">{{ overlayText }}</slot>
      </div>
    </Transition>
  </div>
</template>
```

**使用示例**：
```vue
<DropZone accept=".pdf" overlay-text="释放以导入论文" @drop="handleDrop">
  <ProjectCard :card="card" />
</DropZone>
```

---

## 11. 命名规范检查清单

### 类型文件 (shared/types/library/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `library.type.ts` | 接口/类型 | `[业务域]-[功能].type.ts` | 符合 |

**导出的类型**：
- `PaperDatabase` - 数据库信息
- `PaperMeta` - 论文元数据
- `PaperIndex` - 索引文件
- `Tag` - 标签
- `TagIndex` - 标签索引
- `FileChangeEvent` - 文件变更事件
- `LibraryApi` - API 接口

### 服务文件 (electron/main/services/library/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `library.service.ts` | 主服务 | `[业务域].service.ts` | 符合 |
| `watcher.service.ts` | 监听服务 | `[功能].service.ts` | 符合 |
| `index.service.ts` | 索引服务 | `[功能].service.ts` | 符合 |
| `paper.service.ts` | 论文服务 | `[功能].service.ts` | 符合 |

### IPC 处理器 (electron/main/ipc/library/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `library.ipc.ts` | IPC 处理 | `[业务域].ipc.ts` | 符合 |

### Preload API (preload/apis/library/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `library.api.ts` | Preload API | `[业务域].api.ts` | 符合 |

### Pinia Store (client/src/renderer/stores/library/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `library.store.ts` | Pinia Store | `[业务域].store.ts` | 符合 |
| `types.ts` | Store 类型 | `types.ts` | 符合 |

### 组合式函数 (client/src/renderer/composables/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `useLibrarySync.ts` | Composable | `use[业务域][功能].ts` | 符合 |

### 客户端服务 (client/src/core/services/library/)

| 文件名 | 类型 | 命名规则 | 示例 |
|--------|------|---------|------|
| `library-import.service.ts` | 业务服务 | `[业务域]-[功能].service.ts` | 符合 |

---

## 12. 文件示例

### index.json

```json
{
  "version": "1.0.0",
  "lastUpdated": 1732978800000,
  "papers": {
    "a1b2c3d4": {
      "id": "a1b2c3d4",
      "dirname": "Attention Is All You Need.a1b2c3d4",
      "filename": "Attention Is All You Need.pdf",
      "title": "Attention Is All You Need",
      "authors": ["Vaswani, A.", "Shazeer, N."],
      "year": 2017,
      "doi": "10.48550/arXiv.1706.03762",
      "tags": ["tag1", "tag2"],
      "fileSize": 2048576,
      "addedAt": 1732978800000,
      "updatedAt": 1732978800000
    }
  }
}
```

### tags.json

```json
{
  "version": "1.0.0",
  "tags": {
    "tag1": {
      "id": "tag1",
      "name": "机器学习",
      "color": "#3b82f6",
      "count": 5
    },
    "tag2": {
      "id": "tag2",
      "name": "Transformer",
      "color": "#10b981",
      "count": 3
    }
  }
}
```

### meta.json (单篇论文)

```json
{
  "id": "a1b2c3d4",
  "dirname": "Attention Is All You Need.a1b2c3d4",
  "filename": "Attention Is All You Need.pdf",
  "title": "Attention Is All You Need",
  "authors": ["Vaswani, A.", "Shazeer, N."],
  "year": 2017,
  "doi": "10.48550/arXiv.1706.03762",
  "tags": ["tag1", "tag2"],
  "fileSize": 2048576,
  "addedAt": 1732978800000,
  "updatedAt": 1732978800000
}