<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">Workflow Management</h1>
    <p class="mt-1 text-sm text-gray-700">
      Configure workflow definitions and their associated steps, reminders, and triggers.
    </p>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      
      <!-- Left Column: List of Workflow Definitions -->
      <div class="md:col-span-1">
        <div class="flex justify-between items-center border-b pb-2">
            <h2 class="text-lg font-medium text-gray-800">Definitions</h2>
            <button @click="openDefModal()" class="btn-primary text-sm py-1 px-2">Add New</button>
        </div>
        
        <div v-if="loadingDefinitions" class="mt-4">Loading...</div>
        <div v-else-if="definitionsError" class="mt-4 text-red-600">{{ definitionsError }}</div>
        <ul v-else class="mt-4 space-y-1">
          <li v-for="def in definitions" :key="def.id" 
              @click="selectedDefinition = def"
              class="group flex justify-between items-center p-3 rounded-md transition-colors cursor-pointer"
              :class="selectedDefinition?.id === def.id ? 'bg-brand-blue-100 text-brand-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-600'">
            <span>{{ def.name }}</span>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                <button @click.stop="openDefModal(def)" class="text-blue-500 hover:text-blue-700">Edit</button>
                <button @click.stop="deleteDefinition(def)" class="text-red-500 hover:text-red-700">Del</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Right Column: Step Manager -->
      <div class="md:col-span-2 lg:col-span-3">
        <div v-if="!selectedDefinition" class="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <p class="text-gray-500">Select a workflow definition to see its steps.</p>
        </div>
        <div v-else>
          <h2 class="text-lg font-medium text-gray-800 border-b pb-2">
            Steps for: <span class="font-bold text-brand-blue-600">{{ selectedDefinition.name }}</span>
          </h2>
          <WorkflowStepManager :definition="selectedDefinition" />
        </div>
      </div>
    </div>

    <!-- Definition Create/Edit Modal -->
    <DefinitionFormModal 
        :show="isDefModalOpen"
        :definition-to-edit="defToEdit"
        @close="closeDefModal"
        @definition-saved="handleDefSaved"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import workflowDefinitionService from '@/services/workflowDefinitionService';
import WorkflowStepManager from '@/components/admin/workflows/WorkflowStepManager.vue';
import DefinitionFormModal from '@/components/admin/workflows/DefinitionFormModal.vue';

const definitions = ref([]);
const selectedDefinition = ref(null);
const loadingDefinitions = ref(true);
const definitionsError = ref(null);

const isDefModalOpen = ref(false);
const defToEdit = ref(null);

const fetchDefinitions = async () => {
  loadingDefinitions.value = true;
  definitionsError.value = null;
  try {
    const response = await workflowDefinitionService.getDefinitions();
    definitions.value = response.data;
    // If a definition was selected previously, try to find it again. Otherwise, select the first.
    if (selectedDefinition.value) {
        const reselect = definitions.value.find(d => d.id === selectedDefinition.value.id);
        selectedDefinition.value = reselect || (definitions.value.length > 0 ? definitions.value[0] : null);
    } else if (definitions.value.length > 0) {
        selectedDefinition.value = definitions.value[0];
    } else {
        selectedDefinition.value = null;
    }
  } catch (err) {
    console.error('Failed to fetch workflow definitions:', err);
    definitionsError.value = 'Could not load definitions.';
  } finally {
    loadingDefinitions.value = false;
  }
};

const deleteDefinition = async (definition) => {
    if (!confirm(`Are you sure you want to delete "${definition.name}"? All of its steps will also be deleted.`)) return;
    try {
        await workflowDefinitionService.deleteDefinition(definition.id);
        // If the deleted definition was the selected one, clear the selection
        if (selectedDefinition.value?.id === definition.id) {
            selectedDefinition.value = null;
        }
        await fetchDefinitions();
    } catch (err) {
        alert('Failed to delete definition.');
    }
};

const openDefModal = (definition = null) => {
    defToEdit.value = definition;
    isDefModalOpen.value = true;
};

const closeDefModal = () => {
    isDefModalOpen.value = false;
    defToEdit.value = null;
};

const handleDefSaved = () => {
    closeDefModal();
    fetchDefinitions(); // Refresh the list
};

onMounted(fetchDefinitions);
</script>