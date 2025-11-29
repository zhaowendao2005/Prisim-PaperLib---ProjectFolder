<script setup lang="ts">
/**
 * 右侧栏组件
 * 包含 Notes 和 AI Assistant 切换面板
 */

import { computed, ref } from 'vue'
import { SegmentedControl, ChatMessage, ChatInput } from '@components/index'
import { usePaperStore, useUIStore } from '@stores/index'

const paperStore = usePaperStore()
const uiStore = useUIStore()

const isDark = computed(() => uiStore.isDark)
const rightTab = computed(() => uiStore.rightTab)
const currentPaper = computed(() => paperStore.currentPaper)

const segments = [
  { key: 'notes', label: 'Notes' },
  { key: 'ai', label: 'AI Assistant' }
]

const noteContent = ref(`# Paper Notes

This paper introduces an important concept.

Key takeaways:
- Point 1
- Point 2`)

const containerClass = computed(() =>
  isDark.value ? 'bg-slate-900/60 border-white/5' : 'bg-white/70 border-white/60'
)

const metadataClass = computed(() =>
  isDark.value ? 'bg-white/5 border-white/5' : 'bg-white border-white shadow-sm'
)

const textareaClass = computed(() =>
  isDark.value
    ? 'bg-black/20 border-white/5 text-gray-300 placeholder-gray-600 focus:bg-black/40'
    : 'bg-yellow-50/50 border-yellow-100/50 text-gray-700 placeholder-gray-400 focus:bg-yellow-50 focus:shadow-inner'
)

const buttonClass = computed(() =>
  isDark.value ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
)

function onTabChange(tab: string): void {
  uiStore.setRightTab(tab as 'notes' | 'ai')
}

function onSendMessage(message: string): void {
  // TODO: 实现 AI 对话
  console.log('Send message:', message)
}
</script>

<template>
  <div
    class="w-80 flex flex-col rounded-2xl border backdrop-blur-xl shadow-sm transition-all duration-300"
    :class="containerClass"
  >
    <!-- Segmented Control -->
    <div class="p-4 pb-2">
      <SegmentedControl :segments="segments" :model-value="rightTab" :is-dark="isDark" @update:model-value="onTabChange" />
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar">
      <!-- Notes Tab -->
      <div v-if="rightTab === 'notes'" class="h-full flex flex-col space-y-4">
        <!-- Metadata -->
        <div class="p-4 rounded-xl border space-y-2" :class="metadataClass">
          <div class="flex items-center space-x-2 mb-1">
            <div class="w-2 h-2 rounded-full bg-green-400" />
            <span class="text-xs font-bold uppercase tracking-wide text-gray-400">Metadata</span>
          </div>
          <div class="text-xs space-y-1.5">
            <div class="grid grid-cols-[60px_1fr]">
              <span class="text-gray-400">Journal</span>
              <span class="font-medium">{{ currentPaper?.journal ?? '-' }}</span>
            </div>
            <div class="grid grid-cols-[60px_1fr]">
              <span class="text-gray-400">Year</span>
              <span class="font-medium">{{ currentPaper?.year ?? '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Scratchpad -->
        <div class="flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-2 px-1">
            <span class="text-xs font-bold uppercase tracking-wide text-gray-400">Scratchpad</span>
            <svg class="w-3 h-3 text-gray-400 cursor-pointer hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <textarea
            v-model="noteContent"
            class="flex-1 w-full p-4 rounded-xl resize-none outline-none text-sm leading-relaxed transition-colors border"
            :class="textareaClass"
            placeholder="Write something..."
          />
        </div>
      </div>

      <!-- AI Tab -->
      <div v-if="rightTab === 'ai'" class="h-full flex flex-col">
        <div class="flex-1 space-y-5">
          <!-- AI Message -->
          <ChatMessage :is-dark="isDark">
            I've read <strong>{{ currentPaper?.title ?? 'this paper' }}</strong>.
            <div class="mt-2 flex gap-2">
              <button class="px-2 py-1 rounded-md text-[10px] font-medium transition-colors" :class="buttonClass">
                Summarize
              </button>
              <button class="px-2 py-1 rounded-md text-[10px] font-medium transition-colors" :class="buttonClass">
                Methods
              </button>
            </div>
          </ChatMessage>

          <!-- User Message -->
          <ChatMessage :is-user="true" :is-dark="isDark" content="What is the main contribution?" />

          <!-- AI Response -->
          <ChatMessage :is-dark="isDark" content="The main contribution is proposing a model architecture that eschews recurrence and relies entirely on attention." />
        </div>

        <!-- Chat Input -->
        <div class="mt-4">
          <ChatInput placeholder="Ask PaperMind..." :is-dark="isDark" @send="onSendMessage" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
