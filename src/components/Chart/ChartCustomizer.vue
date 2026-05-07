<!-- src/components/Chart/ChartCustomizer.vue -->
<template>
  <div class="border-t border-gray-100 pt-3 mt-3">
    <h4
      class="text-xs font-medium text-gray-600 mb-2 cursor-pointer flex items-center justify-between hover:text-primary-600 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span>图表样式</span>
      <svg class="w-3.5 h-3.5 transition-transform" :class="isOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </h4>

    <div v-show="isOpen" class="space-y-3">
      <!-- 颜色主题 -->
      <div>
        <label class="text-xs text-gray-500 mb-1.5 block">颜色主题</label>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="(colors, theme) in COLOR_PALETTES"
            :key="theme"
            @click="updateCustomization({ colorTheme: theme as ColorTheme })"
            class="w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer"
            :class="config.customization.colorTheme === theme ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'"
            :title="String(theme)"
          >
            <div class="flex gap-0.5">
              <div
                v-for="(color, i) in colors.slice(0, 3)"
                :key="i"
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: color }"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- 字体大小 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">
          字体大小: {{ config.customization.fontSize }}px
        </label>
        <input
          type="range"
          :value="config.customization.fontSize"
          @input="updateCustomization({ fontSize: Number(($event.target as HTMLInputElement).value) })"
          min="10" max="24" step="1"
          class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      <!-- 图例位置 -->
      <div>
        <label class="text-xs text-gray-500 mb-1.5 block">图例位置</label>
        <div class="flex gap-1">
          <button
            v-for="pos in legendPositions"
            :key="pos.value"
            @click="updateCustomization({ legendPosition: pos.value })"
            class="px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer"
            :class="config.customization.legendPosition === pos.value
              ? 'bg-primary-100 text-primary-700 border border-primary-200'
              : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'"
          >
            {{ pos.label }}
          </button>
        </div>
      </div>

      <!-- 网格线 -->
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          :checked="config.customization.axisStyle.showGrid"
          @change="updateAxisStyle({ showGrid: ($event.target as HTMLInputElement).checked })"
          class="rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
          id="showGrid"
        />
        <label for="showGrid" class="text-xs text-gray-500">显示网格线</label>
      </div>

      <!-- 标签旋转 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">
          标签旋转: {{ config.customization.axisStyle.labelRotation }}°
        </label>
        <input
          type="range"
          :value="config.customization.axisStyle.labelRotation"
          @input="updateAxisStyle({ labelRotation: Number(($event.target as HTMLInputElement).value) })"
          min="0" max="90" step="15"
          class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      <!-- 背景色 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">背景色</label>
        <input
          type="color"
          :value="config.customization.backgroundColor"
          @input="updateCustomization({ backgroundColor: ($event.target as HTMLInputElement).value })"
          class="w-full h-8 rounded-lg cursor-pointer border border-gray-200"
        />
      </div>

      <!-- 交互功能 -->
      <div class="border-t border-gray-100 pt-3">
        <label class="text-xs font-medium text-gray-600 mb-2 block">交互功能</label>

        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="config.interaction.enableZoom"
              @change="updateInteraction({ enableZoom: ($event.target as HTMLInputElement).checked })"
              class="rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
            />
            <span class="text-xs text-gray-500">启用缩放</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="config.interaction.showLabels"
              @change="updateInteraction({ showLabels: ($event.target as HTMLInputElement).checked })"
              class="rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
            />
            <span class="text-xs text-gray-500">显示数值标签</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="config.interaction.enableAnimation"
              @change="updateInteraction({ enableAnimation: ($event.target as HTMLInputElement).checked })"
              class="rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
            />
            <span class="text-xs text-gray-500">动画效果</span>
          </label>
        </div>
      </div>

      <!-- 趋势线 -->
      <div v-if="['line', 'area', 'scatter'].includes(config.type)" class="border-t border-gray-100 pt-3">
        <label class="text-xs font-medium text-gray-600 mb-2 block">趋势线</label>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="config.trendLine.enabled"
              @change="store.updateTrendLine({ enabled: ($event.target as HTMLInputElement).checked })"
              class="rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
            />
            <span class="text-xs text-gray-500">显示趋势线</span>
          </label>
          <div v-if="config.trendLine.enabled" class="flex gap-2 ml-5">
            <button
              @click="store.updateTrendLine({ type: 'linear' })"
              class="px-2 py-0.5 text-xs rounded cursor-pointer"
              :class="config.trendLine.type === 'linear' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
            >
              线性回归
            </button>
            <button
              @click="store.updateTrendLine({ type: 'moving_average' })"
              class="px-2 py-0.5 text-xs rounded cursor-pointer"
              :class="config.trendLine.type === 'moving_average' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
            >
              移动平均
            </button>
          </div>
          <div v-if="config.trendLine.enabled && config.trendLine.type === 'moving_average'" class="ml-5">
            <label class="text-xs text-gray-500 mb-1 block">
              窗口大小: {{ config.trendLine.movingAverageWindow || 5 }}
            </label>
            <input
              type="range"
              :value="config.trendLine.movingAverageWindow || 5"
              @input="store.updateTrendLine({ movingAverageWindow: Number(($event.target as HTMLInputElement).value) })"
              min="2" max="20" step="1"
              class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- 数据标注 -->
      <div class="border-t border-gray-100 pt-3">
        <button
          @click="showAnnotations = !showAnnotations"
          class="flex items-center justify-between w-full text-xs font-medium text-gray-600 mb-2 cursor-pointer"
        >
          <span>数据标注</span>
          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showAnnotations }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="showAnnotations" class="space-y-2">
          <div
            v-for="ann in config.annotations"
            :key="ann.id"
            class="flex gap-1.5 items-center"
          >
            <select
              :value="ann.xValue"
              @change="store.updateAnnotation(ann.id, { xValue: ($event.target as HTMLSelectElement).value })"
              class="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-primary-400"
            >
              <option value="" disabled>X 值</option>
              <option v-for="val in uniqueXValues" :key="val" :value="val">{{ val }}</option>
            </select>
            <input
              type="number"
              :value="ann.yValue"
              @input="store.updateAnnotation(ann.id, { yValue: Number(($event.target as HTMLInputElement).value) })"
              placeholder="Y"
              class="w-16 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary-400"
            />
            <input
              :value="ann.text"
              @input="store.updateAnnotation(ann.id, { text: ($event.target as HTMLInputElement).value })"
              placeholder="标注"
              class="w-16 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-primary-400"
            />
            <input
              type="color"
              :value="ann.color"
              @input="store.updateAnnotation(ann.id, { color: ($event.target as HTMLInputElement).value })"
              class="w-6 h-6 rounded cursor-pointer border border-gray-200"
            />
            <button
              @click="store.removeAnnotation(ann.id)"
              class="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            @click="addAnnotation"
            class="text-xs text-primary-600 hover:text-primary-700 cursor-pointer"
          >
            + 添加标注
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChart } from '@/composables/useChart';
import { useDuckDBStore } from '@/stores/duckdb';
import { COLOR_PALETTES } from '@/types';
import type { ColorTheme, AxisStyle, LegendPosition, ChartCustomization, ChartInteraction } from '@/types';

const { chartConfig: config } = useChart();
const store = useDuckDBStore();
const isOpen = ref(false);
const showAnnotations = ref(false);

const uniqueXValues = computed(() => {
  const col = config.value.xAxisColumn;
  if (!col) return [];
  const values = new Set(store.queryResults.map(row => String(row[col])));
  return Array.from(values).slice(0, 50);
});

const legendPositions: { value: LegendPosition; label: string }[] = [
  { value: 'top', label: '上' },
  { value: 'bottom', label: '下' },
  { value: 'left', label: '左' },
  { value: 'right', label: '右' },
  { value: 'none', label: '无' },
];

function updateCustomization(patch: Partial<ChartCustomization>) {
  store.updateChartCustomization(patch);
}

function updateAxisStyle(patch: Partial<AxisStyle>) {
  store.updateChartCustomization({
    axisStyle: { ...config.value.customization.axisStyle, ...patch },
  });
}

function updateInteraction(patch: Partial<ChartInteraction>) {
  store.updateChartInteraction(patch);
}

function addAnnotation() {
  store.addAnnotation({
    id: crypto.randomUUID(),
    xValue: uniqueXValues.value[0] || '',
    yValue: 0,
    text: '标注',
    color: '#ef4444',
  });
}
</script>
