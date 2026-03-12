<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Product Management (Whitelabel Factory)</h1>
      <button @click="openModal()" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
        + Create New Product
      </button>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-lg shadow-md border overflow-hidden">
        
        <!-- Preview Header: Show Logo or Color Bar -->
        <div class="h-16 w-full flex items-center justify-center relative" :style="{ backgroundColor: getPrimaryColor(product) }">
           <img v-if="product.logoPath || product.logo_path" 
                :src="getAssetUrl(product.logoPath || product.logo_path)" 
                class="h-12 w-auto object-contain bg-white/90 rounded px-2 py-1 shadow-sm absolute bottom-2" 
                alt="Logo" />
        </div>

        <div class="p-5">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ product.name }}</h2>
              <code class="text-xs text-gray-500">/{{ product.slug }}</code>
            </div>
            <span :class="getIsActive(product) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="text-xs px-2 py-1 rounded-full font-medium">
              {{ getIsActive(product) ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex items-center gap-4 text-sm text-gray-600 mb-6">
             <div class="flex items-center">
                <div :style="{ backgroundColor: getPrimaryColor(product) }" class="w-3 h-3 rounded-full mr-1 border border-gray-200"></div>
                <span>Primary</span>
             </div>
             <div>
                <strong>{{ getSubscribersCount(product) }}</strong> Subscribers
             </div>
          </div>

          <div class="flex gap-2">
            <button @click="openModal(product)" class="flex-1 bg-gray-100 py-2 rounded text-sm font-medium hover:bg-gray-200">Edit Settings</button>
            <router-link :to="{ name: 'admin.products.detail', params: { slug: product.slug  }}" class="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded text-sm text-center font-medium hover:bg-indigo-100">
              Manage Licenses
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="products.length === 0" class="text-center py-12 bg-white rounded-lg shadow border border-dashed border-gray-300">
        <p class="text-gray-500 italic">No products found. Create your first product above.</p>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Product' : 'Create Product' }}</h2>
        
        <!-- Note: No encType needed for axios, but good practice -->
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Product Name</label>
            <input v-model="form.name" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium">URL Slug (lowercase, no spaces)</label>
            <input v-model="form.slug" :disabled="isEditing" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100">
          </div>
          
          <!-- File Input for Logo -->
           <div>
            <label class="block text-sm font-medium">Product Logo (Optional)</label>
            <input type="file" @change="handleFileChange" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
            <p v-if="isEditing && form.currentLogo" class="text-xs text-gray-500 mt-1">Current: {{ form.currentLogo }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">Primary Color</label>
              <input v-model="form.primaryColor" type="color" class="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm p-1">
            </div>
            <div>
              <label class="block text-sm font-medium">Secondary Color</label>
              <input v-model="form.secondaryColor" type="color" class="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm p-1">
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <button type="button" @click="showModal = false" class="text-gray-600">Cancel</button>
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded shadow">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient, { getAssetUrl } from '@/services/api';

const products = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const fileInput = ref(null); // Valid ref for file data

const form = ref({ 
  id: null, 
  name: '', 
  slug: '', 
  primaryColor: '#3B82F6', 
  secondaryColor: '#1E40AF',
  currentLogo: null
});

// Helper functions to handle both snake_case and camelCase
const getPrimaryColor = (p) => p.primaryColor || p.primary_color || '#3B82F6';
const getIsActive = (p) => p.isActive !== undefined ? p.isActive : (p.is_active !== undefined ? p.is_active : true);
const getSubscribersCount = (p) => p.subscribersCount !== undefined ? p.subscribersCount : (p.subscribers_count || 0);

const fetchProducts = async () => {
  try {
    const response = await apiClient.get('admin/products');
    let rawData = response.data;
    
    if (rawData && rawData.data && !Array.isArray(rawData)) {
        rawData = rawData.data;
    }

    if (Array.isArray(rawData)) {
        products.value = rawData;
    } else if (rawData && typeof rawData === 'object') {
        if (rawData.id) {
            products.value = [rawData];
        } else {
            const values = Object.values(rawData);
            if (values.length > 0 && (values[0].id || values[0].name)) {
                products.value = values;
            } else {
                products.value = [];
            }
        }
    } else {
        products.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

const openModal = (product = null) => {
  fileInput.value = null; // Reset file input
  if (product) {
    isEditing.value = true;
    form.value = { 
        id: product.id,
        name: product.name,
        slug: product.slug,
        primaryColor: product.primaryColor || product.primary_color || '#3B82F6',
        secondaryColor: product.secondaryColor || product.secondary_color || '#1E40AF',
        currentLogo: product.logo_path
    };
  } else {
    isEditing.value = false;
    form.value = { id: null, name: '', slug: '', primaryColor: '#3B82F6', secondaryColor: '#1E40AF', currentLogo: null };
  }
  showModal.value = true;
};

const handleFileChange = (event) => {
  fileInput.value = event.target.files[0];
};

const saveProduct = async () => {
  // Use FormData for File Uploads
  const formData = new FormData();
  formData.append('name', form.value.name);
  formData.append('slug', form.value.slug);
  formData.append('primary_color', form.value.primaryColor);
  formData.append('secondary_color', form.value.secondaryColor);
  
  if (fileInput.value) {
    formData.append('logo', fileInput.value);
  }

  try {
    if (isEditing.value) {
        // Method Spoofing: PHP/Laravel requires POST with _method=PUT for file uploads in updates
        formData.append('_method', 'PUT');
        
        await apiClient.post(`admin/products/${form.value.slug}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } else {
        await apiClient.post('admin/products', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    
    showModal.value = false;
    await fetchProducts();
  } catch (error) {
    console.error('Failed to save product:', error);
    alert('Error saving product. Please check console.');
  }
};

onMounted(fetchProducts);
</script>