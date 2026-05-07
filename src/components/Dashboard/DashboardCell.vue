<!-- src/components/Dashboard/DashboardCell.vue -->
<template>
  <div class="glass-card p-4">
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-medium text-gray-700 text-sm">{{ chart.title }}</h4>
      <div class="flex gap-1">
        <button
          @click="handleRefresh"
          class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
          title="刷新数据"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </button>
        <button
          @click="$emit('remove')"
          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="删除"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <p class="text-xs text-gray-400 mb-3 truncate font-mono">{{ chart.querySQL }}</p>
    <div v-if="error" class="text-xs text-red-500 mb-2 p-2 bg-red-50 rounded-lg">{{ error }}</div>
    <div v-if="loading" class="py-8 text-center">
      <svg class="w-6 h-6 text-primary-400 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
    <div v-else-if="chartData.length === 0" class="py-8 text-center text-gray-400 text-sm">无数据</div>
    <VChart
      v-else
      style="width: 100%; height: 300px;"
      :option="chartOption"
      autoresize
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import VChart from 'vue-echarts';
import { useDuckDB } from '@/composables/useDuckDB';
import { buildChartOption } from '@/composables/useChart';
import type { DashboardChart, QueryResult } from '@/types';

const props = defineProps<{ chart: DashboardChart }>();
defineEmits<{ remove: [] }>();

const { query, isInitialized, initialize } = useDuckDB();
const chartData = ref<QueryResult[]>([]);
const loading = ref(false);
const error = ref('');

const resolvedConfig = computed(() => {
  const config = { ...props.chart.config };
  if (chartData.value.length === 0) return config;
  if (config.xAxisColumn && config.yAxisColumn) return config;

  const firstRow = chartData.value[0];
  if (!firstRow) return config;
  const keys = Object.keys(firstRow);
  const stringCol = keys.find(k => typeof firstRow[k] === 'string');
  const numericCol = keys.find(k => typeof firstRow[k] === 'number');

  if (!config.xAxisColumn) config.xAxisColumn = stringCol || keys[0] || '';
  if (!config.yAxisColumn) config.yAxisColumn = numericCol || keys[1] || keys[0] || '';
  return config;
});

const chartOption = computed(() => {
  return buildChartOption(chartData.value, resolvedConfig.value);
});

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    if (!isInitialized.value) {
      await initialize();
    }
    const results = await query(props.chart.querySQL);
    chartData.value = results || [];
  } catch (e: any) {
    error.value = e.message || '查询失败';
    chartData.value = [];
  } finally {
    loading.value = false;
  }
}

function handleRefresh() {
  loadData();
}

onMounted(() => {
  loadData();
});

watch(() => props.chart.querySQL, () => {
  loadData();
});
</script>
