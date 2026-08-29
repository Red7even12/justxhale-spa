<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Legal Documents & Compliance Links</h1>
        <p class="text-xs text-gray-500 font-medium">Manage marketing URLs, PDF media paths, and versions referenced in clickwrap agreements.</p>
      </div>
    </div>

    <!-- Legal Documents Index Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
          <tr>
            <th class="p-3">Document Name</th>
            <th class="p-3">Identifier (Slug)</th>
            <th class="p-3">Media / PDF Path URL</th>
            <th class="p-3 text-center">Version</th>
            <th class="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
            <td class="p-3 font-bold text-gray-900">{{ doc.documentName || doc.document_name }}</td>
            <td class="p-3 font-mono text-xs text-gray-500">{{ doc.documentSlug || doc.document_slug }}</td>
            <td class="p-3 text-xs text-brand-blue-600 truncate max-w-xs">
              <a :href="doc.filePathUrl || doc.file_path_url" target="_blank" class="underline hover:text-brand-blue-800">
                {{ doc.filePathUrl || doc.file_path_url }}
              </a>
            </td>
            <td class="p-3 text-center font-bold text-xs">{{ doc.version }}</td>
            <td class="p-3 text-right">
              <button @click="editDoc(doc)" class="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded hover:opacity-90">
                Edit Link
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="editingDoc" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <h2 class="text-lg font-black text-gray-900 border-b pb-2">Update Legal Document Link</h2>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Document Name</label>
            <input v-model="editForm.document_name" type="text" class="form-input w-full" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Media / PDF Path URL</label>
            <input v-model="editForm.file_path_url" type="url" class="form-input w-full" placeholder="https://..." />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Version Number</label>
            <input v-model="editForm.version" type="text" class="form-input w-full" placeholder="1.0" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
            <textarea v-model="editForm.description" class="form-input w-full" rows="2"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="editingDoc = null" class="btn-secondary">Cancel</button>
          <button @click="saveDoc" :disabled="isSaving" class="btn-primary">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const documents = ref([]);
const editingDoc = ref(null);
const isSaving = ref(false);
const { showAlert } = useAlerts();

const editForm = ref({
  document_name: '',
  file_path_url: '',
  version: '1.0',
  description: '',
});

const fetchDocs = async () => {
  try {
    const res = await apiClient.get('/admin/legal-documents');
    documents.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const editDoc = (doc) => {
  editingDoc.value = doc;
  editForm.value = {
    document_name: doc.documentName || doc.document_name,
    file_path_url: doc.filePathUrl || doc.file_path_url,
    version: doc.version || '1.0',
    description: doc.description || '',
  };
};

const saveDoc = async () => {
  if (!editingDoc.value) return;

  isSaving.value = true;
  try {
    await apiClient.put(`/admin/legal-documents/${editingDoc.value.id}`, editForm.value);
    editingDoc.value = null;
    await fetchDocs();
    await showAlert('Success', 'Legal document reference updated successfully.');
  } catch (err) {
    await showAlert('Error', err.response?.data?.message || 'Failed to update legal document.');
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchDocs);
</script>

<style scoped>
.form-input {
  @apply block rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 text-sm p-2 border;
}
.btn-primary {
  @apply px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg shadow hover:opacity-90 transition-all;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-300 transition-all;
}
</style>