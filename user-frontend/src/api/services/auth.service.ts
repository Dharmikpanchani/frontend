import { apiService } from "../client/apiClient";
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
    apiService.post<any>(Api.LOGIN, payload),

  forgotPassword: (payload: URLSearchParams) =>
    apiService.post<any>(Api.FORGATE_USER, payload),

  verifyOtp: (payload: URLSearchParams) =>
    apiService.post<any>(Api.VERYFY_OTP, payload),

  resendOtp: (payload: URLSearchParams) =>
    apiService.post<any>(Api.RESEND_OTP, payload),

  resetPassword: (payload: URLSearchParams) =>
    apiService.post<any>(Api.RESET_PASSWORD, payload),

  changePassword: (payload: any) =>
    apiService.post<any>(Api.CHANGE_PASSWORD, payload),

  getProfile: () =>
    apiService.get<any>(Api.GET_PROFILE),

  updateProfile: (payload: FormData) =>
    apiService.patch<any>(Api.EDIT_PROFILE, payload),

  getSchoolProfile: () =>
    apiService.get<any>(Api.GET_SCHOOL_PROFILE),

  updateSchoolProfile: (payload: FormData) =>
    apiService.post<any>(Api.UPDATE_SCHOOL_PROFILE, payload),

  changeEmailRequest: (payload: URLSearchParams) =>
    apiService.post<any>(Api.CHANGE_EMAIL, payload),

  verifyEmailChange: (payload: URLSearchParams) =>
    apiService.post<any>(Api.VERIFY_EMAIL_CHANGE, payload),

  refreshToken: () =>
    apiService.post<any>(Api.REFRESH_TOKEN, {}),

  logout: () =>
    apiService.post<any>(Api.LOGOUT, {}, { withCredentials: true }),
};
