<!-- src/components/Chart/ChartExportBar.vue -->
<template>
  <div class="flex gap-2 flex-wrap">
    <button
      @click="handleExportPNG"
      :disabled="!hasData"
      class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      导出 PNG
    </button>
    <button
      @click="handleExportSVG"
      :disabled="!hasData"
      class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      导出 SVG
    </button>
    <button
      @click="handleExportCSV"
      :disabled="!hasData"
      class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      导出 CSV
    </button>
  </div>
</template>

<script setup lang="ts">
import { useChart } from '@/composables/useChart';
import { useExport } from '@/composables/useExport';
import { useDuckDBStore } from '@/stores/duckdb';

const { hasData } = useChart();
const { exportAsPNG, exportAsSVG, exportAsCSV } = useExport();
const store = useDuckDBStore();

// 获取 ECharts 实例
const chartRef = defineModel<{ chart?: any }>('chartRef');

function handleExportPNG() {
  const chart = chartRef.value?.chart;
  if (chart) exportAsPNG(chart);
}

function handleExportSVG() {
  const chart = chartRef.value?.chart;
  if (chart) exportAsSVG(chart);
}

function handleExportCSV() {
  exportAsCSV(store.queryResults);
}
</script>
