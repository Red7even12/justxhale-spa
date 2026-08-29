<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      
      <!-- Header Banner -->
      <div class="bg-brand-primary p-6 text-white text-center">
        <h1 class="text-2xl font-black tracking-tight">JustXhale PaaS Master Agreement</h1>
        <p class="text-xs text-white/70 mt-1 uppercase font-bold tracking-widest">Digital Partner Onboarding Schedule</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingSchedule" class="p-12 text-center text-gray-500 animate-pulse">
        <div class="text-sm font-bold uppercase tracking-wider">Retrieving terms schedule...</div>
      </div>

      <!-- Error / Invalid Token -->
      <div v-else-if="error" class="p-8 text-center space-y-4">
        <div class="text-red-600 font-bold text-lg">{{ error }}</div>
        <p class="text-xs text-gray-500">Please contact platform administration for a revised onboarding link.</p>
      </div>

      <!-- Schedule Content -->
      <div v-else-if="schedule" class="p-6 space-y-6">
        
        <!-- Partner Identification -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-2">
          <div>
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Partner Entity</div>
            <div class="text-lg font-black text-gray-900 mt-1">
              {{ schedule.wlpName || schedule.wlp_name }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-wider">Authorized Person</div>
            <div class="text-sm font-bold text-gray-800 mt-1">
              {{ schedule.contactPerson || schedule.contact_person || 'Authorized Representative' }}
            </div>
            <div class="text-xs text-gray-500">
              {{ schedule.contactEmail || schedule.contact_email }}
            </div>
          </div>
        </div>

        <!-- Schedule Parameters Grid -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <span class="block text-gray-500 font-bold uppercase text-[10px]">Activation Deposit Credit</span>
            <span class="text-base font-black text-brand-blue-700">
              R {{ formatMoney(schedule.activationDeposit || schedule.activation_deposit) }}
            </span>
            <span class="block text-[10px] text-gray-400 mt-0.5">Auto-credited to platform fees</span>
          </div>

          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span class="block text-gray-500 font-bold uppercase text-[10px]">Launch Grace Period</span>
            <span class="text-base font-black text-gray-900">
              {{ schedule.launchGraceDays || schedule.launch_grace_days }} Days
            </span>
            <span class="block text-[10px] text-gray-400 mt-0.5">Platform minimum waiver</span>
          </div>

          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span class="block text-gray-500 font-bold uppercase text-[10px]">Base Price Per Casefile</span>
            <span class="text-base font-black text-gray-900">
              R {{ formatMoney(schedule.commercialParameters?.basePricePerFile || schedule.commercial_parameters?.base_price_per_file) }}
            </span>
          </div>

          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span class="block text-gray-500 font-bold uppercase text-[10px]">Min Subscriber Floor</span>
            <span class="text-base font-black text-gray-900">
              R {{ formatMoney(schedule.minimumSubscriberFloor || schedule.minimum_subscriber_floor) }} / mo
            </span>
          </div>
        </div>

        <!-- ENFORCED STRONG PASSWORD SETUP SECTION -->
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          <div class="flex justify-between items-center border-b pb-2">
            <span class="text-xs font-black uppercase text-gray-700 tracking-wider">Set WLP Admin Password</span>
            <button type="button" @click="generateAndSetPassword" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Generate Strong Password
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Password Field -->
            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-500 mb-1">New Secure Password</label>
              <div class="relative rounded-md shadow-sm">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  class="form-input w-full pr-10"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-500 mb-1">Confirm New Password</label>
              <div class="relative rounded-md shadow-sm">
                <input
                  v-model="passwordConfirmation"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  class="form-input w-full pr-10"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  @click="showPasswordConfirm = !showPasswordConfirm"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                >
                  <svg v-if="!showPasswordConfirm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="text-[10px] text-gray-400 italic">
            Password must be at least 8 characters and contain uppercase, lowercase, numbers, and symbols under POPIA compliance rules.
          </div>
        </div>

        <!-- ECTA Electronic Acceptance Checkbox -->
        <div class="border-t pt-4 space-y-3">
          <label class="flex items-start gap-3 cursor-pointer">
            <input v-model="acceptedTerms" type="checkbox" class="mt-1 h-4 w-4 text-brand-primary rounded border-gray-300" />
            <span class="text-xs text-gray-700 leading-relaxed">
              I, <strong>{{ schedule.contactPerson || schedule.contact_person || 'Authorized Representative' }}</strong>, representing <strong>{{ schedule.wlpName || schedule.wlp_name }}</strong>, confirm electronic acceptance of this custom Onboarding Schedule, subject to the 
              <a :href="getLegalUrl('master-paas-agreement')" target="_blank" class="text-brand-primary font-bold underline hover:opacity-80">
                JustXhale Master PaaS Agreement
              </a> 
              and the 
              <a :href="getLegalUrl('sla-popia-pack')" target="_blank" class="text-brand-primary font-bold underline hover:opacity-80">
                GTW Platform SLA & POPIA Compliance Pack
              </a>. I acknowledge that acceptance forms a legally binding contract with GTW Software Technologies (Pty) Ltd under ECTA (Act 25 of 2002) and is permanently recorded in the audit ledger.
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            @click="submitAcceptance"
            :disabled="!acceptedTerms || !password || password.length < 8 || password !== passwordConfirmation || isSubmitting"
            class="w-full py-3 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {{ isSubmitting ? 'Provisioning Tenant & Account...' : 'Accept Terms & Launch Partner Account' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const router = useRouter();
const token = route.params.token;

const schedule = ref(null);
const isLoadingSchedule = ref(true);
const error = ref(null);
const acceptedTerms = ref(false);

const password = ref('');
const passwordConfirmation = ref('');
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const isSubmitting = ref(false);

const formatMoney = (val) => Number(val || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });

const getLegalUrl = (slug) => {
  const docs = schedule.value?.legalDocuments || schedule.value?.legal_documents || {};
  const camelSlug = slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  const snakeSlug = slug.replace(/-/g, '_');
  return docs[slug] || docs[camelSlug] || docs[snakeSlug] || '#';
};

const generateAndSetPassword = () => {
  const length = 16;
  const charsets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  const allChars = Object.values(charsets).join('');
  let generatedPassword = '';
  for (const key in charsets) {
    const charset = charsets[key];
    generatedPassword += charset[Math.floor(Math.random() * charset.length)];
  }
  for (let i = generatedPassword.length; i < length; i++) {
    generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
  }
  generatedPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');
  
  password.value = generatedPassword;
  passwordConfirmation.value = generatedPassword;
  showPassword.value = true;
  showPasswordConfirm.value = true;
};

const fetchSchedule = async () => {
  try {
    const res = await apiClient.get(`/onboard/wlp/${token}`);
    schedule.value = res.data?.data || res.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid or expired onboarding link.';
  } finally {
    isLoadingSchedule.value = false;
  }
};

const submitAcceptance = async () => {
  if (!acceptedTerms.value || password.value !== passwordConfirmation.value) return;

  isSubmitting.value = true;
  try {
    const res = await apiClient.post(`/onboard/wlp/${token}/accept`, {
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    alert(`Onboarding complete! WLP Admin Account created for ${res.data.user?.email}. Redirecting to login...`);
    router.push('/login');
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to accept onboarding terms.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchSchedule);
</script>

<style scoped>
.form-input {
  @apply block rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 text-sm p-2 border;
}
</style>