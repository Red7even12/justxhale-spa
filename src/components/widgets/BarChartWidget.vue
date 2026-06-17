<!-- frontend-spa/src/components/widgets/BarChartWidget.vue -->
<template>
  <div class="w-full space-y-4">
    <div v-for="row in data" :key="row.label" class="group">
      <div class="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
        <span class="truncate pr-2">{{ row.label || 'Unassigned' }}</span>
        <span class="text-blue-600">{{ row.value }}</span>
      </div>
      <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          class="bg-blue-500 h-full transition-all duration-700 ease-out" 
          :style="{ width: getPercentage(row.value) + '%' }"
        ></div>
      </div>
    </div>
    
    <!-- Empty State for Widget -->
    <div v-if="!data || data.length === 0" class="text-center py-4 text-gray-300 text-[10px] font-bold uppercase">
      No Data Found
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ data: any[], config: any }>();

const getPercentage = (val: any) => {
  if (!props.data || props.data.length === 0) return 0;
  // Use Math.max to find the highest value in the set to scale the bars
  const max = Math.max(...props.data.map(d => Number(d.value)));
  if (max === 0) return 0;
  
  // Return percentage, but ensure at least 2% is visible if value > 0
  const percent = (Number(val) / max) * 100;
  return percent > 0 ? Math.max(percent, 2) : 0;
};

const total = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return 0; // Guard against null/objects
  return props.data.reduce((sum, d) => sum + Number(d.value), 0);
});

</script>