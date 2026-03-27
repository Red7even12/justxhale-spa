<template>
  <div v-if="product" class="flex h-screen bg-gray-100 -m-6"> 
    <!-- SIDEBAR -->
    <aside class="w-64 bg-[#242E2C] text-white flex flex-col flex-shrink-0 shadow-2xl">
      <div class="p-6 border-b border-gray-700 bg-[#1a2221]">
        <div class="flex items-center gap-3">
            <div :style="{ backgroundColor: product.primaryColor }" class="w-8 h-8 rounded shadow-inner"></div>
            <h2 class="font-bold text-sm uppercase tracking-widest truncate">{{ product.name }}</h2>
        </div>
        <p class="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Product Architect</p>
      </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <p class="text-[10px] font-bold text-gray-600 uppercase mb-2 px-4">The DNA (Blueprints)</p>
        
        <router-link :to="{ name: 'admin.product.file-types', params: { slug: slug } }" class="nav-item">
            Case File Types
        </router-link>

        <router-link :to="{ name: 'admin.product.workflows', params: { slug: slug } }" class="nav-item">
            Workflow Management
        </router-link>

        <router-link :to="{ name: 'admin.product.document-packs', params: { slug: slug } }" class="nav-item">
            Document Packs
        </router-link>

        <router-link :to="{ name: 'admin.product.roles', params: { slug: slug } }" class="nav-item">
            Participant Roles
        </router-link>

        <p class="text-[10px] font-bold text-gray-600 uppercase mt-8 mb-2 px-4">The Business</p>
        
        <router-link :to="{ name: 'admin.product.licenses', params: { slug: slug } }" class="nav-item">
            License Management
        </router-link>
        
        <router-link :to="{ name: 'admin.products.detail', params: { slug: slug } }" class="nav-item mt-4" exact-active-class="bg-gray-800 text-white border-l-4 border-indigo-500">
            Architect Dashboard
        </router-link>
        </nav>

      <div class="p-4 border-t border-gray-700">
        <router-link to="/admin/products" class="text-xs text-gray-400 hover:text-white flex items-center gap-2">
            ← Back to Product Factory
        </router-link>
      </div>
    </aside>

    <!-- WORKSPACE -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-white border-b h-16 flex items-center px-8 justify-between shadow-sm z-10">
            <h1 class="font-bold text-gray-700 uppercase text-xs tracking-widest">
                {{ $route.meta.displayName || 'Architect Dashboard' }}
            </h1>
            <div class="flex items-center gap-4">
                <span class="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-mono">SLUG: {{ slug }}</span>
            </div>
        </header>

        <main class="flex-1 overflow-y-auto p-10 bg-gray-50">
            <router-view :product="product" :slug="slug" />
        </main>
    </div>
  </div>

  <div v-else class="h-screen flex items-center justify-center bg-gray-100">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import apiClient from '@/services/api';

// Accept the product from the Layout
const props = defineProps({
  product: { type: Object, required: true },
  slug: { type: String, required: true }
});

const route = useRoute();
const { showConfirm, showAlert } = useAlerts();

const product = ref(props.product);

const fetchProduct = async () => {
    const { data } = await apiClient.get(`/admin/products/${props.slug}`);
    product.value = data;
};

const allSubscribers = ref([]);
const linkForm = ref({ subscriberId: '', displayName: '' });

// If the parent product changes, update our local ref
watch(() => props.product, (newVal) => {
    product.value = newVal;
}, { deep: true });

onMounted(fetchProduct);
</script>

<style scoped>
.nav-item { @apply block px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-medium; }
.router-link-active { @apply bg-gray-800 text-white border-l-4 border-indigo-500; }
</style>