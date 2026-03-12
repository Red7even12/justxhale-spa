<template>
  <div class="bg-[#F5F7F7] font-sans min-h-screen flex flex-col">
    
    <!-- 1. MOBILE SIDEBAR: Hidden in V2 Context -->
    <div v-if="isMobileMenuOpen && !isV2Context" class="xl:hidden" role="dialog" aria-modal="true">
      <div @click="isMobileMenuOpen = false" class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"></div>
      <div class="fixed inset-y-0 left-0 flex flex-col w-64 bg-[#242E2C] z-50">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button @click="isMobileMenuOpen = false" type="button" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span class="sr-only">Close sidebar</span>
            <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="flex items-center justify-center py-6 flex-shrink-0 px-4">
          <Logo class="h-12 w-auto" />
        </div>
        <nav class="flex-1 flex flex-col px-2 pb-4 space-y-1">
          <template v-if="!authStore.hasRole('System Admin') && !authStore.hasRole('Business Admin')">
            <router-link @click="closeMobileMenu" to="/" class="mobile-nav-link" :class="{ 'active': $route.name === 'Dashboard' }">Reminders</router-link>
            <router-link @click="closeMobileMenu" to="/estates" class="mobile-nav-link" :class="{ 'active': $route.path.startsWith('/estates') }">Estates</router-link>
            <router-link @click="closeMobileMenu" to="/entities" class="mobile-nav-link" :class="{ 'active': $route.path.startsWith('/entities') }">Contacts & Entities</router-link>
          </template>
          <!-- ... (Rest of your mobile menu content) ... -->
        </nav>
      </div>
    </div>

    <!-- 2. MAIN HEADER (V1): Completely hidden in V2 Context -->
    <header v-if="!isV2Context" class="shadow-sm sticky top-0 z-10">
      <!-- Top Branding & Navigation Bar -->
      <div class="flex justify-between items-center p-4 bg-[#484b45]">
        <div class="flex items-center space-x-8">
          <button @click="isMobileMenuOpen = true" type="button" class="xl:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20">
            <span class="sr-only">Open menu</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Logo class="h-16 w-auto" />
          <nav class="hidden xl:flex items-center space-x-1">
            
            <!-- 1. STANDARD SUBSCRIBER MENU (V1) -->
            <template v-if="!authStore.hasRole('System Admin') && !authStore.hasRole('Business Admin')">
              <router-link to="/launcher" class="nav-link" :class="{ 'active': $route.name === 'AppLauncher' }">Home</router-link>
              <router-link to="/estates" class="nav-link" :class="{ 'active': $route.path.startsWith('/estates') }">Estates</router-link>
              <router-link to="/entities" class="nav-link" :class="{ 'active': $route.path.startsWith('/entities') }">Registry</router-link>
            </template>
            
            <div v-if="authStore.hasRole('Subscriber Admin') || authStore.hasRole('System Admin') || authStore.hasRole('Business Admin')" class="border-l border-gray-500 h-6 mx-3"></div>
            
            <!-- 2. SUBSCRIBER ADMIN MENU -->
            <template v-if="authStore.hasRole('Subscriber Admin')">
              <router-link to="/admin/users" class="nav-link" :class="{ 'active': $route.path.startsWith('/admin/users') }">User Management</router-link>
              <router-link to="/admin/teams" class="nav-link" :class="{ 'active': $route.path.startsWith('/admin/teams') }">Team Management</router-link>
            </template>

            <!-- 3. SYSTEM ADMIN MENU (Merged V1 & V2) -->
            <template v-if="authStore.hasRole('System Admin') || authStore.hasRole('Business Admin')">
              
              <!-- NEW: V2 PRODUCT FACTORY LINK -->
              <router-link to="/admin/products" class="nav-link" :class="{ 'active': $route.path.startsWith('/admin/products') }">
                <span class="text-yellow-400 font-bold">Product Factory</span>
              </router-link>

              <!-- ORIGINAL: SAAS MANAGEMENT DROPDOWN -->
              <div class="relative">
                <button @click="isSaaSMenuOpen = !isSaaSMenuOpen" class="nav-link flex items-center" type="button">
                  <span>SaaS Management</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="ml-1 h-5 w-5"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path></svg>
                </button>
                <!-- Backdrop to close on click-away -->
                <div v-if="isSaaSMenuOpen" @click="isSaaSMenuOpen = false" class="fixed inset-0 z-10 cursor-default"></div>
                
                <div v-if="isSaaSMenuOpen" class="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div class="py-1" role="none">
                    <router-link v-if="authStore.hasRole('System Admin')" to="/admin/core-users" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Core Users</router-link>
                    <router-link to="/admin/subscribers" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Subscribers</router-link>
                    <router-link to="/admin/pricing-plans" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Pricing Management</router-link>
                    <router-link to="/admin/billing" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Billing Management</router-link>
                  </div>
                </div>
              </div>

              <!-- ORIGINAL: SYSTEM SETUP DROPDOWN (Strictly System Admin) -->
              <div v-if="authStore.hasRole('System Admin')" class="relative">
                <button @click="isSystemMenuOpen = !isSystemMenuOpen" class="nav-link flex items-center" type="button">
                  <span>System Setup</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="ml-1 h-5 w-5"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path></svg>
                </button>
                <!-- Backdrop to close on click-away -->
                <div v-if="isSystemMenuOpen" @click="isSystemMenuOpen = false" class="fixed inset-0 z-10 cursor-default"></div>

                <div v-if="isSystemMenuOpen" class="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div class="py-1" role="none">
                    <router-link :to="{ name: 'admin.document-packs' }" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Document Packs</router-link>
                    <router-link to="/admin/document-management" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Document Setup</router-link>                  
                    <router-link to="/admin/workflow-management" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Workflow Management</router-link>
                    <router-link to="/admin/file-types" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Case File Types</router-link>
                    
                    <router-link to="/admin/option-lists" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Option Lists</router-link>
                    <router-link to="/admin/non-working-days" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Non-Working Days</router-link>
                  </div>
                </div>
              </div>
            </template>
          </nav>
        </div>

        <!-- User Profile & Logout -->
        <div class="flex items-center space-x-6 text-white">
          <div class="flex items-center space-x-4 border-l border-gray-400 pl-6">
            <router-link to="/my-profile" title="My Profile" class="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
              <span class="sr-only">My Profile</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
              </svg>
            </router-link>
            <div>
                <div v-if="authStore.user && authStore.user.subscriber" class="text-sm font-light text-right">{{ authStore.user.subscriber.name }}</div>
                <div v-if="authStore.user" class="text-sm font-semibold text-right">{{ authStore.user.name }}</div>
            </div>
            <button @click="logout" class="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Logout</button>
          </div>
        </div>
      </div>
      
      <!-- V1 Navigation Bar with Breadcrumbs & Search -->
      <div class="bg-gray-100 border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row md:justify-between md:items-center">
        <div class="flex-1">
          <Breadcrumbs />
          <h1 class="text-xl font-semibold text-[#242E2C] mt-2">{{ $route.meta.displayName || $route.name }}</h1>
        </div>

        <div class="flex items-center space-x-4 mt-3 md:mt-0">
            <div class="flex items-center relative w-64">
              <label for="search" class="text-sm font-medium text-gray-700 mr-2">Find Case Number(CN)</label>
              <div class="relative flex-grow">
                <div class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.817-4.817A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                </div>
                <input id="search" name="search" class="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm" placeholder="Case Number" type="search" v-model="searchTerm" @keyup.enter="executeSearch" />
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button v-for="(action, index) in uiStore.headerActions" :key="index" @click="action.onClick" class="px-4 py-2 text-sm font-medium text-white bg-[#74958D] rounded-lg hover:bg-[#58726A]">{{ action.label }}</button>
            </div>
        </div>
      </div>
    </header>

    <!-- 3. MAIN CONTENT: V2 context removes the V1 padding -->
    <main :class="['flex-1', isV2Context ? 'p-0' : 'p-6']">
      <router-view />
    </main>

    <!-- 4. GLOBAL MODAL: Always available -->
    <ConfirmationModal
      :show="showModal"
      :title="modalTitle"
      :message="modalMessage"
      :mode="modalMode"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useUiStore } from '../store/ui';
import { useRouter } from 'vue-router';
import Logo from '../components/common/Logo.vue';
import ConfirmationModal from '../components/modals/ConfirmationModal.vue'; 
import { useAlerts } from '../composables/useAlerts'; 
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'; 
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// PILLAR 6: Context Awareness
// This identifies if we should hide the V1 header.
const isV2Context = computed(() => {
  // Hide V1 header if we are on the Launcher OR inside a Product slug
  return route.name === 'AppLauncher' || !!route.params.productSlug;
});

const isSaaSMenuOpen = ref(false); 
const isSystemMenuOpen = ref(false); 

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter(); 
const logout = () => { authStore.logout(); };

const isMobileMenuOpen = ref(false);
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const searchTerm = ref('');
const executeSearch = () => {
  if (!searchTerm.value.trim()) return; 
  router.push({ 
    name: 'search.results', 
    query: { case_number: searchTerm.value }
  });
  searchTerm.value = '';
};

const { showModal, modalTitle, modalMessage, modalMode, onConfirm, onCancel } = useAlerts();

onMounted(() => {
  console.log('--- AppLayout Debug ---');
  console.log('User Roles:', authStore.roles);
  console.log('Is System Admin?', authStore.hasRole('System Admin'));
  console.log('Is Business Admin?', authStore.hasRole('Business Admin'));
});
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-md text-gray-200 hover:bg-black hover:bg-opacity-10 hover:text-white transition-colors;
}
.nav-link.active {
  @apply text-white font-semibold border-b-2 border-white;
}
.mobile-nav-link {
  @apply flex items-center px-4 py-2 rounded-md text-[#EAF1F1] hover:bg-[#3E4F4B];
}
.mobile-nav-link.active {
  @apply bg-[#3E4F4B] font-semibold;
}
</style>