/**
 * 布局控制组合式函数
 * 控制三栏内容区的显示逻辑
 */
import { ref, computed } from 'vue'

/** 面板可见性状态 */
const leftSidebarVisible = ref(true)
const rightSidebarVisible = ref(true)

/** 面板宽度 */
const leftSidebarWidth = ref(256)
const rightSidebarWidth = ref(320)

/**
 * 布局控制组合式函数
 */
export function useAppLayout() {
  // 切换左侧边栏
  const toggleLeftSidebar = () => {
    leftSidebarVisible.value = !leftSidebarVisible.value
  }

  // 切换右侧边栏
  const toggleRightSidebar = () => {
    rightSidebarVisible.value = !rightSidebarVisible.value
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
    setLeftSidebarWidth,
    setRightSidebarWidth
  }
}
