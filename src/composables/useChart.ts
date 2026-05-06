// src/composables/useChart.ts
import { computed, watch } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';
import { useDataTransform } from './useDataTransform';
import type { ChartConfig, ChartCustomization, QueryResult, ColumnMeta } from '@/types';
import { COLOR_PALETTES } from '@/types';
import type { EChartsOption } from 'echarts';

export function useChart() {
  const store = useDuckDBStore();
  const { applyTransforms } = useDataTransform();

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
    const rawData = queryResults.value;
    const config = chartConfig.value;
    return buildChartOption(rawData, config);
  });

  const hasData = computed(() => {
    return queryResults.value.length > 0 &&
      !!chartConfig.value.xAxisColumn &&
      !!chartConfig.value.yAxisColumn;
  });

  function updateConfig(patch: Partial<ChartConfig>) {
    store.updateChartConfig(patch);
  }

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

// 纯函数：构建图表 option（供 useChart 和 Dashboard 使用）
export function buildChartOption(rawData: QueryResult[], config: ChartConfig): EChartsOption {
  const { applyTransforms } = useDataTransform();
  const data = applyTransforms(rawData, config.dataTransform);

  if (data.length === 0 || !config.xAxisColumn || !config.yAxisColumn) {
    return {};
  }

  let option: EChartsOption;
  switch (config.type) {
    case 'bar':
    case 'line':
      option = buildCategoryChart(data, config);
      break;
    case 'pie':
      option = buildPieChart(data, config);
      break;
    case 'scatter':
      option = buildScatterChart(data, config);
      break;
    default:
      option = {};
  }

  return applyCustomization(option, config.customization);
}

// 应用图表定制
function applyCustomization(option: EChartsOption, custom: ChartCustomization): EChartsOption {
  const palette = COLOR_PALETTES[custom.colorTheme];
  const legendMap: Record<string, any> = {
    top: { top: 0, left: 'center', orient: 'horizontal' },
    bottom: { bottom: 0, left: 'center', orient: 'horizontal' },
    left: { left: 0, top: 'middle', orient: 'vertical' },
    right: { right: 0, top: 'middle', orient: 'vertical' },
  };

  return {
    ...option,
    color: palette,
    backgroundColor: custom.backgroundColor,
    textStyle: { fontSize: custom.fontSize },
    legend: custom.legendPosition === 'none' ? undefined : {
      ...option.legend,
      ...legendMap[custom.legendPosition],
    },
    xAxis: option.xAxis ? {
      ...option.xAxis,
      axisLine: { lineStyle: { color: custom.axisStyle.axisLineColor } },
      axisLabel: {
        rotate: custom.axisStyle.labelRotation,
        fontSize: custom.axisStyle.labelFontSize,
      },
      splitLine: custom.axisStyle.showGrid
        ? { lineStyle: { color: custom.axisStyle.gridColor } }
        : undefined,
    } : option.xAxis,
    yAxis: option.yAxis ? {
      ...option.yAxis,
      axisLine: { lineStyle: { color: custom.axisStyle.axisLineColor } },
      axisLabel: { fontSize: custom.axisStyle.labelFontSize },
      splitLine: custom.axisStyle.showGrid
        ? { lineStyle: { color: custom.axisStyle.gridColor } }
        : undefined,
    } : option.yAxis,
  };
}

// 构建柱状图/折线图 option
function buildCategoryChart(data: any[], config: ChartConfig): EChartsOption {
  const { type, title, xAxisColumn, yAxisColumn, seriesColumn } = config;

  if (seriesColumn) {
    const groups = new Map<string, { categories: any[]; values: any[] }>();
    const categories: any[] = [];
    for (const row of data) {
      const category = row[xAxisColumn];
      const seriesName = String(row[seriesColumn] || 'default');
      if (!groups.has(seriesName)) groups.set(seriesName, { categories: [], values: [] });
      groups.get(seriesName)!.categories.push(category);
      groups.get(seriesName)!.values.push(Number(row[yAxisColumn]) || 0);
      if (!categories.includes(category)) categories.push(category);
    }
    return {
      title: title ? { text: title, left: 'center' } : undefined,
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: Array.from(groups.entries()).map(([name, group]) => ({
        name, type: type as 'bar' | 'line', data: group.values,
      })),
    };
  }

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
      type: 'pie', radius: '50%', data: pieData,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
    }],
  };
}

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
