// src/composables/useChart.ts
import { computed, watch } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';
import type { ChartConfig, ColumnMeta } from '@/types';
import type { EChartsOption } from 'echarts';

export function useChart() {
  const store = useDuckDBStore();

  // 图表配置（从 store 读取）
  const chartConfig = computed(() => store.chartConfig);
  const columnMeta = computed(() => store.columnMeta);
  const queryResults = computed(() => store.queryResults);
  const columns = computed(() => store.columns);

  // 智能默认选择：当列元数据变化时自动配置轴
  watch(columnMeta, (meta) => {
    if (meta.length === 0) return;

    const stringCol = meta.find((m) => m.type === 'string');
    const numericCol = meta.find((m) => m.type === 'numeric');

    store.updateChartConfig({
      xAxisColumn: stringCol?.name || meta[0]?.name || '',
      yAxisColumn: numericCol?.name || meta[1]?.name || meta[0]?.name || '',
    });
  }, { immediate: true });

  // 构建 ECharts option
  const chartOption = computed<EChartsOption>(() => {
    const data = queryResults.value;
    const config = chartConfig.value;

    if (data.length === 0 || !config.xAxisColumn || !config.yAxisColumn) {
      return {};
    }

    switch (config.type) {
      case 'bar':
      case 'line':
        return buildCategoryChart(data, config);
      case 'pie':
        return buildPieChart(data, config);
      case 'scatter':
        return buildScatterChart(data, config);
      default:
        return {};
    }
  });

  // 是否有数据
  const hasData = computed(() => {
    return queryResults.value.length > 0 &&
      !!chartConfig.value.xAxisColumn &&
      !!chartConfig.value.yAxisColumn;
  });

  // 更新配置
  function updateConfig(patch: Partial<ChartConfig>) {
    store.updateChartConfig(patch);
  }

  // 重置配置
  function resetConfig() {
    store.resetChartConfig();
  }

  return {
    chartConfig,
    columnMeta,
    chartOption,
    hasData,
    updateConfig,
    resetConfig,
  };
}

// 构建柱状图/折线图 option
function buildCategoryChart(data: any[], config: ChartConfig): EChartsOption {
  const { type, title, xAxisColumn, yAxisColumn, seriesColumn } = config;

  // 如果有分系列列，按组分组
  if (seriesColumn) {
    const groups = new Map<string, { categories: any[]; values: any[] }>();
    const categories: any[] = [];

    for (const row of data) {
      const category = row[xAxisColumn];
      const seriesName = String(row[seriesColumn] || 'default');

      if (!groups.has(seriesName)) {
        groups.set(seriesName, { categories: [], values: [] });
      }
      groups.get(seriesName)!.categories.push(category);
      groups.get(seriesName)!.values.push(Number(row[yAxisColumn]) || 0);

      if (!categories.includes(category)) {
        categories.push(category);
      }
    }

    return {
      title: title ? { text: title, left: 'center' } : undefined,
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: Array.from(groups.entries()).map(([name, group]) => ({
        name,
        type: type as 'bar' | 'line',
        data: group.values,
      })),
    };
  }

  // 无分系列：单系列
  const categories = data.map((row) => row[xAxisColumn]);
  const values = data.map((row) => Number(row[yAxisColumn]) || 0);

  return {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{ type: type as 'bar' | 'line', data: values }],
  };
}

// 构建饼图 option
function buildPieChart(data: any[], config: ChartConfig): EChartsOption {
  const { title, xAxisColumn, yAxisColumn } = config;

  const pieData = data.map((row) => ({
    name: String(row[xAxisColumn]),
    value: Number(row[yAxisColumn]) || 0,
  }));

  return {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: '50%',
      data: pieData,
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
      },
    }],
  };
}

// 构建散点图 option
function buildScatterChart(data: any[], config: ChartConfig): EChartsOption {
  const { title, xAxisColumn, yAxisColumn } = config;

  const scatterData = data.map((row) => [
    Number(row[xAxisColumn]) || 0,
    Number(row[yAxisColumn]) || 0,
  ]);

  return {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [x, y] = params.data;
        return `${xAxisColumn}: ${x}<br/>${yAxisColumn}: ${y}`;
      },
    },
    xAxis: { type: 'value', name: xAxisColumn },
    yAxis: { type: 'value', name: yAxisColumn },
    series: [{ type: 'scatter', data: scatterData, symbolSize: 10 }],
  };
}
