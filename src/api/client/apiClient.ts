import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { getCookieDomain } from "@/apps/common/commonJsFunction";
import { toasterInfo } from "@/utils/toaster/Toaster";
import { Api } from "../EndPoint";
const { VITE_BASE_URL, VITE_END_WITH_DOMAIN, VITE_SUB_DOMAIN } = import.meta
  .env;
const getBaseURL = () => {
  const host = window.location.hostname;
  if (host.endsWith(VITE_END_WITH_DOMAIN)) {
    return VITE_SUB_DOMAIN;
  }
  return VITE_BASE_URL;
};

const DataService = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Prevents multiple simultaneous refresh calls (race condition fix)
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

DataService.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Attach academic year start to request header from localStorage
    if (typeof window !== "undefined" && config.headers) {
      const savedYear = localStorage.getItem("academic-year-filter");
      if (savedYear) {
        try {
          const parsed = JSON.parse(savedYear);
          if (parsed && parsed.startYear) {
            config.headers["x-academic-year-start"] = parsed.startYear.toString();
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

DataService.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const handleLogout = async () => {
      Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
      Cookies.remove("auth_token", { path: "/" });
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    };

    if (error.response?.status === 401) {
      const SESSION_REPLACED_MSG =
        "Your account has been logged in from another device. You have been logged out.";
      if (error.response?.data?.message === SESSION_REPLACED_MSG) {
        Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
        Cookies.remove("auth_token", { path: "/" });
        if (typeof window !== "undefined") {
          toasterInfo({
            title: "Session Expired",
            body: "You have been logged out because your account was accessed from another device.",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest._retry = true;
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(DataService(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const res: any = await axios.post(
            `${getBaseURL().replace(/\/+$/, "")}/${Api.REFRESH_TOKEN}`,
            {},
            { withCredentials: true },
          );
          if (res.status === 200 || res.status === 201 || res.status === 304) {
            const newToken = res.data?.data?.accessToken;
            if (newToken) {
              Cookies.set("auth_token", newToken, {
                expires: 7,
                domain: getCookieDomain(),
                path: "/",
              });
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              onTokenRefreshed(newToken);
              isRefreshing = false;
              return DataService(originalRequest);
            }
          }
          // Refresh succeeded but no token in response
          onTokenRefreshed(null);
          isRefreshing = false;
          await handleLogout();
          return Promise.reject(error);
        } catch (refreshError: any) {
          onTokenRefreshed(null);
          isRefreshing = false;
          if (refreshError.response?.data?.message === SESSION_REPLACED_MSG) {
            Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
            Cookies.remove("auth_token", { path: "/" });
            if (typeof window !== "undefined") {
              toasterInfo({
                title: "Session Expired",
                body: "You have been logged out because your account was accessed from another device.",
              });
              setTimeout(() => {
                window.location.href = "/";
              }, 3000);
            }
          } else {
            await handleLogout();
          }
          return Promise.reject(refreshError);
        }
      } else {
        // _retry already true and still 401 — genuine auth failure
        await handleLogout();
        return Promise.reject(error);
      }
    }

    if (
      error.response?.status === 404 &&
      (originalRequest.url === Api.GET_PROFILE ||
        originalRequest.url === Api.GET_SCHOOL_PROFILE)
    ) {
      await handleLogout();
      return Promise.reject(error);
    }

    // 🔴 403 — Access temporarily suspended (plan violation block)
    // When school_admin hits 15+ unauthorized plan access attempts,
    // backend blocks them for 3 hours. Auto-logout with toaster.
    if (error.response?.status === 403) {
      const message: string = error.response?.data?.message ?? "";
      const VIOLATION_BLOCK_MSG =
        "Access temporarily suspended for 3 hours due to repeated unauthorized access attempts.";

      if (message === VIOLATION_BLOCK_MSG) {
        toasterInfo({
          title: "⛔ Access Suspended",
          body: message,
        });
        setTimeout(async () => {
          await handleLogout();
        }, 3000);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export const adminApiService = {
  get: async <T = unknown>(url: string, params?: object): Promise<T> => {
    const response = await DataService.get<T>(url, { params });
    return response.data;
  },

  post: async <T = unknown>(
    url: string,
    payload?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await DataService.post<T>(url, payload, config);
    return response.data;
  },

  put: async <T = unknown>(url: string, payload?: object): Promise<T> => {
    const response = await DataService.put<T>(url, payload);
    return response.data;
  },

  patch: async <T = unknown>(
    url: string,
    payload?: object,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await DataService.patch<T>(url, payload, config);
    return response.data;
  },

  delete: async <T = unknown>(url: string): Promise<T> => {
    const response = await DataService.delete<T>(url);
    return response.data;
  },

  getFile: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await DataService.get<T>(url, config);
    return response.data;
  },
};

export default DataService;
