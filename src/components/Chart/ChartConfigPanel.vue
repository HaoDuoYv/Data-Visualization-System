<!-- src/components/Chart/ChartConfigPanel.vue -->
<template>
  <div class="chart-config bg-white rounded-lg shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">图表配置</h3>

    <!-- 图表类型选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-2">图表类型</label>
      <div class="flex gap-2">
        <button
          v-for="t in chartTypes"
          :key="t.value"
          @click="updateConfig({ type: t.value })"
          class="px-3 py-2 text-sm rounded-md transition-colors duration-200"
          :class="chartConfig.type === t.value
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- 标题输入 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-2">图表标题</label>
      <input
        v-model="titleInput"
        type="text"
        placeholder="输入图表标题（可选）"
        class="w-full px-3 py-2 border border-gray-300 rounded-md
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               text-sm"
        @input="updateConfig({ title: titleInput })"
      />
    </div>

    <!-- X 轴选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-2">
        {{ chartConfig.type === 'pie' ? '标签列' : 'X 轴' }}
      </label>
      <select
        v-model="chartConfig.xAxisColumn"
        @change="updateConfig({ xAxisColumn: chartConfig.xAxisColumn })"
        class="w-full px-3 py-2 border border-gray-300 rounded-md
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               text-sm"
      >
        <option value="" disabled>选择列</option>
        <option
          v-for="col in columnMeta"
          :key="col.name"
          :value="col.name"
        >
          {{ col.name }} {{ getTypeLabel(col.type) }}
        </option>
      </select>
    </div>

    <!-- Y 轴选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-2">
        {{ chartConfig.type === 'pie' ? '数值列' : 'Y 轴' }}
      </label>
      <select
        v-model="chartConfig.yAxisColumn"
        @change="updateConfig({ yAxisColumn: chartConfig.yAxisColumn })"
        class="w-full px-3 py-2 border border-gray-300 rounded-md
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               text-sm"
      >
        <option value="" disabled>选择列</option>
        <option
          v-for="col in columnMeta"
          :key="col.name"
          :value="col.name"
        >
          {{ col.name }} {{ getTypeLabel(col.type) }}
        </option>
      </select>
    </div>

    <!-- 分系列列选择（仅柱状图/折线图） -->
    <div v-if="chartConfig.type === 'bar' || chartConfig.type === 'line'" class="mb-4">
      <label class="block text-sm font-medium text-gray-600 mb-2">分系列（可选）</label>
      <select
        v-model="selectedSeriesColumn"
        @change="updateConfig({ seriesColumn: selectedSeriesColumn || undefined })"
        class="w-full px-3 py-2 border border-gray-300 rounded-md
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
               text-sm"
      >
        <option value="">不分组</option>
        <option
          v-for="col in columnMeta"
          :key="col.name"
          :value="col.name"
        >
          {{ col.name }}
        </option>
      </select>
    </div>

    <!-- 图表定制 -->
    <ChartCustomizer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useChart } from '@/composables/useChart';
import ChartCustomizer from './ChartCustomizer.vue';

const { chartConfig, columnMeta, updateConfig } = useChart();

const titleInput = ref(chartConfig.value.title);
const selectedSeriesColumn = ref(chartConfig.value.seriesColumn || '');

// 同步 store 变化到本地状态
watch(() => chartConfig.value.title, (newTitle) => {
  titleInput.value = newTitle;
});
watch(() => chartConfig.value.seriesColumn, (newCol) => {
  selectedSeriesColumn.value = newCol || '';
});

const chartTypes = [
  { value: 'bar' as const, label: '柱状图' },
  { value: 'line' as const, label: '折线图' },
  { value: 'pie' as const, label: '饼图' },
  { value: 'scatter' as const, label: '散点图' },
];

function getTypeLabel(type: string): string {
  switch (type) {
    case 'numeric': return '(数值)';
    case 'string': return '(文本)';
    case 'date': return '(日期)';
    default: return '';
  }
}
</script>
