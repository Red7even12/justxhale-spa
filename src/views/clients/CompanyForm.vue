<template>
  <!-- frontend-spa\src\views\clients\CompanyForm.vue -->
  <div>
    
    <!-- === NEW: SUCCESS STATE FOR POPUP MODE === -->
    <div v-if="showPopupSuccess" class="max-w-2xl mx-auto mt-10 bg-green-50 border border-green-200 rounded-lg p-8 text-center shadow-sm">
      <div class="mb-4">
        <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Company Saved Successfully!</h2>
      <p class="text-gray-600 mb-6">
        You can now close this tab. Remember to click <strong>"Refresh List"</strong> on the Estate form to see your changes.
      </p>
      
      <div class="flex justify-center space-x-4">
        <button @click="closeWindow" class="px-4 py-2 bg-brand-blue-600 text-white rounded hover:bg-brand-blue-700 font-medium">
          Close This Tab
        </button>
        <button @click="showPopupSuccess = false" class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium">
          Continue Editing
        </button>
      </div>
    </div>

    <!-- === EXISTING FORM CONTENT (Wrapped in v-else) === -->
    <div v-else>
      <div v-if="isLoading" class="text-center p-8">
        <p>Loading company data...</p>
      </div>
      <div v-else>
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
              <label for="vat-number" class="block text-sm font-medium text-gray-700">VAT Number</label>
              <input type="text" id="vat-number" v-model="form.vatNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
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
 </div> 
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from '@/store/ui';
import Modal from '@/components/common/Modal.vue';
import ContactPersonForm from './ContactPersonForm.vue';
import contactPersonService from '@/services/contactPersonService';
import companyService from '@/services/companyService';
import referenceDataService from '@/services/referenceDataService';
import { useAuthStore } from '@/store/auth';
import { PERMISSIONS } from '@/constants/permissions';

const props = defineProps({
  id: { type: String, default: null },
});

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const authStore = useAuthStore();

const isSaving = ref(false);
const isLoading = ref(false);
const companyTypeList = ref([]);
const showPopupSuccess = ref(false);

const form = reactive({
  id: null,
  name: '',
  email: '',
  isSharedWithinSubscriber: false,
  streetAddress1: '',
  streetAddress2: '',
  city: '',
  switchboardNumber: '',
  vatNumber: '',
  website: '',
  companyTypeId: null,
  isInactive: false,
  contactPersons: [],
});

// MODIFIED: This now reacts to form.id, so it switches to TRUE immediately after creation
const isEditMode = computed(() => !!form.id);

const isContactModalOpen = ref(false);
const selectedContact = ref(null);

// --- Helpers ---
const convertToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertToSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof File)) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z]|\d+)/g, '_$1').replace(/^_/, '').toLowerCase();
      acc[snakeKey] = convertToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const populateForm = (sourceData) => {
    for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
            form[key] = sourceData[key];
        }
    }
};

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

// --- Lifecycle ---
onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await referenceDataService.getCompanyTypes();
    companyTypeList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch company types:", error);
  }

  if (props.id) {
    try {
      const response = await companyService.getCompany(props.id);
      const companyData = convertToCamelCase(response.data);
      populateForm(companyData);
    } catch (error) {
      console.error("Failed to fetch company data:", error);
    }
  }

  // Set initial header actions
  updateHeaderActions();
  
  isLoading.value = false;
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});

// Helper to keep header buttons in sync
const updateHeaderActions = () => {
  uiStore.setHeaderActions([
    { 
      label: isEditMode.value ? 'Save Changes' : 'Save Company', 
      onClick: handleCompanySubmit 
    },
    { 
      label: 'Cancel', 
      onClick: () => {
         if (route.query.popup === 'true') window.close();
         else router.push({ name: 'companies.index' });
      }
    }
  ]);
};

// --- Contact Modal Logic ---
const openContactModal = (contact) => {
  selectedContact.value = contact;
  isContactModalOpen.value = true;
};
const closeContactModal = () => isContactModalOpen.value = false;

const handleContactSaved = (savedContact) => {
  if (!savedContact || !savedContact.id) return;
  const index = form.contactPersons.findIndex(c => c.id === savedContact.id);
  if (index !== -1) {
    form.contactPersons[index] = savedContact;
  } else {
    form.contactPersons.push(savedContact);
  }
  closeContactModal();
};

const handleDeactivateContact = async (contactId) => {
  if (confirm('Are you sure you want to deactivate this contact person?')) {
    try {
      const response = await contactPersonService.deactivateContact(contactId);
      handleContactSaved(response.data);
    } catch (error) {
      console.error("Failed to deactivate contact:", error);
    }
  }
};

const handleReactivateContact = async (contactId) => {
  try {
    const response = await contactPersonService.reactivateContact(contactId);
    handleContactSaved(response.data);
  } catch (error) {
    console.error("Failed to reactivate contact:", error);
  }
};

// --- SUBMIT LOGIC (IMPROVED) ---
const handleCompanySubmit = async () => {
  isSaving.value = true;
  console.log('🔹 Submit started. Is Edit Mode?', !!form.id);

  try {
    const payload = convertToSnakeCase(form);
    
    // =========================================================
    // SCENARIO 1: EDIT MODE (Updating an existing company)
    // =========================================================
    if (form.id) {
        console.log('🔹 Updating existing company:', form.id);
        await companyService.updateCompany(form.id, payload);
        
        // If it was a popup, we are done -> Show Success Screen
        if (route.query.popup === 'true') {
            showPopupSuccess.value = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } 
        // If normal mode, we are done -> Go back to Index
        else {
            router.push({ name: 'companies.index' });
        }
    } 
    
    // =========================================================
    // SCENARIO 2: CREATE MODE (Creating a new company)
    // =========================================================
    else {
        console.log('🔹 Creating new company...');
        const response = await companyService.createCompany(payload);
        
        // --- ROBUST ID EXTRACTION ---
        let newCompanyId = null;
        if (response.data && response.data.id) {
             newCompanyId = response.data.id;
        } else if (response.data && response.data.data && response.data.data.id) {
             newCompanyId = response.data.data.id;
        }

        if (!newCompanyId) throw new Error("API did not return a valid ID");
        // --------------------------
        
        // 1. Update State to match "Edit Mode"
        form.id = newCompanyId;
        
        // 2. Update URL silently (so refresh works)
        const newRoute = router.resolve({ 
            name: 'companies.edit', 
            params: { id: newCompanyId },
            query: route.query 
        });
        window.history.replaceState({}, '', newRoute.href);
        
        // 3. Update Header Button to say "Save Changes"
        updateHeaderActions();

        // 4. UNIFIED BEHAVIOR: ALWAYS STAY ON PAGE
        // We do not redirect to index here. We let the user add contacts.
        
        alert("Company created successfully!\n\nYou can now add Contact Persons in the section below.");
        
        // Scroll down to the contact section to show them where to work
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    }

  } catch (error) {
    console.error('🔴 Failed to save company:', error);
    alert(error.response?.data?.message || "An error occurred while saving the company.");
  } finally {
    isSaving.value = false;
  }
};

const closeWindow = () => {
  window.close();
};
</script>

<style scoped>
.btn-primary-sm {
  @apply px-2.5 py-1.5 text-xs font-medium text-white bg-[#74958D] rounded-md hover:bg-[#58726A];
}
</style>