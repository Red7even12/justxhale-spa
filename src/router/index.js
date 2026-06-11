import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

// --- Imports ---
import AppLayout from '../layouts/AppLayout.vue';
import Login from '../views/Login.vue';
//import Dashboard from '../views/Dashboard.vue';
import Dashboard from '../views/RemindersDashboard.vue';

// Admin Imports
import TeamIndex from '../views/admin/TeamIndex.vue';
import Administration from '../views/Administration.vue';
import SubscriberIndex from '../views/admin/subscribers/SubscriberIndex.vue';
import UserIndex from '../views/admin/UserIndex.vue'; 
import DocumentTypeManager from '@/views/admin/DocumentTypes/DocumentTypeManager.vue';   //frontend-spa\src\views\admin\DocumentTypes\DocumentTypeManager.vue
import EntityIndex from '@/views/admin/entities/EntityIndex.vue';
import SystemMailsSetup from '@/views/admin/SystemMailsSetup.vue';
import ProductBlueprintLayout from '@/layouts/ProductBlueprintLayout.vue';

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
    path: '/portal/upload/:token',
    name: 'ClientUploadPortal',
    // We lazy-load it to keep the main admin bundle small
    component: () => import('@/views/portal/UploadPortal.vue'),
    meta: { 
        requiresAuth: false, // CRITICAL: Do not force login
        title: 'Secure Document Upload' 
    }
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
        path: '/admin/system-mails',
        name: 'SystemMailsSetup',
        component: SystemMailsSetup,
        meta: { 
            requiresAuth: true, 
            // add any admin role checks you usually require here
        }
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
      {
        path: '/admin/permissions',
        name: 'admin.permissions',
        component: () => import('@/views/admin/PermissionMatrix.vue'),
        meta: { displayName: 'Authorization Matrix', requiresAuth: true, role: 'System Admin' }
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
        //component: () => import('@/views/admin/products/ProductDetail.vue'),
        component: () => import('@/views/admin/products/ProductDetail.vue'),  // new path:  frontend-spa\src\layouts\ProductBlueprintLayout.vue
        props: true,
        meta: { displayName: 'Product Detail' }
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
          // --- THE BULK IMPORT WIZARD ---
          {
            path: 'import',
            name: 'ProductCaseImport',
            component: () => import('@/views/cases/CaseImportWizard.vue'),
            meta: { displayName: 'Bulk Case Import' }
          },
          // -----------------------------------
          // The Case Workspace (Grid)
          {
            path: 'cases/:id',
            name: 'ProductCaseWorkspace',
            component: () => import('@/views/cases/CaseWorkspace.vue'),
            props: true,
            meta: { displayName: 'Case Workspace' }
          },
          //  "Setup"
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
          // Subscriber Workspace Context for Reports
          {
              path: 'reports/:reportSlug?', 
              name: 'ProductReport', // Subscriber-only route name
              component: () => import('@/views/reports/ReportsDashboard.vue'),
              props: true,
              meta: { displayName: 'Reporting' }
          }
        ]
      },

      // 6. PRODUCT BLUEPRINTS (Nested under product detail)

      {
          path: '/admin/products/:slug/blueprints',
          component: () => import('@/layouts/ProductBlueprintLayout.vue'),
          props: true,
          children: [
              {
                  path: 'dashboard', // Changed from '' to 'dashboard' to avoid matching conflicts
                  name: 'admin.product.dashboard',
                  component: () => import('@/views/admin/products/blueprints/ProductDashboard.vue'),
                  props: true
              },
              {
                  path: 'licensing',
                  name: 'admin.product.licensing',
                  component: () => import('@/views/admin/products/blueprints/LicenseBlueprint.vue'),
              },
              {
                  path: 'file-types',
                  name: 'admin.product.file-types',
                  component: () => import('@/views/admin/products/blueprints/FileTypeBlueprint.vue'),
                  props: true
              },
              {
                  path: 'document-packs',
                  name: 'admin.product.document-packs',
                  component: () => import('@/views/admin/products/blueprints/DocumentPackBlueprint.vue'),
                  props: true
              },
              {
                  path: 'document-packs/:packId/documents',
                  name: 'admin.product.pack-documents',
                  component: () => import('@/views/admin/DocumentTypes/DocumentTypeManager.vue'),
                  props: true
              },
              {
                  path: 'document-packs/:packId/types',
                  name: 'admin.product.pack-types', // The specific "Manage Docs" screen
                  component: () => import('@/views/admin/DocumentTypes/DocumentTypeManager.vue'),
                  props: true // This passes slug, product, AND packId to the component
              },
              {
                  path: 'workflows',
                  name: 'admin.product.workflows',
                  component: () => import('@/views/admin/products/blueprints/WorkflowBlueprint.vue'),
                  props: true
              },
              {
                  path: 'blueprints/fields/:fileTypeId',
                  name: 'admin.product.file-type-fields', // Matches the link in FileTypeBlueprint.vue
                  component: () => import('@/views/admin/products/blueprints/CaseFieldDefinitionIndex.vue'), 
                  props: true
              },
              {
                  path: 'participant-roles',
                  name: 'admin.product.participant-roles',
                  component: () => import('@/views/admin/products/blueprints/ParticipantRoleBlueprint.vue'),
              },
              {
                  path: 'admin/entity-dna',
                  name: 'admin.subscriber.entity-dna',
                  component: () => import('@/views/admin/entities/EntityDNA.vue'),  
                  meta: { displayName: 'Entity Global DNA' }
              },

              { 
                  path: 'communication', 
                  name: 'admin.product.communication', 
                  component: () => import('@/views/admin/SystemMailsSetup.vue') // Placeholder for refactor
              },
              { 
                  path: 'option-lists', 
                  name: 'admin.product.option-lists', 
                  component: () => import('@/views/admin/OptionListsManager.vue') // Placeholder for refactor
              },
              // Admin Factory Context
              {
                  path: 'reports-builder',
                  name: 'admin.product.report-builder',
                  component: () => import('@/components/reports/ReportBuilder.vue'),
                  props: route => ({ productSlug: route.params.slug }), 
                  meta: { displayName: 'Report Builder' }
              },
              {
                  path: 'reports-preview/:reportSlug',
                  name: 'admin.product.report-preview',
                  component: () => import('@/components/reports/ReportViewer.vue'),
                  // Force the mapping of the parent ':slug' to the component's 'productSlug' prop
                  props: route => ({ 
                      productSlug: route.params.slug,
                      reportSlug: route.params.reportSlug,
                      isAdminPreview: true 
                  }),
                  meta: { displayName: 'Report Preview' }
              },
              {
                  path: 'view-creator',
                  name: 'admin.product.view-creator',
                  component: () => import('@/components/reports/CustomViewCreator.vue'),
                  props: route => ({ productSlug: route.params.slug })
              }

          ]
      }

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