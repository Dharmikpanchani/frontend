import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

/**
 * Auth API service
 * All auth-related API calls go here.
 * Slice thunks call these service methods.
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResendOtpPayload {
  email: string;
}

export const authService = {
  login: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.LOGIN, payload),

  forgotPassword: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.FORGATE_USER, payload),

  verifyOtp: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.VERYFY_OTP, payload),

  resendOtp: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.RESEND_OTP, payload),

  resetPassword: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.RESET_PASSWORD, payload),

  changePassword: (payload: any) =>
    adminApiService.post<any>(Api.CHANGE_PASSWORD, payload),

  getProfile: () =>
    adminApiService.get<any>(Api.GET_PROFILE),

  updateProfile: (payload: FormData) =>
    adminApiService.patch<any>(Api.EDIT_PROFILE, payload),

  getSchoolProfile: () =>
    adminApiService.get<any>(Api.GET_SCHOOL_PROFILE),

  updateSchoolProfile: (payload: FormData) =>
    adminApiService.post<any>(Api.UPDATE_SCHOOL_PROFILE, payload),

  changeEmailRequest: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.CHANGE_EMAIL, payload),

  verifyEmailChange: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.VERIFY_EMAIL_CHANGE, payload),

  refreshToken: () =>
    adminApiService.post<any>(Api.REFRESH_TOKEN, {}),

  logout: () =>
    adminApiService.post<any>(Api.LOGOUT, {}, { withCredentials: true }),
};
