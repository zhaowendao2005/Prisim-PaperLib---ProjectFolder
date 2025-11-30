<script setup lang="ts">
/**
 * 通用拖放区域组件
 * 与业务解耦，可在任意需要拖放的地方使用
 */
import { ref } from 'vue'

interface Props {
  /** 接受的文件类型，如 ".pdf,.doc" */
  accept?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 遮罩提示文字 */
  overlayText?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  disabled: false,
  overlayText: '释放文件以添加'
})

const emit = defineEmits<{
  drop: [files: File[]]
  dragenter: []
  dragleave: []
}>()

const isDragOver = ref(false)
const dragCounter = ref(0) // 解决子元素触发问题

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  if (props.disabled) return
  dragCounter.value++
  isDragOver.value = true
  emit('dragenter')
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragOver.value = false
    emit('dragleave')
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  dragCounter.value = 0

  if (props.disabled) return

  const files = Array.from(e.dataTransfer?.files || [])
  const filtered = filterFiles(files)

  if (filtered.length > 0) {
    emit('drop', filtered)
  }
}

function filterFiles(files: File[]): File[] {
  if (props.accept === '*') return files

  const extensions = props.accept.split(',').map(ext => ext.trim().toLowerCase())
  return files.filter(file => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    return extensions.includes(ext)
  })
}

// 暴露状态给父组件
defineExpose({
  isDragOver
})
</script>

<template>
  <div
    class="drop-zone"
    :class="{ 'is-drag-over': isDragOver, 'is-disabled': disabled }"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <slot />

    <!-- 拖拽遮罩 -->
    <Transition name="fade">
      <div v-if="isDragOver && !disabled" class="drop-overlay">
        <slot name="overlay">
          <div class="overlay-content">
            <svg class="overlay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span class="overlay-text">{{ overlayText }}</span>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.drop-zone {
  position: relative;
}

.drop-zone.is-drag-over {
  /* 父组件可以覆盖这些样式 */
}

.drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-accent-rgb, 59, 130, 246), 0.15);
  border: 2px dashed var(--color-accent, #3b82f6);
  border-radius: inherit;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.overlay-icon {
  width: 32px;
  height: 32px;
  color: var(--color-accent, #3b82f6);
}

.overlay-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-accent, #3b82f6);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
