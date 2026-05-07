<!-- src/components/DataImport/DataPreview.vue -->
<template>
  <div v-if="previewData.length > 0" class="glass-card p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        数据预览 - {{ previewTableName }}
      </h3>
      <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
        {{ previewRowCount }} 行 · {{ previewColumns.length }} 列
      </span>
    </div>

    <!-- 数据表格 -->
    <div class="overflow-x-auto mb-4 rounded-lg border border-gray-100">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50/80">
            <th
              v-for="col in previewColumns"
              :key="col.name"
              class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100"
            >
              {{ col.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in previewData"
            :key="i"
            class="hover:bg-primary-50/50 transition-colors"
          >
            <td
              v-for="col in previewColumns"
              :key="col.name"
              class="px-4 py-2 text-sm text-gray-600 border-b border-gray-50 font-mono"
            >
              {{ formatValue(row[col.name]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 字段信息 -->
    <div class="border-t border-gray-100 pt-3">
      <h4 class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">字段信息</h4>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="col in previewColumns"
          :key="col.name"
          class="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600"
        >
          <span class="font-medium">{{ col.name }}</span>
          <span class="text-gray-400 ml-1">{{ col.type }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';

const store = useDuckDBStore();

const previewData = computed(() => store.previewData);
const previewColumns = computed(() => store.previewColumns);
const previewTableName = computed(() => store.previewTableName);
const previewRowCount = computed(() => store.previewRowCount);

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
</script>
