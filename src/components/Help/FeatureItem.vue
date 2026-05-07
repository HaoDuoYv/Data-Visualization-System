<!-- src/components/Help/FeatureItem.vue -->
<template>
  <div class="p-3 bg-gray-50 rounded-lg border border-gray-100">
    <h4 class="text-sm font-medium text-gray-700 mb-1">{{ title }}</h4>
    <p class="text-xs text-gray-500 leading-relaxed">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>
