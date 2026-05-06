<!-- src/components/Chart/ChartRenderer.vue -->
<template>
  <div class="chart-renderer bg-white rounded-lg shadow-md p-4">
    <div v-if="!hasData" class="py-8 text-center text-gray-400">
      <p>暂无图表数据</p>
      <p class="text-sm mt-1">执行 SQL 查询后将在此显示图表</p>
    </div>
    <VChart
      v-else
      ref="vChartRef"
      :style="{ width: '100%', height: props.height || '400px' }"
      :option="option"
      autoresize
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VChart from 'vue-echarts';
import { useChart } from '@/composables/useChart';
import { buildChartOption } from '@/composables/useChart';
import type { ChartConfig, QueryResult } from '@/types';

const props = defineProps<{
  config?: ChartConfig;
  data?: QueryResult[];
  height?: string;
}>();

const vChartRef = ref<any>(null);

// 支持独立配置（仪表盘）或 store 配置
const { chartOption: storeOption, hasData: storeHasData } = useChart();

const option = computed(() => {
  if (props.config && props.data) {
    return buildChartOption(props.data, props.config);
  }
  return storeOption.value;
});

const hasData = computed(() => {
  if (props.config && props.data) {
    return props.data.length > 0 && !!props.config.xAxisColumn && !!props.config.yAxisColumn;
  }
  return storeHasData.value;
});

// 暴露 VChart ref 给父组件（用于导出）
defineExpose({ chartRef: vChartRef });
</script>
