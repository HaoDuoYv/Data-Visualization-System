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
    case 'area':
      option = buildAreaChart(data, config);
      break;
    case 'pie':
      option = buildPieChart(data, config);
      break;
    case 'scatter':
      option = buildScatterChart(data, config);
      break;
    case 'radar':
      option = buildRadarChart(data, config);
      break;
    case 'funnel':
      option = buildFunnelChart(data, config);
      break;
    case 'gauge':
      option = buildGaugeChart(data, config);
      break;
    case 'heatmap':
      option = buildHeatmapChart(data, config);
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

  const base: EChartsOption = {
    ...option,
    color: palette,
    backgroundColor: custom.backgroundColor,
    textStyle: { fontSize: custom.fontSize },
    legend: custom.legendPosition === 'none' ? undefined : {
      ...option.legend,
      ...legendMap[custom.legendPosition],
    },
  };

  // radar/gauge/funnel/heatmap 不使用标准坐标轴
  if (option.xAxis) {
    (base as any).xAxis = {
      ...option.xAxis,
      axisLine: { lineStyle: { color: custom.axisStyle.axisLineColor } },
      axisLabel: {
        rotate: custom.axisStyle.labelRotation,
        fontSize: custom.axisStyle.labelFontSize,
      },
      splitLine: custom.axisStyle.showGrid
        ? { lineStyle: { color: custom.axisStyle.gridColor } }
        : undefined,
    };
  }
  if (option.yAxis) {
    (base as any).yAxis = {
      ...option.yAxis,
      axisLine: { lineStyle: { color: custom.axisStyle.axisLineColor } },
      axisLabel: { fontSize: custom.axisStyle.labelFontSize },
      splitLine: custom.axisStyle.showGrid
        ? { lineStyle: { color: custom.axisStyle.gridColor } }
        : undefined,
    };
  }

  return base;
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

// 构建面积图 option（折线图 + areaStyle）
function buildAreaChart(data: any[], config: ChartConfig): EChartsOption {
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
        name, type: 'line' as const, data: group.values, areaStyle: {},
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
    series: [{ type: 'line', data: values, areaStyle: {} }],
  };
}

// 构建雷达图 option
function buildRadarChart(data: any[], config: ChartConfig): EChartsOption {
  const { title, xAxisColumn, yAxisColumn, seriesColumn } = config;

  if (seriesColumn) {
    // 分组模式：每个 series 一组数据
    const groups = new Map<string, { indicators: any[]; values: number[] }>();
    const allIndicators = new Set<string>();
    for (const row of data) {
      const indicator = String(row[xAxisColumn]);
      const seriesName = String(row[seriesColumn] || 'default');
      allIndicators.add(indicator);
      if (!groups.has(seriesName)) groups.set(seriesName, { indicators: [], values: [] });
      groups.get(seriesName)!.indicators.push(indicator);
      groups.get(seriesName)!.values.push(Number(row[yAxisColumn]) || 0);
    }
    const indicatorList = Array.from(allIndicators);
    // 为每个 series 对齐数据到完整的 indicator 列表
    const radarData = Array.from(groups.entries()).map(([name, group]) => {
      const valueMap = new Map(group.indicators.map((ind, i) => [ind, group.values[i]]));
      return {
        name,
        value: indicatorList.map(ind => valueMap.get(ind) || 0),
      };
    });
    return {
      title: title ? { text: title, left: 'center' } : undefined,
      tooltip: {},
      legend: { bottom: 0 },
      radar: {
        indicator: indicatorList.map(name => ({ name, max: undefined })),
      },
      series: [{ type: 'radar', data: radarData }],
    };
  }

  // 非分组模式：所有行作为一个 series
  const indicators = data.map(row => String(row[xAxisColumn]));
  const values = data.map(row => Number(row[yAxisColumn]) || 0);
  return {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: {},
    radar: {
      indicator: indicators.map(name => ({ name, max: undefined })),
    },
    series: [{
      type: 'radar',
      data: [{ value: values }],
    }],
  };
}

// 构建漏斗图 option
function buildFunnelChart(data: any[], config: ChartConfig): EChartsOption {
  const { title, xAxisColumn, yAxisColumn } = config;
  const funnelData = data
    .map(row => ({
      name: String(row[xAxisColumn]),
      value: Number(row[yAxisColumn]) || 0,
    }))
    .sort((a, b) => b.value - a.value);
  return {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    legend: { bottom: 0 },
    series: [{
      type: 'funnel',
      left: '10%',
      width: '80%',
      sort: 'descending',
      gap: 2,
      data: funnelData,
      label: { show: true, position: 'inside' },
    }],
  };
}

// 构建仪表盘 option
function buildGaugeChart(data: any[], config: ChartConfig): EChartsOption {
  const { title, yAxisColumn } = config;
  const value = data.length > 0 ? Number(data[0][yAxisColumn]) || 0 : 0;
  const max = Math.max(value * 1.2, 100);
  return {
    title: title ? { text: title, left: 'center' } : undefined,
    series: [{
      type: 'gauge',
      min: 0,
      max,
      progress: { show: true },
      detail: { valueAnimation: true, formatter: '{value}', fontSize: 20 },
      data: [{ value, name: yAxisColumn }],
    }],
  };
}

// 构建热力图 option
function buildHeatmapChart(data: any[], config: ChartConfig): EChartsOption {
  const { title, xAxisColumn, yAxisColumn, seriesColumn } = config;

  // 获取所有唯一的 X 和 Y 值
  const xValues = [...new Set(data.map(row => String(row[xAxisColumn])))];
  const yValues = [...new Set(data.map(row => String(row[yAxisColumn])))];

  // 构建热力图数据 [xIndex, yIndex, value]
  let heatmapData: [number, number, number][];
  if (seriesColumn) {
    heatmapData = data.map(row => [
      xValues.indexOf(String(row[xAxisColumn])),
      yValues.indexOf(String(row[yAxisColumn])),
      Number(row[seriesColumn]) || 0,
    ]);
  } else {
    // 无 seriesColumn 时，统计每个 (x, y) 组合的出现次数
    const countMap = new Map<string, number>();
    for (const row of data) {
      const key = `${row[xAxisColumn]}|||${row[yAxisColumn]}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }
    heatmapData = [];
    for (const [key, count] of countMap) {
      const [x = '', y = ''] = key.split('|||');
      heatmapData.push([xValues.indexOf(x), yValues.indexOf(y), count]);
    }
  }

  const maxValue = Math.max(...heatmapData.map(d => d[2]), 1);

  return {
    title: title ? { text: title, left: 'center' } : undefined,
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: xValues, splitArea: { show: true } },
    yAxis: { type: 'category', data: yValues, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
    },
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
    }],
  };
}
