// src/stores/duckdb.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QueryResult, ChartConfig, ColumnMeta } from '@/types';
import { DEFAULT_CHART_CONFIG } from '@/types';

export const useDuckDBStore = defineStore('duckdb', () => {
  // 状态
  const tables = ref<string[]>([]);
  const queryResults = ref<QueryResult[]>([]);
  const currentQuery = ref('SELECT 1 AS test_column');

  // 预览数据状态
  const previewData = ref<any[]>([]);
  const previewColumns = ref<{ name: string; type: string }[]>([]);
  const previewTableName = ref<string>('');
  const previewRowCount = ref<number>(0);

  // 图表配置状态
  const chartConfig = ref<ChartConfig>({ ...DEFAULT_CHART_CONFIG });

  // 计算属性
  const columns = computed(() => {
    if (queryResults.value.length === 0) return [];
    const first = queryResults.value[0];
    if (!first) return [];
    return Object.keys(first);
  });

  const resultCount = computed(() => queryResults.value.length);

  // 列类型推断
  const columnMeta = computed<ColumnMeta[]>(() => {
    if (queryResults.value.length === 0 || columns.value.length === 0) return [];
    const sampleRows = queryResults.value.slice(0, 10);
    return columns.value.map((col) => {
      let type: ColumnMeta['type'] = 'unknown';
      for (const row of sampleRows) {
        const val = row[col];
        if (val === null || val === undefined) continue;
        if (typeof val === 'number') {
          type = 'numeric';
          break;
        }
        if (typeof val === 'string') {
          if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(val)) {
            type = 'date';
          } else {
            type = 'string';
          }
          break;
        }
      }
      return { name: col, type };
    });
  });

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
    resetChartConfig();
  }

  function updateChartConfig(patch: Partial<ChartConfig>) {
    chartConfig.value = { ...chartConfig.value, ...patch };
  }

  function resetChartConfig() {
    chartConfig.value = { ...DEFAULT_CHART_CONFIG };
  }

  function setPreviewData(data: any[], columns: { name: string; type: string }[], tableName: string, rowCount: number) {
    previewData.value = data;
    previewColumns.value = columns;
    previewTableName.value = tableName;
    previewRowCount.value = rowCount;
  }

  function clearPreviewData() {
    previewData.value = [];
    previewColumns.value = [];
    previewTableName.value = '';
    previewRowCount.value = 0;
  }

  return {
    // 状态
    tables,
    queryResults,
    currentQuery,
    previewData,
    previewColumns,
    previewTableName,
    previewRowCount,
    chartConfig,
    // 计算属性
    columns,
    resultCount,
    columnMeta,
    // 方法
    addTable,
    removeTable,
    setQueryResults,
    setCurrentQuery,
    clearResults,
    setPreviewData,
    clearPreviewData,
    updateChartConfig,
    resetChartConfig,
  };
});
