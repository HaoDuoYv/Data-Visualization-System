<!-- src/components/Chart/ChartPanel.vue -->
<template>
  <div class="chart-panel">
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-gray-700">数据可视化</h3>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 配置面板 -->
      <div class="lg:col-span-1">
        <ChartConfigPanel />
      </div>
      <!-- 图表渲染 -->
      <div class="lg:col-span-2">
        <ChartRenderer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChartConfigPanel from './ChartConfigPanel.vue';
import ChartRenderer from './ChartRenderer.vue';
</script>
