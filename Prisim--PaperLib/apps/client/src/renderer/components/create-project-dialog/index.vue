<script setup lang="ts">
/**
 * 创建项目对话框
 * 用于新建论文库/数据库
 */
import { ref, computed } from 'vue'
import { useLibraryMetaStore } from '@stores/library-meta/library-meta.store'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'created'): void
}>()

const store = useLibraryMetaStore()

// 表单数据
const formData = ref({
  name: '',
  description: ''
})

// 表单验证
const nameError = ref('')
const isSubmitting = ref(false)

// 是否可提交
const canSubmit = computed(() => {
  return formData.value.name.trim().length > 0 && !isSubmitting.value
})

// 验证名称
function validateName() {
  const name = formData.value.name.trim()
  if (!name) {
    nameError.value = '请输入项目名称'
    return false
  }
  if (name.length > 50) {
    nameError.value = '名称不能超过 50 个字符'
    return false
  }
  // 检查是否包含非法字符（文件系统不允许的字符）
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    nameError.value = '名称包含非法字符'
    return false
  }
  nameError.value = ''
  return true
}

// 关闭对话框
function handleClose() {
  if (isSubmitting.value) return
  resetForm()
  emit('update:visible', false)
}

// 重置表单
function resetForm() {
  formData.value = {
    name: '',
    description: ''
  }
  nameError.value = ''
}

// 提交创建
async function handleSubmit() {
  if (!validateName()) return
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    await store.createDatabase(formData.value.name.trim())
    
    resetForm()
    emit('update:visible', false)
    emit('created')
  } catch (error) {
    console.error('[CreateProjectDialog] 创建失败:', error)
    nameError.value = error instanceof Error ? error.message : '创建失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}

// 输入时清除错误
function handleNameInput() {
  if (nameError.value) {
    nameError.value = ''
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="props.visible" class="dialog-overlay" @click.self="handleClose">
        <div class="dialog-container">
          <!-- 标题栏 -->
          <div class="dialog-header">
            <h3 class="dialog-title">新建论文库</h3>
            <button class="close-btn" :disabled="isSubmitting" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 表单内容 -->
          <div class="dialog-body">
            <!-- 名称输入 -->
            <div class="form-group">
              <label class="form-label">
                项目名称
                <span class="required">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                :class="{ 'has-error': nameError }"
                placeholder="输入论文库名称"
                maxlength="50"
                :disabled="isSubmitting"
                @input="handleNameInput"
                @blur="validateName"
                @keyup.enter="handleSubmit"
              />
              <p v-if="nameError" class="error-text">{{ nameError }}</p>
              <p v-else class="hint-text">将作为文件夹名称使用</p>
            </div>

            <!-- 描述输入 -->
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                placeholder="简单描述这个论文库的用途（可选）"
                rows="3"
                maxlength="200"
                :disabled="isSubmitting"
              />
              <p class="hint-text char-count">{{ formData.description.length }}/200</p>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="dialog-footer">
            <button class="btn btn-secondary" :disabled="isSubmitting" @click="handleClose">
              取消
            </button>
            <button class="btn btn-primary" :disabled="!canSubmit" @click="handleSubmit">
              <span v-if="isSubmitting" class="loading-spinner"></span>
              <span v-else>创建</span>
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
  max-width: 440px;
  width: 90%;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.close-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

.dialog-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.required {
  color: #FF3B30;
  margin-left: 2px;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transition: all 0.15s;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input.has-error {
  border-color: #FF3B30;
}

.form-input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-text {
  font-size: 12px;
  color: #FF3B30;
  margin: 0;
}

.hint-text {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.char-count {
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
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
  min-width: 80px;
  justify-content: center;
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
