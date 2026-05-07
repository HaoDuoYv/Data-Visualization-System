// src/composables/useAutoTitle.ts
import { computed } from 'vue';
import type { ChartConfig, ColumnMeta } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  bar: '对比',
  line: '趋势',
  area: '趋势',
  pie: '占比',
  scatter: '关系',
  radar: '雷达图',
  funnel: '漏斗',
  gauge: '仪表盘',
  heatmap: '热力图',
};

export function useAutoTitle(columnMeta: () => ColumnMeta[], chartConfig: () => ChartConfig) {
  const suggestedTitle = computed(() => {
    const config = chartConfig();
    if (config.title) return '';
    if (!config.xAxisColumn) return '';

    const meta = columnMeta();
    const xMeta = meta.find(m => m.name === config.xAxisColumn);
    const yMeta = meta.find(m => m.name === config.yAxisColumn);
    const typeLabel = TYPE_LABELS[config.type] || '图表';

    const xName = xMeta?.name || config.xAxisColumn;
    const yName = yMeta?.name || config.yAxisColumn;

    switch (config.type) {
      case 'pie':
      case 'funnel':
        return `${yName} 按 ${xName} 的${typeLabel}`;
      case 'scatter':
        return `${xName} 与 ${yName} 的${typeLabel}`;
      case 'gauge':
        return `${yName}${typeLabel}`;
      case 'heatmap':
        return `${xName} × ${yName} ${typeLabel}`;
      case 'radar':
        return `${yName}${typeLabel}`;
      default:
        return `${yName} 按 ${xName} 的${typeLabel}`;
    }
  });

  return { suggestedTitle };
}
