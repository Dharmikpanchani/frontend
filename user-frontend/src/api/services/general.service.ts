import { apiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const contactUsService = {
  getAll: (page: number, perPage: number, search: string) =>
    apiService.get<any>(
      `${Api.GET_CONTACT_US}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`
    ),
};

export const settingService = {
  get: () => apiService.get<any>(Api.GET_SETTING),
  update: (formData: FormData) =>
    apiService.post<any>(Api.UPDATE_SETTING, formData),
};
