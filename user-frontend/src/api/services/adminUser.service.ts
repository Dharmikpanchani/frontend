import { apiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const adminUserService = {
  getAll: (page: number, perPage: number, search: string, role?: string, isActive?: string, isLogin?: string, adminType?: string, isVerified?: string) => {
    let url = `${Api.GET_ALL_ADMIN}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`;
    if (role) url += `&role=${role}`;
    if (isActive !== undefined && isActive !== "") url += `&isActive=${isActive}`;
    if (isLogin !== undefined && isLogin !== "") url += `&isLogin=${isLogin}`;
    if (adminType) url += `&adminType=${adminType}`;
    if (isVerified !== undefined && isVerified !== "") url += `&isVerified=${isVerified}`;
    return apiService.get<any>(url);
  },
  getById: (id: string, params: any = {}) => {
    let url = `${Api.GET_ADMIN}/${id}?`;
    if (params.page) url += `pageNumber=${params.page}&`;
    if (params.perPage) url += `perPageData=${params.perPage}&`;
    if (params.search) url += `searchRequest=${encodeURIComponent(params.search)}&`;
    if (params.isActive !== undefined && params.isActive !== "") url += `isActive=${params.isActive}&`;
    if (params.isVerified !== undefined && params.isVerified !== "") url += `isVerified=${params.isVerified}&`;
    if (params.board) url += `board=${params.board}&`;
    if (params.schoolType) url += `schoolType=${params.schoolType}&`;
    if (params.schoolCode) url += `schoolCode=${params.schoolCode}&`;
    if (params.panNumber) url += `panNumber=${params.panNumber}&`;
    if (params.gstNumber) url += `gstNumber=${params.gstNumber}&`;
    if (params.registrationNumber) url += `registrationNumber=${params.registrationNumber}&`;
    if (params.establishedYear) url += `establishedYear=${params.establishedYear}&`;
    return apiService.get<any>(url.replace(/[&?]$/, ""));
  },
  addEdit: (payload: URLSearchParams) =>
    apiService.post<any>(Api.ADD_EDIT_ADMIN, payload),
  delete: (id: string) =>
    apiService.delete<any>(`${Api.DELETE_ADMIN}/${id}`),
  changeStatus: (id: string) =>
    apiService.post<any>(`${Api.CHANGE_ADMIN_STATUS}/${id}`),
};
