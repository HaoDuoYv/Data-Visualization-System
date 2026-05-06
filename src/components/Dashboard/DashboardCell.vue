<!-- src/components/Dashboard/DashboardCell.vue -->
<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-medium text-gray-700 text-sm">{{ chart.title }}</h4>
      <div class="flex gap-1">
        <button
          @click="handleRefresh"
          class="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
          title="刷新数据"
        >↻</button>
        <button
          @click="$emit('remove')"
          class="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
          title="删除"
        >✕</button>
      </div>
    </div>
    <p class="text-xs text-gray-400 mb-2 truncate">{{ chart.querySQL }}</p>
    <div v-if="error" class="text-xs text-red-500 mb-2">{{ error }}</div>
    <div v-if="loading" class="py-8 text-center text-gray-400 text-sm">加载中...</div>
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

// 智能轴检测：从查询结果中自动选择合适的列
const resolvedConfig = computed(() => {
  const config = { ...props.chart.config };
  if (chartData.value.length === 0) return config;
  if (config.xAxisColumn && config.yAxisColumn) return config;

  const firstRow = chartData.value[0];
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
