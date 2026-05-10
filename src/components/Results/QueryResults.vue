<!-- src/components/Results/QueryResults.vue -->
<template>
  <div class="glass-card p-4">
    <!-- 标题栏（可点击折叠） -->
    <div class="flex items-center justify-between cursor-pointer" @click="isCollapsed = !isCollapsed">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.375" />
        </svg>
        <h3 class="text-sm font-semibold text-gray-700">查询结果</h3>
        <svg
          class="w-3.5 h-3.5 text-gray-400 transition-transform"
          :class="{ 'rotate-180': !isCollapsed }"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <span v-if="resultCount > 0" class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
        {{ resultCount }} 条记录
      </span>
    </div>

    <!-- 折叠内容 -->
    <div v-show="!isCollapsed" class="mt-3">
      <div v-if="results.length === 0" class="py-8 text-center">
        <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        <p class="text-gray-400 text-sm">暂无查询结果</p>
        <p class="text-gray-300 text-xs mt-1">执行查询后将在此显示结果</p>
      </div>

      <div v-else class="overflow-x-auto rounded-lg border border-gray-100" style="max-height: 400px">
        <table class="w-full border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="bg-gray-50/80">
              <th
                v-for="col in columns"
                :key="col"
                class="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100"
              >
                {{ col }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in results"
              :key="i"
              class="hover:bg-primary-50/50 transition-colors"
            >
              <td
                v-for="col in columns"
                :key="col"
                class="px-4 py-2 text-sm text-gray-600 border-b border-gray-50 font-mono"
              >
                {{ formatValue(row[col]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';

const store = useDuckDBStore();

const isCollapsed = ref(false);

const results = computed(() => store.queryResults);
const columns = computed(() => store.columns);
const resultCount = computed(() => store.resultCount);

function formatValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
</script>
