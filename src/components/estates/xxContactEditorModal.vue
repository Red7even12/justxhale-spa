<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4 capitalize">Edit {{ role }} Details</h2>
    
    <!-- Company Dropdown -->
    <div>
      <label class="form-label">Company</label>
      <select v-model="selectedCompanyId" class="form-select">
        <option disabled value="">Select a Company</option>
        <option v-for="company in companyList" :key="company.id" :value="company.id">
          {{ company.name }}
        </option>
      </select>
    </div>
    
    <!-- Contact Dropdown -->
    <div class="mt-4">
      <label class="form-label">Contact Person</label>
      <select v-model="selectedContactId" class="form-select" :disabled="!selectedCompanyId || isLoadingContacts">
        <option v-if="isLoadingContacts" value="">Loading contacts...</option>
        <option v-else-if="!selectedCompanyId" value="">Select a company first</option>
        <option v-else disabled value="">Select a Contact</option>
        <option v-for="contact in contactList" :key="contact.id" :value="contact.id">
          {{ contact.name }}
        </option>
      </select>
    </div>

    <div class="mt-6 flex justify-end">
      <button @click="$emit('close')" type="button" class="btn-secondary mr-2">Cancel</button>
      <button @click="saveSelection" type="button" class="btn-primary" :disabled="!selectedContactId">Save</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import companyService from '@/services/companyService';

const props = defineProps({
  role: { type: String, required: true },
  initialCompanyId: { type: [String, Number], default: '' },
  initialContactId: { type: [String, Number], default: '' },
});
const emit = defineEmits(['contact-saved', 'close']);

const companyList = ref([]);
const contactList = ref([]);
const selectedCompanyId = ref(props.initialCompanyId);
const selectedContactId = ref(props.initialContactId);
const isLoadingContacts = ref(false);

// Function to fetch contacts for a given company
const fetchContactsForCompany = async (companyId) => {
  if (!companyId) {
    contactList.value = [];
    return;
  }
  isLoadingContacts.value = true;
  try {
    const response = await companyService.getContacts(companyId);
    contactList.value = response.data;
  } catch (error) {
    console.error(`Failed to fetch contacts for company ${companyId}:`, error);
    contactList.value = [];
  } finally {
    isLoadingContacts.value = false;
  }
};

// Watch for changes in the selected company and fetch new contacts
watch(selectedCompanyId, (newId, oldId) => {
  if (newId !== oldId) {
    selectedContactId.value = ''; // Reset contact selection when company changes
  }
  fetchContactsForCompany(newId);
});

const saveSelection = () => {
  const selectedContact = contactList.value.find(c => c.id === selectedContactId.value);
  if (!selectedContact) return; // Should not happen if button is enabled

  emit('contact-saved', {
    role: props.role,
    companyId: selectedCompanyId.value,
    contactId: selectedContactId.value,
    contactName: selectedContact.name,
  });
};

onMounted(async () => {
  // Load the company list when the modal is mounted
  try {
    const companyResponse = await companyService.getCompanies();
    companyList.value = companyResponse.data;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
  }
  
  // If an initial company is set, fetch its contacts
  if (selectedCompanyId.value) {
    await fetchContactsForCompany(selectedCompanyId.value);
  }
});
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>