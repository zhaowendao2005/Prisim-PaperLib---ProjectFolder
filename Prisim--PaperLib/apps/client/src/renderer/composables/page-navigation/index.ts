/**
 * 页面导航与布局控制组合式函数
 * 包含：Tab 切换、侧边栏控制、面板布局等页面操作
 */
import { ref, computed } from 'vue'

// ============================================================
// Tab 页面切换（动态 Tab 系统）
// ============================================================

/** Tab 类型 */
export type TabType = 'home' | 'project' | 'new-tab' | 'settings'

/** Tab 项定义 */
export interface TabItem {
  id: string
  type: TabType
  title: string
}

/** Tab 列表 */
const tabs = ref<TabItem[]>([
  { id: 'home', type: 'home', title: 'Home' },
  { id: 'project-1', type: 'project', title: 'Attention Is All You Need' }
])

/** 当前激活的 Tab ID */
const activeTabId = ref<string>('home')

/** 下一个 Tab ID（用于生成唯一 ID） */
let nextTabId = 1

/**
 * Tab 管理组合式函数
 */
export function useTabManager() {
  /** 当前激活的 Tab */
  const activeTab = computed(() => 
    tabs.value.find(t => t.id === activeTabId.value) ?? tabs.value[0]
  )

  /** 设置激活的 Tab */
  const setActiveTab = (id: string) => {
    if (tabs.value.some(t => t.id === id)) {
      activeTabId.value = id
    }
  }

  /** 添加新 Tab */
  const addTab = (type: TabType = 'new-tab', title?: string) => {
    const id = `tab-${nextTabId++}`
    const newTab: TabItem = {
      id,
      type,
      title: title ?? 'New Tab'
    }
    tabs.value.push(newTab)
    activeTabId.value = id
    return id
  }

  /** 关闭 Tab */
  const closeTab = (id: string) => {
    // 不允许关闭 Home Tab
    if (id === 'home') return

    const index = tabs.value.findIndex(t => t.id === id)
    if (index === -1) return

    tabs.value.splice(index, 1)

    // 如果关闭的是当前激活的 Tab，切换到前一个或后一个
    if (activeTabId.value === id) {
      const newIndex = Math.min(index, tabs.value.length - 1)
      activeTabId.value = tabs.value[newIndex].id
    }
  }

  /** 更新 Tab 信息 */
  const updateTab = (id: string, updates: Partial<Omit<TabItem, 'id'>>) => {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) {
      Object.assign(tab, updates)
    }
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTab,
    addTab,
    closeTab,
    updateTab
  }
}

// 兼容旧 API
export type MainTabType = TabType

export function useMainTab() {
  const { activeTab, setActiveTab, tabs } = useTabManager()
  
  const activeMainTab = computed({
    get: () => activeTab.value?.type ?? 'home',
    set: (type: TabType) => {
      const tab = tabs.value.find(t => t.type === type)
      if (tab) setActiveTab(tab.id)
    }
  })

  return {
    activeMainTab,
    setActiveTab: (type: TabType) => {
      const tab = tabs.value.find(t => t.type === type)
      if (tab) setActiveTab(tab.id)
    },
    isHome: computed(() => activeTab.value?.type === 'home'),
    isProject: computed(() => activeTab.value?.type === 'project')
  }
}

// ============================================================
// 侧边栏控制
// ============================================================

/** 面板可见性状态 */
const leftSidebarVisible = ref(true)
const rightSidebarVisible = ref(true)

/** 面板宽度 */
const leftSidebarWidth = ref(256)
const rightSidebarWidth = ref(320)

/**
 * 侧边栏控制组合式函数
 */
export function useSidebarControl() {
  // 切换左侧边栏
  const toggleLeftSidebar = () => {
    leftSidebarVisible.value = !leftSidebarVisible.value
  }

  // 切换右侧边栏
  const toggleRightSidebar = () => {
    rightSidebarVisible.value = !rightSidebarVisible.value
  }

  // 显示/隐藏左侧边栏
  const setLeftSidebarVisible = (visible: boolean) => {
    leftSidebarVisible.value = visible
  }

  // 显示/隐藏右侧边栏
  const setRightSidebarVisible = (visible: boolean) => {
    rightSidebarVisible.value = visible
  }

  // 设置左侧边栏宽度
  const setLeftSidebarWidth = (width: number) => {
    leftSidebarWidth.value = Math.max(200, Math.min(400, width))
  }

  // 设置右侧边栏宽度
  const setRightSidebarWidth = (width: number) => {
    rightSidebarWidth.value = Math.max(280, Math.min(480, width))
  }

  // 计算主面板是否全屏
  const isMainPanelFullscreen = computed(() => {
    return !leftSidebarVisible.value && !rightSidebarVisible.value
  })

  return {
    // 状态
    leftSidebarVisible,
    rightSidebarVisible,
    leftSidebarWidth,
    rightSidebarWidth,
    isMainPanelFullscreen,

    // 方法
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebarVisible,
    setRightSidebarVisible,
    setLeftSidebarWidth,
    setRightSidebarWidth
  }
}

// ============================================================
// 右侧边栏 Tab 切换（Notes / AI）
// ============================================================

export type RightSidebarTabType = 'notes' | 'ai'

const activeRightTab = ref<RightSidebarTabType>('notes')

/**
 * 右侧边栏 Tab 切换组合式函数
 */
export function useRightSidebarTab() {
  const setActiveRightTab = (tab: RightSidebarTabType) => {
    activeRightTab.value = tab
  }

  const isNotesTab = computed(() => activeRightTab.value === 'notes')
  const isAiTab = computed(() => activeRightTab.value === 'ai')

  return {
    activeRightTab,
    setActiveRightTab,
    isNotesTab,
    isAiTab
  }
}

