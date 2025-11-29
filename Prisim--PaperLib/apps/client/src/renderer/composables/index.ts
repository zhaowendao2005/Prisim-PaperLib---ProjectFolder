/**
 * Vue 组合式函数导出
 * 存放可复用的响应式逻辑（涉及 ref/watch/生命周期）
 */

// 页面导航与布局控制
export {
  useTabManager,
  useMainTab,
  useSidebarControl,
  useRightSidebarTab
} from './page-navigation'

export type {
  TabType,
  TabItem,
  MainTabType,
  RightSidebarTabType
} from './page-navigation'

// export { useTheme } from './useTheme'
// export { usePdfViewer } from './usePdfViewer'
