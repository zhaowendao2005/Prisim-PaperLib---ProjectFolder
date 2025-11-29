# 拆分计划

## 目标结构

```
views/MainPage/
├── index.vue                          # 主页面容器，组合各区域
├── topbar/
│   └── index.vue                      # 标题栏区域
└── content/
    ├── left-sidebar/
    │   └── index.vue                  # 左侧边栏
    ├── main-panel/
    │   └── index.vue                  # PDF 阅读器
    └── right-sidebar/
        └── index.vue                  # 右侧边栏

composables/
├── index.ts
└── app-layout/
    └── index.ts                       # 布局控制组合式函数（控制三栏显示逻辑）
```

---

## 详细步骤

### 步骤 1：拆分组件

#### 1.1 `topbar/index.vue`
- 提取 `<header class="title-bar">` 及其内容
- 对应样式：`.title-bar`, `.traffic-lights`, `.title-drag-area`, `.title-toolbar` 等

#### 1.2 `content/left-sidebar/index.vue`
- 提取 `<aside class="left-sidebar">` 及其内容
- 包含：搜索框、导航、论文列表、用户资料
- 对应样式：`.left-sidebar`, `.search-*`, `.sidebar-nav`, `.paper-*`, `.user-profile` 等

#### 1.3 `content/main-panel/index.vue`
- 提取 `<section class="pdf-reader">` 及其内容
- 包含：PDF 工具栏、PDF 内容区
- 对应样式：`.pdf-reader`, `.pdf-toolbar`, `.pdf-content`, `.pdf-page` 等

#### 1.4 `content/right-sidebar/index.vue`
- 提取 `<aside class="right-sidebar">` 及其内容
- 包含：分段控制、Notes 标签页、AI 标签页
- 对应样式：`.right-sidebar`, `.segment-*`, `.notes-tab`, `.ai-tab`, `.chat-*` 等

### 步骤 2：重构主 index.vue

主页面简化为布局容器：

```vue
<template>
  <div class="app-container" :class="{ dark: isDark }">
    <AppTopbar />
    <main class="main-layout">
      <LibrarySidebar />
      <ReaderPanel />
      <AppRightSidebar />
    </main>
  </div>
</template>
```

### 步骤 3：创建组合式函数

| 文件 | 职责 |
|------|------|
| `app-layout.composable.ts` | 控制三栏内容区的显示逻辑，决定各 `index.vue` 渲染什么 |