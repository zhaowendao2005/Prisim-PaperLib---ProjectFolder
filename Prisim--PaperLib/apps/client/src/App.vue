<script setup lang="ts">
import { MainPage } from '@views/index'
import ImportConfirmDialog from '@/renderer/components/import-confirm-dialog/index.vue'
</script>

<template>
  <MainPage />
  <!-- 全局导入确认对话框 -->
  <ImportConfirmDialog />
</template>
