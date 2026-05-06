<!-- src/components/DataImport/DataPreview.vue -->
<template>
  <div v-if="previewData.length > 0" class="data-preview bg-white rounded-lg shadow-md p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700">
        数据预览 - {{ previewTableName }}
      </h3>
      <span class="text-sm text-gray-500">
        共 {{ previewRowCount }} 行，{{ previewColumns.length }} 列
      </span>
    </div>

    <!-- 数据表格 -->
    <div class="overflow-x-auto mb-4">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50">
            <th
              v-for="col in previewColumns"
              :key="col.name"
              class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b"
            >
              {{ col.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in previewData"
            :key="i"
            class="hover:bg-gray-50"
          >
            <td
              v-for="col in previewColumns"
              :key="col.name"
              class="px-4 py-2 text-sm text-gray-700 border-b"
            >
              {{ formatValue(row[col.name]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 字段信息 -->
    <div class="border-t pt-3">
      <h4 class="text-sm font-medium text-gray-600 mb-2">字段信息：</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="col in previewColumns"
          :key="col.name"
          class="px-2 py-1 bg-gray-100 rounded text-xs"
        >
          {{ col.name }}: {{ col.type }}
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
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
</script>
