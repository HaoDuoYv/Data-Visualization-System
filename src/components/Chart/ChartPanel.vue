<!-- src/components/Chart/ChartPanel.vue -->
<template>
  <div class="chart-panel">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700">数据可视化</h3>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 配置面板 -->
      <div class="lg:col-span-1 space-y-4">
        <ChartConfigPanel />
        <div class="bg-white rounded-lg shadow-md p-4">
          <DataFilterPanel />
        </div>
      </div>
      <!-- 图表渲染 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-4 mb-3">
          <ChartExportBar />
        </div>
        <ChartRenderer ref="rendererRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChartConfigPanel from './ChartConfigPanel.vue';
import ChartRenderer from './ChartRenderer.vue';
import ChartExportBar from './ChartExportBar.vue';
import DataFilterPanel from './DataFilterPanel.vue';

const rendererRef = ref<any>(null);
</script>
