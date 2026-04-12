import { getSubdomain } from "@/apps/common/commonJsFunction";

const developer = "developer";
const schoolAdmin = "admin";
// const payment = "payment";

const isSubdomain = getSubdomain();

const route = isSubdomain?.isSubdomain ? schoolAdmin : developer;

export const Api = {
  LOGIN: `${route}/login`,
  LOGOUT: `${route}/logout`,
  REFRESH_TOKEN: `${route}/refresh-token`,
  FORGATE_USER: `${route}/forgot-password`,
  CHANGE_EMAIL: `${route}/change-email-request`,
  VERIFY_EMAIL_CHANGE: `${route}/verify-email-change`,
  CREATE_USER: `${route}/create-admin`,
  VERYFY_OTP: `${route}/verify-otp`,
  RESEND_OTP: `${route}/re-send-otp`,
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

  // About Us management
  GET_ALL_ABOUT_US: `${route}/get-all-abouts`,
  ADD_EDIT_ABOUT_US: `${route}/add-edit-about`,
  DELETE_ABOUT_US: `${route}/delete-about`,
  GET_CMS: `${route}/get-cms`,
  CMS: `${route}/cms`,

  // School Management
  SCHOOL_REGISTER: `${route}/schoolRegister`,
  GET_ALL_SCHOOLS: `${route}/get-all-schools`,
  UPDATE_SCHOOL: `${route}/update-school`,
  DELETE_SCHOOL: `${route}/delete-school`,
  CHANGE_SCHOOL_STATUS: `${route}/school-status`,
  GET_SCHOOL: `${route}/get-school`,
  GET_SCHOOL_IMAGE: `${route}/get-school-image`,
  UPDATE_SCHOOL_THEME: `${route}/update-school-theme`,

  // Master Modules
  DEPARTMENTS: `${route}/departments`,
  GET_DEPARTMENT: `${route}/get-department`,
  ADD_EDIT_DEPARTMENT: `${route}/add-edit-department`,
  CHANGE_DEPARTMENT_STATUS: `${route}/department-action-status`,
  SUBJECTS: `${route}/subjects`,
  GET_SUBJECT: `${route}/get-subject`,
  ADD_EDIT_SUBJECT: `${route}/add-edit-subject`,
  CHANGE_SUBJECT_STATUS: `${route}/subject-action-status`,
  CLASSES: `${route}/classes`,
  GET_CLASS: `${route}/get-class`,
  ADD_EDIT_CLASS: `${route}/add-edit-class`,
  CHANGE_CLASS_STATUS: `${route}/class-action-status`,
  SECTIONS: `${route}/sections`,
  GET_SECTION: `${route}/get-section`,
  ADD_EDIT_SECTION: `${route}/add-edit-section`,
  CHANGE_SECTION_STATUS: `${route}/section-action-status`,
  GET_ALL_TEACHERS: `${route}/get-all-teachers`,
  GET_TEACHER: `${route}/get-teacher`,
  ADD_EDIT_TEACHER: `${route}/add-edit-teacher`,
  DELETE_TEACHER: `${route}/delete-teacher`,
  CHANGE_TEACHER_STATUS: `${route}/teacher-action-status`,
};
