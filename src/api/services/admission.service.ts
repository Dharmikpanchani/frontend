import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const admissionService = {
  /** Public — submit student admission application (no auth) */
  submitApplication: (formData: FormData) =>
    adminApiService.post(Api.ADMISSION_APPLY, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Public — check application status by phone number */
  checkStatus: (phoneNumber: string) =>
    adminApiService.get(Api.ADMISSION_STATUS, { phoneNumber }),

  /** Public — fetch available classes for a school */
  getPublicClasses: () => adminApiService.get(Api.PUBLIC_CLASSES),

  /** Admin — list pending admission applications */
  getPendingAdmissions: (params?: object) =>
    adminApiService.get(Api.ADMIN_GET_PENDING_ADMISSIONS, params),

  /** Admin — approve or reject an application */
  admissionAction: (
    id: string,
    payload: { action: "approved" | "rejected"; rejectReason?: string; admissionNumber?: string }
  ) => adminApiService.post(`${Api.ADMIN_STUDENT_ADMISSION_ACTION}/${id}`, payload),

  /** Public — submit inquiry */
  submitInquiry: (payload: any) =>
    adminApiService.post(Api.INQUIRY_APPLY, payload),

  /** Admin — get inquiries */
  getInquiries: (params?: object) =>
    adminApiService.get(Api.ADMIN_GET_INQUIRIES, params),

  /** Admin — export inquiries */
  exportInquiries: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.get<any>(`${Api.EXPORT_INQUIRIES}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },

  /** Admin — update inquiry status */
  updateInquiryStatus: (id: string, payload: { status: string; adminRemark?: string }) =>
    adminApiService.patch(`${Api.ADMIN_INQUIRY_ACTION}/${id}/status`, payload),

  /** Admin — delete inquiry */
  deleteInquiry: (id: string) =>
    adminApiService.delete(`${Api.ADMIN_INQUIRY_DELETE}/${id}`),
};
