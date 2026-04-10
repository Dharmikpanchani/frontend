import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const userService = {
  getAll: (page: number, perPage: number, search: string, status?: string, zodiacSign?: string, startDate?: string, endDate?: string) => {
    let url = `${Api.GET_ALL_USER}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`;
    if (status !== undefined && status !== "") url += `&isActive=${status}`;
    if (zodiacSign) url += `&zodiacSign=${encodeURIComponent(zodiacSign)}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return adminApiService.get<any>(url);
  },
  delete: (id: string) =>
    adminApiService.delete<any>(`${Api.DELETE_USER}/${id}`),
  changeStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_STATUS_USER}/${id}`),
};
