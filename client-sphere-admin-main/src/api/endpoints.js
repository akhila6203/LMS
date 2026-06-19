/**
 * Backend route paths (relative to API_BASE_URL).
 * Matches Node.js routes in backend/server.js
 */
const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google-login",
    ADMIN_LOGIN: "/auth/admin/login",
    ADMIN_REGISTER: "/auth/admin/register",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
  ADMIN_PROFILE: {
    ME: "/admin/profile/me",
    PASSWORD: "/admin/profile/password",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    // WORKSPACE: "/admin/settings/workspace",
    // INTEGRATIONS: "/admin/settings/integrations",
    // integration: (provider) => `/admin/settings/integrations/${provider}`,
  },
  BANNERS: {
  BASE: "/banners",
  PUBLIC: "/banners/public",
  byId: (id) => `/banners/${id}`,
},
HOME_VIDEO: {
  BASE: "/home-video",
  PUBLIC: "/home-video/public",
  byId: (id) => `/home-video/${id}`,
},
  CLASSES: {
    BASE: "/classes",
    byId: (id) => `/classes/${id}`,
  },
  PUBLIC_CLASSES: {
    BASE: "/public/classes",
    byId: (id) => `/public/classes/${id}`,
  },
  LEARNER: {
    CLASSES: "/learner/classes",
    classById: (id) => `/learner/classes/${id}`,
    DASHBOARD: "/learner/dashboard",
  },
  STUDENTS: {
    BASE: "/students",
    BULK_IMPORT: "/students/bulk-import",
    INVITE: "/students/invite",
    byId: (id) => `/students/${id}`,
  },
  SCHOOLS: {
    BASE: "/schools",
  },
  SUBJECTS: {
    BASE: "/subjects",
    PUBLIC: "/subjects/public",
    byId: (id) => `/subjects/${id}`,
  },
  USER: {
    SUBJECTS: "/user/subjects",
  },
  SEARCH: "/search",
  VOCABULARY: {
    LOOKUP: "/vocabulary/lookup",
  },
  USER_PROFILE: {
    ME: "/user/profile/me",
    PASSWORD: "/user/profile/password",
  },
  ENROLLMENTS: {
    MY_CLASSES: "/learner/enrollments/my-classes",
    RECOMMENDED: "/learner/enrollments/recommended",
    progress: (classId) => `/learner/enrollments/classes/${classId}/progress`,
    quizComplete: (classId) => `/learner/enrollments/classes/${classId}/quiz-complete`,
    byClass: (classId) => `/learner/enrollments/classes/${classId}`,
  },
  UPLOAD: {
    VIDEO: "/upload/video",
    MATERIAL: "/upload/material",
  },
  MATERIALS: {
    BASE: "/materials",
    byId: (sourceType, id) => `/materials/${sourceType}/${id}`,
  },
};

export default ENDPOINTS;
