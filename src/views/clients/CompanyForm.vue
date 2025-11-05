<template>
  <!-- frontend-spa\src\views\clients\CompanyForm.vue -->
  <div>
    <div v-if="isLoading" class="text-center p-8">
      <p>Loading company data...</p>
    </div>
    <div v-else>
      <h2 class="text-xl font-semibold mb-4">{{ isEditMode ? 'Edit Company' : 'Create New Company' }}</h2>

      <form @submit.prevent="handleCompanySubmit">
        <!-- Name -->
        <div class="mb-4">
          <label for="company-name" class="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="company-name" v-model="form.name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" required />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label for="company-email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" id="company-email" v-model="form.email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>

        <!-- New Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="company-street-address-1" class="block text-sm font-medium text-gray-700">Street Address 1</label>
            <input type="text" id="company-street-address-1" v-model="form.streetAddress1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
          </div>
          <div>
            <label for="company-street-address-2" class="block text-sm font-medium text-gray-700">Street Address 2</label>
            <input type="text" id="company-street-address-2" v-model="form.streetAddress2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
          </div>
          <div>
            <label for="company-city" class="block text-sm font-medium text-gray-700">City</label>
            <input type="text" id="company-city" v-model="form.city" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
          </div>
          <div>
            <label for="company-switchboard-number" class="block text-sm font-medium text-gray-700">Switchboard Number</label>
            <input type="text" id="company-switchboard-number" v-model="form.switchboardNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
          </div>
          <div>
            <label for="company-website" class="block text-sm font-medium text-gray-700">Website</label>
            <input type="url" id="company-website" v-model="form.website" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
          </div>
          <div>
            <label for="company-type-id" class="block text-sm font-medium text-gray-700">Company Type</label>
            <select id="company-type-id" v-model="form.companyTypeId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
              <option :value="null" disabled>-- Select a type --</option>
              <option v-for="type in companyTypeList" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label class="flex items-center">
            <input type="checkbox" v-model="form.isInactive" class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500" />
            <span class="ml-2 text-sm text-gray-900">Mark as inactive</span>
          </label>
        </div>

        <!-- Share Toggle -->
        <div v-if="authStore.hasPermission(PERMISSIONS.COMPANIES_SHARE)" class="mb-6">
          <label class="flex items-center">
            <input type="checkbox" v-model="form.isSharedWithinSubscriber" class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500" />
            <span class="ml-2 text-sm text-gray-900">Share with all teams in the organization</span>
          </label>
        </div>

        <!-- === CONTACT PERSONS SECTION === -->
        <div v-if="isEditMode" class="mt-8 pt-4 border-t">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-medium text-gray-900">Contact Persons</h3>
            <button @click="openContactModal(null)" type="button" class="btn-primary-sm">Add Contact</button>
          </div>
          <p v-if="!form.contactPersons || form.contactPersons.length === 0" class="text-sm text-gray-500">
            No contacts have been added to this company yet.
          </p>
          <ul v-else role="list" class="divide-y divide-gray-200">
            <li v-for="contact in form.contactPersons" :key="contact.id" class="py-3 flex justify-between items-center">
              
              <div :class="{ 'opacity-50': contact.isInactive }">
                <p class="text-sm font-medium text-gray-900">{{ contact.name }}</p>
                <p class="text-sm text-gray-500">{{ contact.email || 'No email' }}</p>
                <p v-if="contact.isInactive" class="text-xs text-red-600 font-semibold">INACTIVE</p>
              </div>
              <div>
                <template v-if="contact.isInactive">
                  <button @click="handleReactivateContact(contact.id)" type="button" class="text-green-600 hover:text-green-900 text-sm font-medium">Reactivate</button>
                </template>
                <template v-else>
                  <button @click="openContactModal(contact)" type="button" class="text-brand-blue-600 hover:text-brand-blue-900 mr-4 text-sm font-medium">Edit</button>
                  <button @click="handleDeactivateContact(contact.id)" type="button" class="text-red-600 hover:text-red-900 text-sm font-medium">Deactivate</button>
                </template>
              </div>

            </li>
          </ul>
        </div>

      </form>

      <!-- Nested Modal for the Contact Form -->
    <Modal :show="isContactModalOpen" @close="closeContactModal">
      <div class="p-6">
        <ContactPersonForm 
          v-if="form.id"
          :company-id="form.id" 
          :contact="selectedContact" 
          @contact-saved="handleContactSaved($event)" 
          @close="closeContactModal" 
        />
      </div>
    </Modal>
  </div>
 </div> 
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import Modal from '@/components/common/Modal.vue';
import ContactPersonForm from './ContactPersonForm.vue';
import contactPersonService from '@/services/contactPersonService';
import companyService from '@/services/companyService';
import referenceDataService from '@/services/referenceDataService';
import { useAuthStore } from '@/store/auth';
import { PERMISSIONS } from '@/constants/permissions';

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
});

const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();

const isSaving = ref(false);
const isLoading = ref(false); // NEW: Loading state
const companyTypeList = ref([]);

const form = reactive({
  id: null,
  name: '',
  email: '',
  isSharedWithinSubscriber: false,
  streetAddress1: '',
  streetAddress2: '',
  city: '',
  switchboardNumber: '',
  website: '',
  companyTypeId: null,
  isInactive: false,
  contactPersons: [],
});

const isEditMode = computed(() => !!props.id);
const isContactModalOpen = ref(false);
const selectedContact = ref(null);

const convertToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertToSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof File)) {
    return Object.keys(obj).reduce((acc, key) => {
      // This improved regex finds any uppercase letter OR any sequence of digits,
      // and prepends an underscore to it.
      const snakeKey = key
        .replace(/([A-Z]|\d+)/g, '_$1')
        .replace(/^_/, '') // Removes a leading underscore if the key started with a capital
        .toLowerCase();

      acc[snakeKey] = convertToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// NEW & IMPROVED: A robust function to populate the form state
const populateForm = (sourceData) => {
    for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
            form[key] = sourceData[key];
        }
    }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await referenceDataService.getCompanyTypes();
    companyTypeList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch company types:", error);
  }

  if (isEditMode.value) {
    try {
      const response = await companyService.getCompany(props.id);
      // REPLACED: Use the new robust population method
      populateForm(response.data);
    } catch (error) {
      console.error("Failed to fetch company data:", error);
    }
  }

  uiStore.setHeaderActions([
    { 
      label: isEditMode.value ? 'Save Changes' : 'Save Company', 
      onClick: handleCompanySubmit 
    },
    { 
      label: 'Cancel', 
      onClick: () => router.push({ name: 'companies.index' }) 
    }
  ]);
  isLoading.value = false; // Finish loading
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});

const openContactModal = (contact) => {
  selectedContact.value = contact;
  isContactModalOpen.value = true;
};
const closeContactModal = () => isContactModalOpen.value = false;

const handleContactSaved = (savedContact) => {
  if (!savedContact || !savedContact.id) {
    console.error("Invalid contact data received after save.");
    return;
  }

  // Find the index of the contact in our local array.
  const index = form.contactPersons.findIndex(c => c.id === savedContact.id);

  if (index !== -1) {
    // EDIT MODE: The contact was found, so replace it with the fresh data.
    form.contactPersons[index] = savedContact;
  } else {
    // CREATE MODE: The contact was not found, so add the new one to the list.
    form.contactPersons.push(savedContact);
  }
  
  // No need to re-fetch from the API. The state is now in sync.
  closeContactModal();
};

const handleDeactivateContact = async (contactId) => {
  if (confirm('Are you sure you want to deactivate this contact person?')) {
    try {
      // Deactivating returns the updated contact, we can use that to update state
      const response = await contactPersonService.deactivateContact(contactId);
      handleContactSaved(response.data); // REUSE our new logic
    } catch (error) {
      console.error("Failed to deactivate contact:", error);
    }
  }
};

const handleReactivateContact = async (contactId) => {
  try {
    // Reactivating also returns the updated contact
    const response = await contactPersonService.reactivateContact(contactId);
    handleContactSaved(response.data); // REUSE our new logic
  } catch (error) {
    console.error("Failed to reactivate contact:", error);
  }
};

const handleCompanySubmit = async () => {
  isSaving.value = true;
  try {
    // This will now produce the correct snake_case payload
    const payload = convertToSnakeCase(form);
    
    if (isEditMode.value) {
      await companyService.updateCompany(props.id, payload);
    } else {
      await companyService.createCompany(payload);
    }
    router.push({ name: 'companies.index' });
  } catch (error) {
    console.error('Failed to save company:', error);
    alert(error.response?.data?.message || "An error occurred while saving the company.");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.btn-primary-sm {
  @apply px-2.5 py-1.5 text-xs font-medium text-white bg-[#74958D] rounded-md hover:bg-[#58726A];
}
</style>