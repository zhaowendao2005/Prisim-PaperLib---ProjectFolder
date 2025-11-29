
我来继续查看更多文件以完成规划：





现在我已经了解了项目结构和原型demo。让我来规划和设计主页面的组件架构。

---

# Mainpage 页面架构设计

## 原型分析

根据 [Mainpage.html](cci:7://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Reference/ReferencePage/Mainpage.html:0:0-0:0) 原型，页面包含以下核心区域：

| 区域 | 描述 | 可复用性 |
|------|------|----------|
| **TitleBar** | 顶部标题栏（交通灯、标题、主题切换） | ✅ 高复用 |
| **LeftSidebar** | 左侧栏（搜索、导航、论文列表、用户信息） | 部分复用 |
| **PdfViewer** | 中间PDF阅读区（工具栏、页面渲染） | ✅ 高复用 |
| **RightSidebar** | 右侧栏（Notes/AI切换面板） | 部分复用 |

---

## 公共组件规划 (`@renderer/components/`)

按 eslint 规则，组件目录下只能放目录，不能放散文件：

```
components/
├── TitleBar/           # 标题栏组件
│   ├── TitleBar.vue
│   └── index.ts
├── SearchBox/          # 搜索框组件
│   ├── SearchBox.vue
│   └── index.ts
├── NavItem/            # 导航项组件
│   ├── NavItem.vue
│   └── index.ts
├── PaperCard/          # 论文卡片组件
│   ├── PaperCard.vue
│   └── index.ts
├── UserProfile/        # 用户信息组件
│   ├── UserProfile.vue
│   └── index.ts
├── PdfToolbar/         # PDF工具栏组件
│   ├── PdfToolbar.vue
│   └── index.ts
├── PdfPage/            # PDF页面渲染组件
│   ├── PdfPage.vue
│   └── index.ts
├── SegmentedControl/   # 分段控制器组件
│   ├── SegmentedControl.vue
│   └── index.ts
├── ChatMessage/        # 聊天消息组件
│   ├── ChatMessage.vue
│   └── index.ts
├── ChatInput/          # 聊天输入框组件
│   ├── ChatInput.vue
│   └── index.ts
└── index.ts            # 统一导出
```

---

## Composables 规划 (`@renderer/composables/`)

```
composables/
├── useTheme/           # 主题切换逻辑
│   ├── useTheme.ts
│   └── index.ts
├── usePdfViewer/       # PDF阅读器逻辑
│   ├── usePdfViewer.ts
│   └── index.ts
├── useWindowControls/  # 窗口控制逻辑
│   ├── useWindowControls.ts
│   └── index.ts
└── index.ts
```

---

## Stores 规划 (`@renderer/stores/`)

```
stores/
├── paper/              # 论文状态管理
│   ├── paper.store.ts
│   └── index.ts
├── ui/                 # UI状态管理
│   ├── ui.store.ts
│   └── index.ts
└── index.ts
```

---

## Views 规划 (`@renderer/views/Mainpage/`)

```
views/
├── Mainpage/
│   ├── Mainpage.vue           # 主页面组合
│   ├── LeftSidebar.vue        # 左侧栏（业务组合）
│   ├── PdfViewer.vue          # PDF阅读器（业务组合）
│   ├── RightSidebar.vue       # 右侧栏（业务组合）
│   └── index.ts
└── index.ts
```

---

## tsconfig 别名添加

需要在 [tsconfig.json](cci:7://file:///d:/code/Large-scale%20integrated%20projec/Prisim-PaperLib---ProjectFolder/Prisim--PaperLib/tsconfig.json:0:0-0:0) 中添加：
```json
"@views/*": ["apps/client/src/renderer/views/*"]
```

---

## 实施计划

1. **添加 tsconfig 别名**
2. **创建公共组件目录结构**
3. **创建 composables 目录结构**
4. **创建 stores 目录结构**
5. **创建 Mainpage 页面结构**
6. **逐步实现各组件**

---

是否同意此架构设计？我将按此规划开始实施。