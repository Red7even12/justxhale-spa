<template>
    <!-- frontend-spa/src/components/common/ContactPersonSelector.vue  -->
  <div>
 
    <div class="space-y-4">
      <!-- Company Dropdown -->

        <div class="flex items-center justify-between mb-1">
          <label for="company-select" class="form-label">Company</label>
                 <button 
            @click="fetchCompanies" 
            :disabled="isFetchingCompanies"
            type="button"
            class="text-sm font-medium text-brand-blue-600 hover:text-brand-blue-800 focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <!-- Use a ternary operator to change the text during the loading state -->
            {{ isFetchingCompanies ? 'Refreshing...' : 'Refresh List' }}
          </button>
          <!-- === END: REPLACEMENT CODE === -->
        </div>
        <select id="company-select" v-model="selectedCompanyId" class="form-select">
          <option :value="null" disabled>-- Select a company --</option>
          <option v-for="company in companyList" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>
      </div>

      <!-- Contact Person Dropdown -->
      <div v-if="selectedCompanyId">
        <label for="contact-person-select" class="form-label">Contact Person</label>
        <div v-if="isLoadingContacts" class="text-sm text-gray-500">Loading contacts...</div>
        <div v-else-if="contactList.length === 0" class="text-sm text-gray-500">No contacts found for this company.</div>
        <select v-else id="contact-person-select" v-model="selectedContactId" class="form-select">
          <option :value="null" disabled>-- Select a contact --</option>
          <option v-for="contact in contactList" :key="contact.id" :value="contact.id">
            {{ contact.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="mt-6 flex justify-between items-center pt-4 border-t">
      <!-- Left side: The new Edit shortcut -->
      <div>
        <!-- "Create New Company" button -->
        <router-link
          :to="{ name: 'companies.create' }"
          target="_blank"
          class="btn-secondary text-sm"
        >
          Create New Company
        </router-link>
        <router-link
          v-if="selectedCompanyId"
          :to="{ name: 'companies.edit', params: { id: selectedCompanyId } }"
          target="_blank"
          class="btn-secondary text-sm"
        >
          Edit Selected Company
        </router-link>
      </div>

      <!-- Right side: Existing action buttons -->
      <div class="flex space-x-3">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">Cancel</button>
        <button 
          type="button" 
          @click="handleSelect" 
          class="btn-primary" 
          :disabled="!selectedContactId"
        >
          Select Contact
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import companyService from '@/services/companyService';
import contactPersonService from '@/services/contactPersonService'; // We will need this for a more robust contact fetch

const props = defineProps({
  role: { type: String, required: true },
});

const emit = defineEmits(['contact-selected', 'cancel']);

const companyList = ref([]);
const contactList = ref([]);
const selectedCompanyId = ref(null);
const selectedContactId = ref(null);
const isLoadingContacts = ref(false);
const isFetchingCompanies = ref(false);

// No changes to capitalize function
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// --- START: CORRECTED fetchCompanies FUNCTION ---
const fetchCompanies = async () => {
  isFetchingCompanies.value = true;
  try {
    const roleForApi = props.role === 'attorney_poa' ? 'attorney' : props.role;
    const capitalizedRole = capitalize(roleForApi);
    
    // 1. THE FIX: Pass a filter object to the service, and get ALL companies
    const response = await companyService.getCompanies({ 
      type: capitalizedRole, 
      per_page: -1 // -1 is a common convention to request all records
    }); 
    
    // 2. THE FIX: The actual list of companies is in response.data.data
    companyList.value = response.data.data;

    if (selectedCompanyId.value) {
      await fetchContactsForCompany(selectedCompanyId.value);
    }
  } catch (error) {
    console.error(`Failed to fetch companies for role ${props.role}:`, error);
  } finally {
    isFetchingCompanies.value = false;
  }
};
// --- END: CORRECTED fetchCompanies FUNCTION ---


// Renamed and corrected for clarity and robustness
const fetchContactsForCompany = async (companyId) => {
  isLoadingContacts.value = true;
  try {
    // It's more robust to fetch a company's contacts via a dedicated endpoint or relation
    // Let's assume getCompany returns the necessary data
    const response = await companyService.getCompany(companyId);
    // A single resource is wrapped in `data`. The camelCase middleware handles `contactPersons`.
    contactList.value = response.data.contactPersons || []; 
  } catch (error) {
    console.error(`Failed to fetch contacts for company ${companyId}:`, error);
  } finally {
    isLoadingContacts.value = false;
  }
};

// --- LIFECYCLE HOOKS and WATCHERS ---
onMounted(fetchCompanies);

watch(selectedCompanyId, async (newCompanyId) => {
  contactList.value = [];
  selectedContactId.value = null;
  if (newCompanyId) {
    await fetchContactsForCompany(newCompanyId);
  }
});

// No changes to handleSelect
const handleSelect = () => {
  const selectedCompany = companyList.value.find(c => c.id === selectedCompanyId.value);
  const selectedContact = contactList.value.find(c => c.id === selectedContactId.value);

  if (selectedCompany && selectedContact) {
    emit('contact-selected', {
      role: props.role,
      companyId: selectedCompany.id,
      contactId: selectedContact.id,
      contactName: selectedContact.name,
    });
  }
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>
