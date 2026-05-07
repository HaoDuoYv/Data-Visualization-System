<!-- src/components/Help/CodeExample.vue -->
<template>
  <div class="rounded-lg border border-gray-100 overflow-hidden">
    <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
      <span class="text-xs font-medium text-gray-500">{{ title }}</span>
    </div>
    <pre class="p-3 text-xs font-mono text-gray-600 bg-white overflow-x-auto"><code><slot /></code></pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
