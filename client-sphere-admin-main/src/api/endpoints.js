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
  COURSES: {
    BASE: "/courses",
    byId: (id) => `/courses/${id}`,
  },
  PUBLIC_COURSES: {
    BASE: "/public/courses",
    byId: (id) => `/public/courses/${id}`,
  },
  LEARNER: {
    COURSES: "/learner/courses",
    courseById: (id) => `/learner/courses/${id}`,
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
  VOCABULARY: {
    LOOKUP: "/vocabulary/lookup",
  },
  USER_PROFILE: {
    ME: "/user/profile/me",
    PASSWORD: "/user/profile/password",
  },
  ENROLLMENTS: {
    MY_COURSES: "/learner/enrollments/my-courses",
    RECOMMENDED: "/learner/enrollments/recommended",
    progress: (courseId) => `/learner/enrollments/courses/${courseId}/progress`,
    quizComplete: (courseId) => `/learner/enrollments/courses/${courseId}/quiz-complete`,
    byCourse: (courseId) => `/learner/enrollments/courses/${courseId}`,
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
