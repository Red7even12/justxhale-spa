<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Case Classifications</h2>
        <p class="text-sm text-gray-500 font-medium">Define priority levels and visual markers for case files within this product.</p>
      </div>
      <button @click="openModal()" class="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
        Add New Class
      </button>
    </div>

    <!-- Table List -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification Name</th>
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview</th>
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Priority</th>
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="cls in classes" :key="cls.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ cls.name }}</div>
              <div v-if="!cls.is_active" class="text-[10px] text-red-500 font-bold uppercase">Inactive</div>
            </td>
            <td class="px-6 py-4">
              <span 
                :style="{ backgroundColor: cls.bg_color, color: cls.text_color }"
                class="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm border border-black/5"
              >
                Example Case Label
              </span>
            </td>
            <td class="px-6 py-4 text-center">
                <span class="text-sm font-mono font-bold text-gray-600">{{ cls.priority_level }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openModal(cls)" class="text-brand-primary hover:underline font-bold text-xs mr-4">Edit</button>
              <button @click="deleteClass(cls.id)" class="text-red-400 hover:text-red-600 font-bold text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="classes.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-400 font-medium">No classifications defined for this product.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50">
          <h3 class="font-black text-gray-900 uppercase tracking-tight">{{ editingClass ? 'Edit' : 'Add' }} Case Class</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class Name</label>
            <input v-model="form.name" type="text" class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary font-bold" placeholder="e.g. HWI, Urgent, 18.3">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">BG Color (Hex)</label>
              <div class="flex gap-2">
                <input v-model="form.bg_color" type="color" class="h-10 w-10 border-0 p-0 bg-transparent cursor-pointer">
                <input v-model="form.bg_color" type="text" class="flex-1 border-gray-200 rounded-xl text-xs font-mono uppercase" placeholder="#FFFFFF" pattern="^#[0-9A-Fa-f]{6}$">
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Text Color (Hex)</label>
              <div class="flex gap-2">
                <input v-model="form.text_color" type="color" class="h-10 w-10 border-0 p-0 bg-transparent cursor-pointer">
                <input v-model="form.text_color" type="text" class="flex-1 border-gray-200 rounded-xl text-xs font-mono uppercase" placeholder="#000000" pattern="^#[0-9A-Fa-f]{6}$">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Priority Level (Higher = More Urgent)</label>
            <input v-model.number="form.priority_level" type="number" class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary font-bold">
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input v-model="form.is_active" id="is_active" type="checkbox" class="rounded border-gray-300 text-brand-primary focus:ring-brand-primary">
            <label for="is_active" class="text-xs font-bold text-gray-600 uppercase">Active for this product</label>
          </div>
        </div>

        <div class="p-6 bg-gray-50 flex justify-end gap-3">
          <button @click="showModal = false" class="text-sm font-bold text-gray-500 uppercase">Cancel</button>
          <button @click="saveClass" class="bg-brand-primary text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg">Save Classification</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const props = defineProps({
    product: { type: Object, required: true },
    slug: { type: String, required: true }
});

const classes = ref([]);
const showModal = ref(false);
const editingClass = ref(null);
const form = ref({ name: '', bg_color: '#f3f4f6', text_color: '#1f2937', priority_level: 0, is_active: true });

const fetchClasses = async () => {
    const { data } = await apiClient.get(`/${props.slug}/file-classes`); 
    classes.value = data.data;
};

const openModal = (item = null) => {
    editingClass.value = item;
    if (item) {
        form.value = { 
            name: item.name,
            bg_color: item.bg_color || item.bgColor || '#f3f4f6',
            text_color: item.text_color || item.textColor || '#1f2937',
            priority_level: item.priority_level || item.priorityLevel || 0,
            is_active: item.is_active ?? true
        };
    } else {
        form.value = { name: '', bg_color: '#f3f4f6', text_color: '#1f2937', priority_level: 0, is_active: true };
    }
    showModal.value = true;
};

const saveClass = async () => {
    try {
        if (editingClass.value) {
            await apiClient.put(`/${props.slug}/file-classes/${editingClass.value.id}`, form.value);
        } else {
            await apiClient.post(`/${props.slug}/file-classes`, form.value);
        }
        showModal.value = false;
        fetchClasses();
    } catch (e) { 
        console.error(e);
        alert('Error saving classification.');
    }
};

const deleteClass = async (id) => {
    if (!confirm('Are you sure? This will remove the classification option from future cases.')) return;
    try {
        await apiClient.delete(`/${props.slug}/file-classes/${id}`);
        fetchClasses();
    } catch (e) {
        alert('Error deleting classification. It may be in use.');
    }
};

onMounted(fetchClasses);
</script>