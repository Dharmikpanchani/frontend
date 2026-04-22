import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const paymentService = {
  createSchoolPlan: (payload: any) => 
    adminApiService.post<any>(Api.CREATE_SCHOOL_PLAN, payload),
    
  verifyPayment: (payload: any) => 
    adminApiService.post<any>(Api.VERIFY_PAYMENT, payload),
};
