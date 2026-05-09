import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { getCookieDomain } from "@/apps/common/commonJsFunction";
import { Api } from "../EndPoint";
const { VITE_BASE_URL, VITE_END_WITH_DOMAIN, VITE_SUB_DOMAIN } = import.meta.env;
const getBaseURL = () => {
  const host = window.location.hostname;
  if (host.endsWith(VITE_END_WITH_DOMAIN)) {
    return VITE_SUB_DOMAIN;
  }
  return VITE_BASE_URL;
};

const DataService = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});

DataService.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

DataService.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const handleLogout = async () => {
      try {
        await axios.post(`${getBaseURL()}/${Api.LOGOUT}`, {}, { withCredentials: true });
      } catch (logoutError) {
        console.error("Logout API call failed during authentication error:", logoutError);
      }
      Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
      Cookies.remove("auth_token", { path: "/" });
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    };

    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res: any = await axios.post(`${getBaseURL()}/${Api.REFRESH_TOKEN}`, {}, { withCredentials: true });
          if (res.status === 200 || res.status === 201 || res.status === 304) {
            const newToken = res.data?.data?.accessToken;
            if (newToken) {
              Cookies.set("auth_token", newToken, { 
                expires: 7, 
                domain: getCookieDomain(),
                path: "/"
              });
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return DataService(originalRequest);
            }
          }
        } catch (refreshError) {
          await handleLogout();
          return Promise.reject(refreshError);
        }
      } else {
        // If _retry is already true and we get 401, force logout
        await handleLogout();
        return Promise.reject(error);
      }
    }

    if (
      error.response?.status === 404 &&
      (originalRequest.url === Api.GET_PROFILE || originalRequest.url === Api.GET_SCHOOL_PROFILE)
    ) {
      await handleLogout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const adminApiService = {
  get: async <T = unknown>(url: string, params?: object): Promise<T> => {
    const response = await DataService.get<T>(url, { params });
    return response.data;
  },

  post: async <T = unknown>(url: string, payload?: object, config?: AxiosRequestConfig): Promise<T> => {
    const response = await DataService.post<T>(url, payload, config);
    return response.data;
  },

  put: async <T = unknown>(url: string, payload?: object): Promise<T> => {
    const response = await DataService.put<T>(url, payload);
    return response.data;
  },

  patch: async <T = unknown>(url: string, payload?: object, config?: AxiosRequestConfig): Promise<T> => {
    const response = await DataService.patch<T>(url, payload, config);
    return response.data;
  },

  delete: async <T = unknown>(url: string): Promise<T> => {
    const response = await DataService.delete<T>(url);
    return response.data;
  },

  getFile: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await DataService.get<T>(url, config);
    return response.data;
  },
};

export default DataService;
