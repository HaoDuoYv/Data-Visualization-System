<!-- src/components/Chart/DataFilterPanel.vue -->
<template>
  <div class="data-filter-panel">
    <h4
      class="text-xs font-medium text-gray-600 mb-2 cursor-pointer flex items-center justify-between hover:text-primary-600 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span>数据筛选</span>
      <svg class="w-3.5 h-3.5 transition-transform" :class="isOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </h4>

    <div v-show="isOpen" class="space-y-3">
      <!-- 筛选规则 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">筛选条件</label>
        <div v-for="(rule, i) in filters" :key="i" class="flex gap-1 mb-1.5 items-center">
          <select
            :value="rule.column"
            @change="updateFilter(i, { ...rule, column: ($event.target as HTMLSelectElement).value })"
            class="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
          <select
            :value="rule.operator"
            @change="updateFilter(i, { ...rule, operator: ($event.target as HTMLSelectElement).value as any })"
            class="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">></option>
            <option value="<"><</option>
            <option value=">=">>=</option>
            <option value="<="><=</option>
            <option value="contains">包含</option>
            <option value="not_contains">不包含</option>
            <option value="is_null">为空</option>
            <option value="is_not_null">不为空</option>
          </select>
          <input
            v-if="!['is_null', 'is_not_null'].includes(rule.operator)"
            :value="rule.value"
            @input="updateFilter(i, { ...rule, value: ($event.target as HTMLInputElement).value })"
            placeholder="值"
            class="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
          <button
            @click="removeFilter(i)"
            class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          @click="addFilter"
          class="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加条件
        </button>
      </div>

      <!-- 排序 -->
      <div>
        <label class="text-xs text-gray-500 mb-1 block">排序</label>
        <div class="flex gap-1 items-center">
          <select
            :value="sort?.column || ''"
            @change="updateSortColumn(($event.target as HTMLSelectElement).value)"
            class="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">不排序</option>
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
          <button
            v-if="sort"
            @click="toggleSortDirection"
            class="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {{ sort.direction === 'asc' ? '↑ 升序' : '↓ 降序' }}
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
import type { FilterRule } from '@/types';

const { chartConfig: config } = useChart();
const store = useDuckDBStore();

const isOpen = ref(false);
const columns = computed(() => store.columns);
const filters = computed(() => config.value.dataTransform.filters);
const sort = computed(() => config.value.dataTransform.sort);

function addFilter() {
  store.addFilterRule({
    column: columns.value[0] || '',
    operator: '=',
    value: '',
  });
}

function removeFilter(index: number) {
  store.removeFilterRule(index);
}

function updateFilter(index: number, rule: FilterRule) {
  store.updateFilterRule(index, rule);
}

function updateSortColumn(column: string) {
  if (!column) {
    store.updateDataTransform({ sort: null });
  } else {
    store.updateDataTransform({ sort: { column, direction: 'asc' } });
  }
}

function toggleSortDirection() {
  if (!sort.value) return;
  store.updateDataTransform({
    sort: { ...sort.value, direction: sort.value.direction === 'asc' ? 'desc' : 'asc' },
  });
}
</script>
