# 目录结构规范

本规范定义 `apps/` 目录下各模块的组织方式、文件放置规则和类型管理约定。

---

## 一、顶层目录结构

```
apps/
├── client/                     # 渲染进程（Vue 前端）
├── electron/                   # Electron 主进程 & Preload
└── shared/                     # Client 与 Electron 共享内容
```

### 路径别名

| 别名 | 指向 | 用途 |
|------|------|------|
| `@/*` | `apps/client/src/*` | Client 通用 |
| `@renderer/*` | `apps/client/src/renderer/*` | 渲染层 |
| `@core/*` | `apps/client/src/core/*` | 核心层 |
| `@views/*` | `apps/client/src/renderer/views/*` | 页面视图 |
| `@components/*` | `apps/client/src/renderer/components/*` | 公共组件 |
| `@stores/*` | `apps/client/src/renderer/stores/*` | 状态管理 |
| `@composables/*` | `apps/client/src/renderer/composables/*` | 组合式函数 |
| `@client&electron.share/*` | `apps/shared/*` | 跨层共享 |

---

## 二、Client 目录结构

```
apps/client/
├── index.html                  # 入口 HTML
└── src/
    ├── main.ts                 # 应用入口
    ├── App.vue                 # 根组件
    ├── env.d.ts                # 环境类型声明
    ├── core/                   # 核心层（与 UI 无关的业务逻辑）
    │   ├── services/           # 业务服务
    │   ├── types/              # 核心类型定义
    │   └── utils/              # 工具函数
    └── renderer/               # 渲染层（Vue UI 相关）
        ├── components/         # 公共组件
        ├── composables/        # 组合式函数
        ├── stores/             # Pinia 状态管理
        ├── styles/             # 样式文件
        └── views/              # 页面视图
```

### 2.1 core/ 核心层规则

**职责**：与 UI 框架无关的纯业务逻辑

```
core/
├── services/                   # 业务服务
│   └── {业务域}/
│       └── {业务域}-{功能}.service.ts
├── types/                      # 核心类型
│   └── {业务域}/
│       └── {业务域}-{功能}.type.ts
└── utils/                      # 工具函数
    └── {业务域}/
        └── {业务域}-{功能}.util.ts
```

**示例**：
```
core/
├── services/
│   └── paper/
│       ├── paper-search.service.ts
│       └── paper-import.service.ts
├── types/
│   └── paper/
│       └── paper-metadata.type.ts
└── utils/
    └── paper/
        └── paper-format.util.ts
```

### 2.2 renderer/ 渲染层规则

#### components/ 公共组件

**规则**：
- 每个组件一个目录
- 目录名 = 组件名（kebab-case）
- 主文件为 `index.vue`

```
components/
├── index.ts                    # 聚合导出（允许）
└── {component-name}/
    ├── index.vue               # 主组件
    ├── {sub-component}.vue     # 子组件（可选）
    └── {component-name}.type.ts # 组件专用类型（可选）
```

**示例**：
```
components/
├── index.ts
├── titlebar/
│   └── index.vue
└── paper-card/
    ├── index.vue
    ├── PaperCardHeader.vue
    └── paper-card.type.ts
```

#### composables/ 组合式函数

**规则**：
- 每个 composable 一个目录
- 目录名 = 功能名（kebab-case）
- 主文件为 `index.ts`

```
composables/
├── index.ts                    # 聚合导出（允许）
└── {功能名}/
    └── index.ts
```

**示例**：
```
composables/
├── index.ts
├── app-layout/
│   └── index.ts
└── paper-search/
    └── index.ts
```

#### stores/ 状态管理

**规则**：
- 每个 store 一个目录
- 目录名 = `{业务域}-{功能}`
- 主文件为 `{业务域}-{功能}.store.ts`

```
stores/
├── index.ts                    # 聚合导出（允许）
└── {业务域}-{功能}/
    ├── {业务域}-{功能}.store.ts
    └── {业务域}-{功能}.type.ts  # Store 专用类型（可选）
```

**示例**：
```
stores/
├── index.ts
├── paper-list/
│   ├── paper-list.store.ts
│   └── paper-list.type.ts
└── app-settings/
    └── app-settings.store.ts
```

#### views/ 页面视图

**规则**：
- 每个页面一个目录（PascalCase）
- 主文件为 `index.vue`
- 页面内组件按功能区域组织子目录

```
views/
├── index.ts                    # 路由导出
└── {PageName}/
    ├── index.vue               # 页面主组件
    ├── {area}/                 # 功能区域目录
    │   └── index.vue
    └── composables/            # 页面专用 composable（可选）
        └── {功能}/
            └── index.ts
```

**示例**：
```
views/
├── index.ts
└── MainPage/
    ├── index.vue
    ├── topbar/
    │   └── index.vue
    └── content/
        ├── left-sidebar/
        │   └── index.vue
        ├── main-panel/
        │   └── index.vue
        └── right-sidebar/
            └── index.vue
```

---

## 三、Electron 目录结构

```
apps/electron/
├── main/                       # 主进程
│   ├── index.ts                # 入口（仅生命周期管理）
│   ├── services/               # 主进程服务
│   │   └── {业务域}/
│   │       └── {业务域}.service.ts
│   └── ipc/                    # IPC 处理器
│       ├── ipc.register.ts     # IPC 注册聚合
│       └── {业务域}/
│           └── {业务域}.ipc.ts
└── preload/
    ├── index.ts                # 入口（contextBridge）
    ├── index.d.ts              # 全局类型声明
    └── apis/                   # 暴露给渲染进程的 API
        ├── api.aggregate.ts    # API 聚合
        └── {业务域}/
            └── {业务域}.api.ts
```

### 3.1 Electron 文件命名后缀

| 后缀 | 用途 | 位置 |
|------|------|------|
| `.service.ts` | 主进程服务 | `main/services/` |
| `.ipc.ts` | IPC 处理器 | `main/ipc/` |
| `.api.ts` | Preload API | `preload/apis/` |
| `.register.ts` | 注册/聚合文件 | 各目录 |
| `.aggregate.ts` | 聚合导出文件 | 各目录 |

### 3.2 示例

```
apps/electron/
├── main/
│   ├── index.ts
│   ├── services/
│   │   └── window/
│   │       └── window.service.ts
│   └── ipc/
│       ├── ipc.register.ts
│       └── window/
│           └── window.ipc.ts
└── preload/
    ├── index.ts
    ├── index.d.ts
    └── apis/
        ├── api.aggregate.ts
        └── window/
            └── window.api.ts
```

---

## 四、Shared 目录结构

**职责**：Client 与 Electron 之间共享的类型定义

```
apps/shared/
├── index.ts                    # 通用导出（可选）
└── types/
    ├── index.ts                # 类型聚合导出（允许）
    └── {业务域}/
        └── {业务域}.type.ts
```

### 4.1 示例

```
apps/shared/
└── types/
    ├── index.ts
    ├── window/
    │   └── window.type.ts
    └── api/
        └── api.type.ts
```

### 4.2 使用方式

```typescript
// 通过聚合导出
import type { Api, WindowApi } from '@client&electron.share/types'

// 或精确导入
import type { WindowApi } from '@client&electron.share/types/window/window.type'
```

---

## 五、核心规则总结

### 5.1 目录规则

| 规则 | 说明 |
|------|------|
| **禁止散文件** | 所有目录下不直接放置业务文件，必须按业务域建子目录 |
| **index 文件** | 仅用于聚合导出，不包含业务逻辑 |
| **入口文件** | `main/index.ts`、`preload/index.ts` 仅做初始化和导入 |

### 5.2 文件命名规则

| 文件类型 | 命名格式 | 示例 |
|----------|----------|------|
| Vue 组件 | `index.vue` 或 `PascalCase.vue` | `index.vue`, `PaperCardHeader.vue` |
| 服务 | `{业务域}.service.ts` | `window.service.ts` |
| IPC | `{业务域}.ipc.ts` | `window.ipc.ts` |
| API | `{业务域}.api.ts` | `window.api.ts` |
| 类型 | `{业务域}.type.ts` | `window.type.ts` |
| 工具 | `{业务域}.util.ts` | `paper-format.util.ts` |
| Store | `{业务域}-{功能}.store.ts` | `paper-list.store.ts` |
| 聚合 | `*.aggregate.ts` 或 `*.register.ts` | `api.aggregate.ts` |

### 5.3 index 文件使用场景

| 场景 | 是否允许 index |
|------|----------------|
| `shared/types/` | ✅ 允许（频繁导入） |
| `components/` | ✅ 允许（聚合导出） |
| `composables/` | ✅ 允许（聚合导出） |
| `stores/` | ✅ 允许（聚合导出） |
| `views/` | ✅ 允许（路由导出） |
| `electron/main/services/` | ❌ 不允许（精确导入） |
| `electron/main/ipc/` | ❌ 不允许（精确导入） |
| `electron/preload/apis/` | ❌ 不允许（精确导入） |

---

## 六、检查清单

创建新文件或目录时，请确认：

- [ ] 是否按业务域创建了子目录？
- [ ] 文件命名是否包含正确的类型后缀？
- [ ] 是否避免了在目录下直接放置散文件？
- [ ] 跨层类型是否放在了 `shared/types/` 中？
- [ ] Electron 层是否使用精确导入路径？
- [ ] Client 层聚合导出是否更新？
