<template>
  <form @submit.prevent="handleSubmit">
    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
      {{ isEditMode ? 'Edit Contact' : 'Add New Contact' }}
    </h3>
    <div class="space-y-4">
      <div>
        <label for="contact_name" class="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" v-model="form.name" id="contact_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" required />
      </div>
      <div>
        <label for="contact_email" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" v-model="form.email" id="contact_email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
      </div>
      <div>
        <label for="contact_cell" class="block text-sm font-medium text-gray-700">Cell Number</label>
        <input type="text" v-model="form.cellNumber" id="contact_cell" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
      </div>

      <!-- New Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="contact-country-dialing-code" class="block text-sm font-medium text-gray-700">Country Dialing Code</label>
          <input type="text" id="contact-country-dialing-code" v-model="form.countryDialingCode" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-alternative-cell-number" class="block text-sm font-medium text-gray-700">Alternative Cell Number</label>
          <input type="text" id="contact-alternative-cell-number" v-model="form.alternativeCellNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-landline" class="block text-sm font-medium text-gray-700">Landline</label>
          <input type="text" id="contact-landline" v-model="form.landline" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-street-address-1" class="block text-sm font-medium text-gray-700">Street Address 1</label>
          <input type="text" id="contact-street-address-1" v-model="form.streetAddress1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-street-address-2" class="block text-sm font-medium text-gray-700">Street Address 2</label>
          <input type="text" id="contact-street-address-2" v-model="form.streetAddress2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-street-city" class="block text-sm font-medium text-gray-700">City</label>
          <input type="text" id="contact-street-city" v-model="form.streetCity" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-street-province-id" class="block text-sm font-medium text-gray-700">Province</label>
          <select id="contact-street-province-id" v-model="form.streetProvinceId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            <option :value="null" disabled>Select a province</option>
            <option v-for="province in provinceList" :key="province.id" :value="province.id">
              {{ province.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="contact-street-region" class="block text-sm font-medium text-gray-700">Region</label>
          <input type="text" id="contact-street-region" v-model="form.streetRegion" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-street-post-code" class="block text-sm font-medium text-gray-700">Post Code</label>
          <input type="text" id="contact-street-post-code" v-model="form.streetPostCode" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-postal-address-1" class="block text-sm font-medium text-gray-700">Postal Address 1</label>
          <input type="text" id="contact-postal-address-1" v-model="form.postalAddress1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-postal-address-2" class="block text-sm font-medium text-gray-700">Postal Address 2</label>
          <input type="text" id="contact-postal-address-2" v-model="form.postalAddress2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-postal-city" class="block text-sm font-medium text-gray-700">Postal City</label>
          <input type="text" id="contact-postal-city" v-model="form.postalCity" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-postal-province-id" class="block text-sm font-medium text-gray-700">Postal Province</label>
          <select id="contact-postal-province-id" v-model="form.postalProvinceId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            <option :value="null" disabled>Select a province</option>
            <option v-for="province in provinceList" :key="province.id" :value="province.id">
              {{ province.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="contact-postal-region" class="block text-sm font-medium text-gray-700">Postal Region</label>
          <input type="text" id="contact-postal-region" v-model="form.postalRegion" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-postal-post-code" class="block text-sm font-medium text-gray-700">Postal Post Code</label>
          <input type="text" id="contact-postal-post-code" v-model="form.postalPostCode" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-id-number" class="block text-sm font-medium text-gray-700">ID Number</label>
          <input type="text" id="contact-id-number" v-model="form.idNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div>
          <label for="contact-citizenship-country-id" class="block text-sm font-medium text-gray-700">Citizenship</label>
          <select id="contact-citizenship-country-id" v-model="form.citizenshipCountryId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            <option :value="null" disabled>Select a country</option>
            <option v-for="country in countryList" :key="country.id" :value="country.id">
              {{ country.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="contact-tax-number" class="block text-sm font-medium text-gray-700">Tax Number</label>
          <input type="text" id="contact-tax-number" v-model="form.taxNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
      </div>

      <div class="mt-4">
        <label class="flex items-center">
          <input type="checkbox" v-model="form.isInactive" class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500" />
          <span class="ml-2 text-sm text-gray-900">Mark as inactive</span>
        </label>
      </div>
    </div>
    <div class="mt-6 flex justify-end space-x-3 pt-4 border-t">
      <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save Contact' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted } from 'vue';
import contactPersonService from '@/services/contactPersonService';
import referenceDataService from '@/services/referenceDataService'; 

const props = defineProps({
  contact: { type: Object, default: null },
  companyId: { type: Number, required: true },
});

const emit = defineEmits(['contact-saved', 'close']);
const isSaving = ref(false);

const provinceList = ref([]);
const countryList = ref([]);

// RULE 1 APPLIED: Local state uses camelCase to match API response.
const form = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  isPrimaryContact: false,
  isInactive: false,
  cellNumber: '',
  countryDialingCode: '',
  alternativeCellNumber: '',
  landline: '',
  streetAddress1: '',
  streetAddress2: '',
  streetCity: '',
  streetProvinceId: null,
  streetRegion: '',
  streetPostCode: '',
  postalAddress1: '',
  postalAddress2: '',
  postalCity: '',
  postalProvinceId: null,
  postalRegion: '',
  postalPostCode: '',
  idNumber: '',
  citizenshipCountryId: null,
  taxNumber: '',
});

const isEditMode = computed(() => !!form.id);

// NEW: Robustly populate form state to ensure reactivity.
const populateForm = (sourceData) => {
    for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
            form[key] = sourceData[key];
        }
    }
};

// NEW: Cleanly reset the form for creating new contacts.
const resetForm = () => {
    for (const key in form) {
        if (typeof form[key] === 'boolean') {
            form[key] = false;
        } else if (typeof form[key] === 'number') {
            form[key] = 0;
        } else if (Array.isArray(form[key])) {
            form[key] = [];
        } else {
            form[key] = /Id$/.test(key) ? null : '';
        }
    }
    form.id = null; // Ensure ID is always null for a reset form
};


watch(() => props.contact, (newContact) => {
    if (newContact && newContact.id) {
        populateForm(newContact);
    } else {
        resetForm();
    }
}, { immediate: true, deep: true });

// Conversion utility for submitting data.
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

const handleSubmit = async () => {
  isSaving.value = true;
  try {
    let savedContact;
    // RULE 2 APPLIED: Convert camelCase state to snake_case payload for the API.
    const payload = convertToSnakeCase(form);

    if (isEditMode.value) {
      const response = await contactPersonService.updateContact(props.contact.id, payload);
      savedContact = response.data;
    } else {
      // Create new contact logic remains the same, but uses the converted payload
      try {
        const response = await contactPersonService.createContact(props.companyId, payload);
        savedContact = response.data;
      } catch (error) {
        if (error.response && error.response.status === 409) {
          if (confirm(error.response.data.message + "\n\nWould you like to reactivate this contact?")) {
            const inactiveContact = error.response.data.contact;
            const reactivatedResponse = await contactPersonService.reactivateContact(inactiveContact.id);
            savedContact = reactivatedResponse.data;
          } else {
            isSaving.value = false;
            return;
          }
        } else {
          throw error;
        }
      }
    }
    emit('contact-saved', savedContact);
  } catch (error) {
    console.error("Failed to save contact", error);
    alert(error.response?.data?.message || "An error occurred while saving.");
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  try {
    const [provincesRes, countriesRes] = await Promise.all([
      referenceDataService.getProvinces(),
      referenceDataService.getCountries(),
    ]);
    provinceList.value = provincesRes.data;
    countryList.value = countriesRes.data;
  } catch (error) {
    console.error("Failed to fetch reference data:", error);
  }
});
</script>