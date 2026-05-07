<!-- src/components/DataImport/TableList.vue -->
<template>
  <div class="glass-card p-4">
    <div class="flex items-center gap-2 mb-3">
      <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
      <h3 class="text-sm font-semibold text-gray-700">已导入数据表</h3>
    </div>

    <div v-if="tables.length === 0" class="text-xs text-gray-400 text-center py-6">
      <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
      暂无数据表，请导入文件
    </div>

    <div v-else class="space-y-1">
      <div
        v-for="table in tables"
        :key="table.name"
        class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all"
        :class="activeTable === table.name
          ? 'bg-primary-50 border border-primary-200'
          : 'hover:bg-gray-50 border border-transparent'"
        @click="handleSelect(table.name)"
      >
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate" :class="activeTable === table.name ? 'text-primary-700' : 'text-gray-700'">
            {{ table.name }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">
            {{ table.rowCount }} 行 · {{ table.columnCount }} 列
          </div>
        </div>
        <button
          @click.stop="handleDelete(table.name)"
          class="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
          title="删除表"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDuckDBStore } from '@/stores/duckdb';
import { useDuckDB } from '@/composables/useDuckDB';
import { deleteCSV } from '@/core/dataStore';

const store = useDuckDBStore();
const { query } = useDuckDB();

const tables = computed(() => store.tables.map(name => {
  const meta = store.tableMeta[name];
  return {
    name,
    rowCount: meta?.rowCount ?? 0,
    columnCount: meta?.columns?.length ?? 0,
  };
}));

const activeTable = computed(() => store.previewTableName);

const emit = defineEmits<{
  (e: 'select', tableName: string): void;
}>();

async function handleSelect(tableName: string) {
  const results = await query(`SELECT * FROM "${tableName}" LIMIT 100`);
  if (results) {
    const columns = Object.keys(results[0] || {});
    const columnTypes = columns.map(col => {
      const val = results[0]?.[col];
      const type = typeof val === 'number' ? 'numeric' : 'string';
      return { name: col, type };
    });
    store.setPreviewData(results, columnTypes, tableName, results.length);
  }
  emit('select', tableName);
}

async function handleDelete(tableName: string) {
  try {
    await query(`DROP TABLE IF EXISTS "${tableName}"`);
    await deleteCSV(tableName);
    store.removeTable(tableName);
  } catch (e) {
    console.error('Delete table error:', e);
  }
}
</script>
