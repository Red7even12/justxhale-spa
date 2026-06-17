<!-- frontend-spa/src/components/widgets/DonutChartWidget.vue -->
<template>
  <div class="flex flex-col items-center w-full">
    <div class="relative w-32 h-32 mb-4">
      <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
        <!-- Background Circle -->
        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f3f4f6" stroke-width="4"></circle>
        
        <!-- Data Segments -->
        <circle 
          v-for="(seg, i) in segments" :key="i"
          cx="18" cy="18" r="15.9" 
          fill="transparent" 
          :stroke="colors[i % colors.length]" 
          stroke-width="4.1"
          :stroke-dasharray="`${seg.percent} 100`"
          :stroke-dashoffset="seg.offset"
          class="transition-all duration-1000 ease-in-out"
        ></circle>
      </svg>
      
      <!-- Center Label -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-lg font-black text-gray-800 leading-none">{{ total }}</span>
        <span class="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Total</span>
      </div>
    </div>

    <!-- Mini Legend -->
    <div class="w-full grid grid-cols-1 gap-1">
      <div v-for="(row, i) in data" :key="i" class="flex justify-between items-center text-[9px] px-2">
        <div class="flex items-center gap-1.5 truncate">
          <div class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: colors[i % colors.length] }"></div>
          <span class="text-gray-500 font-bold truncate">{{ row.label || 'n/a' }}</span>
        </div>
        <span class="text-gray-800 font-black ml-1">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ data: any[], config: any }>();

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const total = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return 0; // Guard against null/objects
  return props.data.reduce((sum, d) => sum + Number(d.value), 0);
});

const segments = computed(() => {
  if (!total.value) return [];
  let currentOffset = 0;
  return props.data.map(d => {
    const percent = (Number(d.value) / total.value) * 100;
    const offset = -currentOffset;
    currentOffset += percent;
    return { percent, offset };
  });
});

</script>