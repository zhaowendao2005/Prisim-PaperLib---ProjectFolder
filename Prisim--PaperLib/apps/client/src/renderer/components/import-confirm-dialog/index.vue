<script setup lang="ts">
/**
 * 导入确认对话框
 * 当 _imports/ 目录检测到新文件时弹出
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { isElectron } from '@/core/utils/env'
import type { ImportConfirmRequest } from '@client&electron.share/types'

// 状态
const visible = ref(false)
const currentRequest = ref<ImportConfirmRequest | null>(null)
const loading = ref(false)

// 取消订阅函数
let unsubscribe: (() => void) | null = null

// 处理确认
async function handleConfirm() {
  if (!currentRequest.value || !isElectron()) return
  
  loading.value = true
  try {
    // 通知主进程用户确认
    await window.api.library.handleConfirmImport(true)
    // 执行导入
    await window.api.library.executeImport(
      currentRequest.value.databaseId,
      currentRequest.value.filePaths
    )
  } finally {
    loading.value = false
    visible.value = false
    currentRequest.value = null
  }
}

// 处理取消
async function handleCancel() {
  if (!isElectron()) return
  
  await window.api.library.handleConfirmImport(false)
  visible.value = false
  currentRequest.value = null
}

// 获取来源描述
function getSourceText(source: string): string {
  switch (source) {
    case 'drag-drop':
      return '拖放'
    case 'file-dialog':
      return '文件选择'
    case 'imports-folder':
      return '_imports 目录'
    default:
      return source
  }
}

onMounted(() => {
  if (!isElectron()) return

  // 监听导入确认请求
  unsubscribe = window.api.library.onConfirmImport((request) => {
    currentRequest.value = request
    visible.value = true
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
        <div class="dialog-container">
          <div class="dialog-header">
            <svg class="dialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h3 class="dialog-title">检测到新文件</h3>
          </div>

          <div class="dialog-body">
            <p class="dialog-message">
              在 <strong>{{ currentRequest?.databaseName }}</strong> 中检测到 
              <strong>{{ currentRequest?.fileCount }}</strong> 个 PDF 文件
            </p>
            <p class="dialog-source">
              来源：{{ getSourceText(currentRequest?.source || '') }}
            </p>
            <p class="dialog-question">是否将这些文件导入到论文库？</p>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-secondary" :disabled="loading" @click="handleCancel">
              取消
            </button>
            <button class="btn btn-primary" :disabled="loading" @click="handleConfirm">
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>导入</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.dialog-container {
  background: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 0;
}

.dialog-icon {
  width: 32px;
  height: 32px;
  color: var(--color-accent);
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog-body {
  padding: 16px 24px;
}

.dialog-message {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.dialog-source {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.dialog-question {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-light);
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.btn-primary {
  background: var(--color-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .dialog-container,
.fade-leave-active .dialog-container {
  transition: transform 0.2s ease;
}

.fade-enter-from .dialog-container,
.fade-leave-to .dialog-container {
  transform: scale(0.95);
}
</style>
