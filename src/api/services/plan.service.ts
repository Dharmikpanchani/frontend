import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const planService = {
  getAll: (page: number, perPage: number, search: string, filters: any = {}) => {
    let url = `${Api.GET_ALL_PLANS}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`;
    if (filters.isActive !== undefined && filters.isActive !== "") url += `&isActive=${filters.isActive}`;
    if (filters.developerId) url += `&developerId=${filters.developerId}`;
    if (filters.developerEmail) url += `&developerEmail=${encodeURIComponent(filters.developerEmail)}`;
    if (filters.developerName) url += `&developerName=${encodeURIComponent(filters.developerName)}`;
    if (filters.developerPhoneNumber) url += `&developerPhoneNumber=${encodeURIComponent(filters.developerPhoneNumber)}`;
    return adminApiService.get<any>(url);
  },
  getById: (id: string) => {
    return adminApiService.get<any>(`${Api.GET_PLAN}/${id}`);
  },
  addEdit: (payload: any) =>
    adminApiService.post<any>(Api.ADD_EDIT_PLAN, payload),
  delete: (id: string) =>
    adminApiService.delete<any>(`${Api.DELETE_PLAN}/${id}`),
  changeStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_PLAN_STATUS}/${id}`),
};
