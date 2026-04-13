import { apiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const faqService = {
  getAll: (page: number, perPage: number) =>
    apiService.get<any>(
      `${Api.GET_FAQ}?pageNumber=${page}&perPageData=${perPage}`
    ),
  addEdit: (payload: URLSearchParams) =>
    apiService.post<any>(Api.ADD_FAQ, payload),
  delete: (id: string) =>
    apiService.post<any>(`${Api.DELETE_FAQ}/${id}`),
  changeStatus: (id: string) =>
    apiService.get<any>(`${Api.CHANGE_STATUS_FAQ}/${id}`),
};
