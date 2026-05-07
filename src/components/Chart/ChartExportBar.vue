<!-- src/components/Chart/ChartExportBar.vue -->
<template>
  <div class="flex gap-2 flex-wrap">
    <button
      @click="handleExportPNG"
      :disabled="!hasData"
      class="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
      </svg>
      导出 PNG
    </button>
    <button
      @click="handleExportSVG"
      :disabled="!hasData"
      class="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      导出 SVG
    </button>
    <button
      @click="handleExportCSV"
      :disabled="!hasData"
      class="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      导出 CSV
    </button>
  </div>
</template>

<script setup lang="ts">
import { useChart } from '@/composables/useChart';
import { useExport } from '@/composables/useExport';
import { useDuckDBStore } from '@/stores/duckdb';
import type { ECharts } from 'echarts';

const props = defineProps<{
  chartInstance?: ECharts;
}>();

const { hasData } = useChart();
const { exportAsPNG, exportAsSVG, exportAsCSV } = useExport();
const store = useDuckDBStore();

function handleExportPNG() {
  if (props.chartInstance) exportAsPNG(props.chartInstance);
}

function handleExportSVG() {
  if (props.chartInstance) exportAsSVG(props.chartInstance);
}

function handleExportCSV() {
  exportAsCSV(store.queryResults);
}
</script>
