<script setup lang="ts">
/**
 * 公共标题栏组件
 * 包含红绿灯窗口控制按钮，具体行为通过 props 传入的回调函数执行
 * 支持多窗口复用
 */

export interface TitlebarProps {
  /** 关闭窗口回调 */
  onClose?: () => void
  /** 最小化窗口回调 */
  onMinimize?: () => void
  /** 最大化/还原窗口回调 */
  onMaximize?: () => void
}

const props = withDefaults(defineProps<TitlebarProps>(), {
  onClose: undefined,
  onMinimize: undefined,
  onMaximize: undefined
})

// 默认使用 Electron API，如果传入了自定义回调则使用自定义回调
const handleClose = () => {
  if (props.onClose) {
    props.onClose()
  } else {
    window.api?.window?.close()
  }
}

const handleMinimize = () => {
  if (props.onMinimize) {
    props.onMinimize()
  } else {
    window.api?.window?.minimize()
  }
}

const handleMaximize = () => {
  if (props.onMaximize) {
    props.onMaximize()
  } else {
    window.api?.window?.maximize()
  }
}
</script>

<template>
  <header class="titlebar">
    <!-- Traffic Lights -->
    <div class="traffic-lights">
      <button class="traffic-btn close" @click="handleClose">
        <span>×</span>
      </button>
      <button class="traffic-btn minimize" @click="handleMinimize">
        <span>-</span>
      </button>
      <button class="traffic-btn maximize" @click="handleMaximize">
        <span>⤢</span>
      </button>
    </div>

    <!-- 插槽：用于放置自定义内容（如拖拽区域、工具栏等） -->
    <slot />
  </header>
</template>

<style scoped>
/* ========== Title Bar ========== */
.titlebar {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  user-select: none;
  background-color: var(--color-bg-toolbar);
  backdrop-filter: blur(12px);
  z-index: 50;
  transition: background-color 0.3s;
}

/* Traffic Lights */
.traffic-lights {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
  -webkit-app-region: no-drag;
}

.traffic-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s;
}
.traffic-btn:hover {
  filter: brightness(0.9);
}
.traffic-btn span {
  display: none;
  font-size: 8px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
}
.traffic-btn:hover span {
  display: block;
}

.traffic-btn.close {
  background-color: var(--traffic-close);
  border-color: var(--traffic-close-border);
}
.traffic-btn.minimize {
  background-color: var(--traffic-minimize);
  border-color: var(--traffic-minimize-border);
}
.traffic-btn.maximize {
  background-color: var(--traffic-maximize);
  border-color: var(--traffic-maximize-border);
}
.traffic-btn.maximize span {
  font-size: 6px;
}
</style>
