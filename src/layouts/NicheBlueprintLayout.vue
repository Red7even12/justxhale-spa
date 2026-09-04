<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Left Sidebar: Niche Blueprint Workshop -->
    <aside class="w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl flex flex-col h-screen sticky top-0 z-20">
      
      <!-- Top Niche Identity Box -->
      <div class="p-6 border-b border-white/10">
        <div v-if="niche" class="flex flex-col items-center gap-2 mb-3">
          <div class="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner">
            ⚡
          </div>
          <div class="text-center overflow-hidden w-full">
            <h1 class="font-black truncate text-sm tracking-tight text-white">{{ niche.name }}</h1>
            <p class="text-[10px] text-blue-400 uppercase tracking-widest font-black">
              {{ niche.category || 'Niche Blueprint' }}
            </p>
          </div>
        </div>

        <!-- Exit link back to Foundry Catalog -->
        <router-link :to="{ name: 'admin.niche-factory' }" class="text-xs text-white/50 hover:text-white font-bold flex items-center justify-center gap-1 mt-2 transition-colors">
          ← Exit to Workspace Factory
        </router-link>
      </div>

      <!-- Navigation Tree -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <div class="pt-2 pb-2 text-[10px] font-black text-white/30 uppercase tracking-widest px-3">
          DNA Engineering
        </div>

        <!-- 1. Fields DNA -->
        <router-link 
          :to="{ name: 'admin.niche-factory.fields', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">📋</span> Fields DNA
        </router-link>

        <!-- 2. Document Packs -->
        <router-link 
          :to="{ name: 'admin.niche-factory.document-packs', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">📦</span> Document Packs
        </router-link>

        <!-- 3. Workflows -->
        <router-link 
          :to="{ name: 'admin.niche-factory.workflows', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">⚡</span> Workflows
        </router-link>

        <!-- 4. Participant Roles -->
        <router-link 
          :to="{ name: 'admin.niche-factory.participant-roles', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">👥</span> Participant Roles
        </router-link>

        <!-- 5. System Mails -->
        <router-link 
          :to="{ name: 'admin.niche-factory.communication', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">✉️</span> System Mails
        </router-link>

        <!-- 6. Option Lists -->
        <router-link 
          :to="{ name: 'admin.niche-factory.option-lists', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">📑</span> Option Lists
        </router-link>

        <!-- Distribution Section -->
        <div class="pt-6 pb-2 text-[10px] font-black text-white/30 uppercase tracking-widest px-3">
          Commercial Usage
        </div>

        <!-- 7. Product Deployment Matrix -->
        <router-link 
          :to="{ name: 'admin.niche-factory.deployment', params: { fileTypeId } }" 
          class="nav-link" 
          active-class="nav-active"
        >
          <span class="text-base mr-1">🚀</span> Deployed Products
          <span v-if="niche?.products?.length" class="ml-auto bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
            {{ niche.products.length }}
          </span>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-white/10 bg-black/30 space-y-2">
        <div class="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase tracking-wider">
          <span>IP Status:</span>
          <span v-if="niche?.is_public" class="text-emerald-400">Public Core</span>
          <span v-else-if="!niche?.wlp_tenant_id" class="text-purple-400">Licensed IP</span>
          <span v-else class="text-blue-400">Proprietary</span>
        </div>
        <div class="text-[10px] text-white/30 font-mono text-center tracking-tighter">
          Foundry Engine v2.2
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Breadcrumb Header -->
      <header class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <router-link :to="{ name: 'admin.niche-factory' }" class="font-medium hover:text-blue-600 transition-colors">
            Workspace Foundry
          </router-link> 
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          <span class="text-gray-900 font-bold">{{ niche?.name }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          <span class="text-blue-600 font-black uppercase text-[10px] tracking-widest">{{ $route.meta.displayName || 'Blueprint' }}</span>
        </div>

        <!-- IP Tier Badge -->
        <div class="flex items-center gap-3">
          <span v-if="niche?.is_public" class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full uppercase">
            ● Public Core Blueprint
          </span>
          <span v-else-if="!niche?.wlp_tenant_id" class="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-3 py-1 rounded-full uppercase">
            🔒 Licensed Platform IP
          </span>
          <span v-else class="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black px-3 py-1 rounded-full uppercase">
            🏢 {{ niche.wlp_tenant?.name || 'Proprietary' }}
          </span>
        </div>
      </header>

      <!-- Sub-view content -->
      <div class="flex-1 overflow-y-auto p-8 bg-gray-50/50">
        <router-view v-if="niche" :niche="niche" :fileTypeId="fileTypeId" :key="fileTypeId" />
        <div v-else class="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse">
          <div class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mb-4"></div>
          <p class="font-bold text-sm uppercase tracking-widest">Loading Niche Blueprint...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const fileTypeId = ref(route.params.fileTypeId);
const niche = ref(null);

const fetchNiche = async () => {
  try {
    const { data } = await apiClient.get(`admin/file-types/${fileTypeId.value}`);
    niche.value = data?.data || data;
  } catch (error) {
    console.error('Failed to load niche blueprint layout context', error);
  }
};

watch(() => route.params.fileTypeId, (newId) => {
  if (newId) {
    fileTypeId.value = newId;
    fetchNiche();
  }
}, { immediate: true });

onMounted(fetchNiche);
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all border border-transparent;
}
.nav-active {
  @apply bg-blue-600/40 text-white border-blue-500/30 font-black shadow-md;
}
</style>