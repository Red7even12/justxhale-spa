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
import axios from 'axios'; 

const route = useRoute();
const token = route.params.token;

const loading = ref(true);
const error = ref(null);
const portalData = ref({});

onMounted(async () => {
    try {
        const response = await axios.get(`/api/v1/portal/upload/${token}`);
        portalData.value = response.data.data;
        
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

// ==========================================
// THE COMPRESSION ENGINE (CLIENT-SIDE)
// ==========================================
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                // 1. Calculate New Dimensions (Max Edge: 2048px)
                const MAX_EDGE = 2048;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_EDGE) {
                        height *= MAX_EDGE / width;
                        width = MAX_EDGE;
                    }
                } else {
                    if (height > MAX_EDGE) {
                        width *= MAX_EDGE / height;
                        height = MAX_EDGE;
                    }
                }

                // 2. Draw on Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 3. Compress to 80% JPEG Blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        // Create a new File object from the Blob so it mimics the original
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    0.80 // 80% Quality
                );
            };
            
            img.onerror = (err) => reject(err);
        };
        
        reader.onerror = (err) => reject(err);
    });
};

// ==========================================
// UPLOAD HANDLER
// ==========================================
const handleFileUpload = async (event, doc) => {
    let file = event.target.files[0];
    if (!file) return;

    doc.isUploading = true;
    doc.uploadError = null;

    try {
        // Only compress if it's an image (Ignore PDFs)
        if (file.type.startsWith('image/')) {
            console.log(`Original Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            file = await compressImage(file);
            console.log(`Compressed Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        } else if (file.size > 10 * 1024 * 1024) {
            // If it's a PDF over 10MB, reject it
            throw new Error("PDF is too large. Maximum size is 10MB.");
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_requirement_id', doc.id);

        await axios.post(`/api/v1/portal/upload/${token}/process`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        doc.status = 'submitted';
        
    } catch (err) {
        // Fallback error messaging
        const laravelError = err.response?.data?.errors?.document?.[0];
        const status = err.response?.status ? `(Status: ${err.response.status}) ` : '';
        doc.uploadError = laravelError || `${status}${err.message || err.response?.data?.message || 'Failed to upload file. Please try again.'}`;
    } finally {
        doc.isUploading = false;
        event.target.value = ''; // Reset input
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