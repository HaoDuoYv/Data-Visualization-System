<!-- src/components/Chart/ChartComparisonView.vue -->
<template>
  <div class="grid gap-4" :class="count === 3 ? 'grid-cols-3' : 'grid-cols-2'">
    <div v-for="(slot, i) in slots" :key="i" class="glass-card p-3">
      <select
        v-model="slot.type"
        class="mb-2 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-primary-400"
      >
        <option v-for="t in chartTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <ChartRenderer
        :config="buildSlotConfig(slot.type)"
        :data="queryResults"
        height="300px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';
import { useChart } from '@/composables/useChart';
import ChartRenderer from './ChartRenderer.vue';
import type { ChartType, ChartConfig } from '@/types';

const props = defineProps<{ count?: 2 | 3 }>();

const store = useDuckDBStore();
const { chartConfig } = useChart();
const queryResults = computed(() => store.queryResults);

const chartTypes = [
  { value: 'bar' as ChartType, label: '柱状图' },
  { value: 'line' as ChartType, label: '折线图' },
  { value: 'area' as ChartType, label: '面积图' },
  { value: 'pie' as ChartType, label: '饼图' },
  { value: 'scatter' as ChartType, label: '散点图' },
  { value: 'radar' as ChartType, label: '雷达图' },
  { value: 'funnel' as ChartType, label: '漏斗图' },
  { value: 'gauge' as ChartType, label: '仪表盘' },
  { value: 'heatmap' as ChartType, label: '热力图' },
];

const defaultTypes: ChartType[] = ['bar', 'line', 'pie'];
const slots = ref(
  Array.from({ length: props.count || 2 }, (_, i) => ({
    type: defaultTypes[i] || 'bar',
  }))
);

function buildSlotConfig(type: ChartType): ChartConfig {
  return { ...chartConfig.value, type };
}
</script>
