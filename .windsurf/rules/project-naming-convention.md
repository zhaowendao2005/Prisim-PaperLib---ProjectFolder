# 命名规范

本规范定义项目中**文件命名**和**类/组件命名**的统一约定。

---

## 核心原则

**所有命名必须分为 2-3 段，采用语义化分段结构：**

```
[业务域/模块]_[功能/职责]_[类型后缀(可选)]
```

| 段位 | 含义 | 必需 | 示例 |
|------|------|------|------|
| **第一段** | 业务域 / 所属模块 | ✅ | `Paper`, `Library`, `Reader`, `Auth` |
| **第二段** | 功能 / 职责描述 | ✅ | `List`, `Detail`, `Search`, `Import` |
| **第三段** | 类型后缀 | 可选 | `Service`, `Store`, `View`, `Card` |

---

## 一、文件命名规范

### 1.1 Vue 组件文件

**格式：** `[业务域][功能][类型].vue` (PascalCase)

```
✅ 正确示例：
PaperListCard.vue          # Paper(业务域) + List(功能) + Card(类型)
ReaderToolbar.vue          # Reader(业务域) + Toolbar(功能)
LibrarySearchBox.vue       # Library(业务域) + Search(功能) + Box(类型)
AuthLoginForm.vue          # Auth(业务域) + Login(功能) + Form(类型)

❌ 错误示例：
Card.vue                   # 缺少业务域，过于通用
SearchComponent.vue        # 缺少业务域
MyButton.vue               # 无意义前缀
```

### 1.2 TypeScript 文件

**格式：** `[业务域]-[功能].[类型].ts` (kebab-case + 类型后缀)

```
✅ 正确示例：
paper-list.service.ts      # Paper(业务域) + List(功能) + service(类型)
library-import.store.ts    # Library(业务域) + Import(功能) + store(类型)
reader-annotation.types.ts # Reader(业务域) + Annotation(功能) + types(类型)
auth-token.utils.ts        # Auth(业务域) + Token(功能) + utils(类型)

❌ 错误示例：
service.ts                 # 缺少业务域和功能描述
utils.ts                   # 过于通用
helpers.ts                 # 无业务语义
```

### 1.3 常用类型后缀

| 后缀 | 用途 | 示例 |
|------|------|------|
| `.service.ts` | 业务逻辑服务 | `paper-search.service.ts` |
| `.store.ts` | Pinia 状态管理 | `library-filter.store.ts` |
| `.types.ts` | 类型定义 | `reader-page.types.ts` |
| `.utils.ts` | 工具函数 | `paper-format.utils.ts` |
| `.api.ts` | API 请求封装 | `paper-fetch.api.ts` |
| `.hook.ts` / `.composable.ts` | Vue Composable | `reader-scroll.hook.ts` |
| `.config.ts` | 配置文件 | `app-theme.config.ts` |
| `.constant.ts` | 常量定义 | `paper-status.constant.ts` |

---

## 二、类/接口命名规范

### 2.1 类命名

**格式：** `[业务域][功能][类型]` (PascalCase)

```typescript
✅ 正确示例：
class PaperSearchService { }      // Paper + Search + Service
class LibraryImportManager { }    // Library + Import + Manager
class ReaderAnnotationStore { }   // Reader + Annotation + Store
class AuthTokenValidator { }      // Auth + Token + Validator

❌ 错误示例：
class Service { }                 // 缺少业务域
class Manager { }                 // 过于通用
class Helper { }                  // 无业务语义
class DataHandler { }             // 缺少业务域
```

### 2.2 接口命名

**格式：** `I[业务域][功能][类型]` 或 `[业务域][功能][类型]` (PascalCase)

```typescript
✅ 正确示例：
interface IPaperMetadata { }      // Paper + Metadata
interface LibraryFilterOptions { } // Library + Filter + Options
interface ReaderPageConfig { }    // Reader + Page + Config

// 带 Props/Emits 后缀的组件接口
interface PaperCardProps { }      // Paper + Card + Props
interface LibraryListEmits { }    // Library + List + Emits
```

### 2.3 类型别名命名

**格式：** `[业务域][功能][类型]` (PascalCase)

```typescript
✅ 正确示例：
type PaperSortOrder = 'asc' | 'desc'
type LibraryViewMode = 'grid' | 'list'
type ReaderZoomLevel = number
```

### 2.4 枚举命名

**格式：** `[业务域][功能]Enum` (PascalCase)

```typescript
✅ 正确示例：
enum PaperStatusEnum {
  Draft = 'draft',
  Published = 'published',
}

enum LibraryFilterTypeEnum {
  Author = 'author',
  Year = 'year',
}
```

---

## 三、目录命名规范

**格式：** `[业务域]-[功能]` (kebab-case) 或 PascalCase (Vue 组件目录)

```
✅ 正确示例：
components/
├── PaperCard/              # 组件目录用 PascalCase
├── LibrarySearch/
└── ReaderToolbar/

services/
├── paper-search/           # 服务目录用 kebab-case
├── library-import/
└── reader-annotation/

stores/
├── paper-list/
├── library-filter/
└── reader-settings/
```

---

## 四、业务域词汇表

项目中统一使用以下业务域前缀：

| 业务域 | 含义 | 适用范围 |
|--------|------|----------|
| `Paper` | 论文相关 | 论文元数据、PDF、引用等 |
| `Library` | 文献库相关 | 收藏、分类、标签、筛选等 |
| `Reader` | 阅读器相关 | PDF渲染、标注、高亮等 |
| `Auth` | 认证相关 | 登录、注册、Token等 |
| `User` | 用户相关 | 用户信息、设置、偏好等 |
| `App` | 应用级 | 全局配置、主题、窗口等 |
| `Sync` | 同步相关 | 云同步、数据备份等 |
| `AI` | AI功能相关 | 智能问答、摘要生成等 |

---

## 五、完整示例

### 5.1 一个完整的功能模块结构

```
paper-search/
├── PaperSearchBox.vue           # 搜索框组件
├── PaperSearchResult.vue        # 搜索结果组件
├── PaperSearchFilter.vue        # 搜索筛选组件
├── paper-search.service.ts      # 搜索服务
├── paper-search.store.ts        # 搜索状态
├── paper-search.types.ts        # 搜索类型定义
├── paper-search.api.ts          # 搜索API
└── index.ts                     # 统一导出
```

### 5.2 类型定义示例

```typescript
// paper-search.types.ts

/** 论文搜索参数 */
interface PaperSearchParams {
  keyword: string
  filters: PaperSearchFilters
  pagination: PaperSearchPagination
}

/** 论文搜索筛选条件 */
interface PaperSearchFilters {
  year?: number
  author?: string
  tags?: string[]
}

/** 论文搜索分页 */
interface PaperSearchPagination {
  page: number
  pageSize: number
}

/** 论文搜索结果 */
interface PaperSearchResult {
  items: PaperSearchItem[]
  total: number
}
```

---

## 六、检查清单

创建新文件或类时，请确认：

- [ ] 命名是否包含明确的**业务域**前缀？
- [ ] 命名是否包含清晰的**功能/职责**描述？
- [ ] 文件类型后缀是否正确（`.service.ts`, `.store.ts` 等）？
- [ ] 是否避免了过于通用的命名（如 `utils.ts`, `helper.ts`）？
- [ ] 是否与项目中已有的命名风格保持一致？
