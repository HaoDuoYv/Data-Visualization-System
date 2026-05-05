// src/stores/duckdb.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QueryResult } from '@/types';

export const useDuckDBStore = defineStore('duckdb', () => {
  // 状态
  const tables = ref<string[]>([]);
  const queryResults = ref<QueryResult[]>([]);
  const currentQuery = ref('SELECT 1 AS test_column');

  // 计算属性
  const columns = computed(() => {
    if (queryResults.value.length === 0) return [];
    return Object.keys(queryResults.value[0]);
  });

  const resultCount = computed(() => queryResults.value.length);

  // 方法
  function addTable(name: string) {
    if (!tables.value.includes(name)) {
      tables.value.push(name);
    }
  }

  function removeTable(name: string) {
    const index = tables.value.indexOf(name);
    if (index > -1) {
      tables.value.splice(index, 1);
    }
  }

  function setQueryResults(results: QueryResult[]) {
    queryResults.value = results;
  }

  function setCurrentQuery(query: string) {
    currentQuery.value = query;
  }

  function clearResults() {
    queryResults.value = [];
  }

  return {
    // 状态
    tables,
    queryResults,
    currentQuery,
    // 计算属性
    columns,
    resultCount,
    // 方法
    addTable,
    removeTable,
    setQueryResults,
    setCurrentQuery,
    clearResults,
  };
});
