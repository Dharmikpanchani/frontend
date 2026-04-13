import { getSubdomain } from "@/utils/commonJsFunction";

// For user side, we might have different routes, but user said "same as admin"
const user = "user"; // Assuming 'user' or 'admin' depending on API
const schoolAdmin = "admin";

const isSubdomain = getSubdomain();

// If it's a subdomain, it's likely a school-specific user/admin
const route = isSubdomain?.isSubdomain ? schoolAdmin : user;

export const Api = {
  LOGIN: `${route}/login`,
  LOGOUT: `${route}/logout`,
  REFRESH_TOKEN: `${route}/refresh-token`,
  FORGATE_USER: `${route}/forgot-password`,
  CHANGE_EMAIL: `${route}/change-email-request`,
  VERIFY_EMAIL_CHANGE: `${route}/verify-email-change`,
  VERYFY_OTP: `${route}/verify-otp`,
  RESEND_OTP: `${route}/re-send-otp`,
  SET_PASSWORD: `${route}/reset-password`,
  CHANGE_PASSWORD: `${route}/change-password`,
  RESET_PASSWORD: `${route}/reset-password`,
  GET_PROFILE: `${route}/profile`,
  EDIT_PROFILE: `${route}/update-profile`,
  GET_SCHOOL_PROFILE: `${route}/school-profile`,
  UPDATE_SCHOOL_PROFILE: `${route}/school-update-profile`,
  GET_SCHOOL_IMAGE: `${route}/get-school-image`,
};
