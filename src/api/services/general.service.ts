import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const contactUsService = {
  getAll: (page: number, perPage: number, search: string) =>
    adminApiService.get<any>(
      `${Api.GET_CONTACT_US}?pageNumber=${page}&perPageData=${perPage}&searchRequest=${encodeURIComponent(search)}`
    ),
};

export const settingService = {
  get: () => adminApiService.get<any>(Api.GET_SETTING),
  update: (formData: FormData) =>
    adminApiService.post<any>(Api.UPDATE_SETTING, formData),
};
