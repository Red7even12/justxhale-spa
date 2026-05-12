<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- Plan Details Section -->
      <div>
        <label for="plan_name" class="block text-sm font-medium text-gray-700">Plan Name</label>
        <input type="text" v-model="editablePlan.plan_name" id="plan_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" v-model="editablePlan.start_date" id="start_date" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700">End Date (Optional)</label>
          <input type="date" v-model="editablePlan.end_date" id="end_date" :min="editablePlan.start_date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div class="flex items-center">
        <input type="checkbox" v-model="editablePlan.is_default" id="is_default" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <label for="is_default" class="ml-2 block text-sm text-gray-900">Set as default plan</label>
      </div>
      <hr />

      <!-- Tiers Section -->
      <h3 class="text-lg font-semibold">Pricing Tiers</h3>
      <div v-for="(tier, index) in editablePlan.tiers" :key="index" class="p-4 border rounded-md space-y-2 relative">
        <button type="button" @click="removeTier(index)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium">Min Case Files</label>
            <input type="number" v-model.number="tier.min_case_files" required min="1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium">Max Case Files</label>
            <input type="number" v-model.number="tier.max_case_files" :min="tier.min_case_files" placeholder="No limit" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium">Rate per Case File</label>
            <input type="number" v-model.number="tier.rate_per_case_files" required min="0" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>
      </div>
      <button type="button" @click="addTier" class="w-full text-[#72958D] hover:text-[#0F2629] bg-[#EBF5F5] hover:bg-[#D2F1F1] border border-[#72958D] hover:border-[#455E5E] font-bold py-2 px-4 rounded">
        + Add Tier
      </button>

      <!-- Action Buttons -->
      <div class="flex justify-end pt-4 space-x-2">
         <button type="button" @click="$emit('close')" class="text-[#72958D] hover:text-[#0F2629] bg-[#EBF5F5] hover:bg-[#D2F1F1] border border-[#72958D] hover:border-[#455E5E] font-bold py-2 px-4 rounded">
            Cancel
        </button>
        <button type="submit" :disabled="isLoading" class="text-[#EBF5F5] hover:text-[#72958D] bg-[#72958D] hover:bg-[#ABE0E0] border border-[#71B6B1] hover:border-[#0F2629] font-bold py-2 px-4 rounded">
            {{ isEditing ? 'Save Changes' : 'Create Plan' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  plan: { type: Object, default: null },
  isLoading: Boolean,
});
const emit = defineEmits(['submit', 'close']);
const isEditing = computed(() => !!props.plan);

const createFreshPlan = () => ({
  plan_name: '',
  is_default: false,
  start_date: new Date().toISOString().slice(0, 10), // Default to today
  end_date: null,
  tiers: [{ min_case_files: 1, max_case_files: null, rate_per_case_files: 0 }]
});

// Helper to convert object keys from camelCase to snake_case
const convertKeysToSnakeCase = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      // Special handling for 'pricingTiers' to become 'tiers'
      if (snakeKey === 'pricing_tiers') {
        snakeKey = 'tiers';
      }
      newObj[snakeKey] = convertKeysToSnakeCase(obj[key]);
    }
  }
  return newObj;
};

const editablePlan = ref(createFreshPlan());

watch(() => props.plan, (newPlan) => {
  editablePlan.value = newPlan ? convertKeysToSnakeCase(JSON.parse(JSON.stringify(newPlan))) : createFreshPlan();
}, { immediate: true });

const addTier = () => {
  const lastTier = editablePlan.value.tiers[editablePlan.value.tiers.length - 1];
  const newMin = (lastTier && lastTier.max_case_files) ? lastTier.max_case_files + 1 : 1;
  editablePlan.value.tiers.push({ min_case_files: newMin, max_case_files: null, rate_per_case_files: 0 });
};
const removeTier = (index) => {
  if(editablePlan.value.tiers.length > 1) {
    editablePlan.value.tiers.splice(index, 1);
  } else { alert("A plan must have at least one tier."); }
};
const handleSubmit = () => {
  const camelCasePlan = convertKeysToCamelCase(editablePlan.value);
  emit('submit', camelCasePlan);
};

// Helper to convert object keys from snake_case to camelCase
const convertKeysToCamelCase = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = convertKeysToCamelCase(obj[key]);
    }
  }
  return newObj;
};
</script>