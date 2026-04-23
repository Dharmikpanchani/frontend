import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const schoolService = {
  addEditSchool: (payload: FormData) =>
    adminApiService.post<any>(Api.ADD_EDIT_SCHOOL, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getAll: (params: any) => {
    let url = `${Api.GET_ALL_SCHOOLS}?pageNumber=${params.page}&perPageData=${params.perPage}`;
    if (params.search) url += `&searchRequest=${encodeURIComponent(params.search)}`;
    if (params.isActive !== undefined && params.isActive !== "") url += `&isActive=${params.isActive}`;
    if (params.isVerified !== undefined && params.isVerified !== "") url += `&isVerified=${params.isVerified}`;
    if (params.board) url += `&board=${params.board}`;
    if (params.schoolType) url += `&schoolType=${params.schoolType}`;
    if (params.referralId) url += `&referralId=${params.referralId}`;
    if (params.schoolCode) url += `&schoolCode=${params.schoolCode}`;
    if (params.panNumber) url += `&panNumber=${params.panNumber}`;
    if (params.gstNumber) url += `&gstNumber=${params.gstNumber}`;
    if (params.registrationNumber) url += `&registrationNumber=${params.registrationNumber}`;
    if (params.establishedYear) url += `&establishedYear=${params.establishedYear}`;
    if (params.isActivePlan !== undefined && params.isActivePlan !== "") url += `&isActivePlan=${params.isActivePlan}`;
    if (params.planName) url += `&planName=${encodeURIComponent(params.planName)}`;
    if (params.adminId) url += `&adminId=${params.adminId}`;
    
    return adminApiService.get<any>(url);
  },
  delete: (id: string) => adminApiService.delete<any>(`${Api.DELETE_SCHOOL}/${id}`),
  changeStatus: (id: string) => adminApiService.post<any>(`${Api.CHANGE_SCHOOL_STATUS}/${id}`),
  getById: (id: string) => adminApiService.get<any>(`${Api.GET_SCHOOL}/${id}`),
  getSchoolImageByCode: (payload: any) => adminApiService.post<any>(Api.GET_SCHOOL_IMAGE, payload),
  updateSchoolTheme: (payload: any) => adminApiService.post<any>(Api.UPDATE_SCHOOL_THEME, payload),
  getDeveloperWiseSchoolPlan: (schoolId?: string) => {
    let url = Api.GET_DEVELOPER_WISE_SCHOOL_PLAN;
    if (schoolId) url += `?school_id=${schoolId}`;
    return adminApiService.get<any>(url);
  },
  getSchoolByCode: (schoolCode: string) => adminApiService.get<any>(`${Api.GET_SCHOOL_BY_CODE}?schoolCode=${schoolCode}`),
};
