<!-- src/components/Results/QueryResults.vue -->
<template>
  <div class="query-results bg-white rounded-lg shadow-md p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700">查询结果</h3>
      <span v-if="resultCount > 0" class="text-sm text-gray-500">
        共 {{ resultCount }} 条记录
      </span>
    </div>

    <div v-if="results.length === 0" class="py-8 text-center text-gray-400">
      <p>暂无查询结果</p>
      <p class="text-sm mt-1">执行 SQL 查询后将在此显示结果</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50">
            <th
              v-for="col in columns"
              :key="col"
              class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in results"
            :key="i"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td
              v-for="col in columns"
              :key="col"
              class="px-4 py-2 text-sm text-gray-700 border-b"
            >
              {{ formatValue(row[col]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';

const store = useDuckDBStore();

const results = computed(() => store.queryResults);
const columns = computed(() => store.columns);
const resultCount = computed(() => store.resultCount);

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
</script>
