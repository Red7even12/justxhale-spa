<template>
  <!-- frontend-spa\src\views\estates\EstateForm.vue -->
  <div class="max-w-4xl mx-auto">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-[#242E2C] mb-6">
        {{ isEditMode ? 'Edit Estate' : 'Create New Estate' }}
      </h1>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Team Allocation -->
            <div class="col-span-1">
                <label for="currentTeamId" class="form-label">Assigned Team</label>
                <select 
                  id="currentTeamId" 
                  v-model="form.currentTeamId" 
                  class="form-select" 
                  :disabled="!canAllocateTeam"
                  :title="canAllocateTeam ? '' : 'You do not have permission to allocate teams.'"
                  required
                >
                  <option disabled value="">Please select a team</option>
                  <option v-for="team in teamList" :key="team.id" :value="team.id">
                    {{ team.name }}
                  </option>
                </select>
            </div>
            <div class="col-span-1"></div>

            <div class="col-span-1">
                <label for="estateName" class="form-label">Estate Name</label>
                <input id="estateName" v-model="form.estateName" type="text" class="form-input" required />
            </div>
            
            <div class="col-span-1">
                <label for="surname" class="form-label">Deceased Surname</label>
                <input id="surname" v-model="form.surname" type="text" class="form-input" required />
            </div>
            
            <div class="col-span-1">
                <label for="names" class="form-label">Deceased First Names</label>
                <input id="names" v-model="form.names" type="text" class="form-input" required />
            </div>

            <div class="col-span-1">
                <label for="deceasedIdNumber" class="form-label">Deceased ID Number</label>
                <input id="deceasedIdNumber" v-model="form.deceasedIdNumber" type="text" class="form-input" />
            </div>

            <div class="col-span-1">
                <label for="dateOfDeath" class="form-label">Date of Death</label>
                <input id="dateOfDeath" v-model="form.dateOfDeath" type="date" class="form-input" />
            </div>

            <div class="col-span-1">
                <label for="dateOfInstruction" class="form-label">Date of Instruction</label>
                <input id="dateOfInstruction" v-model="form.dateOfInstruction" type="date" class="form-input" />
            </div>

            <div class="col-span-1">
                <label for="deceasedTaxNumberPre" class="form-label">Deceased Estate Tax No (Pre)</label>
                <input id="deceasedTaxNumberPre" v-model="form.deTaxNumberPre" type="text" class="form-input" />
            </div>

            <div class="col-span-1">
                <label for="deceasedTaxNumberPost" class="form-label">Deceased Estate Tax No (Post)</label>
                <input id="deceasedTaxNumberPost" v-model="form.deTaxNumberPost" type="text" class="form-input" />
            </div>
                <div>
                  <label for="executor_contact_person_display" class="form-label">Executor</label>
                  <div class="flex items-center">
                    <input id="executor_contact_person_display" :value="executorContactPersonName" type="text" class="form-input flex-grow bg-gray-100" readonly />
                    <button 
                      @click.prevent="openExecutorModal()" 
                      type="button" 
                      class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap"
                    >
                      {{ executorContactPersonName && executorContactPersonName !== 'N/A' ? 'Edit Executor' : 'Add Executor' }}
                    </button>
                  </div>
                </div>            
            <div class="col-span-1">
                <label for="taxConsFileReference" class="form-label">Tax Practitioner File Ref No</label>
                <input id="taxConsFileReference" v-model="form.taxConsFileReference" type="text" class="form-input" />
            </div>
        </div>

<div class="mt-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            
            <!-- LEFT COLUMN: Attorney -->
            <div class="col-span-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Attorney</h3>
              <div class="space-y-4">
                
                <!-- Attorney Company (Button moved here) -->
                <div>
                  <label for="attorney_company_id" class="form-label">Attorney Company</label>
                  <div class="flex items-center">
                    <input 
                      :value="attorneyCompanyName" 
                      type="text" 
                      class="form-input flex-grow bg-gray-100" 
                      readonly 
                    />
                    <button 
                      @click.prevent="openContactEditor('attorney')" 
                      type="button" 
                      class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap"
                    >
                      Add/Edit
                    </button>
                  </div>
                </div>

                <!-- Attorney Contact (Button removed) -->
                <div>
                  <label for="attorney_contact_person_display" class="form-label">Attorney Contact</label>
                  <input 
                    id="attorney_contact_person_display" 
                    :value="attorneyContactPersonName" 
                    type="text" 
                    class="form-input w-full bg-gray-100" 
                    readonly 
                  />
                </div>

                <!-- Attorney Reference -->
                <div>
                  <label for="attorneyReference" class="form-label">Attorney File Ref No</label>
                  <input 
                    id="attorneyReference" 
                    v-model="form.attorneyReference" 
                    type="text" 
                    class="form-input" 
                  />
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Agent -->
            <div class="col-span-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Agent</h3>
              <div class="space-y-4">
                
                <!-- Agent (Executor) -->
                <div>
                  <label for="agent_executor_display" class="form-label">Agent</label>
                  <div class="flex items-center">
                    <input 
                      id="agent_executor_display" 
                      :value="agentExecutorName" 
                      type="text" 
                      class="form-input flex-grow bg-gray-100" 
                      readonly 
                    />
                    <button 
                      @click.prevent="openContactEditor('agent_executor')" 
                      type="button" 
                      class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap"
                    >
                      Add/Edit
                    </button>
                  </div>
                </div>

                <!-- Agent Reference -->
                <div>
                  <label for="executorReference" class="form-label">Agent File Ref No</label>
                  <input 
                    id="executorReference" 
                    v-model="form.executorReference" 
                    type="text" 
                    class="form-input" 
                  />
                </div>              
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  </div>

  <!-- Modals -->
   <Modal :show="isCompanyModalOpen" @close="closeCompanyModal">
    <div class="p-6">
      <CompanyForm :company="selectedCompanyForEditing" @company-saved="handleCompanySaved" @close-modal="closeCompanyModal" />
    </div>
  </Modal>
  <Modal :show="isContactEditorOpen" @close="isContactEditorOpen = false">
    <template #title>{{ contactSelectorTitle }}</template>
    <div class="p-6">
      <ContactPersonSelector v-if="contactEditorRole" :role="contactEditorRole" @contact-selected="handleContactSelected" @cancel="isContactEditorOpen = false" />
    </div>
  </Modal>
    <!-- NEW EXECUTOR MODAL -->
  <AddExecutorModal 
    v-if="isExecutorModalOpen" 
    :team-id="form.currentTeamId" 
    :executor="currentExecutorContact"
    @close="isExecutorModalOpen = false"
    @executor-saved="handleExecutorSaved"
  />
</template>
    
<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import estateService from '@/services/estateService';
import companyService from '@/services/companyService';
import teamService from '@/services/teamService';
import Modal from '@/components/common/Modal.vue';
import CompanyForm from '@/views/clients/CompanyForm.vue';
import ContactPersonSelector from '@/components/common/ContactPersonSelector.vue';
import contactPersonService from '@/services/contactPersonService';
import { useAuthStore } from '@/store/auth';
import AddExecutorModal from '@/components/modals/AddExecutorModal.vue';

const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();
const props = defineProps({ id: { type: String, required: false } });
const isEditMode = computed(() => !!props.id);
const isExecutorModalOpen = ref(false);

const formatDateForInput = (dateString) => {
  if (!dateString) return null;
  return dateString.substring(0, 10);
};

const form = reactive({
  estateName: '',
  surname: '',
  names: '',
  deceasedIdNumber: '',
  dateOfDeath: null,
  dateOfInstruction: null,
  taxConsFileReference: '',
  deTaxNumberPre: '', // Changed from deceasedTaxNumberPre
  deTaxNumberPost: '', // Changed from deceasedTaxNumberPost
  spoaDate: null,
  currentTeamId: '',
  executorReference: '',
  executorCompanyId: null,
  executorContactPersonId: null,
  attorneyCompanyId: null,
  attorneyContactPersonId: null,
  attorneyReference: '',
  attorneyPoaPersonId: null,
});

const companyList = ref([]);
const teamList = ref([]);
const executorContactPersonName = ref('N/A');
const attorneyContactPersonName = ref('N/A');
const agentExecutorName = ref('N/A');
const isCompanyModalOpen = ref(false);
const selectedCompanyForEditing = ref(null);
const isContactEditorOpen = ref(false);
const contactEditorRole = ref(null);
const currentExecutorContact = ref(null); // New ref for current executor data

const canAllocateTeam = computed(() => {
  if (!authStore.user || !authStore.user.roles) {
    return false;
  }
  const allowedRoleIds = [1, 3];
  return authStore.user.roles.some(role => allowedRoleIds.includes(role.id));
});

const contactSelectorTitle = computed(() => {
  if (contactEditorRole.value === 'attorney') return 'Select Attorney Contact';
  if (contactEditorRole.value === 'agent_executor') return 'Select Agent (Executor)';
  return 'Select Contact';
});

const executorCompanyName = computed(() => companyList.value.find(c => c.id === form.executorCompanyId)?.name || 'N/A');
const attorneyCompanyName = computed(() => companyList.value.find(c => c.id === form.attorneyCompanyId)?.name || 'N/A');

const closeCompanyModal = () => { isCompanyModalOpen.value = false; };

const handleCompanySaved = async () => {
  await fetchCompanyList();
  closeCompanyModal();
};

const openExecutorModal = async () => { // Made async to fetch current executor if needed
  // Set currentExecutorContact if an executor is linked, otherwise it will be null for 'add new'
  currentExecutorContact.value = null; // Reset first
  if (form.executorContactPersonId) {
    try {
      const response = await contactPersonService.getContactPerson(form.executorContactPersonId);
      currentExecutorContact.value = response.data;
    } catch (error) {
      console.error("Failed to fetch current executor for editing:", error);
    }
  }
  isExecutorModalOpen.value = true;
};


// openContactEditor now only handles 'attorney' and 'agent_executor' roles
const openContactEditor = (role) => {
  contactEditorRole.value = role;
  isContactEditorOpen.value = true;
};

const handleContactSelected = (data) => {
  if (data.role === 'attorney') {
    form.attorneyCompanyId = data.companyId;
    form.attorneyContactPersonId = data.contactId;
    attorneyContactPersonName.value = data.contactName;
  } else if (data.role === 'agent_executor') {
    form.attorneyPoaPersonId = data.contactId;
    agentExecutorName.value = data.contactName;
  }
  isContactEditorOpen.value = false;
};

const fetchTeamList = async () => {
  try {
    const response = await teamService.getTeams();
    teamList.value = response.data.data;
  } catch (error) { console.error("Failed to fetch teams:", error); }
};

const fetchCompanyList = async () => {
  try {
    const response = await companyService.getCompanies({ per_page: -1 });
    companyList.value = response.data.data;
  } catch (error) { console.error("Failed to fetch companies:", error); }
};

const convertToSnakeCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(v => convertToSnakeCase(v));
  if (obj !== null && typeof obj === 'object' && !(obj instanceof File)) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z]|\d+)/g, '_$1').replace(/^_/, '').toLowerCase();
      acc[snakeKey] = convertToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const handleSubmit = async () => {
  try {
    const payload = convertToSnakeCase(form);
    let response;
    if (isEditMode.value) {
      response = await estateService.updateEstate(props.id, payload);
      router.push({ name: 'estates.edit', params: { id: props.id } });
    } else {
      response = await estateService.createEstate(payload);
      const newEstateId = response.data.data.id;
      router.push({ name: 'estates.edit', params: { id: newEstateId } });
    }
  } catch (error) {
    const errorMessages = error.response?.data?.errors;
    let alertMessage = "An error occurred while saving the estate.";
    if (errorMessages) {
      alertMessage = Object.values(errorMessages)[0][0];
    }
    console.error("Failed to save estate:", error);
    alert(alertMessage);
  }
};

const fetchContactPersonName = async (id) => {
  if (!id) return 'N/A';
  try {
    const response = await contactPersonService.getContactPerson(id);
    return response.data.name;
  } catch (error) {
    console.error(`Failed to fetch contact person name for ID ${id}:`, error);
    return 'N/A';
  }
};

const handleExecutorSaved = async (savedContact) => { // Renamed from handleExecutorAdded
  // 1. Update the Form ID references
  // The 'Individual Executors' company (ID 12) is hardcoded on the backend.
  // The backend storeExecutor method sets the company_id for the newly created executor.
  // We need to ensure form.executorCompanyId is updated correctly here.
  form.executorCompanyId = savedContact.company_id || 1;
  form.executorContactPersonId = savedContact.id;

  // 2. Update the visual text inputs
  executorContactPersonName.value = savedContact.name;

  // 3. Update the currentExecutorContact ref with the saved data
  currentExecutorContact.value = savedContact;

  // 4. Re-fetch company list if the executor's company was newly added or changed
  const companyExists = companyList.value.some(c => c.id === savedContact.company_id);
  if (!companyExists) {
    await fetchCompanyList(); // Refresh list to ensure new company (if any) is present
  }
  isExecutorModalOpen.value = false;
};

onMounted(async () => {
  await Promise.all([fetchCompanyList(), fetchTeamList()]);

  if (isEditMode.value) {
    try {
      const response = await estateService.getEstate(props.id);
      const estateData = response.data.data;

      for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(estateData, key)) {
          form[key] = estateData[key];
        }
      }

      form.dateOfDeath = formatDateForInput(estateData.dateOfDeath);
      form.dateOfInstruction = formatDateForInput(estateData.dateOfInstruction);
      form.spoaDate = formatDateForInput(estateData.spoaDate);

      executorContactPersonName.value = await fetchContactPersonName(form.executorContactPersonId);
      attorneyContactPersonName.value = await fetchContactPersonName(form.attorneyContactPersonId);
      agentExecutorName.value = await fetchContactPersonName(form.attorneyPoaPersonId);

      // Fetch the full executor contact object if one is linked for editing
      if (form.executorContactPersonId) {
        try {
          const executorResponse = await contactPersonService.getContactPerson(form.executorContactPersonId);
          currentExecutorContact.value = executorResponse.data;
        } catch (execError) {
          console.error("Failed to fetch current executor details:", execError);
          currentExecutorContact.value = null; // Ensure it's null on error
        }
      }

    } catch (error) {
      console.error("Failed to fetch estate data:", error);
    }
  }

  uiStore.setHeaderActions([
    { label: isEditMode.value ? 'Save Changes' : 'Create & View Estate', onClick: handleSubmit },
    { label: 'Cancel', onClick: () => router.back() }
  ]);
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input, .form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>