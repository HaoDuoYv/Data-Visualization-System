// src/plugins/echarts.ts
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart, FunnelChart, GaugeChart, HeatmapChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  RadarComponent,
  VisualMapComponent,
} from 'echarts/components';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  RadarComponent,
  VisualMapComponent,
]);
