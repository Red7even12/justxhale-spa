<template>
  <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Filter Estates</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="filter_surname" class="form-label">Deceased Surname</label>
        <input id="filter_surname" v-model="localFilters.surname" type="text" class="form-input" />
      </div>
      <div>
        <label for="filter_names" class="form-label">Deceased First Names</label>
        <input id="filter_names" v-model="localFilters.names" type="text" class="form-input" />
      </div>
      <div>
        <label for="filter_deceased_id_number" class="form-label">Deceased ID Number</label>
        <input id="filter_deceased_id_number" v-model="localFilters.deceasedIdNumber" type="text" class="form-input" />
      </div>
      <div>
        <label for="filter_de_tax_number_pre" class="form-label">Deceased Estate Tax No (Pre)</label>
        <input id="filter_de_tax_number_pre" v-model="localFilters.deTaxNumberPre" type="text" class="form-input" />
      </div>
      <div>
        <label for="filter_de_tax_number_post" class="form-label">Deceased Estate Tax No (Post)</label>
        <input id="filter_de_tax_number_post" v-model="localFilters.deTaxNumberPost" type="text" class="form-input" />
      </div>
      <div>
        <label for="filter_loe_loa" class="form-label">LOE/LOA Number</label>
        <input id="filter_loe_loa" v-model="localFilters.loeLoa" type="text" class="form-input" />
      </div>
      <div>
        <label for="filter_date_of_death" class="form-label">Date of Death</label>
        <input id="filter_date_of_death" v-model="localFilters.dateOfDeath" type="date" class="form-input" />
      </div>
      <div>
        <label for="filter_attorney" class="form-label">Attorney Company</label>
        <input id="filter_attorney" v-model="localFilters.attorney" type="text" class="form-input" placeholder="Search Attorney..." />
      </div>
    </div>
    <div class="mt-4 flex justify-end space-x-2">
      <button @click="applyFilters" class="btn-primary">Apply Filters</button>
      <button @click="clearFilters" class="btn-secondary">Clear Filters</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'apply-filters', 'clear-filters']);

// Create a local copy of the filters to allow immediate input without
// triggering a full fetch on every keystroke.
const localFilters = ref({ ...props.modelValue });

// Watch for external changes to modelValue (e.g., from parent clearing filters)
watch(() => props.modelValue, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

const applyFilters = () => {
  emit('update:modelValue', localFilters.value);
  emit('apply-filters'); // Optional: for parent to explicitly trigger fetch
};

const clearFilters = () => {
  const cleared = {
    surname: '',
    names: '',
    deceasedIdNumber: '',
    deTaxNumberPre: '',
    deTaxNumberPost: '',
    loeLoa: '',
    dateOfDeath: '',
    attorney: '',
  };
  localFilters.value = cleared;
  emit('update:modelValue', cleared);
  emit('clear-filters'); // Optional: for parent to explicitly trigger fetch
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input, .form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
.btn-primary { @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500; }
.btn-secondary { @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500; }
</style>
