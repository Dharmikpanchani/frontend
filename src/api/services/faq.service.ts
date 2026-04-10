import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const faqService = {
  getAll: (page: number, perPage: number) =>
    adminApiService.get<any>(
      `${Api.GET_FAQ}?pageNumber=${page}&perPageData=${perPage}`
    ),
  addEdit: (payload: URLSearchParams) =>
    adminApiService.post<any>(Api.ADD_FAQ, payload),
  delete: (id: string) =>
    adminApiService.post<any>(`${Api.DELETE_FAQ}/${id}`),
  changeStatus: (id: string) =>
    adminApiService.get<any>(`${Api.CHANGE_STATUS_FAQ}/${id}`),
};
