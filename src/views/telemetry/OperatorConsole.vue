<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between max-w-lg mx-auto shadow-2xl p-6">
    
    <!-- Top Bar: Operator Identity & Logout -->
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-sm font-black text-white uppercase tracking-tight">Field Operator Console</h1>
        <p class="text-xs text-blue-400 font-mono">{{ authStore.user?.name || 'Operator' }}</p>
      </div>
      <button 
        @click="logout" 
        class="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
      >
        Logout
      </button>
    </header>

    <!-- Main Mobile Hub Body -->
    <main class="space-y-6 my-auto py-8">
      
      <!-- Primary Action: Scan QR Code -->
      <div class="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-xl text-center space-y-4">
        <div class="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
          📷
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-black text-white uppercase tracking-wide">Scan Machine QR</h2>
          <p class="text-xs text-blue-100">Point your camera at the physical QR sticker on the asset cab.</p>
        </div>
        <button
          @click="openScanner"
          class="w-full py-4 bg-white text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:bg-slate-100 transition"
        >
          Open Camera Scanner
        </button>
      </div>

      <!-- Secondary Action: Manual Asset Search (For Unlabelled Assets) -->
      <div class="bg-slate-850 p-5 rounded-3xl border border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-300 uppercase">Manual Asset Search</h3>
          <span class="text-[10px] text-slate-500">No QR sticker?</span>
        </div>
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="searchAssets"
            type="text"
            placeholder="Type fleet #, VIN, or asset name..."
            class="w-full bg-slate-900 border-slate-700 rounded-xl text-xs text-white p-3 pr-10 focus:ring-blue-500"
          />
          <span class="absolute right-3 top-3.5 text-slate-500 text-xs">🔍</span>
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="searchResults.length > 0" class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 max-h-48 overflow-y-auto">
          <button
            v-for="asset in searchResults"
            :key="asset.id"
            @click="selectAsset(asset.qr_uuid)"
            class="w-full p-3 text-left hover:bg-slate-800 transition flex items-center justify-between text-xs"
          >
            <div>
              <div class="font-bold text-white">{{ asset.file_name }}</div>
              <div class="text-[10px] text-slate-400 font-mono">Ref: {{ asset.file_reference || 'N/A' }}</div>
            </div>
            <span class="text-blue-400 font-bold">Select →</span>
          </button>
        </div>
      </div>

      <!-- Quick Link: My Compliance Profile -->
      <div class="text-center">
        <router-link
          to="/my-compliance"
          class="text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>🛡️</span> View My Compliance & Certifications →
        </router-link>
      </div>

    </main>

    <!-- Footer -->
    <footer class="text-center text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-4">
      JustXhale Field Telemetry V2.2
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const searchResults = ref([]);
let searchTimeout = null;

const openScanner = () => {
  // If you use a QR scanner library, trigger it here. 
  // Otherwise, fallback to manual search or prompt for QR code URL.
  const uuid = prompt('Enter or paste asset QR code ID (or scan):');
  if (uuid) {
    router.push({ name: 'public.telemetry.ingest', params: { qrUuid: uuid } });
  }
};

const searchAssets = () => {
  clearTimeout(searchTimeout);
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await apiClient.get('/telemetry/assets/search', {
        params: { q: searchQuery.value }
      });
      searchResults.value = res.data.data || [];
    } catch (e) {
      console.error('Asset search failed', e);
    }
  }, 350);
};

const selectAsset = (qrUuid) => {
  router.push({ name: 'public.telemetry.ingest', params: { qrUuid } });
};

const logout = async () => {
  await authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.bg-slate-850 {
  background-color: #131b2e;
}
</style>