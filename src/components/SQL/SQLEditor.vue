<!-- src/components/SQL/SQLEditor.vue -->
<template>
  <div class="sql-editor bg-white rounded-lg shadow-md p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-700">SQL 编辑器</h3>
      <span v-if="isLoading" class="text-blue-500 text-sm">执行中...</span>
    </div>

    <textarea
      v-model="query"
      placeholder="输入 SQL 查询语句..."
      rows="6"
      class="w-full p-3 font-mono text-sm border border-gray-300 rounded-md
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             resize-vertical"
      @keydown.ctrl.enter="executeQuery"
    />

    <div class="mt-3 flex items-center justify-between">
      <span class="text-xs text-gray-500">按 Ctrl + Enter 执行</span>
      <button
        @click="executeQuery"
        :disabled="isLoading || !query.trim()"
        class="px-4 py-2 bg-blue-500 text-white rounded-md
               hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors duration-200"
      >
        {{ isLoading ? '执行中...' : '执行查询' }}
      </button>
    </div>

    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';

const { isLoading, error, query: executeQueryDB } = useDuckDB();
const store = useDuckDBStore();

const query = ref(store.currentQuery);

// 同步查询到 store
watch(query, (newQuery) => {
  store.setCurrentQuery(newQuery);
});

async function executeQuery() {
  if (!query.value.trim()) return;

  const results = await executeQueryDB(query.value);
  if (results) {
    store.setQueryResults(results);
  }
}
</script>
