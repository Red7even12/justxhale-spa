<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
    
    <!-- 1. Emergency Logout -->
    <div class="absolute top-6 right-6">
      <div class="flex items-center gap-4">
        <div class="text-right">
            <div class="text-sm font-bold text-gray-900">{{ authStore.user?.name }}</div>
            <div class="text-xs text-gray-500">{{ authStore.user?.email }}</div>
        </div>
        <button @click="authStore.logout()" class="px-4 py-2 bg-white border border-gray-300 shadow-sm text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          Logout
        </button>
      </div>
    </div>

    <div class="max-w-5xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900">Welcome back, {{ authStore.user?.name }}</h1>
        <p class="mt-2 text-gray-600">Please select an application context to continue.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        
        <!-- 2. SYSTEM ADMIN CARD -->
        <div v-if="authStore.hasRole('System Admin') || authStore.hasRole('Business Admin')" 
             class="bg-[#242E2C] text-white rounded-xl shadow-xl border border-gray-800 overflow-hidden hover:scale-105 transition-transform duration-300">
          <div class="h-2 bg-yellow-500"></div>
          <div class="p-8 flex flex-col h-full">
            <div class="flex items-center mb-6">
              <div class="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center text-[#242E2C] text-xl font-bold shadow-inner mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold">System Admin</h2>
                <span class="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Master Console</span>
              </div>
            </div>
            <p class="text-gray-400 text-sm mb-8 flex-grow">
              Access the Product Factory, Global Registry, and Subscriber Management tools.
            </p>
            <button @click="router.push('/admin/products')" 
                    class="w-full bg-yellow-500 text-[#242E2C] py-3 rounded-lg font-bold shadow-md hover:bg-yellow-400 transition-colors">
              Open Console
            </button>
          </div>
        </div>

        <!-- 3. STANDARD PRODUCT CARDS -->
        <div v-for="product in products" :key="product.id" 
             class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          
          <!-- Product Color Header -->
          <div :style="{ backgroundColor: getPrimaryColor(product) }" class="h-2"></div>
          
          <div class="p-8 flex flex-col h-full">
            <div class="flex items-center mb-6">
              
              <!-- LOGO LOGIC START -->
              <div v-if="product.logoUrl || product.logo_url" 
                   class="w-40 h-15 mr-4 bg-gray-500 rounded-lg shadow-sm border border-gray-400 flex items-center justify-center overflow-hidden p-1">
                 <img 
                   :src="getAssetUrl(product.logoUrl || product.logo_url)" 
                   class="w-full h-full object-contain" 
                   alt="App Logo"
                 />
              </div>

              <div v-else 
                   :style="{ backgroundColor: getPrimaryColor(product) }" 
                   class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-inner mr-4">
                {{ product.name.charAt(0) }}
              </div>
              <!-- LOGO LOGIC END -->

              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ product.name }}</h2>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Licensed App</span>
              </div>
            </div>

            <p class="text-gray-500 text-sm mb-8 leading-relaxed flex-grow">
              Access the {{ product.name }} engine workspace.
            </p>

            <div class="flex gap-3">
              <button @click="launch(product.slug)" 
                      :style="{ backgroundColor: getPrimaryColor(product) }"
                      class="flex-1 text-white py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity text-sm">
                Launch
              </button>
            </div>
          </div>
        </div>

        <!-- 4. NO PRODUCTS STATE -->
        <div v-if="products.length === 0 && !authStore.hasRole('System Admin') && !authStore.hasRole('Business Admin')" class="col-span-full text-center py-12">
           <div class="text-gray-400 mb-2">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
           </div>
           <h3 class="text-lg font-bold text-gray-900">No Applications Assigned</h3>
           <p class="text-gray-500">Contact your administrator to assign a license to your account.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth'; 
import apiClient, { getAssetUrl } from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();
const products = ref([]);
const subscriberName = ref('');

// Helper to handle casing (snake vs camel)
const getPrimaryColor = (p) => p.primaryColor || p.primary_color || '#3B82F6';

const fetchMyProducts = async () => {
  try {
    const { data } = await apiClient.get('user/products');
    products.value = data.products || [];
    subscriberName.value = data.subscriberName || '';

    // Logic: If user only has ONE product AND is NOT an Admin, auto-launch.
    const isAdmin = authStore.hasRole('System Admin') || authStore.hasRole('Business Admin');
    if (products.value.length === 1 && !isAdmin) {
      launch(products.value[0].slug);
    }
  } catch (error) {
    console.error("Launcher error:", error);
  }
};

const launch = (slug) => {
  router.push(`/${slug}/dashboard`);
};

onMounted(fetchMyProducts);
</script>