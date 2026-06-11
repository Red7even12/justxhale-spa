<template>
  <!-- frontend-spa\src\layouts\ProductLayout.vue-->

  <div :style="brandStyles" class="min-h-screen flex flex-col font-sans antialiased text-gray-900 bg-gray-50">
    
    <!-- 1. MOBILE SIDEBAR (V2) -->
    <div v-if="isMobileMenuOpen" class="xl:hidden" role="dialog" aria-modal="true">
      <div @click="isMobileMenuOpen = false" class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"></div>
      <div class="fixed inset-y-0 left-0 flex flex-col w-64 bg-brand-primary z-50 shadow-xl">
        <!-- Close Button -->
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button @click="isMobileMenuOpen = false" type="button" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span class="sr-only">Close sidebar</span>
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Mobile Logo -->
        <div class="flex items-center justify-center py-6 flex-shrink-0 px-4 border-b border-white/10">
          <div v-if="product?.logoUrl || product?.logo_url" class="h-12 w-auto">
             <img 
               :src="getAssetUrl(product.logoUrl || product.logo_url)" 
               alt="Product Logo" 
               class="h-full w-auto object-contain"
             />
          </div>
          <div v-else class="text-white font-bold text-xl uppercase tracking-tighter">
            {{ product?.name || 'JustXhale' }}
          </div>
        </div>

        <!-- Mobile Links -->
        <nav class="flex-1 flex flex-col px-2 py-4 space-y-1 overflow-y-auto">
          <router-link @click="isMobileMenuOpen = false" :to="`/${productSlug}/dashboard`" class="mobile-nav-link" active-class="mobile-nav-active">
            Reminders
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="`/${productSlug}/cases`" class="mobile-nav-link" active-class="mobile-nav-active">
            Case Files
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="`/${productSlug}/registry`" class="mobile-nav-link" active-class="mobile-nav-active">
            People
          </router-link>
          
          <!-- Mobile Reports Node -->
          <div>
            <button @click="isMobileReportsOpen = !isMobileReportsOpen" class="w-full mobile-nav-link flex justify-between items-center text-left">
              <span>Reports</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 text-white/60" :class="{ 'rotate-180': isMobileReportsOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-show="isMobileReportsOpen" class="pl-4 space-y-1 bg-black/10 rounded-lg py-1 mt-1">
              <!-- Main Library Link -->
              <router-link 
                :to="{ name: 'ProductReport', params: { productSlug: $route.params.productSlug } }" 
                class="block px-4 py-2 text-sm text-white/80 hover:text-white"
                @click="isMobileMenuOpen = false"
              >
                Reports Library
              </router-link>
              
              <div class="px-4 py-2 text-xs text-white/40 italic border-t border-white/5 mt-1">
                Custom reports available in library...
              </div>
            </div>
          </div>

          <!-- Mobile Admin Node -->
          <template v-if="authStore.hasRole('Subscriber Admin') || authStore.hasRole('System Admin')">
            <div class="pt-2">
              <button @click="isMobileAdminOpen = !isMobileAdminOpen" class="w-full mobile-nav-link flex justify-between items-center text-left">
                <span>Admin</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 text-white/60" :class="{ 'rotate-180': isMobileAdminOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="isMobileAdminOpen" class="pl-4 space-y-1 bg-black/10 rounded-lg py-1 mt-1">
                <router-link @click="isMobileMenuOpen = false" :to="`/${productSlug}/import`" class="mobile-sub-nav-link" active-class="mobile-sub-nav-active">
                  Take-on
                </router-link>
                <router-link @click="isMobileMenuOpen = false" :to="`/${productSlug}/users`" class="mobile-sub-nav-link" active-class="mobile-sub-nav-active">
                  Users
                </router-link>
                <router-link @click="isMobileMenuOpen = false" :to="`/${productSlug}/teams`" class="mobile-sub-nav-link" active-class="mobile-sub-nav-active">
                  Teams
                </router-link>
              </div>
            </div>
          </template>

          <div class="border-t border-white/10 my-4 pt-4"></div>
          
          <router-link @click="isMobileMenuOpen = false" to="/launcher" class="mobile-nav-link text-yellow-400 font-bold">
            Switch App
          </router-link>
          <router-link @click="isMobileMenuOpen = false" to="/my-profile" class="mobile-nav-link">
            My Profile
          </router-link>
          <div class="px-4 py-3">
            <button @click="handleLogout(); isMobileMenuOpen = false;" class="mobile-nav-link text-red-400 w-full text-left p-0">
              Logout
            </button>
            <div class="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">v{{ authStore.appVersion }}</div>
          </div>
          </nav>
        <div class="p-4 border-t border-white/10 bg-black/10">
          <div class="text-[10px] uppercase tracking-widest text-white/60 font-bold leading-none mb-1">Active Context</div>
          <div class="text-xs text-white font-black uppercase">{{ productSlug }}</div>
        </div>
      </div>
    </div>

    <!-- CONSOLIDATED TOP NAVIGATION (V2) -->
    <header class="bg-brand-primary border-b border-white/10 sticky top-0 z-40 shadow-md">
      <div class="max-w-[100%] mx-auto px-6 h-[96px] flex items-center justify-between">
        
        <!-- Left Section: Branding & Product Navigation -->
        <div class="flex items-center gap-6 h-full">
          <!-- Mobile Menu Toggle -->
          <button @click="isMobileMenuOpen = true" type="button" class="xl:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 mr-2">
            <span class="sr-only">Open menu</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div class="flex items-center gap-4 pr-6 border-r border-white/20 h-16">
            
            <!-- Logo OR Fallback Letter -->
            <div v-if="product?.logoUrl || product?.logo_url" class="h-16 w-auto">
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

          <!-- Product Horizontal Menu (Desktop) -->
          <nav class="hidden xl:flex items-center gap-2">
            <router-link :to="`/${productSlug}/dashboard`" class="top-nav-link" active-class="top-nav-active">
              Reminders
            </router-link>
            <router-link :to="`/${productSlug}/cases`" class="top-nav-link" active-class="top-nav-active">
              Case Files
            </router-link>
            <router-link :to="`/${productSlug}/registry`" class="top-nav-link" active-class="top-nav-active">
              Contacts
            </router-link>

            <!-- Reports Dropdown Node -->
            <div class="relative">
              <button @click="toggleReportsDropdown" 
                      @blur="closeReportsWithDelay"
                      class="top-nav-link flex items-center gap-1.5 focus:outline-none transition-all"
                      :class="{ 'top-nav-active': isReportsActive, 'bg-white/10': isReportsOpen }">
                <span>Reports</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200 opacity-80" :class="{ 'rotate-180': isReportsOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div v-show="isReportsOpen" 
                  class="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-left transition-all duration-200">
                <div class="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                  Reporting Hub
                </div>
                
                <!-- Link to the Dashboard -->
                <router-link 
                  :to="{ name: 'ProductReport', params: { productSlug: $route.params.productSlug } }" 
                  class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all font-medium"
                  @click="isReportsOpen = false"
                >
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-lg opacity-50">analytics</span>
                    Open Report Library
                  </div>
                </router-link>

                <div class="px-4 py-3 text-[10px] text-gray-400 italic leading-tight bg-gray-50/50 mt-1">
                  Access standard and custom operational reports.
                </div>
              </div>
            </div>

            <!-- Admin Dropdown Node -->
            <div v-if="authStore.hasRole('Subscriber Admin') || authStore.hasRole('System Admin')" class="relative">
              <button @click="toggleAdminDropdown" 
                      @blur="closeAdminWithDelay"
                      class="top-nav-link flex items-center gap-1.5 focus:outline-none transition-all"
                      :class="{ 'top-nav-active': isAdminActive, 'bg-white/10': isAdminOpen }">
                <span>Admin</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-200 opacity-80" :class="{ 'rotate-180': isAdminOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-show="isAdminOpen" 
                   class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all duration-200">
                <router-link :to="`/${productSlug}/import`" class="dropdown-item" active-class="dropdown-active">
                  Take-on
                </router-link>
                <router-link :to="`/${productSlug}/users`" class="dropdown-item" active-class="dropdown-active">
                  Users
                </router-link>
                <router-link :to="`/${productSlug}/teams`" class="dropdown-item" active-class="dropdown-active">
                  Teams
                </router-link>
              </div>
            </div>
          </nav>
        </div>

        <!-- Right Section: Identity, Switcher & Logout (Desktop View) -->
        <div class="flex items-center gap-4 lg:gap-6 h-full">

          <div class="hidden xl:block text-right">
            <div class="text-[10px] uppercase tracking-widest text-white/60 font-bold leading-none mb-1">Active Context</div>
            <div class="text-xs text-white font-black uppercase">{{ productSlug }}</div>
          </div>
          
          <!-- App Switcher -->
          <router-link to="/launcher" class="text-[10px] font-bold text-white items-center gap-1.5 uppercase tracking-widest border border-white/40 px-3 py-1.5 rounded-md hover:bg-white/10 transition-all opacity-80 hover:opacity-100 hidden md:flex">
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
              <div class="text-right hidden lg:block">
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
            <div class="hidden sm:flex flex-col items-end gap-1">
              <button 
                @click="handleLogout" 
                class="px-3 py-1.5 text-[10px] font-bold text-white bg-red-500/80 hover:bg-red-600 rounded-md transition-all uppercase tracking-wider shadow-sm border border-red-400/50"
              >
                Logout
              </button>
              <span class="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-none">v{{ authStore.appVersion }}</span>
            </div>
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
const isMobileMenuOpen = ref(false); // Added for mobile navigation
const productSlug = computed(() => route.params.productSlug);

// --- Dropdown States & Toggles ---
const isAdminOpen = ref(false);
const isReportsOpen = ref(false);
const isMobileAdminOpen = ref(false);
const isMobileReportsOpen = ref(false);

const toggleAdminDropdown = () => {
  isAdminOpen.value = !isAdminOpen.value;
  if (isAdminOpen.value) isReportsOpen.value = false;
};

const toggleReportsDropdown = () => {
  isReportsOpen.value = !isReportsOpen.value;
  if (isReportsOpen.value) isAdminOpen.value = false;
};

const closeAdminWithDelay = () => {
  setTimeout(() => {
    isAdminOpen.value = false;
  }, 200);
};

const closeReportsWithDelay = () => {
  setTimeout(() => {
    isReportsOpen.value = false;
  }, 200);
};

// --- Active Node Highlights ---
const isAdminActive = computed(() => {
  if (!productSlug.value) return false;
  const paths = [
    `/${productSlug.value}/import`,
    `/${productSlug.value}/users`,
    `/${productSlug.value}/teams`
  ];
  return paths.some(p => route.path.startsWith(p));
});

const isReportsActive = computed(() => {
  if (!productSlug.value) return false;
  const paths = [
    `/${productSlug.value}/reports`
  ];
  return paths.some(p => route.path.startsWith(p));
});

// Close dropdowns on route change
watch(() => route.path, () => {
  isAdminOpen.value = false;
  isReportsOpen.value = false;
});

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

.dropdown-item {
  @apply block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-bold transition-colors;
}

.dropdown-active {
  @apply bg-gray-50 text-gray-900 font-black border-l-4 border-brand-primary;
}

.mobile-nav-link {
  @apply flex items-center px-4 py-3 rounded-md text-white/80 hover:bg-black/10 hover:text-white transition-all text-sm font-bold uppercase tracking-wide;
}

.mobile-nav-active {
  @apply bg-black/20 text-white border-l-4 border-white;
}

.mobile-sub-nav-link {
  @apply flex items-center px-4 py-2 rounded-md text-white/70 hover:bg-white/5 hover:text-white transition-all text-xs font-bold uppercase tracking-wide;
}

.mobile-sub-nav-active {
  @apply bg-white/10 text-white border-l-2 border-white;
}
</style>