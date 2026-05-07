// src/data/chartTemplates.ts
import type { ChartConfig } from '@/types';
import { DEFAULT_CHART_CONFIG } from '@/types';

export interface ChartTemplate {
  name: string;
  description: string;
  icon: string;
  partialConfig: Partial<ChartConfig>;
}

export const CHART_TEMPLATES: ChartTemplate[] = [
  {
    name: '月度趋势',
    description: '用折线图展示数据随时间的变化趋势',
    icon: '📈',
    partialConfig: {
      type: 'line',
      customization: {
        ...DEFAULT_CHART_CONFIG.customization,
        legendPosition: 'top',
        axisStyle: { ...DEFAULT_CHART_CONFIG.customization.axisStyle, showGrid: true },
      },
      interaction: { enableZoom: true, showLabels: false, enableAnimation: true },
    },
  },
  {
    name: 'Top 10 排名',
    description: '用水平柱状图展示排名前列的数据',
    icon: '🏆',
    partialConfig: {
      type: 'bar',
      dataTransform: {
        ...DEFAULT_CHART_CONFIG.dataTransform,
        sort: { column: '', direction: 'desc' },
      },
      interaction: { enableZoom: false, showLabels: true, enableAnimation: true },
    },
  },
  {
    name: '占比分析',
    description: '用饼图展示各部分占总体的比例',
    icon: '🥧',
    partialConfig: {
      type: 'pie',
      customization: {
        ...DEFAULT_CHART_CONFIG.customization,
        legendPosition: 'right',
      },
    },
  },
  {
    name: '相关性分析',
    description: '用散点图分析两个变量之间的关系',
    icon: '🔵',
    partialConfig: {
      type: 'scatter',
      customization: {
        ...DEFAULT_CHART_CONFIG.customization,
        legendPosition: 'none',
      },
    },
  },
  {
    name: '绩效仪表盘',
    description: '用仪表盘展示关键指标的完成情况',
    icon: '🎯',
    partialConfig: {
      type: 'gauge',
    },
  },
  {
    name: '漏斗分析',
    description: '用漏斗图展示转化流程各阶段的数据',
    icon: '🔻',
    partialConfig: {
      type: 'funnel',
      customization: {
        ...DEFAULT_CHART_CONFIG.customization,
        legendPosition: 'left',
      },
    },
  },
  {
    name: '面积趋势',
    description: '用面积图强调数据量的变化幅度',
    icon: '📊',
    partialConfig: {
      type: 'area',
      interaction: { enableZoom: true, showLabels: false, enableAnimation: true },
    },
  },
  {
    name: '热力分布',
    description: '用热力图展示二维数据的分布密度',
    icon: '🌡️',
    partialConfig: {
      type: 'heatmap',
    },
  },
];
