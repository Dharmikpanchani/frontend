import { apiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const schoolService = {
  getAllSchoolCodes: () => apiService.get<any>(Api.ALL_SCHOOL_CODES),
};
