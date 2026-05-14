import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const subscriptionService = {
  getCurrentSubscription: () =>
    adminApiService.get<any>(Api.GET_CURRENT_SUBSCRIPTION),

  getFuturePlan: () =>
    adminApiService.get<any>(Api.GET_FUTURE_PLAN),

  getSubscriptionHistory: () =>
    adminApiService.get<any>(Api.GET_SUBSCRIPTION_HISTORY),

  upgradePlan: (payload: { newPlanId: string; paymentId?: string; amountPaid?: number }) =>
    adminApiService.post<any>(Api.UPGRADE_PLAN, payload),

  instantUpgrade: (payload: { futurePlanId: string }) =>
    adminApiService.post<any>(Api.INSTANT_UPGRADE, payload),

  cancelFuturePlan: (payload: { futurePlanId: string }) =>
    adminApiService.post<any>(Api.CANCEL_FUTURE_PLAN, payload),
};
