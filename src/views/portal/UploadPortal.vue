<template>
  <div class="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8 font-sans">
    
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center mt-20">
      <svg class="animate-spin h-10 w-10 text-brand-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle></svg>
      <p class="text-gray-500">Opening secure portal...</p>
    </div>

    <!-- Active Portal State -->
    <div v-else class="sm:mx-auto sm:w-full sm:max-w-xl px-4">
      
      <div class="text-center mb-8">
        <img v-if="portalData.branding?.logo_url" :src="portalData.branding.logo_url" alt="Logo" class="mx-auto h-16 w-auto mb-4" />
        <h2 class="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">Secure Upload</h2>
      </div>

      <div class="bg-white py-6 px-4 shadow-xl rounded-2xl border border-gray-100">
        <!-- Header -->
        <div class="mb-6 border-b pb-4">
          <h3 class="text-lg font-bold text-gray-800">Welcome, {{ portalData.session?.participant_name }}</h3>
          <p class="text-xs text-gray-500 mt-1">Ref: {{ portalData.session?.case_reference }}</p>
        </div>

        <!-- Document List -->
        <div class="space-y-6">
          <div 
            v-for="doc in portalData.documents" 
            :key="doc.id" 
            class="border rounded-xl p-4 transition-all"
            :class="doc.status === 'submitted' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'"
          >
            <div class="mb-3">
                <h4 class="text-sm font-bold text-gray-900 uppercase">
                  {{ doc.name }} <span v-if="doc.is_required" class="text-red-500">*</span>
                </h4>
                <p v-if="doc.note" class="text-[11px] text-gray-400 italic">{{ doc.note }}</p>
            </div>

            <!-- Upload Action Bar -->
            <div v-if="doc.status !== 'submitted'" class="flex flex-col gap-3">
                
                <!-- The Triple-Action Button Group -->
                <div class="grid grid-cols-3 gap-2">
                    <button @click="triggerUpload(doc, 'scan')" :disabled="doc.isUploading" class="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50">
                        <span class="text-xl">📷</span>
                        <span class="text-[9px] font-bold text-gray-500 mt-1 uppercase">Scan</span>
                    </button>
                    <button @click="triggerUpload(doc, 'selfie')" :disabled="doc.isUploading" class="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50">
                        <span class="text-xl">👤</span>
                        <span class="text-[9px] font-bold text-gray-500 mt-1 uppercase">Selfie</span>
                    </button>
                    <button @click="triggerUpload(doc, 'gallery')" :disabled="doc.isUploading" class="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50">
                        <span class="text-xl">📁</span>
                        <span class="text-[9px] font-bold text-gray-500 mt-1 uppercase">Files</span>
                    </button>
                </div>

                <div v-if="doc.isUploading" class="text-center text-xs font-bold text-brand-primary animate-pulse">
                    {{ doc.uploadMessage || 'Uploading...' }}
                </div>
            </div>
            
            <!-- Success Message -->
            <div v-else class="flex items-center gap-2 text-green-600 font-bold text-sm">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Received
            </div>

            <p v-if="doc.uploadError" class="mt-2 text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded">{{ doc.uploadError }}</p>
          </div>
        </div>

        <!-- Global Hidden Inputs -->
        <input type="file" ref="scanInput" class="hidden" accept="image/*" capture="environment" @change="onFilePicked">
        <input type="file" ref="selfieInput" class="hidden" accept="image/*" capture="user" @change="onFilePicked">
        <input type="file" ref="galleryInput" class="hidden" accept="image/*,application/pdf" @change="onFilePicked">

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

// Global references for the current upload context
const scanInput = ref(null);
const selfieInput = ref(null);
const galleryInput = ref(null);
const activeDoc = ref(null);
const activeType = ref(null);

onMounted(async () => {
    try {
        const response = await axios.get(`/api/v1/portal/upload/${token}`);
        portalData.value = response.data.data;
        portalData.value.documents = portalData.value.documents.map(doc => ({
            ...doc, isUploading: false, uploadError: null, uploadMessage: ''
        }));
    } catch (err) {
        error.value = 'This link has expired or is invalid.';
    } finally {
        loading.value = false;
    }
});

const triggerUpload = (doc, type) => {
    activeDoc.value = doc;
    activeType.value = type;
    if (type === 'scan') scanInput.value.click();
    else if (type === 'selfie') selfieInput.value.click();
    else galleryInput.value.click();
};

const onFilePicked = (event) => {
    handleFileUpload(event, activeDoc.value);
};

// ==========================================
// OPTIMIZED COMPRESSION ENGINE
// ==========================================
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        // MEMORY OPTIMIZATION: Use ObjectURL instead of FileReader (Base64)
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        
        img.onload = () => {
            const MAX_EDGE = 2048;
            let width = img.width;
            let height = img.height;

            if (width > MAX_EDGE || height > MAX_EDGE) {
                const ratio = Math.min(MAX_EDGE / width, MAX_EDGE / height);
                width *= ratio;
                height *= ratio;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                // CLEANUP: Revoke the source URL immediately after drawing to canvas
                URL.revokeObjectURL(url);
                
                if (!blob) return reject(new Error('Compression failed'));
                
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                resolve(compressedFile);
            }, 'image/jpeg', 0.85);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
    });
};

const handleFileUpload = async (event, doc) => {
    let file = event.target.files[0];
    if (!file) return;

    doc.isUploading = true;
    doc.uploadError = null;
    doc.uploadMessage = 'Processing Image...';

    try {
        // 1. Generate a Clean, Audit-Friendly Filename
        const timestamp = new Date().getTime();
        const extension = file.type.split('/')[1] || 'jpg';
        // Format: ID_Document_Selfie_1715832000.jpg
        const cleanName = `${doc.name.replace(/\s+/g, '_')}_${activeType.value}_${timestamp}.${extension}`;

        // 2. Client-Side Compression (Crucial for mobile data/upload speed)
        if (file.type.startsWith('image/')) {
            file = await compressImage(file);
        }

        // 3. Prepare Multi-part Form
        const formData = new FormData();
        formData.append('document', file, cleanName);
        formData.append('document_requirement_id', doc.id);

        doc.uploadMessage = 'Uploading Securely...';
        
        await axios.post(`/api/v1/portal/upload/${token}/process`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 4. Success State
        doc.status = 'submitted';
        
    } catch (err) {
        console.error("Upload Error:", err);
        doc.uploadError = "Upload failed. Please try again or choose a smaller file.";
    } finally {
        doc.isUploading = false;
        // CRITICAL: Clear the inputs so if the user takes a bad photo, 
        // they can immediately click the button again to take a better one.
        scanInput.value.value = '';
        selfieInput.value.value = '';
        galleryInput.value.value = '';
    }
};

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString() : '';
</script>