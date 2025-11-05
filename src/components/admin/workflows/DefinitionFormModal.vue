<template>
<Modal :show="show" @close="$emit('close')">
<div class="p-6">
<h2 class="text-xl font-semibold text-gray-900 mb-4">
{{ isEditMode ? 'Edit Workflow Definition' : 'Create New Definition' }}
</h2>
<form @submit.prevent="handleSubmit">
<div class="space-y-4">
<div>
<label for="def-name" class="form-label">Definition Name</label>
<input id="def-name" v-model="form.name" type="text" class="form-input" required />
</div>
<div>
<label for="def-description" class="form-label">Description</label>
<textarea id="def-description" v-model="form.description" rows="3" class="form-input"></textarea>
</div>
<div class="flex items-center">
<input id="def-is_active" v-model="form.isActive" type="checkbox" class="h-4 w-4 text-brand-blue-600 border-gray-300 rounded focus:ring-brand-blue-500" />
<label for="def-is_active" class="ml-2 block text-sm text-gray-900">Is Active</label>
</div>
</div>
<div v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</div>

    <div class="mt-8 flex justify-end space-x-3">
      <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
      <button type="submit" class="btn-primary" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save Definition' }}
      </button>
    </div>
  </form>
</div>
</Modal>
</template>
<script setup>
import { ref, reactive, watch, computed } from 'vue';
import Modal from '@/components/common/Modal.vue';
import workflowDefinitionService from '@/services/workflowDefinitionService';

const props = defineProps({
show: { type: Boolean, required: true },
definitionToEdit: { type: Object, default: null },
});
const emit = defineEmits(['close', 'definition-saved']);

const form = reactive({ name: '', description: '', isActive: true });
const isSaving = ref(false);
const errorMessage = ref(null);

const isEditMode = computed(() => !!props.definitionToEdit);

watch(() => props.show, (newVal) => {
if (newVal) {
errorMessage.value = null;
if (isEditMode.value) {
form.name = props.definitionToEdit.name;
form.description = props.definitionToEdit.description;
form.isActive = props.definitionToEdit.isActive;
} else {
form.name = '';
form.description = '';
form.isActive = true;
}
}
});

const handleSubmit = async () => {
isSaving.value = true;
errorMessage.value = null;
try {
if (isEditMode.value) {
await workflowDefinitionService.updateDefinition(props.definitionToEdit.id, form);
} else {
await workflowDefinitionService.createDefinition(form);
}
emit('definition-saved');
} catch (err) {
errorMessage.value = err.response?.data?.message || 'Failed to save definition.';
} finally {
isSaving.value = false;
}
};
</script>
<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>