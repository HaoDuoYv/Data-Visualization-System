<!-- src/components/Chart/ChartRenderer.vue -->
<template>
  <div class="chart-renderer glass-card p-4">
    <div v-if="!hasData" class="py-12 text-center">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
      </svg>
      <p class="text-gray-400 text-sm">暂无图表数据</p>
      <p class="text-gray-300 text-xs mt-1">执行查询后将在此显示图表</p>
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

const vChartRef = ref<InstanceType<typeof VChart> | null>(null);

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

defineExpose({ chartRef: vChartRef });
</script>
