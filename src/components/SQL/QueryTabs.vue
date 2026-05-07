<!-- src/components/SQL/QueryTabs.vue -->
<template>
  <div>
    <!-- 标签栏 -->
    <div class="flex border-b border-gray-200 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
        :class="activeTab === tab.key ? 'tab-active' : 'tab-inactive'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 内容区 -->
    <QueryBuilder v-if="activeTab === 'visual'" />
    <SQLEditor v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QueryBuilder from './QueryBuilder.vue';
import SQLEditor from './SQLEditor.vue';

const tabs = [
  { key: 'visual' as const, label: '可视化查询' },
  { key: 'sql' as const, label: 'SQL 查询' },
];

const activeTab = ref<'visual' | 'sql'>('visual');
</script>
