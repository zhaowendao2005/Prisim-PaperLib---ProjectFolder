<script setup lang="ts">
/**
 * 扩展设置页面
 * 管理第三方扩展配置，当前包含 MinerU OCR
 */
import { ref, computed, onMounted, watch } from 'vue'
import type { MineruConfig } from '@client&electron.share/types'
import { DEFAULT_MINERU_CONFIG } from '@client&electron.share/types'
import { useMineruTaskStore } from '@/renderer/stores/mineru-task/mineru-task.store'
import { isElectron } from '@/core/utils/env'

// MinerU Store
const mineruStore = useMineruTaskStore()

// ===== 状态 =====

/** 配置表单数据 */
const formData = ref<MineruConfig>({ ...DEFAULT_MINERU_CONFIG })

/** 原始配置（用于检测变更） */
const originalConfig = ref<MineruConfig>({ ...DEFAULT_MINERU_CONFIG })

/** 加载状态 */
const loading = ref(false)

/** 保存状态 */
const saving = ref(false)

/** 测试连接状态 */
const testing = ref(false)

/** 测试结果 */
const testResult = ref<{ success: boolean; message: string } | null>(null)

/** 错误信息 */
const errorMsg = ref('')

// ===== 计算属性 =====

/** 是否有未保存的更改 */
const isDirty = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalConfig.value)
})

/** 是否在 Electron 环境 */
const isElectronEnv = computed(() => isElectron())

/** 语言选项 */
const languageOptions = [
  { value: 'ch', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' }
]

// ===== 方法 =====

/** 加载配置 */
async function loadConfig(): Promise<void> {
  if (!isElectronEnv.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    const config = await window.api.system.getConfigValue<MineruConfig | undefined>('extensions.mineru')
    if (config) {
      formData.value = { ...config }
      originalConfig.value = { ...config }
    } else {
      formData.value = { ...DEFAULT_MINERU_CONFIG }
      originalConfig.value = { ...DEFAULT_MINERU_CONFIG }
    }
  } catch (e) {
    errorMsg.value = '加载配置失败'
    console.error('[ExtensionsSettings] 加载配置失败:', e)
  } finally {
    loading.value = false
  }
}

/** 保存配置 */
async function saveConfig(): Promise<void> {
  if (!isElectronEnv.value || !isDirty.value) return

  saving.value = true
  errorMsg.value = ''

  try {
    // 验证轮询间隔
    formData.value.pollingIntervalSec = Math.max(5, Math.min(60, formData.value.pollingIntervalSec))

    await window.api.system.setConfigValue('extensions.mineru', formData.value)
    originalConfig.value = { ...formData.value }
    testResult.value = null
  } catch (e) {
    errorMsg.value = '保存配置失败'
    console.error('[ExtensionsSettings] 保存配置失败:', e)
  } finally {
    saving.value = false
  }
}

/** 测试连接 */
async function testConnection(): Promise<void> {
  if (!isElectronEnv.value) return

  testing.value = true
  testResult.value = null

  try {
    const result = await mineruStore.testConnection()
    testResult.value = result
  } catch (e) {
    testResult.value = { success: false, message: '测试失败' }
  } finally {
    testing.value = false
  }
}

/** 重置为默认值 */
function resetToDefault(): void {
  formData.value = { ...DEFAULT_MINERU_CONFIG }
}

// ===== 生命周期 =====

onMounted(() => {
  loadConfig()
})

// 清除测试结果当 API Key 变化时
watch(() => formData.value.apiKey, () => {
  testResult.value = null
})
</script>

<template>
  <div class="extensions-settings">
    <h2 class="section-title">扩展</h2>

    <!-- MinerU 配置区 -->
    <div class="settings-card">
      <div class="card-header">
        <div class="card-icon mineru">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div class="card-title">
          <h3>MinerU OCR</h3>
          <p>PDF 文档智能解析服务</p>
        </div>
      </div>

      <!-- 非 Electron 环境提示 -->
      <div v-if="!isElectronEnv" class="env-warning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>MinerU 功能仅在桌面应用中可用</span>
      </div>

      <!-- 配置表单 -->
      <div v-else class="card-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          正在加载配置...
        </div>

        <template v-else>
          <!-- API Key -->
          <div class="form-group">
            <label class="form-label">API Key</label>
            <div class="input-with-button">
              <input
                v-model="formData.apiKey"
                type="password"
                class="form-input"
                placeholder="输入 MinerU API Key"
              >
              <button
                class="btn-secondary"
                :disabled="testing || !formData.apiKey"
                @click="testConnection"
              >
                {{ testing ? '测试中...' : '测试连接' }}
              </button>
            </div>
            <div v-if="testResult" class="test-result" :class="{ success: testResult.success, error: !testResult.success }">
              {{ testResult.message }}
            </div>
          </div>

          <!-- 模型版本 -->
          <div class="form-group">
            <label class="form-label">模型版本</label>
            <div class="radio-group">
              <label class="radio-item">
                <input v-model="formData.modelVersion" type="radio" value="vlm">
                <span class="radio-label">
                  <strong>VLM</strong>
                  <small>效果更好，推荐</small>
                </span>
              </label>
              <label class="radio-item">
                <input v-model="formData.modelVersion" type="radio" value="pipeline">
                <span class="radio-label">
                  <strong>Pipeline</strong>
                  <small>速度更快</small>
                </span>
              </label>
            </div>
          </div>

          <!-- Pipeline 专用选项 -->
          <div v-if="formData.modelVersion === 'pipeline'" class="form-group pipeline-options">
            <label class="form-label">Pipeline 选项</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input v-model="formData.enableOcr" type="checkbox">
                <span>启用 OCR</span>
              </label>
              <label class="checkbox-item">
                <input v-model="formData.enableFormula" type="checkbox">
                <span>公式识别</span>
              </label>
              <label class="checkbox-item">
                <input v-model="formData.enableTable" type="checkbox">
                <span>表格识别</span>
              </label>
            </div>
          </div>

          <!-- 语言 -->
          <div class="form-group">
            <label class="form-label">语言</label>
            <select v-model="formData.language" class="form-select">
              <option v-for="opt in languageOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- 轮询间隔 -->
          <div class="form-group">
            <label class="form-label">轮询间隔（秒）</label>
            <input
              v-model.number="formData.pollingIntervalSec"
              type="number"
              class="form-input small"
              min="5"
              max="60"
            >
            <p class="form-hint">任务状态查询间隔，范围 5-60 秒</p>
          </div>

          <!-- 错误信息 -->
          <div v-if="errorMsg" class="error-msg">
            {{ errorMsg }}
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button class="btn-text" @click="resetToDefault">
              恢复默认
            </button>
            <button
              class="btn-primary"
              :disabled="!isDirty || saving"
              @click="saveConfig"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.extensions-settings {
  padding: 0 4px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.mineru {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.card-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.card-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.card-title p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.card-content {
  padding: 20px;
}

.env-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fef3c7;
  color: #92400e;
  font-size: 13px;
}

.env-warning svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: white;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.small {
  width: 120px;
}

.form-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 6px;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button .form-input {
  flex: 1;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.radio-item input {
  margin-top: 4px;
}

.radio-label {
  display: flex;
  flex-direction: column;
}

.radio-label strong {
  font-size: 14px;
  color: var(--color-text-primary);
}

.radio-label small {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.checkbox-group {
  display: flex;
  gap: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
}

.pipeline-options {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin-top: -8px;
}

.test-result {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.test-result.success {
  background: #d1fae5;
  color: #065f46;
}

.test-result.error {
  background: #fee2e2;
  color: #991b1b;
}

.error-msg {
  padding: 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn-primary {
  padding: 10px 20px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-text {
  padding: 10px 16px;
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-text:hover {
  color: var(--color-text-primary);
}
</style>
