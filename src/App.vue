<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-surface">
    <!-- 全局导航 -->
    <header class="glass-header sticky top-0 z-50">
      <div class="flex items-center justify-between px-4 py-2.5">
        <div class="flex items-center gap-4">
          <router-link to="/" class="flex items-center gap-2 no-underline">
            <div class="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="text-base font-bold text-primary-900">FlexViz Lite</span>
          </router-link>
          <nav class="flex items-center gap-1">
            <router-link
              to="/"
              class="nav-link"
              :class="$route.path === '/' ? 'nav-link-active' : 'nav-link-inactive'"
            >
              数据管理
            </router-link>
            <router-link
              to="/query"
              class="nav-link"
              :class="$route.path === '/query' ? 'nav-link-active' : 'nav-link-inactive'"
            >
              数据查询
            </router-link>
            <router-link
              to="/dashboard"
              class="nav-link"
              :class="$route.path === '/dashboard' ? 'nav-link-active' : 'nav-link-inactive'"
            >
              仪表盘
            </router-link>
          </nav>
        </div>
        <button
          @click="showHelp = true"
          class="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
        >
          使用说明
        </button>
      </div>
    </header>

    <!-- 页面内容 -->
    <router-view />

    <!-- 使用说明模态框 -->
    <HelpModal :visible="showHelp" @close="showHelp = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HelpModal from '@/components/Help/HelpModal.vue';

const showHelp = ref(false);
</script>
