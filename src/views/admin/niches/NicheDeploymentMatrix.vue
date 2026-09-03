<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Commercial Deployment Matrix</h2>
        <p class="text-xs text-gray-500 mt-1">
          Active products assembling this Niche blueprint.
        </p>
      </div>
      <span class="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1.5 rounded-full">
        Deployed in {{ niche?.products?.length || 0 }} Product(s)
      </span>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4 text-left">Product Name</th>
            <th class="px-6 py-4 text-left">URL Slug</th>
            <th class="px-6 py-4 text-center">Tab Order</th>
            <th class="px-6 py-4 text-left">Tab Label Override</th>
            <th class="px-6 py-4 text-center">Status on Product</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="product in (niche?.products || [])" :key="product.id" class="hover:bg-gray-50/50">
            <td class="px-6 py-4 font-bold text-gray-900 text-sm">{{ product.name }}</td>
            <td class="px-6 py-4 font-mono text-xs text-gray-400">/{{ product.slug }}</td>
            <td class="px-6 py-4 text-center font-bold text-xs">{{ product.pivot?.sort_order ?? product.pivot?.sortOrder ?? 1 }}</td>
            <td class="px-6 py-4 text-sm text-gray-600 italic">
              {{ product.pivot?.tab_label_override || product.pivot?.tabLabelOverride || '— Default (' + niche.name + ')' }}
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="Number(product.pivot?.is_active ?? product.pivot?.isActive ?? 1) === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
                {{ Number(product.pivot?.is_active ?? product.pivot?.isActive ?? 1) === 1 ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <router-link :to="{ name: 'admin.product.file-types', params: { slug: product.slug } }" class="text-xs text-indigo-600 hover:text-indigo-900 font-bold">
                Open Assembly Board ↗
              </router-link>
            </td>
          </tr>
          <tr v-if="!niche?.products?.length">
            <td colspan="6" class="p-8 text-center text-gray-400 italic text-sm">
              This Niche blueprint is not currently assembled into any commercial products.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  niche: Object,
  fileTypeId: [String, Number]
});
</script>