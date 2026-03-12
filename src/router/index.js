import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

// --- Imports ---
import AppLayout from '../layouts/AppLayout.vue';
import Login from '../views/Login.vue';
//import Dashboard from '../views/Dashboard.vue';
import Dashboard from '../views/RemindersDashboard.vue';
// V1 Legacy Imports
import EstatesIndex from '../views/estates/EstatesIndex.vue'; 
import EstateEditor from '../views/estates/EstateEditor.vue'; 
import EstateForm from '../views/estates/EstateForm.vue';

// Admin Imports
import TeamIndex from '../views/admin/TeamIndex.vue';
import Administration from '../views/Administration.vue';
import SubscriberIndex from '../views/admin/subscribers/SubscriberIndex.vue';
import UserIndex from '../views/admin/UserIndex.vue'; 
import DocumentTypeManager from '@/views/admin/DocumentTypes/DocumentTypeManager.vue';   //frontend-spa\src\views\admin\DocumentTypes\DocumentTypeManager.vue
import EntityIndex from '@/views/admin/entities/EntityIndex.vue';

// Auth Imports
import SetPassword from '../views/SetPassword.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';
import ResetPassword from '@/views/ResetPassword.vue';

// V2 Imports
import AppLauncher from '@/views/AppLauncher.vue';
import ProductLayout from '@/layouts/ProductLayout.vue'; 
import CaseIndex from '@/views/cases/CaseIndex.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    redirect: { name: 'AppLauncher' }
  },
  {
    path: '/set-password/:token', 
    name: 'SetPassword',
    component: SetPassword,
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
  },

  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      // 1. STATIC ROUTES (Profile & Launcher)
      {
        path: 'my-profile',
        name: 'MyProfile',
        component: () => import('@/views/MyProfile.vue'),
        meta: { displayName: 'My Profile' }
      },
      {
        path: 'launcher', 
        name: 'AppLauncher',
        component: AppLauncher,
      },

      // 2. SYSTEM ADMIN ROUTES (Restored from Imports)
      // Placed BEFORE :productSlug to ensure they capture "admin/*" correctly
      {
        path: 'administration',
        name: 'Administration',
        component: Administration,
        meta: { displayName: 'System Administration' }
      },
      {
         path: 'admin/subscribers',
         name: 'admin.subscribers.index',
         component: SubscriberIndex,
         meta: { displayName: 'Subscriber Management' }
      },
      {
        path: '/admin/subscribers/create',
        name: 'admin-subscribers-create',
        component: () => import('@/views/admin/subscribers/Create.vue'),
        meta: { requiresAuth: true, permission: 'edit subscribers' } // Or a 'create' permission
      },
      {
        path: '/admin/subscribers/:id/edit',
        name: 'admin-subscribers-edit',
        component: () => import('@/views/admin/subscribers/Edit.vue'),
        meta: { requiresAuth: true, permission: 'edit subscribers' }
      },
      {
        path: 'admin/workflow-management',
        name: 'admin.workflows',
        component: () => import('@/views/admin/workflows/WorkflowIndex.vue'),
        meta: { displayName: 'Workflow Management' }
        // meta: { permission: 'manage workflows' } // Optional: Add permission check
      }, 

      {
        path: 'admin/file-types',              // Changed to match the resource
        name: 'admin.file-types',              // Changed to match the path
        component: () => import('@/views/admin/FileTypes/FileTypeIndex.vue'),
        meta: { displayName: 'Case File Types' }
      },
    {
      path: 'admin/file-types/:id/fields',
      name: 'admin.file-type-fields',
      component: () => import('@/views/admin/FileTypes/CaseFieldDefinitionIndex.vue'),
      props: true,
      meta: { displayName: 'Field Definitions' }
    },
    {
      path: 'admin/document-packs',
        name: 'admin.document-packs',
        component: () => import('@/views/admin/DocumentPacks/DocumentPackIndex.vue'),
        meta: { displayName: 'Document Packs' }
      },
      // V2 Route (Pack Content Manager)
      {
        path: 'document-packs/:id/documents',
        name: 'admin.pack-documents',
        component: () => import('@/views/admin/DocumentTypes/DocumentTypeManager.vue'), // REUSE V1 COMPONENT  frontend-spa\src\views\admin\DocumentTypeManager.vue
        props: (route) => ({ packId: route.params.id }), // Pass ID as prop
        meta: { displayName: 'Manage Pack Content' }
      },


      {
        path: 'admin/document-management',
        name: 'admin.documents',
        component: DocumentTypeManager,
        meta: { requiresAuth: true, isAdmin: true, displayName: 'Document Management' } // Or your equivalent admin protection
      },
      {
        path: 'admin/option-lists',
        name: 'admin.option-lists',
        component: () => import('@/views/admin/OptionListsManager.vue'),
        meta: { requiresAuth: true, isAdmin: true, displayName: 'Option Lists' }
      },
      {
        path: '/admin/non-working-days',
        name: 'admin.non-working-days',
        component: () => import('@/views/admin/NonWorkingDays.vue'),
        meta: { requiresAuth: true, isAdmin: true, displayName: 'Non-Working Days' }
      },    

      // --- Billing routes  // 
      {
          path: '/admin/billing',
          name: 'admin-billing',
          component: () => import('@/views/admin/BillingDashboard.vue'),
          meta: { requiresAuth: true, permission: 'run billing cycles' } // Use your permission enum
      },
      {
          path: '/admin/pricing-plans',
          name: 'admin-pricing-plans',
          component: () => import('@/views/admin/PricingPlanManager.vue'), 
          meta: { requiresAuth: true, permission: 'manage pricing plans' }
      },
      {
          path: '/admin/invoices',
          name: 'admin-invoices',
          component: () => import('@/views/admin/InvoiceList.vue'),
          meta: { requiresAuth: true, permission: 'view invoices' }
      }, 

      /// --- Business Users routes  // 
      {
          path: '/admin/core-users',
          name: 'AdminUserManagement',
          component: () => import('@/views/admin/AdminUserManagement.vue'),
          // This is the navigation guard that protects the route
          beforeEnter: (to, from, next) => {
            const authStore = useAuthStore();
            if (authStore.hasRole('System Admin')) {
              next(); // Allow access
            } else {
              next({ name: 'Dashboard' }); // Or wherever you want to redirect them
            }
        },
      },

      {
         path: 'admin/users',
         name: 'admin.users.index',
         component: UserIndex,
         meta: { displayName: 'User Management' }
      },
      {
         path: 'admin/teams',
         name: 'admin.teams.index',
         component: TeamIndex,
         meta: { displayName: 'Team Management' }
      },
      {
        path: 'document-types',
        name: 'admin.document-types',
        component: () => import('@/views/admin/DocumentTypes/DocumentTypeManager.vue'),
        meta: { displayName: 'Global Document Types' }
      },
      {
        path: 'admin/products',
        name: 'admin.products',
        component: () => import('@/views/products/ProductIndex.vue'),
        meta: { displayName: 'Product Factory' }
      },
      {
        path: 'admin/products/:slug',
        name: 'admin.products.detail',
        component: () => import('@/views/admin/products/ProductDetail.vue'),
        props: true,
        meta: { displayName: 'Product Detail' }
      },

      // 3. V1 LEGACY ROUTES (Estates)
      { 
         path: 'estates', 
         name: 'estates.index',
         component: EstatesIndex,
         meta: { displayName: 'Estates Management' } 
      },
      {
        path: 'estates/create',
        name: 'estates.create',
        component: EstateForm,
        meta: { displayName: 'Create Estate' }
      },
      {
        path: 'estates/:id/edit',
        name: 'estates.form.edit',
        component: EstateForm,
        props: true,
        meta: { displayName: 'Edit Estate' }
      },
      {
        // Legacy Editor (V1)
        path: 'estates/:id',
        name: 'estates.edit',
        component: EstateEditor,
        props: true,
        meta: { displayName: 'Estate Workspace' }
      },

      // 4. GLOBAL REGISTRY (Shared)
      {
        path: 'entities',
        name: 'entities.index',
        component: EntityIndex,
        meta: { displayName: 'Global Registry' },
      },

      // 5. THE V2 GENERIC PRODUCT ENGINE (Must be LAST)
      {
        path: ':productSlug',
        component: ProductLayout,
        children: [
          {
            path: 'dashboard',
            name: 'ProductDashboard',
            component: Dashboard
          },
          {
            path: 'cases',
            name: 'ProductCases',
            component: CaseIndex,
            meta: { displayName: 'Case Files' }
          },
          // The NEW Case Workspace (Grid)
          {
            path: 'cases/:id',
            name: 'ProductCaseWorkspace',
            component: () => import('@/views/cases/CaseWorkspace.vue'),
            props: true,
            meta: { displayName: 'Case Workspace' }
          },
          // The OLD Case Detail (Tabs - now "Setup")
          {
            path: 'cases/:id/setup',
            name: 'ProductCaseSetup',
            component: () => import('@/views/cases/CaseDetail.vue'),
            props: true,
            meta: { displayName: 'Case Setup' }
          },
          {
            path: 'registry',
            name: 'ProductRegistry',
            component: EntityIndex,
            meta: { displayName: 'Entity Registry' }
          },
          {
            path: 'users',
            name: 'ProductUsers',
            component: UserIndex,
            meta: { displayName: 'User Management' }
          },
          {
            path: 'teams',
            name: 'ProductTeams',
            component: TeamIndex,
            meta: { displayName: 'Team Management' }
          },
          {
            path: 'cases/:id/timeline-report',
            name: 'CaseTimelineReport',
            component: () => import('@/views/reports/CaseTimelineReport.vue'),
            meta: { displayName: 'Timeline Report' }
          },
        ]
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && token) {
    next({ name: 'AppLauncher' });
  } else {
    next();
  }
});

export default router;