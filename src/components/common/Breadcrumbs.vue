<template>
  <nav v-if="breadcrumbs.length > 1" class="mb-4 px-2 py-2 bg-gray-100 rounded-lg shadow-inner" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
        <router-link 
          v-if="crumb.to && index < breadcrumbs.length - 1" 
          :to="crumb.to" 
          class="text-gray-600 hover:text-brand-blue-600 text-sm font-medium"
        >
          {{ crumb.label }}
        </router-link>
        <span v-else class="text-gray-500 text-sm font-medium">
          {{ crumb.label }}
        </span>
        
        <svg v-if="index < breadcrumbs.length - 1" class="ml-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbs = computed(() => {
  const crumbs = [];
  let currentPath = '';

  // Add static breadcrumbs if needed (e.g., Dashboard)
  crumbs.push({ label: 'Reminders', to: '/' });
  currentPath = '/';

  // Add route-specific breadcrumbs
  // This is a simple example; you might need more complex logic
  // based on your route meta data or path matching.
  const pathSegments = route.path.split('/').filter(segment => segment !== '');

  pathSegments.forEach((segment, index) => {
    // Special handling for common segments
    if (segment === 'admin' && currentPath === '/') {
        crumbs.push({ label: 'Administration', to: '/admin' });
        currentPath += segment + '/';
    } else if (segment === 'estates' && currentPath.includes('/admin')) {
        // Example: Admin > Estates (if you had such a route)
        // crumbs.push({ label: 'Estates', to: '/admin/estates' }); // Adjust path if needed
        // currentPath += segment + '/';
    } else if (segment === 'estates') {
        crumbs.push({ label: 'Estates', to: '/estates' });
        currentPath += segment + '/';
    } else if (segment === 'entities') {
        crumbs.push({ label: 'Contacts & Entities', to: '/entities' });
        currentPath += segment + '/';
    } else if (segment === 'admin') {
        // If it's just 'admin' and not preceded by anything specific, we might have already added 'Administration'
        // Or if it's a direct /admin route, add it.
        if (currentPath === '/') {
           crumbs.push({ label: 'Administration', to: '/admin' });
           currentPath += segment + '/';
        }
    }
    // Add more specific segment logic here based on your routes
    // For nested dynamic segments like /estates/:id, you'll need to access route.params
    else if (!isNaN(segment) && crumbs[crumbs.length - 1]?.label === 'Estates') {
      // This is a crude way to get the ID. Ideally, use route.params.id and fetch the name.
      crumbs.push({ label: `Estate #${segment}`, to: null }); // Don't link back to just the ID segment
    } else if (!isNaN(segment) && crumbs[crumbs.length - 1]?.label === 'Contacts & Entities') {
        crumbs.push({ label: `Entity #${segment}`, to: null });
    }
    // You'll need to refine this for all your routes (e.g., /admin/users/:id)
  });

  // Ensure the last crumb doesn't have a 'to' link if it's the current page
  if (crumbs.length > 0 && crumbs[crumbs.length - 1].to) {
    crumbs[crumbs.length - 1].to = null;
  }

  return crumbs;
});

// Watch for route changes to update breadcrumbs
watch(() => route.path, () => {
  // The computed property handles updates automatically, but explicit watchers can be useful for complex logic.
}, { immediate: true }); // Run immediately on component mount
</script>

<style scoped>
/* You might want to add specific styles if needed */
</style>