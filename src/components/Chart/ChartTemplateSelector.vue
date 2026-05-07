<!-- src/components/Chart/ChartTemplateSelector.vue -->
<template>
  <div class="mb-3">
    <p class="text-xs text-gray-500 mb-1.5">快速模板</p>
    <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      <button
        v-for="t in CHART_TEMPLATES"
        :key="t.name"
        @click="applyTemplate(t)"
        class="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        :title="t.description"
      >
        <span>{{ t.icon }}</span>
        <span>{{ t.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDuckDBStore } from '@/stores/duckdb';
import { CHART_TEMPLATES } from '@/data/chartTemplates';
import type { ChartTemplate } from '@/data/chartTemplates';

const store = useDuckDBStore();

function applyTemplate(template: ChartTemplate) {
  store.updateChartConfig(template.partialConfig);
}
</script>
