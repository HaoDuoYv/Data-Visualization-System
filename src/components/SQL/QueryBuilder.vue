<!-- src/components/SQL/QueryBuilder.vue -->
<template>
  <div class="glass-card p-4">
    <div class="flex items-center gap-2 mb-3">
      <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
      <h3 class="text-sm font-semibold text-gray-700">可视化查询</h3>
    </div>

    <!-- 表选择 + 列选择 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">数据表</label>
        <select
          v-model="selectedTable"
          @change="handleTableChange"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white
                 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
        >
          <option value="" disabled>选择数据表</option>
          <option v-for="t in availableTables" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">返回行数</label>
        <input
          v-model.number="limit"
          type="number"
          min="1"
          max="10000"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-colors"
        />
      </div>
    </div>

    <!-- 列选择 -->
    <div v-if="tableColumns.length > 0" class="mb-3">
      <label class="block text-xs font-medium text-gray-500 mb-1.5">选择列</label>
      <div class="flex flex-wrap gap-1.5">
        <label
          v-for="col in tableColumns"
          :key="col.name"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all"
          :class="selectedColumns.includes(col.name) ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'"
        >
          <input
            type="checkbox"
            :value="col.name"
            v-model="selectedColumns"
            class="rounded border-gray-300 text-primary-500 focus:ring-primary-500/30"
          />
          {{ col.name }}
          <span class="text-gray-400">{{ col.type === 'numeric' ? '#' : 'Aa' }}</span>
        </label>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div v-if="tableColumns.length > 0" class="mb-3">
      <label class="block text-xs font-medium text-gray-500 mb-1.5">筛选条件</label>
      <div v-for="(rule, i) in filters" :key="i" class="flex gap-1.5 mb-1.5 items-center">
        <select
          v-model="rule.column"
          class="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option v-for="col in tableColumns" :key="col.name" :value="col.name">{{ col.name }}</option>
        </select>
        <select
          v-model="rule.operator"
          class="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value=">">></option>
          <option value="<"><</option>
          <option value=">=">>=</option>
          <option value="<="><=</option>
          <option value="contains">包含</option>
          <option value="is_null">为空</option>
          <option value="is_not_null">不为空</option>
        </select>
        <input
          v-if="!['is_null', 'is_not_null'].includes(rule.operator)"
          v-model="rule.value"
          placeholder="值"
          class="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <button
          @click="filters.splice(i, 1)"
          class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <button
        @click="filters.push({ column: tableColumns[0]?.name || '', operator: '=', value: '' })"
        class="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        添加条件
      </button>
    </div>

    <!-- 排序 -->
    <div v-if="tableColumns.length > 0" class="mb-4">
      <label class="block text-xs font-medium text-gray-500 mb-1.5">排序</label>
      <div class="flex gap-2 items-center">
        <select
          v-model="sortColumn"
          class="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="">不排序</option>
          <option v-for="col in tableColumns" :key="col.name" :value="col.name">{{ col.name }}</option>
        </select>
        <button
          v-if="sortColumn"
          @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
          class="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {{ sortDirection === 'asc' ? '↑ 升序' : '↓ 降序' }}
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedTable" class="flex items-center gap-3">
      <button
        @click="handleExecute"
        :disabled="selectedColumns.length === 0"
        class="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600
               disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        执行查询
      </button>
      <button
        @click="showSQL = !showSQL"
        class="px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {{ showSQL ? '隐藏 SQL' : '查看 SQL' }}
      </button>
    </div>

    <!-- 生成的 SQL 预览 -->
    <div v-if="showSQL && selectedTable" class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <pre class="text-xs font-mono text-gray-600 whitespace-pre-wrap">{{ generatedSQL }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDuckDB } from '@/composables/useDuckDB';
import { useDuckDBStore } from '@/stores/duckdb';
import type { ColumnMeta } from '@/types';

const { query } = useDuckDB();
const store = useDuckDBStore();

const selectedTable = ref('');
const tableColumns = ref<ColumnMeta[]>([]);
const selectedColumns = ref<string[]>([]);
const filters = ref<{ column: string; operator: string; value: string }[]>([]);
const sortColumn = ref('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const limit = ref(100);
const showSQL = ref(false);

const availableTables = computed(() => store.tables);

async function handleTableChange() {
  tableColumns.value = [];
  selectedColumns.value = [];
  filters.value = [];
  sortColumn.value = '';
  if (!selectedTable.value) return;

  const results = await query(`SELECT * FROM "${selectedTable.value}" LIMIT 5`);
  if (!results || results.length === 0) return;

  const firstRow = results[0]!;
  tableColumns.value = Object.keys(firstRow).map(key => ({
    name: key,
    type: typeof firstRow[key] === 'number' ? 'numeric' as const : 'string' as const,
  }));
  selectedColumns.value = Object.keys(firstRow);
}

function buildSQL(): string {
  const cols = selectedColumns.value.length > 0
    ? selectedColumns.value.map(c => `"${c}"`).join(', ')
    : '*';
  let sql = `SELECT ${cols} FROM "${selectedTable.value}"`;

  const whereClauses: string[] = [];
  for (const rule of filters.value) {
    if (!rule.column) continue;
    const col = `"${rule.column}"`;
    switch (rule.operator) {
      case '=': whereClauses.push(`${col} = '${rule.value}'`); break;
      case '!=': whereClauses.push(`${col} != '${rule.value}'`); break;
      case '>': whereClauses.push(`${col} > '${rule.value}'`); break;
      case '<': whereClauses.push(`${col} < '${rule.value}'`); break;
      case '>=': whereClauses.push(`${col} >= '${rule.value}'`); break;
      case '<=': whereClauses.push(`${col} <= '${rule.value}'`); break;
      case 'contains': whereClauses.push(`${col} LIKE '%${rule.value}%'`); break;
      case 'is_null': whereClauses.push(`${col} IS NULL`); break;
      case 'is_not_null': whereClauses.push(`${col} IS NOT NULL`); break;
    }
  }
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  if (sortColumn.value) {
    sql += ` ORDER BY "${sortColumn.value}" ${sortDirection.value}`;
  }

  sql += ` LIMIT ${limit.value}`;
  return sql;
}

const generatedSQL = computed(() => buildSQL());

async function handleExecute() {
  const sql = buildSQL();
  const results = await query(sql);
  if (results) {
    store.setQueryResults(results);
    store.setCurrentQuery(sql);
  }
}
</script>
