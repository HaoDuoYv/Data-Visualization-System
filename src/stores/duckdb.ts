// src/stores/duckdb.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QueryResult, ChartConfig, ColumnMeta, ChartCustomization, ChartInteraction, DataTransform, FilterRule, Annotation, DerivedColumn, TrendLineConfig } from '@/types';
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

  // 表元数据（每张表的行数和列信息）
  const tableMeta = ref<Record<string, { rowCount: number; columns: { name: string; type: string }[] }>>({});

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
    delete tableMeta.value[name];
  }

  function setTableMeta(name: string, meta: { rowCount: number; columns: { name: string; type: string }[] }) {
    tableMeta.value[name] = meta;
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

  function updateChartCustomization(patch: Partial<ChartCustomization>) {
    chartConfig.value = {
      ...chartConfig.value,
      customization: { ...chartConfig.value.customization, ...patch },
    };
  }

  function updateChartInteraction(patch: Partial<ChartInteraction>) {
    chartConfig.value = {
      ...chartConfig.value,
      interaction: { ...chartConfig.value.interaction, ...patch },
    };
  }

  function updateDataTransform(patch: Partial<DataTransform>) {
    chartConfig.value = {
      ...chartConfig.value,
      dataTransform: { ...chartConfig.value.dataTransform, ...patch },
    };
  }

  function addFilterRule(rule: FilterRule) {
    chartConfig.value = {
      ...chartConfig.value,
      dataTransform: {
        ...chartConfig.value.dataTransform,
        filters: [...chartConfig.value.dataTransform.filters, rule],
      },
    };
  }

  function removeFilterRule(index: number) {
    const filters = [...chartConfig.value.dataTransform.filters];
    filters.splice(index, 1);
    chartConfig.value = {
      ...chartConfig.value,
      dataTransform: { ...chartConfig.value.dataTransform, filters },
    };
  }

  function updateFilterRule(index: number, rule: FilterRule) {
    const filters = [...chartConfig.value.dataTransform.filters];
    filters[index] = rule;
    chartConfig.value = {
      ...chartConfig.value,
      dataTransform: { ...chartConfig.value.dataTransform, filters },
    };
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

  // 标注管理
  function addAnnotation(annotation: Annotation) {
    chartConfig.value = {
      ...chartConfig.value,
      annotations: [...chartConfig.value.annotations, annotation],
    };
  }

  function removeAnnotation(id: string) {
    chartConfig.value = {
      ...chartConfig.value,
      annotations: chartConfig.value.annotations.filter(a => a.id !== id),
    };
  }

  function updateAnnotation(id: string, patch: Partial<Annotation>) {
    chartConfig.value = {
      ...chartConfig.value,
      annotations: chartConfig.value.annotations.map(a => a.id === id ? { ...a, ...patch } : a),
    };
  }

  // 派生列管理
  function addDerivedColumn(col: DerivedColumn) {
    chartConfig.value = {
      ...chartConfig.value,
      derivedColumns: [...chartConfig.value.derivedColumns, col],
    };
  }

  function removeDerivedColumn(index: number) {
    const derivedColumns = [...chartConfig.value.derivedColumns];
    derivedColumns.splice(index, 1);
    chartConfig.value = { ...chartConfig.value, derivedColumns };
  }

  function updateDerivedColumn(index: number, col: DerivedColumn) {
    const derivedColumns = [...chartConfig.value.derivedColumns];
    derivedColumns[index] = col;
    chartConfig.value = { ...chartConfig.value, derivedColumns };
  }

  // 趋势线管理
  function updateTrendLine(patch: Partial<TrendLineConfig>) {
    chartConfig.value = {
      ...chartConfig.value,
      trendLine: { ...chartConfig.value.trendLine, ...patch },
    };
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
    tableMeta,
    chartConfig,
    // 计算属性
    columns,
    resultCount,
    columnMeta,
    // 方法
    addTable,
    removeTable,
    setTableMeta,
    setQueryResults,
    setCurrentQuery,
    clearResults,
    setPreviewData,
    clearPreviewData,
    updateChartConfig,
    resetChartConfig,
    updateChartCustomization,
    updateChartInteraction,
    updateDataTransform,
    addFilterRule,
    removeFilterRule,
    updateFilterRule,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    addDerivedColumn,
    removeDerivedColumn,
    updateDerivedColumn,
    updateTrendLine,
  };
});
