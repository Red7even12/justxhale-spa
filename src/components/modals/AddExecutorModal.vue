<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    
    <!-- Backdrop -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <!-- Modal Panel -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ isEditMode ? 'Edit Executor' : 'Add New Executor' }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ isEditMode ? 'Edit the details of the executor.' : 'Enter the details of the individual acting as Executor. They will be linked to this Estate.' }}
              </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="saveExecutor" class="mt-4 space-y-4">
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" v-model="form.firstName" id="first_name" required 
                         class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
                </div>
                <div>
                  <label for="last_name" class="block text-sm font-medium text-gray-700">Surname</label>
                  <input type="text" v-model="form.lastName" id="last_name" required 
                         class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" v-model="form.email" id="email" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
              </div>

              <div>
                <label for="cell_number" class="block text-sm font-medium text-gray-700">Cell / Mobile Number</label>
                <input type="text" v-model="form.cellNumber" id="cell_number" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
                </div>

 
              <div>
                <label for="country_dialing_code" class="block text-sm font-medium text-gray-700">Country Code</label>
                <input type="text" v-model="form.countryDialingCode" id="country_dialing_code" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
              </div>
              

              <div>
                <label for="alternative_cell_number" class="block text-sm font-medium text-gray-700">Alternative Cell Number</label>
                <input type="text" v-model="form.alternativeCellNumber" id="alternative_cell_number" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
              </div> 
              
               <div>
                <label for="landline" class="block text-sm font-medium text-gray-700">Landline</label>
                <input type="text" v-model="form.landline" id="landline" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
              </div>              

               <div>
                <label for="id_number" class="block text-sm font-medium text-gray-700">ID Number</label>
                <input type="text" v-model="form.idNumber" id="id_number" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
              </div>   

               <div>
                <label for="citizenship_country_id" class="block text-sm font-medium text-gray-700">Citizenship Country</label>
                <select v-model="form.citizenshipCountryId" id="citizenship_country_id" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
                  <option :value="null">Select a country</option>
                  <option v-for="country in countryList" :key="country.id" :value="country.id">{{ country.name }}</option>
                </select>
              </div>  

               <div>
                <label for="tax_number" class="block text-sm font-medium text-gray-700">Tax Number</label>
                <input type="text" v-model="form.taxNumber" id="tax_number" 
                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--c-primary-action)] focus:border-[var(--c-primary-action)] sm:text-sm">
              </div>  



              <!-- Error Message -->
              <div v-if="error" class="text-red-600 text-sm mt-2">
                {{ error }}
              </div>

              <!-- Action Buttons -->
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button type="submit" :disabled="isSaving"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[var(--c-primary-button-bg)] text-base font-medium text-[var(--c-primary-button-text)] hover:bg-[var(--c-primary-button-hover-bg)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--c-primary-button-border)] sm:ml-3 sm:w-auto sm:text-sm">
                  {{ isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Executor') }}
                </button>
                <button type="button" @click="$emit('close')"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--c-primary-action)] sm:mt-0 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, watch } from 'vue'; // Added computed, watch
import apiClient from '@/services/api';
import referenceDataService from '@/services/referenceDataService'; // Import referenceDataService

const props = defineProps({
  teamId: {
    type: [Number, String],
    required: false,
    default: null
  },
  executor: { // New prop for existing executor data
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'executor-saved']); // Changed event name

const isSaving = ref(false);
const error = ref(null);
const countryList = ref([]); // New ref for country list

const form = reactive({
  id: null, // Add id to form for editing
  firstName: '',
  lastName: '',
  email: '',
  cellNumber: '',
  countryDialingCode: '',
  alternativeCellNumber: '',
  landline: '',
  idNumber: '',
  citizenshipCountryId: null,
  taxNumber: ''
});

// Computed property to determine if in edit mode
const isEditMode = computed(() => !!form.id);

// Function to convert snake_case keys to camelCase
const convertToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertToCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = convertToCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// Function to populate the form (for edit mode)
const populateForm = (data) => {
  const camelCaseData = convertToCamelCase(data);
  form.id = camelCaseData.id;
  
  // Split the 'name' field from the database into firstName and lastName
  const fullName = camelCaseData.name || '';
  const nameParts = fullName.split(' ');
  form.firstName = nameParts.shift() || ''; // First part is firstName
  form.lastName = nameParts.join(' ') || ''; // Remaining parts are lastName
  
  form.email = camelCaseData.email || '';
  form.cellNumber = camelCaseData.cellNumber || '';
  form.countryDialingCode = camelCaseData.countryDialingCode || '';
  form.alternativeCellNumber = camelCaseData.alternativeCellNumber || '';
  form.landline = camelCaseData.landline || '';
  form.idNumber = camelCaseData.idNumber || '';
  form.citizenshipCountryId = camelCaseData.citizenshipCountryId || null;
  form.taxNumber = camelCaseData.taxNumber || '';
};

// Function to reset the form (for add mode)
const resetForm = () => {
  form.id = null;
  form.firstName = '';
  form.lastName = '';
  form.email = '';
  form.cellNumber = '';
  form.countryDialingCode = '';
  form.alternativeCellNumber = '';
  form.landline = '';
  form.idNumber = '';
  form.citizenshipCountryId = null;
  form.taxNumber = '';
};

// Watch for changes in the executor prop to populate the form
watch(() => props.executor, (newExecutor) => {
  if (newExecutor) {
    populateForm(newExecutor);
  } else {
    resetForm();
  }
}, { immediate: true }); // Immediate to run on initial mount if prop is present

// Fetch countries on component mount
onMounted(async () => {
  try {
    const response = await referenceDataService.getCountries();
    countryList.value = response.data;
  } catch (err) {
    console.error("Failed to fetch countries:", err);
  }
});

const saveExecutor = async () => {
  // Validate that a team is selected before saving (only for new creation)
  if (!isEditMode.value && !props.teamId) { // Only validate teamId if not in edit mode
    error.value = "Please select an 'Assigned Team' on the main form before adding an executor.";
    return;
  }

  isSaving.value = true;
  error.value = null;

  try {
    const payload = {
      name: `${form.firstName} ${form.lastName}`.trim(), // Combine firstName and lastName into a single name field
      email: form.email,
      cell_number: form.cellNumber,
      country_dialing_code: form.countryDialingCode,
      alternative_cell_number: form.alternativeCellNumber,  
      landline: form.landline,
      id_number: form.idNumber,
      citizenship_country_id: form.citizenshipCountryId,
      tax_number: form.taxNumber,
      team_id: props.teamId // Send the Team ID to the backend
    };

    let response;
    if (isEditMode.value) {
      // Ensure the 'name' field is added to the payload for PUT request as well
      response = await apiClient.put(`/contacts/${form.id}`, payload); // Use PUT for update
    } else {
      response = await apiClient.post('/contacts/executor', payload); // Use POST for create
    }
    
    emit('executor-saved', response.data); // Emit executor-saved
    emit('close');

  } catch (err) {
    console.error('Failed to save executor:', err);
    error.value = err.response?.data?.message || 'Failed to save executor.';
  } finally {
    isSaving.value = false;
  }
};
</script>