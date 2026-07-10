import { getSubdomain } from "@/apps/common/commonJsFunction";

const developer = "developer";
const schoolAdmin = "admin";
// const payment = "payment";

const isSubdomain = getSubdomain();

let route = isSubdomain?.isSubdomain ? schoolAdmin : developer;

// Override route for local testing of Checkout page
if (window.location.pathname.startsWith("/checkout")) {
  route = schoolAdmin;
}

export const Api = {
  PING: `${route}/ping`,
  LOGIN: `${route}/login`,
  LOGOUT: `${route}/logout`,
  REFRESH_TOKEN: `${route}/refresh-token`,
  FORGATE_USER: `${route}/forgot-password`,
  CHANGE_EMAIL: `${route}/change-email-request`,
  VERIFY_EMAIL_CHANGE: `${route}/verify-email-change`,
  CREATE_USER: `${route}/create-admin`,
  VERYFY_OTP: `${route}/verify-otp`,
  RESEND_OTP: `${route}/re-send-otp`,
  OTP_STATUS: `${route}/otp-status`,
  SET_PASSWORD: `${route}/reset-password`,
  CHANGE_PASSWORD: `${route}/change-password`,
  RESET_PASSWORD: `${route}/reset-password`,
  GET_PROFILE: `${route}/profile`,
  EDIT_PROFILE: `${route}/update-profile`,
  GET_SCHOOL_PROFILE: `${route}/school-profile`,
  UPDATE_SCHOOL_PROFILE: `${route}/school-update-profile`,

  GET_ALL_USER: `${route}/get-all-users`,
  DELETE_USER: `${route}/delete-user`,
  CHANGE_STATUS_USER: `${route}/user-action-status`,

  // Admin management
  GET_ALL_ADMIN: `${route}/get-all-admins`,
  GET_ADMIN: `${route}/get-admin`,
  ADD_EDIT_ADMIN: `${route}/add-edit-admin`,
  DELETE_ADMIN: `${route}/delete-admin`,
  CHANGE_ADMIN_STATUS: `${route}/admin-action-status`,

  // FAQ management
  GET_FAQ: `${route}/get-all-faq`,
  ADD_FAQ: `${route}/add-edit-faq`,
  DELETE_FAQ: `${route}/delete-faq`,
  CHANGE_STATUS_FAQ: `${route}/change-faq-status`,

  // Contact Us / Settings
  GET_CONTACT_US: `${route}/get-contact-us`,
  GET_SETTING: `${route}/get-setting`,
  UPDATE_SETTING: `${route}/update-setting`,

  // Role management
  GET_ALL_ROLE: `${route}/get-all-roles`,
  GET_ROLE: `${route}/get-role`,
  ADD_EDIT_ROLE: `${route}/add-edit-role`,
  DELETE_ROLE: `${route}/delete-role`,
  CHANGE_STATUS_ROLE: `${route}/change-role-status`,
  IMPORT_ROLES: `${route}/import-roles`,
  EXPORT_ROLES: `${route}/export-roles`,

  // About Us management
  GET_ALL_ABOUT_US: `${route}/get-all-abouts`,
  ADD_EDIT_ABOUT_US: `${route}/add-edit-about`,
  DELETE_ABOUT_US: `${route}/delete-about`,
  GET_CMS: `${route}/get-cms`,
  CMS: `${route}/cms`,

  // School Management
  ADD_EDIT_SCHOOL: `${route}/add-edit-school`,
  GET_ALL_SCHOOLS: `${route}/get-all-schools`,
  DELETE_SCHOOL: `${route}/delete-school`,
  CHANGE_SCHOOL_STATUS: `${route}/school-status`,
  GET_SCHOOL: `${route}/get-school`,
  GET_SCHOOL_IMAGE: `${route}/get-school-image`,
  UPDATE_SCHOOL_THEME: `${route}/update-school-theme`,
  GET_SCHOOL_BY_CODE: `${route}/get-school-by-code`,

  // Master Modules
  DEPARTMENTS: `${route}/departments`,
  GET_DEPARTMENT: `${route}/get-department`,
  ADD_EDIT_DEPARTMENT: `${route}/add-edit-department`,
  CHANGE_DEPARTMENT_STATUS: `${route}/department-action-status`,
  EXPORT_DEPARTMENTS: `${route}/export-departments`,
  IMPORT_DEPARTMENTS: `${route}/import-departments`,
  SUBJECTS: `${route}/subjects`,
  GET_SUBJECT: `${route}/get-subject`,
  ADD_EDIT_SUBJECT: `${route}/add-edit-subject`,
  CHANGE_SUBJECT_STATUS: `${route}/subject-action-status`,
  EXPORT_SUBJECTS: `${route}/export-subjects`,
  IMPORT_SUBJECTS: `${route}/import-subjects`,
  CLASSES: `${route}/classes`,
  GET_CLASS: `${route}/get-class`,
  ADD_EDIT_CLASS: `${route}/add-edit-class`,
  CHANGE_CLASS_STATUS: `${route}/class-action-status`,
  EXPORT_CLASSES: `${route}/export-classes`,
  IMPORT_CLASSES: `${route}/import-classes`,
  SECTIONS: `${route}/sections`,
  GET_SECTION: `${route}/get-section`,
  ADD_EDIT_SECTION: `${route}/add-edit-section`,
  CHANGE_SECTION_STATUS: `${route}/section-action-status`,
  EXPORT_SECTIONS: `${route}/export-sections`,
  IMPORT_SECTIONS: `${route}/import-sections`,
  GET_ALL_TEACHERS: `${route}/get-all-teachers`,
  GET_TEACHER: `${route}/get-teacher`,
  EXPORT_TEACHERS: `${route}/export-teachers`,
  IMPORT_TEACHERS: `${route}/import-teachers`,
  ADD_EDIT_TEACHER: `${route}/add-edit-teacher`,
  DELETE_TEACHER: `${route}/delete-teacher`,
  CHANGE_TEACHER_STATUS: `${route}/teacher-action-status`,
  TEACHER_ASSIGNMENTS: `${route}/teacher-assignments`,
  TEACHER_ASSIGNMENTS_HISTORY: `${route}/teacher-assignments/history`,
  TEACHER_ASSIGNMENTS_CLONE: `${route}/teacher-assignments/clone`,
  GET_ALL_STUDENTS: `${route}/get-all-students`,
  GET_STUDENT: `${route}/get-student`,
  EXPORT_STUDENTS: `${route}/export-students`,
  IMPORT_STUDENTS: `${route}/import-students`,
  ADD_EDIT_STUDENT: `${route}/add-edit-student`,
  DELETE_STUDENT: `${route}/delete-student`,
  CHANGE_STUDENT_STATUS: `${route}/student-action-status`,
  STUDENT_ID_CARD: `${route}/students`,
  GENERATE_ROLL_NUMBERS: `${route}/students/generate-roll-numbers`,
  PROMOTE_STUDENTS: `${route}/students/promote`,
  // Plan management
  GET_ALL_PLANS: `${route}/get-all-plans`,
  GET_PLAN: `${route}/get-plan`,
  ADD_EDIT_PLAN: `${route}/add-edit-plan`,
  IMPORT_PLANS: `${route}/import-plans`,
  DELETE_PLAN: `${route}/delete-plan`,
  CHANGE_PLAN_STATUS: `${route}/plan-status`,
  GET_DEVELOPER_WISE_SCHOOL_PLAN: `${route}/get-developer-wise-school-plan`,

  // Payment
  CREATE_SCHOOL_PLAN: `payment/create-school-plan`,
  VERIFY_PAYMENT: `payment/verify`,

  // Teacher Documents (User Side)
  GET_TEACHER_DOCUMENTS: `user/teacher/documents`,
  REUPLOAD_TEACHER_DOCUMENT: `user/teacher/document/reupload`,
  GET_TEACHER_DOCUMENT_HISTORY: `user/teacher/document/history`,

  // Teacher Documents (Admin Side Verification)
  ADMIN_GET_PENDING_TEACHERS: `${route}/teacher-documents/pending`,
  ADMIN_GET_TEACHER_DOCUMENTS: `${route}/teacher-documents/teacher`,
  ADMIN_VERIFY_TEACHER_DOCUMENT: `${route}/teacher-documents/verify`,

  // Subscription management
  GET_CURRENT_SUBSCRIPTION: `subscription/current`,
  GET_FUTURE_PLAN: `subscription/future-plan`,
  GET_SUBSCRIPTION_HISTORY: `subscription/history`,
  UPGRADE_PLAN: `subscription/upgrade`,
  INSTANT_UPGRADE: `subscription/instant-upgrade`,
  CANCEL_FUTURE_PLAN: `subscription/cancel-future-plan`,

  // Settings
  GET_SCHOOL_SETTINGS: `${route}/school-settings`,
  UPDATE_SCHOOL_SETTINGS: `${route}/school-settings`,

  // Academic Years
  GET_ACADEMIC_YEARS: `${route}/academic-years`,
  CREATE_ACADEMIC_YEAR: `${route}/academic-years`,

  // Fee Category
  GET_ALL_FEE_CATEGORIES: `${route}/fee-categories`,
  GET_FEE_CATEGORY: `${route}/fee-categories`,
  ADD_FEE_CATEGORY: `${route}/fee-categories`,
  UPDATE_FEE_CATEGORY: `${route}/fee-categories`,
  DELETE_FEE_CATEGORY: `${route}/fee-categories`,
  CHANGE_FEE_CATEGORY_STATUS: `${route}/fee-category-action-status`, // /:id
  IMPORT_FEE_CATEGORIES: `${route}/fee-categories/import`,
  EXPORT_FEE_CATEGORIES: `${route}/fee-categories/export`,
 
  GET_ALL_FEE_STRUCTURES: `${route}/fee-structures`,
  GET_FEE_STRUCTURE: `${route}/fee-structures`,
  ADD_FEE_STRUCTURE: `${route}/fee-structures`,
  UPDATE_FEE_STRUCTURE: `${route}/fee-structures`,
  DELETE_FEE_STRUCTURE: `${route}/fee-structures`,
  CHANGE_FEE_STRUCTURE_STATUS: `${route}/fee-structure-action-status`, // /:id
  IMPORT_FEE_STRUCTURES: `${route}/fee-structures/import`,
  EXPORT_FEE_STRUCTURES: `${route}/fee-structures/export`,

  GET_ALL_FEE_COLLECTIONS: `${route}/fee-collections`,
  GET_FEE_COLLECTION: `${route}/fee-collections`,
  ADD_FEE_COLLECTION: `${route}/fee-collections/collect`,
  EXPORT_FEE_RECEIPT: `${route}/fee-collections/receipt`, // /:id/export

  GET_FEE_DUES: `${route}/fee-collections/dues`,
  SEND_DUE_REMINDER: `${route}/fee-collections/dues`,

  GET_DASHBOARD_FEE_STATS: `${route}/fee-collections`,

  // User Portal - Fees
  USER_GET_FEE_LEDGER: `user/fees/ledger`,
  USER_EXPORT_FEE_RECEIPT: `user/fees/receipt`, // id/export

  // Admission (Public)
  ADMISSION_APPLY: `user/admissions/apply`,
  ADMISSION_STATUS: `user/admissions/status`,
  PUBLIC_CLASSES: `user/public-classes`,

  // Admission (Admin)
  ADMIN_GET_PENDING_ADMISSIONS: `${route}/pending-admission-students`,
  ADMIN_STUDENT_ADMISSION_ACTION: `${route}/student-admission-action`, // /:id

  // Inquiries
  INQUIRY_APPLY: `user/inquiries/submit`,
  ADMIN_GET_INQUIRIES: `${route}/inquiries`,
  EXPORT_INQUIRIES: `${route}/export-inquiries`,
  ADMIN_INQUIRY_ACTION: `${route}/inquiries`, // PATCH /:id/status
  ADMIN_INQUIRY_DELETE: `${route}/inquiries`, // DELETE /:id

  // Clearances & Developer Transactions (Phase 1.5)
  CLEAR_FEE_COLLECTION: `${route}/fee-collections`, // /:id/payment-status
  GET_DEVELOPER_TRANSACTIONS: `developer/transactions`,
  EXPORT_DEVELOPER_TRANSACTIONS: `developer/transactions/export`,

  // Import Logs
  IMPORT_LOGS: `${route}/import-logs`,
  IMPORT_LOG_DETAIL: `${route}/import-log`,

  // Reports & Archive
  GENERATE_FEE_REPORT: `${route}/reports/fee-report`,
  GENERATE_DUE_REPORT: `${route}/reports/due-report`,
  RUN_ARCHIVE: `${route}/archive/run`,
};
