<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Header / Branding -->
    <div class="sm:mx-auto sm:w-full sm:max-w-3xl text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-4">
        30-Day Free Trial Workspace Setup
      </div>
      <h1 class="text-3xl font-black text-gray-900 tracking-tight">Welcome to JustXhale</h1>
      <p class="text-sm text-gray-500 mt-2">
        Let's calibrate your compliance workspace in 4 swift steps. No credit card required.
      </p>

      <!-- Resume Link for returning users -->
      <p v-if="store.currentStep === 1" class="text-xs text-gray-500 mt-3">
        Already registered?
        <router-link to="/login" class="font-bold text-blue-600 hover:underline">
          Log in here to resume your setup
        </router-link>
      </p>
    </div>

    <!-- Stepper Navigation -->
    <div class="sm:mx-auto sm:w-full sm:max-w-3xl mb-8 px-4">
      <nav aria-label="Progress">
        <ol class="flex items-center justify-between">
          <li v-for="step in steps" :key="step.number" class="relative flex-1 flex items-center">
            <div class="flex items-center gap-3">
              <span
                :class="[
                  (typeof store.currentStep === 'number' && store.currentStep > step.number) || (step.number === 1 && store.currentStep === 'verify_otp')
                    ? 'bg-green-600 text-white'
                    : (store.currentStep === step.number || (step.number === 1 && store.currentStep === 'verify_otp'))
                    ? 'border-2 border-blue-600 bg-white text-blue-600'
                    : 'border-2 border-gray-200 bg-white text-gray-400',
                  'h-9 w-9 rounded-full flex items-center justify-center text-xs font-black transition-all'
                ]"
              >
                <span v-if="typeof store.currentStep === 'number' && store.currentStep > step.number">✓</span>
                <span v-else>{{ step.number }}</span>
              </span>
              <div class="hidden sm:block">
                <p :class="store.currentStep >= step.number || (step.number === 1 && store.currentStep === 'verify_otp') ? 'text-gray-900' : 'text-gray-400'" class="text-xs font-bold leading-tight">
                  {{ step.title }}
                </p>
                <p class="text-[10px] text-gray-400 leading-none mt-0.5">
                  {{ step.number === 1 && store.currentStep === 'verify_otp' ? 'Email Verification' : step.subtitle }}
                </p>
              </div>
            </div>
            <div v-if="step.number < 4" class="hidden sm:block flex-1 h-0.5 bg-gray-200 mx-4" :class="{ 'bg-blue-600': typeof store.currentStep === 'number' && store.currentStep > step.number }"></div>
          </li>
        </ol>
      </nav>
    </div>

    <!-- Main Card -->
    <div class="sm:mx-auto sm:w-full sm:max-w-3xl px-4">
      <div class="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-3xl border border-gray-200/80 sm:px-10">

        <!-- Error Banner -->
        <div v-if="store.errorMessage" class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex justify-between items-center">
          <span>{{ store.errorMessage }}</span>
          <button @click="store.errorMessage = null" class="text-red-400 hover:text-red-600 font-black ml-4">✕</button>
        </div>

        <!-- ==========================================
             STEP 1: Unified Account & Business Registration
             ========================================== -->
        <div v-if="store.currentStep === 1" class="space-y-6">
          <div class="border-b border-gray-100 pb-4">
            <h2 class="text-lg font-black text-gray-900">1. Business &amp; Administrator Setup</h2>
            <p class="text-xs text-gray-500 mt-0.5">Enter your business and primary administrator credentials to build your workspace.</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-6">
            <!-- Company Section -->
            <div class="space-y-4">
              <h3 class="text-xs font-black text-blue-900 uppercase tracking-wider">Business Identity</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Company Legal Name *</label>
                  <input v-model="form.company_name" required type="text" placeholder="e.g. Apex Logistics (Pty) Ltd" class="input-standard">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Trading Name (DBA)</label>
                  <input v-model="form.trading_name" type="text" placeholder="e.g. Apex Haulage" class="input-standard">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">CIPC Registration Number</label>
                  <input v-model="form.company_number" type="text" placeholder="2021/123456/07 (Optional for trial)" class="input-standard">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Company Phone Number</label>
                  <input v-model="form.cell_number" type="tel" placeholder="+27 11 000 0000" class="input-standard">
                </div>
              </div>
            </div>

            <!-- Root Admin Section -->
            <div class="pt-4 border-t border-gray-100 space-y-4">
              <h3 class="text-xs font-black text-blue-900 uppercase tracking-wider">Root Administrator (User Zero)</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Name *</label>
                  <input v-model="form.first_name" required type="text" placeholder="John" class="input-standard">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name *</label>
                  <input v-model="form.last_name" required type="text" placeholder="Doe" class="input-standard">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Admin Email Address *</label>
                <input v-model="form.email" required type="email" placeholder="john@company.co.za" class="input-standard">
                <p class="text-[10px] text-gray-400 mt-1">We will send a 6-digit verification code to this address.</p>
              </div>

              <!-- Password Inputs with Bank-Grade Generator -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Password * (Min 16 Chars)
                  </label>
                  <div class="relative rounded-xl">
                    <input
                      v-model="form.password"
                      required
                      minlength="16"
                      :type="passwordVisible ? 'text' : 'password'"
                      placeholder="••••••••••••••••"
                      autocomplete="new-password"
                      class="input-standard pr-10 font-mono"
                    >
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                      <button
                        type="button"
                        @click.stop.prevent="passwordVisible = !passwordVisible"
                        class="p-1 text-gray-400 hover:text-blue-600 focus:outline-none cursor-pointer"
                        :title="passwordVisible ? 'Hide password' : 'Show password'"
                      >
                        <svg v-if="!passwordVisible" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div class="relative rounded-xl">
                    <input
                      v-model="form.password_confirmation"
                      required
                      minlength="16"
                      :type="passwordVisible ? 'text' : 'password'"
                      placeholder="••••••••••••••••"
                      autocomplete="new-password"
                      class="input-standard pr-10 font-mono"
                    >
                  </div>
                </div>
              </div>

              <!-- Strong Password Generator Bar -->
              <div class="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span class="text-[11px] text-blue-900 font-medium">
                  🔒 {{ policyHint }}
                </span>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    @click.stop.prevent="generateAndSetPassword"
                    class="text-xs font-black text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    ⚡ Generate Strong Password
                  </button>
                  <button
                    v-if="form.password"
                    type="button"
                    @click.stop.prevent="copyGeneratedPassword"
                    class="text-xs font-bold text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{{ passwordCopied ? '✓ Copied' : '📋 Copy' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-100">
              <button :disabled="store.loading" type="submit" class="btn-primary">
                <span v-if="store.loading">Registering Account...</span>
                <span v-else>Register &amp; Verify Email →</span>
              </button>
            </div>
          </form>
        </div>

        <!-- ==========================================
             STEP 1.5: EMAIL OTP VERIFICATION GATE
             ========================================== -->
        <div v-else-if="store.currentStep === 'verify_otp'" class="space-y-6 text-center py-4">
          <div class="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 text-blue-600 text-2xl mx-auto">
            📩
          </div>

          <div>
            <h2 class="text-xl font-black text-gray-900">Check Your Inbox</h2>
            <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              We sent a 6-digit verification code to
              <span class="font-bold text-gray-900">{{ store.adminEmail }}</span>. Enter it below to confirm your identity.
            </p>
          </div>

          <form @submit.prevent="handleVerifyOtp" class="max-w-xs mx-auto space-y-4">
            <div>
              <input
                v-model="otpCode"
                required
                maxlength="6"
                type="text"
                pattern="[0-9]{6}"
                inputmode="numeric"
                placeholder="000000"
                class="w-full text-center text-3xl font-mono tracking-[0.4em] font-black rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3 bg-gray-50/50"
              >
              <p class="text-[10px] text-gray-400 mt-1.5">Code expires in 15 minutes.</p>
            </div>

            <button :disabled="store.loading || otpCode.length !== 6" type="submit" class="btn-primary w-full py-3">
              <span v-if="store.loading">Verifying Code...</span>
              <span v-else>Verify &amp; Select Solution →</span>
            </button>

            <!-- Resend Action & Back Link -->
            <div class="pt-3 flex flex-col items-center gap-2 text-xs">
              <button
                type="button"
                :disabled="resendCooldown > 0 || store.loading"
                @click="handleResendOtp"
                class="text-blue-600 hover:text-blue-800 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span v-if="resendCooldown > 0">Resend code in {{ resendCooldown }}s</span>
                <span v-else>Didn't get the email? Resend Code</span>
              </button>

              <button
                type="button"
                @click="store.currentStep = 1"
                class="text-gray-400 hover:text-gray-600 text-[11px]"
              >
                ← Change email or business details
              </button>
            </div>
          </form>
        </div>

        <!-- ==========================================
             STEP 2: Commercial Product Selection
             ========================================== -->
        <div v-else-if="store.currentStep === 3" class="space-y-6">
          <div class="border-b border-gray-100 pb-4">
            <h2 class="text-lg font-black text-gray-900">2. Select Your Workspace Solution</h2>
            <p class="text-xs text-gray-500 mt-0.5">Pick the commercial product calibrated for your operational requirements.</p>
          </div>

          <div v-if="store.loading && store.availableProducts.length === 0" class="py-12 text-center text-gray-400 text-sm italic">
            Loading commercial blueprint catalog...
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="product in store.availableProducts"
              :key="product.id"
              @click="selectedProductId = product.id"
              :class="[
                selectedProductId === product.id
                  ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
                'p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between'
              ]"
            >
              <div>
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-black text-gray-900 text-base">{{ product.name }}</h3>
                  <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-gray-100 text-gray-700">
                    {{ product.file_types?.length || 0 }} Niches
                  </span>
                </div>
                <p class="text-xs text-gray-500 line-clamp-2 mb-4">{{ product.description || 'Pre-configured compliance engine.' }}</p>

                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="ft in product.file_types"
                    :key="ft.id"
                    class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100/60 text-blue-800"
                  >
                    {{ ft.tab_label_override || ft.name }}
                  </span>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-400">30 Days Free Trial</span>
                <span :class="selectedProductId === product.id ? 'text-blue-600 font-black' : 'text-gray-400'" class="text-xs font-bold">
                  {{ selectedProductId === product.id ? 'Selected ✓' : 'Click to Select' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-gray-100">
            <button
              :disabled="store.loading || !selectedProductId"
              @click="handlePhase3"
              type="button"
              class="btn-primary"
            >
              <span v-if="store.loading">Activating Product...</span>
              <span v-else>Configure Teams &amp; Security →</span>
            </button>
          </div>
        </div>

        <!-- ==========================================
             STEP 3: Team Hydration & POPIA Clearance
             ========================================== -->
        <div v-else-if="store.currentStep === 4" class="space-y-6">
          <div class="border-b border-gray-100 pb-4">
            <h2 class="text-lg font-black text-gray-900">3. Auto-Hydrate Teams &amp; Clearances</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              The engine will now provision functional teams, configure POPIA tab clearance gates, and enroll you as primary manager.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
            <h4 class="text-xs font-black text-blue-950 uppercase tracking-wider">What happens next:</h4>
            <ul class="space-y-2 text-xs text-blue-900">
              <li class="flex items-center gap-2">
                <span class="text-green-600 font-bold">✓</span>
                Instantiates blueprint teams for your licensed product niches.
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-600 font-bold">✓</span>
                Links <code class="bg-blue-100 px-1 rounded">team_file_type</code> tab permissions for data segregation.
              </li>
              <li class="flex items-center gap-2">
                <span class="text-green-600 font-bold">✓</span>
                Assigns {{ store.user?.name || 'Root Admin' }} to all provisioned teams.
              </li>
            </ul>
          </div>

          <div v-if="store.hydratedTeams.length > 0" class="space-y-2">
            <p class="text-xs font-bold text-gray-700">Provisioned Teams:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="t in store.hydratedTeams"
                :key="t.id"
                class="px-3 py-1 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-bold"
              >
                {{ t.name }} ({{ t.team_type }})
              </span>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-gray-100">
            <button
              :disabled="store.loading"
              @click="handlePhase4"
              type="button"
              class="btn-primary"
            >
              <span v-if="store.loading">Hydrating Teams &amp; Security...</span>
              <span v-else>Hydrate &amp; Launch First Case →</span>
            </button>
          </div>
        </div>

        <!-- ==========================================
             STEP 4: First Operational Case File
             ========================================== -->
        <div v-else-if="store.currentStep === 5" class="space-y-6">
          <div class="border-b border-gray-100 pb-4">
            <h2 class="text-lg font-black text-gray-900">4. Create Your First Live Case File</h2>
            <div class="text-xs text-gray-500 mt-0.5 space-y-0.5">
              <p>Deploy your initial case file to experience live workflow tracking and document compliance.</p>
              <p>A Case File contains all the documents belonging to one specific matter.</p>
              <p>The range of those documents will be unique to your environment.</p>
              <p>Use any name for now - you can change it later</p>
            </div>
          </div> 

          <form @submit.prevent="handlePhase5" class="space-y-4">
            <!-- Anchor Niche Display (Replaces Dropdown) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Primary Intake Domain (Anchor Niche)
              </label>
              <div class="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-blue-600 text-white font-black text-xs shadow-xs">
                    #1
                  </span>
                  <div>
                    <h4 class="text-sm font-black text-blue-950">
                      {{ primaryAnchorNiche?.tabLabelOverride || primaryAnchorNiche?.tab_label_override || primaryAnchorNiche?.name || 'Primary Intake Domain' }}
                    </h4>
                    <p class="text-[11px] text-blue-700 font-medium">
                      Foundational anchor tab for this solution. Subsequent niches build sequentially from this record.
                    </p>
                  </div>
                </div>
                <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  Anchor Domain
                </span>
              </div>
            </div>

            <!-- Matter Reference / Name Input -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Case File Reference Title *
              </label>
              <input
                v-model="phase5Form.title"
                required
                type="text"
                :placeholder="primaryAnchorNiche ? `e.g. ${primaryAnchorNiche.name} Intake: Reference 001` : 'e.g. Initial Case File Reference'"
                class="input-standard"
              >
              <p class="text-[10px] text-gray-400 mt-1">This will be your first active operational case file.</p>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-100">
              <button :disabled="store.loading || !phase5Form.file_type_id" type="submit" class="btn-primary bg-green-600 hover:bg-green-700">
                <span v-if="store.loading">Deploying Workspace...</span>
                <span v-else>Complete Onboarding &amp; Launch 🚀</span>
              </button>
            </div>
          </form>
        </div>

        <!-- ==========================================
             STEP 5: Celebration & Login Handoff
             ========================================== -->
        <div v-else-if="store.currentStep === 6" class="text-center py-8 space-y-6">
          <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 text-2xl mb-2">
            🎉
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900">Workspace Successfully Provisioned!</h2>
            <p class="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Your 30-day trial for <strong class="text-gray-900">{{ store.companyName }}</strong> is active. 
              Your initial case file is waiting for you.
            </p>
            <p class="text-xs text-blue-800 bg-blue-50 py-2 px-4 rounded-xl inline-block mt-4 border border-blue-100 font-medium">
              Please sign in with your email (<strong class="font-bold">{{ store.adminEmail }}</strong>) and chosen password to launch your session.
            </p>
          </div>

          <div class="pt-4">
            <button @click="proceedToLogin" class="btn-primary px-8 py-3 text-sm">
              Proceed to Login &amp; Launch Workspace →
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useOnboardingStore } from '@/store/onboarding';
import { useAuthStore } from '@/store/auth'; 
import { usePasswordGenerator } from '@/composables/usePasswordGenerator';
import { validatePassword } from '@/config/passwordPolicy';

const router = useRouter();
const store = useOnboardingStore();
const authStore = useAuthStore();
const { generateStrongPassword, policyHint } = usePasswordGenerator();

const steps = [
  { number: 1, title: 'Account', subtitle: 'Company & Admin' },
  { number: 2, title: 'Solution', subtitle: 'Product selection' },
  { number: 3, title: 'Teams', subtitle: 'Security & clearances' },
  { number: 4, title: 'First Case', subtitle: 'Live activation' },
];

const selectedProductId = ref(null);
const passwordVisible = ref(false);
const otpCode = ref('');
const resendCooldown = ref(0);
let cooldownTimer = null;

const form = reactive({
  company_name: '',
  trading_name: '',
  company_number: '',
  cell_number: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

const passwordCopied = ref(false);

const copyGeneratedPassword = async () => {
  if (!form.password) return;
  await navigator.clipboard.writeText(form.password);
  passwordCopied.value = true;
  setTimeout(() => {
    passwordCopied.value = false;
  }, 2500);
};

const phase5Form = reactive({
  file_type_id: '',
  title: '',
});

const availableNiches = computed(() => {
  const prod = store.selectedProduct;
  return prod?.fileTypes || prod?.file_types || [];
});

// Resolves the No. 1 Tab (the anchor niche with the lowest sort order)
const primaryAnchorNiche = computed(() => {
  return availableNiches.value.length > 0 ? availableNiches.value[0] : null;
});

// Automatically bind the No. 1 Tab ID into the form
watch(primaryAnchorNiche, (niche) => {
  if (niche) {
    phase5Form.file_type_id = niche.id;
  }
}, { immediate: true });

onMounted(async () => {
  await store.checkStatus();
  if (store.currentStep === 3) {
    await store.loadProducts();
  }
});

const generateAndSetPassword = () => {
  const generated = generateStrongPassword();
  form.password = generated;
  form.password_confirmation = generated;
  passwordVisible.value = true;
};

const handleRegister = async () => {
  store.errorMessage = null;

  if (form.password !== form.password_confirmation) {
    store.errorMessage = "Passwords do not match.";
    return;
  }

  const { isValid, errors } = validatePassword(form.password);
  if (!isValid) {
    store.errorMessage = errors.join(' ');
    return;
  }

  await store.registerTenant(form);
  // Starts 60-second cooldown for resending
  startCooldown();
};

const handleVerifyOtp = async () => {
  if (!otpCode.value || otpCode.value.length !== 6) {
    store.errorMessage = 'Please enter the complete 6-digit verification code.';
    return;
  }
  await store.verifyOtp(otpCode.value);
};

const handleResendOtp = async () => {
  if (resendCooldown.value > 0) return;
  await store.resendOtp();
  startCooldown();
};

const startCooldown = () => {
  resendCooldown.value = 60;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
    }
  }, 1000);
};

const handlePhase3 = async () => {
  if (!selectedProductId.value) return;
  await store.submitPhase3(selectedProductId.value);
};

const handlePhase4 = async () => {
  await store.submitPhase4();
  if (availableNiches.value.length > 0) {
    phase5Form.file_type_id = availableNiches.value[0].id;
  }
};

const handlePhase5 = async () => {
  await store.submitPhase5(phase5Form);
};

const proceedToLogin = () => {
  const email = store.adminEmail;

  // Clear transient onboarding token so normal login takes full control
  localStorage.removeItem('auth_token');
  store.token = null;

  // Route to formal login with email prefilled in query param
  router.push({
    path: '/login',
    query: { email: email, onboarded: '1' }
  });
};
</script>

<style scoped>
.input-standard {
  @apply w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500;
}
.btn-primary {
  @apply inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>