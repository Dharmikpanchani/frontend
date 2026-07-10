import { Api } from "../EndPoint";
import appClient from "../client/apiClient";

// --- School Settings ---
export const getSchoolSettings = async () => {
  return await appClient.get(Api.GET_SCHOOL_SETTINGS);
};

export const updateSchoolSettings = async (data: any) => {
  return await appClient.put(Api.UPDATE_SCHOOL_SETTINGS, data);
};

export const linkRazorpayRoute = async (bankAccountId: string) => {
  return await appClient.post(`${Api.UPDATE_SCHOOL_SETTINGS}/link-razorpay/${bankAccountId}`);
};

// --- Fee Category ---
export const getFeeCategories = async (params?: any) => {
  return await appClient.get(Api.GET_ALL_FEE_CATEGORIES, { params });
};

export const getFeeCategoryById = async (id: string) => {
  return await appClient.get(`${Api.GET_FEE_CATEGORY}/${id}`);
};

export const addFeeCategory = async (data: any) => {
  return await appClient.post(Api.ADD_FEE_CATEGORY, data);
};

export const updateFeeCategory = async (id: string, data: any) => {
  return await appClient.post(`${Api.UPDATE_FEE_CATEGORY}/${id}`, data);
};

export const deleteFeeCategory = async (id: string) => {
  return await appClient.delete(`${Api.DELETE_FEE_CATEGORY}/${id}`);
};

export const changeFeeCategoryStatus = async (id: string, data: any) => {
  return await appClient.post(`${Api.CHANGE_FEE_CATEGORY_STATUS}/${id}`, data);
};

// --- Fee Structure ---
export const getFeeStructures = async (params?: any) => {
  return await appClient.get(Api.GET_ALL_FEE_STRUCTURES, { params });
};

export const getFeeStructureById = async (id: string) => {
  return await appClient.get(`${Api.GET_FEE_STRUCTURE}/${id}`);
};

export const addFeeStructure = async (data: any) => {
  return await appClient.post(Api.ADD_FEE_STRUCTURE, data);
};

export const updateFeeStructure = async (id: string, data: any) => {
  return await appClient.post(`${Api.UPDATE_FEE_STRUCTURE}/${id}`, data);
};

export const deleteFeeStructure = async (id: string) => {
  return await appClient.delete(`${Api.DELETE_FEE_STRUCTURE}/${id}`);
};

export const changeFeeStructureStatus = async (id: string, data: any) => {
  return await appClient.post(`${Api.CHANGE_FEE_STRUCTURE_STATUS}/${id}`, data);
};

// --- Fee Collection ---
export const getFeeCollections = async (params?: any) => {
  return await appClient.get(Api.GET_ALL_FEE_COLLECTIONS, { params });
};

export const collectFee = async (data: any) => {
  return await appClient.post(Api.ADD_FEE_COLLECTION, data);
};

export const exportFeeReceipt = async (id: string, format: string) => {
  return await appClient.get(`${Api.EXPORT_FEE_RECEIPT}/${id}/export?format=${format}`, {
    responseType: format === 'excel' ? 'blob' : 'text',
  });
};

// --- Fee Dues ---
export const getFeeDues = async (params?: any) => {
  return await appClient.get(Api.GET_FEE_DUES, { params });
};

export const sendDueReminder = async (data: any) => {
  return await appClient.post(Api.SEND_DUE_REMINDER, data);
};

// --- Dashboard Stats ---
export const getFeeStats = async (params?: any) => {
  return await appClient.get(Api.GET_DASHBOARD_FEE_STATS, { params });
};

// --- User Portal (Student) ---
export const getUserFeeLedger = async () => {
  return await appClient.get(Api.USER_GET_FEE_LEDGER);
};

export const exportUserFeeReceipt = async (id: string, format: string) => {
  return await appClient.get(`${Api.USER_EXPORT_FEE_RECEIPT}/${id}/export?format=${format}`, {
    responseType: format === 'excel' ? 'blob' : 'text',
  });
};

// Clearance & Developer Transactions
export const updateFeeClearance = async (id: string, data: { status: string; remarks?: string }) => {
  return await appClient.put(`${Api.CLEAR_FEE_COLLECTION}/${id}/payment-status`, data);
};

export const getDeveloperTransactions = async (params?: any) => {
  return await appClient.get(Api.GET_DEVELOPER_TRANSACTIONS, { params });
};

export const exportDeveloperTransactions = async (params?: any) => {
  const format = params?.format || 'excel';
  return await appClient.get(`${Api.EXPORT_DEVELOPER_TRANSACTIONS}`, {
    params,
    responseType: format === 'excel' || format === 'pdf' || format === 'html' ? 'blob' : 'text',
  });
};

export const exportFeeCollections = async (params?: any) => {
  const format = params?.format || 'excel';
  return await appClient.get(`${Api.GET_ALL_FEE_COLLECTIONS}/export`, {
    params,
    responseType: format === 'excel' || format === 'pdf' ? 'blob' : 'text',
  });
};

export const importFeeCategories = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return await appClient.post(Api.IMPORT_FEE_CATEGORIES, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const exportFeeCategories = async (params?: any) => {
  const format = params?.format || "excel";
  return await appClient.get(Api.EXPORT_FEE_CATEGORIES, {
    params,
    responseType: format === "excel" || format === "pdf" ? "blob" : "text",
  });
};

export const importFeeStructures = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return await appClient.post(Api.IMPORT_FEE_STRUCTURES, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const exportFeeStructures = async (params?: any) => {
  const format = params?.format || "excel";
  return await appClient.get(Api.EXPORT_FEE_STRUCTURES, {
    params,
    responseType: format === "excel" || format === "pdf" ? "blob" : "text",
  });
};

// --- Reports & Archive ---
export const generateFeeReport = async (data: { email?: string }) => {
  return await appClient.post(Api.GENERATE_FEE_REPORT, data);
};

export const generateDueReport = async (data: { email?: string }) => {
  return await appClient.post(Api.GENERATE_DUE_REPORT, data);
};

export const runArchiveProcess = async () => {
  return await appClient.post(Api.RUN_ARCHIVE);
};
