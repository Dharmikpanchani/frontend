import { apiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const roleService = {
  getAll: (page: number, perPage: number, search: string) =>
    apiService.get<any>(
      `${Api.GET_ALL_ROLE}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`
    ),
  getAllSimple: (search: string) => apiService.get<any>(`${Api.GET_ALL_ROLE}?type=${encodeURIComponent(search)}`),
  getById: (id: string) => apiService.get<any>(`${Api.GET_ROLE}/${id}`),
  addEdit: (payload: object) =>
    apiService.post<any>(Api.ADD_EDIT_ROLE, payload),
  delete: (id: string) =>
    apiService.delete<any>(`${Api.DELETE_ROLE}/${id}`),
};
