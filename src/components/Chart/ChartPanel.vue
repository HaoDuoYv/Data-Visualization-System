<!-- src/components/Chart/ChartPanel.vue -->
<template>
  <div class="chart-panel">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <h3 class="text-sm font-semibold text-gray-700">数据可视化</h3>
      </div>
      <button
        @click="comparisonMode = !comparisonMode"
        class="px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer"
        :class="comparisonMode
          ? 'bg-primary-500 text-white'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
      >
        {{ comparisonMode ? '单图表' : '对比视图' }}
      </button>
    </div>

    <!-- 对比视图 -->
    <div v-if="comparisonMode">
      <div class="mb-3 flex items-center gap-2">
        <span class="text-xs text-gray-500">对比数量：</span>
        <button
          v-for="n in [2, 3]"
          :key="n"
          @click="comparisonCount = n as 2 | 3"
          class="px-2 py-0.5 text-xs rounded cursor-pointer"
          :class="comparisonCount === n ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
        >
          {{ n }} 个
        </button>
      </div>
      <ChartComparisonView :count="comparisonCount" />
    </div>

    <!-- 单图表视图 -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- 配置面板 -->
      <div class="lg:col-span-1 space-y-4">
        <ChartConfigPanel />
        <div class="glass-card p-4">
          <DataFilterPanel />
        </div>
      </div>
      <!-- 图表渲染 -->
      <div class="lg:col-span-2 space-y-4">
        <div class="glass-card p-4 flex items-center justify-between gap-3">
          <ChartExportBar :chart-instance="chartInstance" />
          <ChartSnapshotBar />
        </div>
        <ChartRenderer ref="rendererRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ChartConfigPanel from './ChartConfigPanel.vue';
import ChartRenderer from './ChartRenderer.vue';
import ChartExportBar from './ChartExportBar.vue';
import ChartSnapshotBar from './ChartSnapshotBar.vue';
import ChartComparisonView from './ChartComparisonView.vue';
import DataFilterPanel from './DataFilterPanel.vue';
import type { ECharts } from 'echarts';

const rendererRef = ref<InstanceType<typeof ChartRenderer> | null>(null);
const comparisonMode = ref(false);
const comparisonCount = ref<2 | 3>(2);

const chartInstance = computed(() => {
  const vChart = rendererRef.value?.chartRef;
  return vChart?.chart as ECharts | undefined;
});
</script>
