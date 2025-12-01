<script setup lang="ts">
/**
 * SingleFile Right Content - 右侧内容区域
 * 占位组件，具体内容待定
 */
</script>

<template>
  <div class="right-content">
    <div class="placeholder">
      <span class="placeholder-text">右侧栏内容</span>
    </div>
  </div>
</template>

<style scoped>
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.placeholder-text {
  opacity: 0.5;
}
</style>
