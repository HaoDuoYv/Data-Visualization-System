<!-- src/views/QueryView.vue -->
<template>
  <div style="height: calc(100vh - 49px)" class="flex flex-col">
    <!-- 顶部：列选择工具栏 -->
    <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
      <span class="text-xs text-gray-500">数据表：</span>
      <select
        v-model="selectedTable"
        class="px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-primary-400"
      >
        <option value="" disabled>选择表</option>
        <option v-for="t in tables" :key="t" :value="t">{{ t }}</option>
      </select>
      <span class="text-xs text-gray-400 ml-auto">{{ tables.length }} 张表</span>
    </div>

    <div class="flex-1 overflow-hidden flex flex-col p-4">
      <div class="max-w-5xl mx-auto w-full flex-1 overflow-y-auto space-y-4">
        <!-- 查询区域 -->
        <div class="glass-card p-4">
          <QueryTabs />
        </div>

        <!-- 查询结果（可折叠） -->
        <QueryResults />

        <!-- 图表 -->
        <ChartPanel v-if="resultCount > 0" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import QueryTabs from '@/components/SQL/QueryTabs.vue';
import QueryResults from '@/components/Results/QueryResults.vue';
import ChartPanel from '@/components/Chart/ChartPanel.vue';

const store = useDuckDBStore();
const { isInitialized, initialize } = useDuckDB();

const tables = computed(() => store.tables);
const resultCount = computed(() => store.resultCount);

onMounted(async () => {
  if (!isInitialized.value) {
    await initialize();
  }
});
</script>
