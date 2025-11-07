<template>
  <!-- frontend-spa\src\views\estates\EstateForm.vue -->
  <div class="max-w-4xl mx-auto">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-[#242E2C] mb-6">
        {{ isEditMode ? 'Edit Estate Details' : 'Create New Estate' }}
      </h1>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- All v-models are now camelCase -->
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
                <label for="taxConsFileReference" class="form-label">Tax Practitioner File Ref</label>
                <input id="taxConsFileReference" v-model="form.taxConsFileReference" type="text" class="form-input" />
            </div>

            <div class="col-span-1">
                <label for="deTaxNumberPre" class="form-label">Deceased Tax Number (Pre)</label>
                <input id="deTaxNumberPre" v-model="form.deTaxNumberPre" type="text" class="form-input" />
            </div>

            <div class="col-span-1">
                <label for="deTaxNumberPost" class="form-label">Deceased Tax Number (Post)</label>
                <input id="deTaxNumberPost" v-model="form.deTaxNumberPost" type="text" class="form-input" />
            </div>
        </div>

        <div class="mt-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div class="col-span-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Executor</h3>
              <div class="space-y-4">
                <div>
                  <label for="executor_company_id" class="form-label">Executor Company</label>
                  <input :value="executorCompanyName" type="text" class="form-input bg-gray-100" readonly />
                </div>
                <div>
                  <label for="executor_contact_person_display" class="form-label">Executor Contact</label>
                  <div class="flex items-center">
                    <input id="executor_contact_person_display" :value="executorContactPersonName" type="text" class="form-input flex-grow bg-gray-100" readonly />
                    <button @click.prevent="openContactEditor('executor')" type="button" class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap">Edit</button>
                  </div>
                </div>
                <div>
                  <label for="executorReference" class="form-label">Executor Reference</label>
                  <input id="executorReference" v-model="form.executorReference" type="text" class="form-input" />
                </div>
              </div>
            </div>

            <div class="col-span-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Attorney</h3>
              <div class="space-y-4">
                <div>
                  <label for="attorney_company_id" class="form-label">Attorney Company</label>
                  <input :value="attorneyCompanyName" type="text" class="form-input bg-gray-100" readonly />
                </div>
                <div>
                  <label for="attorney_contact_person_display" class="form-label">Attorney Contact</label>
                  <div class="flex items-center">
                    <input id="attorney_contact_person_display" :value="attorneyContactPersonName" type="text" class="form-input flex-grow bg-gray-100" readonly />
                    <button @click.prevent="openContactEditor('attorney')" type="button" class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap">Edit</button>
                  </div>
                </div>
                <div>
                  <label for="attorneyReference" class="form-label">Attorney Reference</label>
                  <input id="attorneyReference" v-model="form.attorneyReference" type="text" class="form-input" />
                </div>
              </div>
                <div class="mt-8 pt-6 border-t">
                  <h4 class="text-md font-semibold text-gray-700 mb-4">Agent (Executor)</h4>
                  <div class="space-y-4">
                    <div>
                      <label for="agent_executor_display" class="form-label">Agent (Executor)</label>
                      <div class="flex items-center">
                        <!-- THE FIX: Use the correct variable 'agentExecutorName' -->
                        <input id="agent_executor_display" :value="agentExecutorName" type="text" class="form-input flex-grow bg-gray-100" readonly />
                        <!-- THE FIX: Use the correct role 'agent_executor' -->
                        <button @click.prevent="openContactEditor('agent_executor')" type="button" class="ml-2 btn-secondary px-3 py-2 text-sm whitespace-nowrap">
                          Edit
                        </button>
                      </div>
                    </div>
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

const router = useRouter();
const uiStore = useUiStore();
const props = defineProps({ id: { type: String, required: false } });
const isEditMode = computed(() => !!props.id);

// --- Utilities ---
const formatDateForInput = (dateString) => {
  if (!dateString) return null;
  return dateString.substring(0, 10);
};

// --- Form State ---
const form = reactive({
  estateName: '', surname: '', names: '', deceasedIdNumber: '', dateOfDeath: null, dateOfInstruction: null,
  taxConsFileReference: '', deTaxNumberPre: '', deTaxNumberPost: '', spoaDate: null,
  currentTeamId: '', executorReference: '', executorCompanyId: null,
  executorContactPersonId: null, attorneyCompanyId: null, attorneyContactPersonId: null,
  attorneyReference: '', attorneyPoaPersonId: null,
});

// --- Component State ---
const companyList = ref([]);
const teamList = ref([]);
const executorContactPersonName = ref('N/A');
const attorneyContactPersonName = ref('N/A');
const agentExecutorName = ref('N/A'); 
const isCompanyModalOpen = ref(false);
const selectedCompanyForEditing = ref(null);
const isContactEditorOpen = ref(false);
const contactEditorRole = ref(null);

// --- Computed Properties ---
const contactSelectorTitle = computed(() => {
  if (contactEditorRole.value === 'executor') return 'Select Executor Contact';
  if (contactEditorRole.value === 'attorney') return 'Select Attorney Contact';
  if (contactEditorRole.value === 'agent_executor') return 'Select Agent (Executor)'; 
  return 'Select Contact';
});

const executorCompanyName = computed(() => {
  const company = companyList.value.find(c => c.id === form.executorCompanyId);
  return company ? company.name : 'N/A';
});

const attorneyCompanyName = computed(() => {
  const company = companyList.value.find(c => c.id === form.attorneyCompanyId);
  return company ? company.name : 'N/A';
});

// --- START: ADD MISSING MODAL FUNCTIONS ---
const openCompanyModal = () => {
  selectedCompanyForEditing.value = form.clientCompanyId
    ? companyList.value.find(c => c.id === form.clientCompanyId) || null
    : null;
  isCompanyModalOpen.value = true;
};

const closeCompanyModal = () => { isCompanyModalOpen.value = false; };

const handleCompanySaved = async () => {
  await fetchCompanyList();
  closeCompanyModal();
};
// --- END: ADD MISSING MODAL FUNCTIONS ---

const openContactEditor = (role) => {
  contactEditorRole.value = role;
  isContactEditorOpen.value = true;
};

const handleContactSelected = (data) => {
  if (data.role === 'executor') {
    form.executorCompanyId = data.companyId;
    form.executorContactPersonId = data.contactId;
    executorContactPersonName.value = data.contactName;
  } else if (data.role === 'attorney') {
    form.attorneyCompanyId = data.companyId;
    form.attorneyContactPersonId = data.contactId;
    attorneyContactPersonName.value = data.contactName;
  } else if (data.role === 'agent_executor') { // Use the corrected role name
    form.attorneyPoaPersonId = data.contactId;
    agentExecutorName.value = data.contactName;
  }
  isContactEditorOpen.value = false;
};

// --- Data Fetching ---
const fetchTeamList = async () => {
  try {
    const response = await teamService.getTeams();
    teamList.value = response.data;
  } catch (error) { console.error("Failed to fetch teams:", error); }
};

const fetchCompanyList = async () => {
  try {
    const response = await companyService.getCompanies({ per_page: -1 });
    companyList.value = response.data.data;
  } catch (error) { console.error("Failed to fetch companies:", error); }
};

// --- Form Submission ---
const handleSubmit = async () => {
  try {
    // --- START: CONVERT PAYLOAD TO SNAKE_CASE ---
    const snakeCasePayload = {};
    for (const key in form) {
      // This regex converts a camelCaseKey to a snake_case_key
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      snakeCasePayload[snakeKey] = form[key];
    }
    // --- END: CONVERT PAYLOAD TO SNAKE_CASE ---

    let response;
    
    if (isEditMode.value) {
      // Send the corrected payload
      response = await estateService.updateEstate(props.id, snakeCasePayload);
      router.push({ name: 'estates.edit', params: { id: props.id } });
    } else {  
      // Send the corrected payload for a new Estate record
      response = await estateService.createEstate(snakeCasePayload); 
      const newEstateId = response.data.data.id;
      router.push({ name: 'estates.edit', params: { id: newEstateId } });
    }
  } catch (error) {
    // This will now show you the specific validation errors from Laravel
    const errorMessages = error.response?.data?.errors;
    let alertMessage = "An error occurred while saving the estate.";
    if (errorMessages) {
        // Grab the first error message to show the user
        alertMessage = Object.values(errorMessages)[0][0];
    }
    console.error("Failed to save estate:", error);
    alert(alertMessage);
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  // We still need the company and team lists for the dropdowns
  await Promise.all([fetchCompanyList(), fetchTeamList()]);

  if (isEditMode.value) {
    try {
      // The getEstate call now returns everything we need!
      const response = await estateService.getEstate(props.id);
      const estateData = response.data.data; // The backend now provides a 'data' wrapper

      // --- SIMPLIFIED DATA ASSIGNMENT ---
      // Assign the main form fields
      Object.assign(form, estateData);

      // Format dates for the input fields
      form.dateOfDeath = formatDateForInput(estateData.dateOfDeath);
      form.dateOfInstruction = formatDateForInput(estateData.dateOfInstruction);
      form.spoaDate = formatDateForInput(estateData.spoaDate);
      
      // The related contact names are now included in the response from the backend
      // because we eager loaded them in the controller's 'show' method.
      executorContactPersonName.value = estateData.executor_contact_person?.name || 'N/A';
      attorneyContactPersonName.value = estateData.attorney_contact_person?.name || 'N/A';
      agentExecutorName.value = estateData.attorney_poa_person?.name || 'N/A';

    } catch (error) {
      console.error("Failed to fetch estate data:", error);
      // Optional: Redirect or show an error message if the estate can't be loaded
      // router.push({ name: 'estates.index' }); 
    }
  }
  
  // This part remains the same
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