<!-- src/components/SQL/SQLEditor.vue -->
<template>
  <div class="glass-card p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        SQL 编辑器
      </h3>
      <span v-if="isLoading" class="text-xs text-cta-600 flex items-center gap-1">
        <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        执行中...
      </span>
    </div>

    <textarea
      v-model="query"
      placeholder="SELECT * FROM table_name LIMIT 100"
      rows="5"
      class="w-full p-3 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50/50
             focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
             resize-vertical transition-colors"
      @keydown.ctrl.enter="executeQuery"
    />

    <div class="mt-3 flex items-center justify-between">
      <span class="text-xs text-gray-400 flex items-center gap-1">
        <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Ctrl</kbd>
        <span>+</span>
        <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Enter</kbd>
        <span class="ml-1">执行</span>
      </span>
      <button
        @click="executeQuery"
        :disabled="isLoading || !query.trim()"
        class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg
               hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors cursor-pointer"
      >
        {{ isLoading ? '执行中...' : '执行查询' }}
      </button>
    </div>

    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
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
