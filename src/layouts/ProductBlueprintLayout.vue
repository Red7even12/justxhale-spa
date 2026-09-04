<template>
  <div class="min-h-screen bg-gray-50 flex" :style="brandStyles">
    <!-- Sidebar -->
    <aside class="w-64 text-white flex-shrink-0 shadow-xl flex flex-col h-screen sticky top-0 z-20" :style="{ backgroundColor: 'var(--brand-primary, #111827)' }">
      <div class="p-6 border-b border-white/10">
        <div v-if="product" class="flex flex-col items-center gap-3 mb-4">
            <div class="w-40 h-16 rounded-xl bg-white p-2 flex items-center justify-center shadow-inner overflow-hidden border border-white/10">
                <img v-if="product.logoUrl || product.logo_url" :src="getAssetUrl(product.logoUrl || product.logo_url)" class="max-h-full max-w-full object-contain" alt="Logo" />
                <div v-else class="text-3xl font-black text-gray-200">{{ product.name.charAt(0) }}</div>
            </div>
            <div class="text-center overflow-hidden w-full">
                <h1 class="font-bold truncate text-sm tracking-tight">{{ product.name }}</h1>
                <p class="text-[10px] text-white/50 uppercase tracking-widest font-black">DNA Blueprint</p>
            </div>
        </div>
        <router-link :to="backDestination" class="text-xs text-white/60 hover:text-white font-bold flex items-center justify-center gap-1 mt-2 transition-colors">
            ← {{ backLabel }}
        </router-link>
      </div>

<nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link :to="{ name: 'admin.product.dashboard', params: { slug } }" class="nav-link" active-class="nav-active">
          Dashboard
        </router-link>
        
        <div class="pt-6 pb-2 text-[10px] font-black text-white/30 uppercase tracking-widest px-3">Product Assembly</div>
        
        <!-- Re-labeled to Niche Assembly -->
        <router-link :to="{ name: 'admin.product.file-types', params: { slug } }" class="nav-link" active-class="nav-active">
          Workspace Assembly
        </router-link>
        
        <!-- Case Classifications (Priority badges calibrated for this product) -->
        <router-link :to="{ name: 'admin.product.file-classes', params: { slug } }" class="nav-link" active-class="nav-active">
          Case Classifications
        </router-link>

        <div class="pt-6 pb-2 text-[10px] font-black text-white/30 uppercase tracking-widest px-3">Commercial & SaaS</div>
        
        <router-link :to="{ name: 'admin.product.licensing', params: { slug } }" class="nav-link" active-class="nav-active">
          License Management
        </router-link>
      </nav>

      <div class="p-4 border-t border-white/10 bg-black/20 space-y-2">
          <router-link to="/launcher" class="block w-full text-center text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white border border-white/30 rounded-md py-1.5 hover:bg-white/10 transition-colors">
              ← Switch App (Home)
          </router-link>
          <div class="text-[10px] text-white/40 font-bold uppercase text-center tracking-tighter">
              Product Factory v2.1
          </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <!-- Left: Breadcrumbs -->
        <div class="flex items-center gap-2 text-sm text-gray-400">
            <span class="font-medium">Factory Floor</span> 
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-gray-900 font-bold">{{ product?.name }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-brand-primary-600 font-black uppercase text-[10px] tracking-widest">{{ $route.meta.displayName || 'Blueprinting' }}</span>
        </div>

        <!-- Right: Layout Selector & Role Badge -->
        <div class="flex items-center gap-4">
            <!-- 1. NEW: DYNAMIC PRODUCT UX LAYOUT SELECTOR -->
            <div v-if="product" class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <span class="text-[10px] font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">Layout:</span>
              <select 
                :value="product.workspace_template || product.workspaceTemplate || 'TemplateUnifiedStandard'"
                @change="updateLayoutEngine($event.target.value)"
                :disabled="updatingLayout"
                class="text-xs font-bold text-gray-800 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer pr-4 disabled:opacity-50"
              >
                <option value="TemplateUnifiedStandard">Unified Workspace (Tabs & Dual Engine)</option>
                <option value="TemplateEstateStandard">Estates: Classic 3-Column Manager</option>
                <option value="TemplateStandard">Standard Generic Single-Column</option>
              </select>
              <div v-if="updatingLayout" class="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div class="h-8 w-px bg-gray-100"></div>

            <!-- Role Badge -->
            <div class="text-right">
                <div class="text-xs font-bold text-gray-900 leading-none">
                    {{ authStore.hasRole('System Admin') ? 'Architect View' : 'Product Owner View' }}
                </div>
                <div class="text-[10px] text-gray-400 font-medium">
                    {{ product?.name }} DNA
                </div>
            </div>
        </div> 
      </header>

      <div class="flex-1 overflow-y-auto p-8 bg-gray-50/50">
        <!-- CRITICAL: Ensure props are passed to children -->
        <router-view v-if="product" :product="product" :slug="slug" :key="slug" />
        <div v-else class="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse">
            <div class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-500 animate-spin mb-4"></div>
            <p class="font-bold text-sm uppercase tracking-widest">Loading Product DNA...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient, { getAssetUrl } from '@/services/api';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const route = useRoute();
const slug = ref(route.params.slug);
const product = ref(null);
const updatingLayout = ref(false);

const brandStyles = computed(() => {
    if (!product.value) return {};
    return {
        '--brand-primary': product.value.primaryColor || product.value.primary_color || '#111827',
        '--brand-secondary': product.value.secondaryColor || product.value.secondary_color || '#4f46e5',
        '--brand-accent': (product.value.primaryColor || product.value.primary_color || '#111827') + '20' 
    };
});

const isWlpAdmin = computed(() => authStore.hasRole('WLP Admin') || authStore.hasRole('WLPAdmin'));
const isSystemAdmin = computed(() => authStore.hasRole('System Admin') || authStore.hasRole('Business Admin'));

const backDestination = computed(() => {
    return isWlpAdmin.value
        ? { name: 'partner.admin.dashboard' }
        : { name: 'admin.products' };
});

const backLabel = computed(() => {
    return isWlpAdmin.value ? 'Return to Partner Console' : 'Exit to Product List';
});

const fetchProduct = async () => {
  try {
    const { data } = await apiClient.get(`admin/products/${slug.value}`);
    product.value = data;
  } catch (error) {
    console.error("Failed to load context", error);
  }
};

// Autosave Layout Engine on change
const updateLayoutEngine = async (newLayout) => {
  updatingLayout.value = true;
  try {
    await apiClient.put(`admin/products/${slug.value}`, {
      workspace_template: newLayout
    });
    if (product.value) {
      product.value.workspace_template = newLayout;
      product.value.workspaceTemplate = newLayout;
    }
  } catch (error) {
    console.error("Failed to update layout engine", error);
    alert("Failed to update product layout engine.");
  } finally {
    updatingLayout.value = false;
  }
};

watch(() => route.params.slug, (newSlug) => {
    if (newSlug) {
        slug.value = newSlug;
        fetchProduct();
    }
}, { immediate: true });

onMounted(fetchProduct);
</script>

<style scoped>
.nav-link {
    @apply flex items-center px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all border border-transparent;
}
.nav-active {
    @apply bg-white/20 text-white border-white/10 font-black shadow-lg;
    background-image: linear-gradient(to right, rgba(255,255,255,0.1), transparent);
}
</style>