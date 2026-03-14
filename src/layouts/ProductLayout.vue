<template>
  <!-- frontend-spa\src\layouts\ProductLayout.vue-->

  <div :style="brandStyles" class="min-h-screen flex flex-col font-sans antialiased text-gray-900 bg-gray-50">
    
    <!-- CONSOLIDATED TOP NAVIGATION (V2) -->
    <header class="bg-brand-primary border-b border-white/10 sticky top-0 z-40 shadow-md">
      <div class="max-w-[100%] mx-auto px-6 h-[75px] flex items-center justify-between">
        
        <!-- Left Section: Branding & Product Navigation -->
        <div class="flex items-center gap-6 h-full">
          <div class="flex items-center gap-4 pr-6 border-r border-white/20 h-10">
            
            <!-- Logo OR Fallback Letter -->
            <div v-if="product?.logoPath || product?.logo_path" class="h-30 w-auto">
               <img 
                 :src="getAssetUrl(product.logoUrl || product.logo_url)" 
                 alt="Product Logo" 
                 class="h-full w-auto object-contain drop-shadow-sm"
               />
            </div>
            <div v-else class="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-inner border border-white/30">
              {{ product ? product.name.charAt(0) : '?' }}
            </div>
          </div>

          <!-- Product Horizontal Menu -->
          <nav class="flex items-center gap-2">
            <router-link :to="`/${productSlug}/dashboard`" class="top-nav-link" active-class="top-nav-active">
              Dashboard
            </router-link>
            <router-link :to="`/${productSlug}/cases`" class="top-nav-link" active-class="top-nav-active">
              Case Files
            </router-link>
            <router-link :to="`/${productSlug}/registry`" class="top-nav-link" active-class="top-nav-active">
              Registry
            </router-link>
            <template v-if="authStore.hasRole('Subscriber Admin') || authStore.hasRole('System Admin')">
              <router-link :to="`/${productSlug}/users`" class="top-nav-link" active-class="top-nav-active">
                Users
              </router-link>
              <router-link :to="`/${productSlug}/teams`" class="top-nav-link" active-class="top-nav-active">
                Teams
              </router-link>
            </template>
          </nav>
        </div>

        <!-- Right Section: Identity, Switcher & Logout -->
        <div class="flex items-center gap-4 lg:gap-6 h-full">

          <div class="hidden lg:block text-right">
            <div class="text-[10px] uppercase tracking-widest text-white/60 font-bold leading-none mb-1">Active Context</div>
            <div class="text-xs text-white font-black uppercase">{{ productSlug }}</div>
          </div>
          
          <!-- App Switcher -->
          <router-link to="/launcher" class="text-[10px] font-bold text-white flex items-center gap-1.5 uppercase tracking-widest border border-white/40 px-3 py-1.5 rounded-md hover:bg-white/10 transition-all opacity-80 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            Switch App
          </router-link>

          <!-- USER IDENTITY & PROFILE LINK -->
          <div class="flex items-center gap-4 pl-4 border-l border-white/20 h-10">
            
            <router-link 
              to="/my-profile" 
              class="flex items-center gap-3 group"
              title="View My Profile"
            >
              <div class="text-right hidden sm:block">
                <div class="text-sm font-bold text-white leading-none group-hover:underline">
                  {{ authStore.user?.name }}
                </div>
                <div class="text-[10px] text-white/70 font-medium mt-1 uppercase tracking-tight">
                  {{ authStore.user?.subscriber?.name }}
                </div>
              </div>
              
              <!-- Initials Circle -->
              <div class="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:bg-white/20 transition-all">
                {{ userInitials }}
              </div>
            </router-link>

            <!-- Logout Button -->
            <button 
              @click="handleLogout" 
              class="px-3 py-1.5 text-[10px] font-bold text-white bg-red-500/80 hover:bg-red-600 rounded-md transition-all uppercase tracking-wider shadow-sm border border-red-400/50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- FULL WIDTH MAIN AREA -->
    <main class="flex-1 w-full p-6 lg:p-10">
      <router-view />
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import apiClient, { getAssetUrl } from '@/services/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const product = ref(null);
const productSlug = computed(() => route.params.productSlug);

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U';
  return authStore.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
});

const colors = ref({ primary: '#3B82F6', secondary: '#1E40AF' });

const fetchBranding = async () => {
  if (!productSlug.value) return;
  try {
    // Note: apiClient already includes /api/v1
    const { data } = await apiClient.get(`products/${productSlug.value}`);
    product.value = data;
    colors.value.primary = data.primaryColor || data.primary_color || '#3B82F6';
    colors.value.secondary = data.secondaryColor || data.secondary_color || '#1E40AF';
  } catch (e) {
    console.error("Branding fetch failed. Check if slug exists in DB.", e);
  }
};

const handleLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    await authStore.logout();
    router.push('/login');
  }
};

const brandStyles = computed(() => ({
  '--brand-primary': colors.value.primary,
  '--brand-secondary': colors.value.secondary,
}));

watch(() => route.params.productSlug, fetchBranding);
onMounted(fetchBranding);
</script>

<style scoped>
.top-nav-link {
  @apply px-3 py-2 rounded-md text-gray-200 hover:bg-black hover:bg-opacity-10 hover:text-white transition-colors;
}

.top-nav-active {
  @apply text-white font-semibold border-b-2 border-white;
}
</style>