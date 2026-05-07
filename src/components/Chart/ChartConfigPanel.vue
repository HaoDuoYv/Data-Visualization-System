<!-- src/components/Chart/ChartConfigPanel.vue -->
<template>
  <div class="glass-card p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
      <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
      图表配置
    </h3>

    <!-- 快速模板 -->
    <ChartTemplateSelector />

    <!-- 图表类型选择 -->
    <div class="mb-4">
      <label class="block text-xs font-medium text-gray-500 mb-2">图表类型</label>
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="t in chartTypes"
          :key="t.value"
          @click="updateConfig({ type: t.value })"
          class="px-2 py-1.5 text-xs rounded-lg transition-all cursor-pointer"
          :class="chartConfig.type === t.value
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- 标题输入 -->
    <div class="mb-4">
      <label class="block text-xs font-medium text-gray-500 mb-1">图表标题</label>
      <input
        v-model="titleInput"
        type="text"
        placeholder="输入图表标题（可选）"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
               focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
               transition-colors"
        @input="updateConfig({ title: titleInput })"
      />
      <!-- 自动标题建议 -->
      <button
        v-if="suggestedTitle && !titleInput"
        @click="titleInput = suggestedTitle; updateConfig({ title: suggestedTitle })"
        class="mt-1.5 px-2 py-0.5 text-xs text-primary-600 bg-primary-50 border border-primary-200 rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
      >
        {{ suggestedTitle }}
      </button>
    </div>

    <!-- X 轴选择 -->
    <div class="mb-4">
      <label class="block text-xs font-medium text-gray-500 mb-1">
        {{ ['pie', 'funnel', 'radar'].includes(chartConfig.type) ? '标签列' : chartConfig.type === 'heatmap' ? 'X 维度' : 'X 轴' }}
      </label>
      <select
        v-model="chartConfig.xAxisColumn"
        @change="updateConfig({ xAxisColumn: chartConfig.xAxisColumn })"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
               focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
               transition-colors"
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
      <label class="block text-xs font-medium text-gray-500 mb-1">
        {{ ['pie', 'funnel', 'gauge'].includes(chartConfig.type) ? '数值列' : chartConfig.type === 'heatmap' ? 'Y 维度' : 'Y 轴' }}
      </label>
      <select
        v-model="chartConfig.yAxisColumn"
        @change="updateConfig({ yAxisColumn: chartConfig.yAxisColumn })"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
               focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
               transition-colors"
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

    <!-- 分系列列选择 -->
    <div v-if="['bar', 'line', 'area', 'radar', 'heatmap'].includes(chartConfig.type)" class="mb-4">
      <label class="block text-xs font-medium text-gray-500 mb-1">分系列（可选）</label>
      <select
        v-model="selectedSeriesColumn"
        @change="updateConfig({ seriesColumn: selectedSeriesColumn || undefined })"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
               focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
               transition-colors"
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

    <!-- 派生列 -->
    <div class="mb-4">
      <button
        @click="showDerivedColumns = !showDerivedColumns"
        class="flex items-center justify-between w-full text-xs font-medium text-gray-500 mb-1 cursor-pointer"
      >
        <span>派生列（计算字段）</span>
        <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showDerivedColumns }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="showDerivedColumns" class="space-y-2 mt-2">
        <div
          v-for="(dc, i) in chartConfig.derivedColumns"
          :key="i"
          class="flex gap-1.5 items-start"
        >
          <input
            :value="dc.name"
            @input="updateDerivedColumn(i, { ...dc, name: ($event.target as HTMLInputElement).value })"
            placeholder="列名"
            class="w-20 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary-400"
          />
          <input
            :value="dc.expression"
            @input="updateDerivedColumn(i, { ...dc, expression: ($event.target as HTMLInputElement).value })"
            placeholder="如: price * quantity"
            class="flex-1 px-2 py-1 text-xs border border-gray-200 rounded font-mono focus:outline-none focus:border-primary-400"
          />
          <button
            @click="removeDerivedColumn(i)"
            class="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          @click="addDerivedColumn"
          class="text-xs text-primary-600 hover:text-primary-700 cursor-pointer"
        >
          + 添加派生列
        </button>
      </div>
    </div>

    <!-- 图表定制 -->
    <ChartCustomizer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useChart } from '@/composables/useChart';
import { useDuckDBStore } from '@/stores/duckdb';
import { useAutoTitle } from '@/composables/useAutoTitle';
import ChartCustomizer from './ChartCustomizer.vue';
import ChartTemplateSelector from './ChartTemplateSelector.vue';
import type { DerivedColumn } from '@/types';

const { chartConfig, columnMeta, updateConfig } = useChart();
const store = useDuckDBStore();

const titleInput = ref(chartConfig.value.title);
const selectedSeriesColumn = ref(chartConfig.value.seriesColumn || '');
const showDerivedColumns = ref(false);

const { suggestedTitle } = useAutoTitle(
  () => columnMeta.value,
  () => chartConfig.value,
);

watch(() => chartConfig.value.title, (newTitle) => {
  titleInput.value = newTitle;
});
watch(() => chartConfig.value.seriesColumn, (newCol) => {
  selectedSeriesColumn.value = newCol || '';
});

const chartTypes = [
  { value: 'bar' as const, label: '柱状图' },
  { value: 'line' as const, label: '折线图' },
  { value: 'area' as const, label: '面积图' },
  { value: 'pie' as const, label: '饼图' },
  { value: 'scatter' as const, label: '散点图' },
  { value: 'radar' as const, label: '雷达图' },
  { value: 'funnel' as const, label: '漏斗图' },
  { value: 'gauge' as const, label: '仪表盘' },
  { value: 'heatmap' as const, label: '热力图' },
];

function getTypeLabel(type: string): string {
  switch (type) {
    case 'numeric': return '(数值)';
    case 'string': return '(文本)';
    case 'date': return '(日期)';
    default: return '';
  }
}

function addDerivedColumn() {
  store.addDerivedColumn({ name: '', expression: '' });
}

function removeDerivedColumn(index: number) {
  store.removeDerivedColumn(index);
}

function updateDerivedColumn(index: number, col: DerivedColumn) {
  store.updateDerivedColumn(index, col);
}
</script>
