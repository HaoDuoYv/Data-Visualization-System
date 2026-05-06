<!-- src/components/Chart/ChartCustomizer.vue -->
<template>
  <div class="chart-customizer border-t pt-3 mt-3">
    <h4
      class="text-sm font-medium text-gray-600 mb-2 cursor-pointer flex items-center justify-between"
      @click="isOpen = !isOpen"
    >
      <span>图表样式</span>
      <span class="text-xs">{{ isOpen ? '▲' : '▼' }}</span>
    </h4>

    <div v-show="isOpen" class="space-y-3">
      <!-- 颜色主题 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">颜色主题</label>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="(colors, theme) in COLOR_PALETTES"
            :key="theme"
            @click="updateCustomization({ colorTheme: theme as ColorTheme })"
            class="w-8 h-8 rounded border-2 transition-all flex items-center justify-center"
            :class="config.customization.colorTheme === theme ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'"
            :title="theme"
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
          class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <!-- 图例位置 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">图例位置</label>
        <div class="flex gap-1">
          <button
            v-for="pos in legendPositions"
            :key="pos.value"
            @click="updateCustomization({ legendPosition: pos.value })"
            class="px-2 py-1 text-xs rounded transition-colors"
            :class="config.customization.legendPosition === pos.value
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
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
          class="rounded"
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
          class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <!-- 背景色 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">背景色</label>
        <input
          type="color"
          :value="config.customization.backgroundColor"
          @input="updateCustomization({ backgroundColor: ($event.target as HTMLInputElement).value })"
          class="w-full h-8 rounded cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChart } from '@/composables/useChart';
import { useDuckDBStore } from '@/stores/duckdb';
import { COLOR_PALETTES } from '@/types';
import type { ColorTheme, AxisStyle, LegendPosition } from '@/types';

const { chartConfig: config } = useChart();
const store = useDuckDBStore();
const isOpen = ref(false);

const legendPositions: { value: LegendPosition; label: string }[] = [
  { value: 'top', label: '上' },
  { value: 'bottom', label: '下' },
  { value: 'left', label: '左' },
  { value: 'right', label: '右' },
  { value: 'none', label: '无' },
];

function updateCustomization(patch: Record<string, any>) {
  store.updateChartCustomization(patch);
}

function updateAxisStyle(patch: Partial<AxisStyle>) {
  store.updateChartCustomization({
    axisStyle: { ...config.value.customization.axisStyle, ...patch },
  });
}
</script>
