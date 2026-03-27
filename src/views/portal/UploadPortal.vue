<template>
  <div class="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8 font-sans">
    
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center mt-20">
      <svg class="animate-spin h-10 w-10 text-brand-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="text-gray-500">Loading secure portal...</p>
    </div>

    <!-- Error / Expired State -->
    <div v-else-if="error" class="sm:mx-auto sm:w-full sm:max-w-md mt-10">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border-t-4 border-red-500">
        <svg class="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
        <p class="text-gray-600 text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Active Portal State -->
    <div v-else class="sm:mx-auto sm:w-full sm:max-w-xl">
      
      <!-- Dynamic Branding Header -->
      <div class="text-center mb-8">
        <img v-if="portalData.branding?.logo_url" :src="portalData.branding.logo_url" alt="Logo" class="mx-auto h-16 w-auto mb-4" />
        <h2 class="text-3xl font-extrabold text-gray-900">Secure Upload Portal</h2>
        <p class="mt-2 text-sm text-gray-600">Powered by {{ portalData.branding?.product_name || 'JustXhale' }}</p>
      </div>

      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        
        <!-- Welcome Context -->
        <div class="mb-8 border-b pb-6">
          <h3 class="text-lg font-medium text-gray-900">Welcome, {{ portalData.session?.participant_name }}</h3>
          <p class="mt-1 text-sm text-gray-500">
            Please provide the requested documents for reference: <br>
            <strong class="text-gray-800">{{ portalData.session?.case_reference }}</strong>
          </p>
          <p class="mt-2 text-xs text-red-500 font-semibold">
            This secure session expires automatically on {{ formatDate(portalData.session?.expires_at) }}.
          </p>
        </div>

        <!-- Document Checklist -->
        <div class="space-y-6">
          <div 
            v-for="doc in portalData.documents" 
            :key="doc.id" 
            class="border rounded-lg p-4 transition-colors"
            :class="doc.status === 'submitted' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-md font-bold text-gray-900">
                  {{ doc.name }}
                  <span v-if="doc.is_required" class="text-red-500 ml-1">*</span>
                </h4>
                <p v-if="doc.note" class="text-xs text-gray-500 mt-1">{{ doc.note }}</p>
                
                <!-- Status Badges -->
                <div class="mt-2">
                  <span v-if="doc.status === 'submitted'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                    Received - Under Review
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Action Required
                  </span>
                </div>
              </div>

              <!-- Upload Action -->
              <div class="ml-4 flex-shrink-0">
                <!-- Hidden HTML5 Input (accepts images & pdfs, prompts camera on mobile) -->
                <input 
                  type="file" 
                  :id="`file-${doc.id}`" 
                  class="hidden" 
                  accept="image/jpeg,image/png,application/pdf" 
                  capture="environment"
                  @change="(e) => handleFileUpload(e, doc)"
                />
                
                <button 
                  v-if="doc.status !== 'submitted'"
                  @click="triggerFileInput(doc.id)"
                  :disabled="doc.isUploading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none disabled:opacity-50"
                >
                  <svg v-if="doc.isUploading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  {{ doc.isUploading ? 'Uploading...' : 'Upload' }}
                </button>
                
                <!-- Success Checkmark -->
                <div v-else class="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </div>
            </div>
            
            <!-- Error message specifically for this document -->
            <p v-if="doc.uploadError" class="mt-2 text-xs text-red-600">{{ doc.uploadError }}</p>
          </div>
        </div>

        <div v-if="portalData.documents?.length === 0" class="text-center py-6 text-gray-500">
            All requested documents have been submitted. Thank you!
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// Note: We use standard axios or an unauthenticated instance so it doesn't try to attach Bearer tokens or redirect to /login
import axios from 'axios'; 

const route = useRoute();
const token = route.params.token;

const loading = ref(true);
const error = ref(null);
const portalData = ref({});

// Fetch initial portal data
onMounted(async () => {
    try {
        // Calls the Public API Endpoint we built in the previous step
        const response = await axios.get(`/api/v1/portal/upload/${token}`);
        portalData.value = response.data.data;
        
        // Inject custom local state properties into documents for UI tracking
        portalData.value.documents = portalData.value.documents.map(doc => ({
            ...doc,
            isUploading: false,
            uploadError: null
        }));

    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load the secure portal.';
    } finally {
        loading.value = false;
    }
});

const triggerFileInput = (docId) => {
    document.getElementById(`file-${docId}`).click();
};

const handleFileUpload = async (event, doc) => {
    const file = event.target.files[0];
    if (!file) return;

    // Basic Validation (e.g., 10MB limit)
    if (file.size > 20 * 1024 * 1024) {
        doc.uploadError = "File is too large. Maximum size is 10MB.";
        event.target.value = ''; // Reset input
        return;
    }

    doc.isUploading = true;
    doc.uploadError = null;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_requirement_id', doc.id);

    try {
        // We will build this endpoint next! It will upload to S3/Backblaze and change status to 'submitted'
        await axios.post(`/api/v1/portal/upload/${token}/process`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Update UI to show Success
        doc.status = 'submitted';
        
    } catch (err) {
        // Grab the specific validation error message from Laravel (e.g., "The document must be a file of type: jpeg, png.")
        const laravelError = err.response?.data?.errors?.document?.[0];
        doc.uploadError = laravelError || err.response?.data?.message || "Failed to upload file. Please try again.";
    } finally {
        doc.isUploading = false;
        event.target.value = ''; // Reset input so user can try again if needed
    }
};

const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};
</script>

<style scoped>
/* Optional: ensures the brand-primary class falls back nicely if CSS vars aren't injected */
.text-brand-primary { color: var(--brand-primary, #74958D); }
.bg-brand-primary { background-color: var(--brand-primary, #74958D); }
.focus\:ring-brand-primary:focus { --tw-ring-color: var(--brand-primary, #74958D); }
</style>