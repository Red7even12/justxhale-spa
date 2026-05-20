<template>
  <div class="p-6">
    <h2 class="text-lg font-bold mb-4">Select Contact Person</h2>

    <div class="grid grid-cols-1 gap-y-4">
      <div>
        <label for="company_id" class="form-label">Company</label>
        <select id="company_id" v-model="selectedCompanyId" class="form-select">
          <option disabled value="">Please select a company</option>
          <option v-for="company in companyList" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="contact_person_id" class="form-label">Contact Person</label>
        <select id="contact_person_id" v-model="selectedContactId" class="form-select" :disabled="!selectedCompanyId || contactPersonList.length === 0">
          <option v-if="contactPersonList.length > 0" value="">Select a contact</option>
          <option v-else-if="selectedCompanyId" value="">No contacts available</option>
          <option v-else value="">Select a company first</option>
          <option v-for="contact in contactPersonList" :key="contact.id" :value="contact.id">
            {{ contact.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <button @click="$emit('close')" type="button" class="btn-secondary mr-2">Cancel</button>
      <button @click="selectContact" type="button" class="btn-primary" :disabled="!selectedContactId">Select</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import companyService from '@/services/companyService';

const props = defineProps({
  initialCompanyId: {
    type: [Number, String],
    default: ''
  }
});

const emit = defineEmits(['contact-selected', 'close']);

const companyList = ref([]);
const contactPersonList = ref([]);
const selectedCompanyId = ref('');
const selectedContactId = ref('');

const fetchCompanyList = async () => {
  try {
    const response = await companyService.getCompanies();
    companyList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
  }
};

const fetchContactPersons = async (companyId) => {
  if (!companyId) return;
  try {
    const response = await companyService.getContacts(companyId);
    contactPersonList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch contact persons:", error);
    contactPersonList.value = [];
  }
};

watch(selectedCompanyId, (newCompanyId) => {
  selectedContactId.value = '';
  contactPersonList.value = [];
  if (newCompanyId) {
    fetchContactPersons(newCompanyId);
  }
});

const selectContact = () => {
  if (selectedContactId.value) {
    emit('contact-selected', selectedContactId.value);
    emit('close');
  }
};

onMounted(async () => {
  await fetchCompanyList();
  if (props.initialCompanyId) {
    selectedCompanyId.value = props.initialCompanyId;
  }
});
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>
