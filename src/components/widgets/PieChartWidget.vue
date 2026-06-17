<template>
  <div class="flex flex-col items-center w-full">
    <!-- SVG PIE CONTAINER -->
    <div class="relative w-32 h-32 mb-4">
      <!-- 
        1. Added overflow-hidden and rounded-full to the SVG 
        2. Adjusted viewBox to 32 32 for cleaner math
      -->
      <svg viewBox="0 0 32 32" class="w-full h-full transform -rotate-90 rounded-full overflow-hidden">
        <!-- Background Plate -->
        <circle cx="16" cy="16" r="16" fill="#f3f4f6"></circle>
        
        <!-- 
          DATA SEGMENTS 
          Radius is 8, so Circumference is ~50.26
          Stroke-width is 16, which fills from center (0) to edge (16)
        -->
        <circle 
          v-for="(seg, i) in segments" :key="i"
          cx="16" cy="16" r="8" 
          fill="none" 
          :stroke="colors[i % colors.length]" 
          stroke-width="16" 
          :stroke-dasharray="`${seg.dash} 50.26`"
          :stroke-dashoffset="seg.offset"
          class="transition-all duration-1000 ease-in-out"
        ></circle>
      </svg>

      <!-- Center Total Label -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="bg-white/90 px-2 py-0.5 rounded text-[10px] font-black shadow-sm border border-white/50 text-gray-800">
            {{ total }} TOTAL
          </span>
      </div>
    </div>

    <!-- LEGEND -->
    <div class="w-full grid grid-cols-1 gap-1 px-2">
      <div v-for="(row, i) in data" :key="i" class="flex justify-between items-center text-[9px]">
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

const props = defineProps<{ 
    data: any[], 
    config: any 
}>();

const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

const total = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return 0;
  return props.data.reduce((sum, d) => sum + Number(d.value), 0);
});

const segments = computed(() => {
  if (!total.value) return [];
  
  // The circumference for a circle with r=8 is exactly 50.265
  const circumference = 50.265;
  let currentOffset = 0;
  
  return props.data.map(d => {
    const val = Number(d.value);
    const ratio = val / total.value;
    const dash = ratio * circumference;
    const offset = -currentOffset;
    
    currentOffset += dash;
    return { dash, offset };
  });
});
</script>

// 1.  **The Magic Radius (`15.915`):** In SVG, $Circumference = 2 * \pi * r$. If you want $Circumference = 100$, then $r = 100 / (2 * \pi) \approx 15.915$.
// 2.  **Stroke-Width (`31.83`):** By setting the `stroke-width` to double the radius, the "line" is so thick that it meets in the center of the circle, turning a "ring" into a "slice."
// 3.  **Consistency:** Since the math is now identical to your working Donut chart, the `currentOffset` and `percent` values will correctly position the slices without them overlapping or disappearing.