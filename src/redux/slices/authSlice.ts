import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AdminState } from "../../types/interfaces/reduxInterface";
import { authService } from "../../api/services/auth.service";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { getCookieDomain } from "../../apps/common/commonJsFunction";

export interface AuthState extends AdminState {
  emailForReset: string;
  loading: boolean;
  isOtpPending: boolean;
}

const tokenFromCookie = Cookies.get("auth_token") || "";

const initialState: AuthState = {
  isAdminLogin: !!tokenFromCookie,
  adminDetails: { isLogin: true },
  token: tokenFromCookie,
  emailForReset: "",
  loading: !!tokenFromCookie,
  isOtpPending: false,
};

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.login(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "Login successful");
        return res.data;
      } else {
        toast.error(res.message || "Login failed");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Login failed";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPasswordAdmin = createAsyncThunk(
  "auth/forgotPassword",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.forgotPassword(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "OTP sent successfully");
        return { data: res.data, email: urlencoded.get("email") };
      } else {
        toast.error(res.message || "Failed to send OTP");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Forgot password error";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOtpAdmin = createAsyncThunk(
  "auth/verifyOtp",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.verifyOtp(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "OTP verified successfully");
        return res.data;
      } else {
        toast.error(res.message || "Failed to verify OTP");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "OTP verification error";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendOtpAdmin = createAsyncThunk(
  "auth/resendOtp",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.resendOtp(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "OTP resent successfully");
        return res;
      } else {
        toast.error(res.message || "Failed to resend OTP");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Resend OTP error";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPasswordAdmin = createAsyncThunk(
  "auth/resetPassword",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.resetPassword(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "Password reset successfully");
        return res;
      } else {
        toast.error(res.message || "Failed to reset password");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Reset password error";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeEmailRequestAdmin = createAsyncThunk(
  "auth/changeEmailRequest",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.changeEmailRequest(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "OTP sent successfully");
        return res;
      } else {
        toast.error(res.message || "Failed to initiate email change");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Email change request error";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyEmailChangeAdmin = createAsyncThunk(
  "auth/verifyEmailChange",
  async (urlencoded: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await authService.verifyEmailChange(urlencoded);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "Email updated successfully");
        return { data: res.data, newEmail: urlencoded.get("newEmail") };
      } else {
        toast.error(res.message || "Failed to verify email change");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Email verification error";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getProfileAdmin = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res: any = await authService.getProfile();
      if (res.status === 200 || res.status === 201) {
        return res.data;
      } else {
        toast.error(res.message || "Failed to fetch profile");
        return rejectWithValue(res.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error?.message || "Failed to fetch profile";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      state.isAdminLogin = false;
      state.adminDetails = {};
      state.token = "";
      state.emailForReset = "";
      state.isOtpPending = false;
      Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
    },
    setEmailForReset: (state, action: PayloadAction<string>) => {
      state.emailForReset = action.payload;
    },
    setAdminLogin: (state, action: PayloadAction<any>) => {
      state.adminDetails = { ...action.payload, isLogin: true };
      state.isAdminLogin = true;
      const token = action.payload?.accessToken || action.payload?.token || state.token || Cookies.get("auth_token") || "";
      state.token = token;
      if (token) Cookies.set("auth_token", token, { expires: 7, domain: getCookieDomain(), path: "/" });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.requireOtp) {
          state.isAdminLogin = false;
          state.isOtpPending = true;
          state.adminDetails = action.payload; // Storing temporarily
          state.token = action.payload?.accessToken || action.payload?.token || "";
        } else {
          state.isAdminLogin = true;
          state.isOtpPending = false;
          state.adminDetails = { ...action.payload, isLogin: true };
          const token = action.payload?.accessToken || action.payload?.token || "";
          state.token = token;
          if (token) Cookies.set("auth_token", token, { expires: 7, domain: getCookieDomain(), path: "/" });
        }
      })
      .addCase(loginAdmin.rejected, (state) => {
        state.loading = false;
      })

      .addCase(forgotPasswordAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPasswordAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.emailForReset = action.payload.email as string;
      })
      .addCase(forgotPasswordAdmin.rejected, (state) => {
        state.loading = false;
      })

      .addCase(verifyOtpAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtpAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const type = action.meta.arg.get("type");
        const isRegistration = type === "registration" || type === "schoolRegistration";

        if (!isRegistration) {
          state.isAdminLogin = true;
          state.isOtpPending = false;
          if (action.payload) {
            state.adminDetails = { ...action.payload, isLogin: true };
            const token = action.payload?.accessToken || action.payload?.token || state.token || Cookies.get("auth_token") || "";
            state.token = token;
            if (token) Cookies.set("auth_token", token, { expires: 7, domain: getCookieDomain(), path: "/" });
          }
        }
      })
      .addCase(verifyOtpAdmin.rejected, (state) => {
        state.loading = false;
      })

      .addCase(resendOtpAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOtpAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtpAdmin.rejected, (state) => {
        state.loading = false;
      })

      .addCase(resetPasswordAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPasswordAdmin.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPasswordAdmin.rejected, (state) => {
        state.loading = false;
      })

      .addCase(getProfileAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminDetails = { ...action.payload, isLogin: true };
        state.isAdminLogin = true;
      })
      .addCase(getProfileAdmin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(verifyEmailChangeAdmin.fulfilled, (state, action) => {
        if (state.adminDetails) {
          state.adminDetails.email = action.payload.newEmail as string;
        }
      });
  },
});

export const { logoutAdmin, setEmailForReset, setAdminLogin } = authSlice.actions;
export default authSlice.reducer;
