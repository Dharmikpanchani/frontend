import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const roleService = {
  getAll: (page: number, perPage: number, search: string) =>
    adminApiService.get<any>(
      `${Api.GET_ALL_ROLE}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`
    ),
  getAllSimple: (search: string) => adminApiService.get<any>(`${Api.GET_ALL_ROLE}?type=${encodeURIComponent(search)}`),
  getById: (id: string) => adminApiService.get<any>(`${Api.GET_ROLE}/${id}`),
  addEdit: (payload: object) =>
    adminApiService.post<any>(Api.ADD_EDIT_ROLE, payload),
  delete: (id: string) =>
    adminApiService.delete<any>(`${Api.DELETE_ROLE}/${id}`),
};
