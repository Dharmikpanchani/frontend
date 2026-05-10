import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const teacherDocumentService = {
  getDocuments: () => {
    return adminApiService.get<any>(Api.GET_TEACHER_DOCUMENTS);
  },
  
  reuploadDocument: (payload: FormData) => {
    return adminApiService.post<any>(Api.REUPLOAD_TEACHER_DOCUMENT, payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  getDocumentHistory: () => {
    return adminApiService.get<any>(Api.GET_TEACHER_DOCUMENT_HISTORY);
  }
};
