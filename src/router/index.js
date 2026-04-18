import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: "/",
      component: Layout,
      redirect: "/workbench",
      children: [
        {
          path: "workbench",
          name: "workbench",
          component: () => import("@/views/workbench/workbench.vue"),
        },
        {
          path: "ecg-data",
          name: "ecg-data",
          component: () => import("@/views/ecg-data/ecg-data.vue"),
        },
        {
          path: "ai-diagnosis",
          name: "ai-diagnosis",
          component: () => import("@/views/ai-diagnosis/ai-diagnosis.vue"),
        },
        {
          path: "report",
          name: "report",
          component: () => import("@/views/report/report.vue"),
        },
        {
          path: "patient",
          name: "patient",
          component: () => import("@/views/patient/patient.vue"),
        },
        {
          path: "warning",
          name: "warning",
          component: () => import("@/views/warning/warning.vue"),
        },
        {
          path: "realtime",
          name: "realtime",
          component: () => import("@/views/realtime/realtime.vue"),
        },
        {
          path: "device",
          name: "device",
          component: () => import("@/views/device/device.vue"),
        },
        {
          path: "quality",
          name: "quality",
          component: () => import("@/views/quality/quality.vue"),
        },
        {
          path: "system/users",
          name: "system-users",
          component: () => import("@/system/users/index.vue"),
        },
        {
          path: "system/roles",
          name: "system-roles",
          component: () => import("@/system/roles/index.vue"),
        },
        {
          path: "system/departments",
          name: "system-departments",
          component: () => import("@/system/departments/index.vue"),
        }
      ],
    },
  ],
})

export default router
