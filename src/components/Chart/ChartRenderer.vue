<!-- src/components/Chart/ChartRenderer.vue -->
<template>
  <div class="chart-renderer bg-white rounded-lg shadow-md p-4">
    <div v-if="!hasData" class="py-8 text-center text-gray-400">
      <p>暂无图表数据</p>
      <p class="text-sm mt-1">执行 SQL 查询后将在此显示图表</p>
    </div>
    <VChart v-else style="width: 100%; height: 400px;" :option="chartOption" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { useChart } from '@/composables/useChart';

const { chartOption, hasData } = useChart();
</script>
