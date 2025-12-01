<script setup lang="ts">
/**
 * SingleFile Left Content - 左侧内容区域
 * 占位组件，具体内容待定
 */
</script>

<template>
  <div class="left-content">
    <div class="placeholder">
      <span class="placeholder-text">左侧栏内容</span>
    </div>
  </div>
</template>

<style scoped>
.left-content {
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
