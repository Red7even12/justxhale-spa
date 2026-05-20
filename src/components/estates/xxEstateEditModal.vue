<template>
  <Modal :show="show" @close="closeModal">
    <div class="p-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Estate Details</h3>
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          <!-- Column 1 -->
          <div class="col-span-1">
            <label for="estate_name" class="form-label">Estate Name</label>
            <input id="estate_name" v-model="localForm.estateName" type="text" class="form-input" required />
          </div>
          
          <div class="col-span-1">
            <label for="surname" class="form-label">Deceased Surname</label>
            <input id="surname" v-model="localForm.surname" type="text" class="form-input" required />
          </div>
          
          <div class="col-span-1">
            <label for="names" class="form-label">Deceased First Names</label>
            <input id="names" v-model="localForm.names" type="text" class="form-input" required />
          </div>

          <div class="col-span-1">
            <label for="deceased_id_number" class="form-label">Deceased ID Number</label>
            <input id="deceased_id_number" v-model="localForm.deceasedIdNumber" type="text" class="form-input" />
          </div>

          <div class="col-span-1">
            <label for="date_of_instruction" class="form-label">Date of Instruction</label>
            <input id="date_of_instruction" v-model="localForm.dateOfInstruction" type="date" class="form-input" />
          </div>

          <!-- Column 2 -->
          <div class="col-span-1">
            <label for="client_company_id" class="form-label">Client Company / Executor</label>
            <div class="flex items-center">
              <select id="client_company_id" v-model="localForm.clientCompanyId" class="form-select flex-grow" required>
                <option disabled value="">Please select a company</option>
                <option v-for="company in companyList" :key="company.id" :value="company.id">
                  {{ company.name }}
                </option>
              </select>
              <button 
                v-if="authStore.hasPermission(PERMISSIONS.COMPANIES_CREATE)" 
                @click.prevent="openCompanyModal" 
                type="button" 
                class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap"
              >
                Manage
              </button>
            </div>
          </div>

          <div class="col-span-1">
            <label for="current_team_id" class="form-label">Assigned Team</label>
            <select id="current_team_id" v-model="localForm.currentTeamId" class="form-select" required>
              <option disabled value="">Please select a team</option>
              <option v-for="team in teamList" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>

          <div class="col-span-1">
            <label for="client_contact_person_id" class="form-label">Client Primary Contact</label>
            <select id="client_contact_person_id" v-model="localForm.clientContactPersonId" class="form-select" :disabled="!localForm.clientCompanyId || contactPersonList.length === 0">
              <option v-if="contactPersonList.length > 0" value="">Select a contact</option>
              <option v-else-if="localForm.clientCompanyId" value="">No contacts available</option>
              <option v-else value="">Select a company first</option>
              <option v-for="contact in contactPersonList" :key="contact.id" :value="contact.id">
                {{ contact.name }}
              </option>
            </select>
          </div>

          <div class="col-span-1">
            <label for="executor_reference" class="form-label">Executor Reference</label>
            <input id="executor_reference" v-model="localForm.executorReference" type="text" class="form-input" />
          </div>

          <div class="col-span-1">
            <label for="tax_cons_file_reference" class="form-label">Tax Practitioner File Ref</label>
            <input id="tax_cons_file_reference" v-model="localForm.taxConsFileReference" type="text" class="form-input" />
          </div>
          
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isSaving">
            <span v-if="isSaving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </Modal>

  <!-- Nested Company Modal for Management -->
  <Modal :show="isCompanyModalOpen" @close="closeCompanyModal">
    <div class="p-6">
      <CompanyForm 
        :company="selectedCompanyForEditing" 
        @company-saved="handleCompanySaved"
        @close-modal="closeCompanyModal"
      />
    </div>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import Modal from '@/components/common/Modal.vue';
import CompanyForm from '@/views/clients/CompanyForm.vue'; // Assuming this is reusable
import estateService from '@/services/estateService';
import companyService from '@/services/companyService';
import teamService from '@/services/teamService';
import { useAuthStore } from '@/store/auth';
import { PERMISSIONS } from '@/constants/permissions';

const props = defineProps({
  show: { type: Boolean, default: false },
  estate: { type: Object, default: null } // Pre-fill with existing estate data
});

const emit = defineEmits(['close', 'estate-updated']);

const authStore = useAuthStore();
const localForm = reactive({});
const isSaving = ref(false);

// Dropdown & Modal State
const companyList = ref([]);
const teamList = ref([]);
const contactPersonList = ref([]);
const isCompanyModalOpen = ref(false);
const selectedCompanyForEditing = ref(null);

// --- Modal Management Logic for Company Form ---
const openCompanyModal = () => {
  selectedCompanyForEditing.value = localForm.clientCompanyId
    ? companyList.value.find(c => c.id === localForm.clientCompanyId) || null
    : null;
  isCompanyModalOpen.value = true;
};
const closeCompanyModal = () => { isCompanyModalOpen.value = false; };
const handleCompanySaved = async (savedCompany) => {
  await fetchCompanyList(); // Refresh list with new/edited data
  if (savedCompany && savedCompany.id) {
    localForm.clientCompanyId = savedCompany.id; // Auto-select the one just saved
  }
  closeCompanyModal();
};

// --- Data Fetching Logic ---
const fetchTeamList = async () => {
  try {
    const response = await teamService.getTeams();
    teamList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch teams:", error);
  }
};
const fetchCompanyList = async () => {
  try {
    const response = await companyService.getCompanies();
    companyList.value = response.data;
  } catch (error) { console.error("Failed to fetch companies:", error); }
};
const fetchContactPersons = async (companyId) => {
  if (!companyId) {
    contactPersonList.value = [];
    return;
  }
  try {
    const response = await companyService.getContacts(companyId);
    contactPersonList.value = response.data;
  } catch (error) {
    console.error("Failed to fetch contact persons:", error);
    contactPersonList.value = []; // Reset on error
  }
};

// Watcher for Dependent Dropdown
watch(() => localForm.clientCompanyId, (newCompanyId) => {
  localForm.clientContactPersonId = ''; // Reset selection
  fetchContactPersons(newCompanyId);
});

// Watcher for prop.estate to populate localForm when modal opens or estate data changes
watch(() => props.estate, (newEstate) => {
  if (newEstate) {
    // Reset localForm and then assign new values
    Object.keys(localForm).forEach(key => delete localForm[key]);
    Object.assign(localForm, {
      estateName: newEstate.estateName,
      surname: newEstate.surname,
      names: newEstate.names,
      deceasedIdNumber: newEstate.deceasedIdNumber,
      dateOfDeath: newEstate.dateOfDeath,
      dateOfInstruction: newEstate.dateOfInstruction,
      clientCompanyId: newEstate.clientCompanyId,
      currentTeamId: newEstate.currentTeamId,
      clientContactPersonId: newEstate.clientContactPersonId,
      executorReference: newEstate.executorReference,
      taxConsFileReference: newEstate.taxConsFileReference,
    });
    // Manually trigger contact persons fetch if company_id is present
    if (newEstate.clientCompanyId) {
        fetchContactPersons(newEstate.clientCompanyId);
    }
  } else {
    // Clear form if no estate is provided (e.g., creating a new one)
    Object.keys(localForm).forEach(key => delete localForm[key]);
  }
}, { immediate: true, deep: true });

// Fetch dropdown data on mount
onMounted(async () => {
  await Promise.all([
    fetchCompanyList(),
    fetchTeamList()
  ]);
});

const handleSubmit = async () => {
  isSaving.value = true;
  try {
    await estateService.updateEstate(props.estate.id, localForm);
    emit('estate-updated'); // Notify parent to refetch estate
    closeModal();
  } catch (error) {
    console.error("Failed to update estate:", error);
    // TODO: Display user-friendly error
  } finally {
    isSaving.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input, .form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>