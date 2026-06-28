import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const masterService = {
  // Departments
  // Departments
  getDepartments: (params: any) => {
    let url = `${Api.DEPARTMENTS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditDepartment: (payload: any) =>
    adminApiService.post<any>(Api.ADD_EDIT_DEPARTMENT, payload),
  getDepartmentById: (id: string) =>
    adminApiService.get<any>(`${Api.GET_DEPARTMENT}/${id}`),
  deleteDepartment: (id: string) =>
    adminApiService.delete<any>(`${Api.DEPARTMENTS}/${id}`),
  changeDepartmentStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_DEPARTMENT_STATUS}/${id}`, {}),
  exportDepartments: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.getFile<any>(`${Api.EXPORT_DEPARTMENTS}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },
  importDepartments: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminApiService.post<any>(`${Api.IMPORT_DEPARTMENTS}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Subjects
  getSubjects: (params: any) => {
    let url = `${Api.SUBJECTS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.departmentId)
      queryParams.append("departmentId", params.departmentId);
    if (params.isActive !== undefined && params.isActive !== "")
      queryParams.append("isActive", params.isActive);
    if (params.type) queryParams.append("type", params.type);
    if (params.startYear) {
      if (Array.isArray(params.startYear)) {
        params.startYear.forEach((y: any) => queryParams.append("startYear", String(y)));
      } else {
        queryParams.append("startYear", String(params.startYear));
      }
    }

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditSubject: (payload: any) =>
    adminApiService.post<any>(Api.ADD_EDIT_SUBJECT, payload),
  getSubjectById: (id: string) =>
    adminApiService.get<any>(`${Api.GET_SUBJECT}/${id}`),
  deleteSubject: (id: string) =>
    adminApiService.delete<any>(`${Api.SUBJECTS}/${id}`),
  changeSubjectStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_SUBJECT_STATUS}/${id}`, {}),
  exportSubjects: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.getFile<any>(`${Api.EXPORT_SUBJECTS}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },
  importSubjects: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminApiService.post<any>(`${Api.IMPORT_SUBJECTS}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Classes
  getClasses: (params: any) => {
    let url = `${Api.CLASSES}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.type) queryParams.append("type", params.type);
    if (params.isActive !== undefined && params.isActive !== "")
      queryParams.append("isActive", params.isActive);
    if (params.startYear) {
      if (Array.isArray(params.startYear)) {
        params.startYear.forEach((y: any) => queryParams.append("startYear", String(y)));
      } else {
        queryParams.append("startYear", String(params.startYear));
      }
    }

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditClass: (payload: any) =>
    adminApiService.post<any>(Api.ADD_EDIT_CLASS, payload),
  getClassById: (id: string) =>
    adminApiService.get<any>(`${Api.GET_CLASS}/${id}`),
  deleteClass: (id: string) =>
    adminApiService.delete<any>(`${Api.CLASSES}/${id}`),
  changeClassStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_CLASS_STATUS}/${id}`, {}),
  exportClasses: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.getFile<any>(`${Api.EXPORT_CLASSES}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },
  importClasses: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminApiService.post<any>(`${Api.IMPORT_CLASSES}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Sections
  getSections: (params: any) => {
    let url = `${Api.SECTIONS}`;
    const queryParams = new URLSearchParams();
    if (params.schoolId) queryParams.append("schoolId", params.schoolId);
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.classId) queryParams.append("classId", params.classId);
    if (params.isActive !== undefined && params.isActive !== "")
      queryParams.append("isActive", params.isActive);
    if (params.type) queryParams.append("type", params.type);
    if (params.startYear) {
      if (Array.isArray(params.startYear)) {
        params.startYear.forEach((y: any) => queryParams.append("startYear", String(y)));
      } else {
        queryParams.append("startYear", String(params.startYear));
      }
    }

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditSection: (payload: any) =>
    adminApiService.post<any>(Api.ADD_EDIT_SECTION, payload),
  getSectionById: (id: string) =>
    adminApiService.get<any>(`${Api.GET_SECTION}/${id}`),
  deleteSection: (id: string) =>
    adminApiService.delete<any>(`${Api.SECTIONS}/${id}`),
  changeSectionStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_SECTION_STATUS}/${id}`, {}),
  exportSections: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.getFile<any>(`${Api.EXPORT_SECTIONS}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },
  importSections: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminApiService.post<any>(`${Api.IMPORT_SECTIONS}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Teachers
  getTeachers: (params: any) => {
    let url = `${Api.GET_ALL_TEACHERS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.departmentId)
      queryParams.append("departmentId", params.departmentId);
    if (params.classId) queryParams.append("classId", params.classId);
    if (params.sectionId) queryParams.append("sectionId", params.sectionId);
    if (params.subjectId) queryParams.append("subjectId", params.subjectId);
    if (params.joiningDate)
      queryParams.append("joiningDate", params.joiningDate);
    if (params.designation)
      queryParams.append("designation", params.designation);
    if (params.employmentType)
      queryParams.append("employmentType", params.employmentType);
    if (params.attendanceId)
      queryParams.append("attendanceId", params.attendanceId);
    if (params.isActive !== undefined && params.isActive !== "")
      queryParams.append("isActive", params.isActive);
    if (params.isVerified !== undefined && params.isVerified !== "")
      queryParams.append("isVerified", params.isVerified);
    if (params.teacherCode)
      queryParams.append("teacherCode", params.teacherCode);
    if (params.fullName)
      queryParams.append("fullName", params.fullName);
    if (params.phoneNumber)
      queryParams.append("phoneNumber", params.phoneNumber);
    if (params.email)
      queryParams.append("email", params.email);
    if (params.type) queryParams.append("type", params.type);
    if (params.startYear) {
      if (Array.isArray(params.startYear)) {
        params.startYear.forEach((y: any) => queryParams.append("startYear", String(y)));
      } else {
        queryParams.append("startYear", String(params.startYear));
      }
    }

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  exportTeachers: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.getFile<any>(`${Api.EXPORT_TEACHERS}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },
  importTeachers: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminApiService.post<any>(`${Api.IMPORT_TEACHERS}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  addEditTeacher: (payload: any, id?: string) => {
    const url = id ? `${Api.ADD_EDIT_TEACHER}/${id}` : Api.ADD_EDIT_TEACHER;
    return adminApiService.post<any>(url, payload);
  },
  getTeacherById: (id: string) =>
    adminApiService.get<any>(`${Api.GET_TEACHER}/${id}`),
  deleteTeacher: (id: string) =>
    adminApiService.delete<any>(`${Api.DELETE_TEACHER}/${id}`),
  changeTeacherStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_TEACHER_STATUS}/${id}`, {}),

  // Teacher Document Verification (Admin)
  getPendingTeachers: () =>
    adminApiService.get<any>(Api.ADMIN_GET_PENDING_TEACHERS),
  getTeacherDocumentsForAdmin: (teacherId: string) =>
    adminApiService.get<any>(`${Api.ADMIN_GET_TEACHER_DOCUMENTS}/${teacherId}`),
  verifyTeacherDocument: (payload: {
    documentId: string;
    status: "APPROVED" | "REJECTED";
    rejectReason?: string;
  }) => adminApiService.post<any>(Api.ADMIN_VERIFY_TEACHER_DOCUMENT, payload),

  // Students
  getStudents: (params: any) => {
    let url = `${Api.GET_ALL_STUDENTS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.classId) queryParams.append("classId", params.classId);
    if (params.sectionId) queryParams.append("sectionId", params.sectionId);
    if (params.isActive !== undefined && params.isActive !== "")
      queryParams.append("isActive", params.isActive);
    if (params.fullName)
      queryParams.append("fullName", params.fullName);
    if (params.phoneNumber)
      queryParams.append("phoneNumber", params.phoneNumber);
    if (params.email)
      queryParams.append("email", params.email);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  exportStudents: (params?: any) => {
    const format = params?.format || "excel";
    return adminApiService.getFile<any>(`${Api.EXPORT_STUDENTS}`, {
      params,
      responseType: format === "excel" || format === "pdf" ? "blob" : "text",
    });
  },
  importStudents: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminApiService.post<any>(`${Api.IMPORT_STUDENTS}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  addEditStudent: (payload: any) => {
    let id: string | undefined;
    let body: any = payload;
    if (payload instanceof FormData) {
      id = (payload.get("id") as string) || undefined;
      if (id) payload.delete("id");
    } else {
      id = payload?.id;
      if (id) {
        const { id: _id, ...rest } = payload;
        body = rest;
      }
    }
    const url = id ? `${Api.ADD_EDIT_STUDENT}/${id}` : Api.ADD_EDIT_STUDENT;
    return adminApiService.post<any>(url, body);
  },
  getStudentById: (id: string) =>
    adminApiService.get<any>(`${Api.GET_STUDENT}/${id}`),
  deleteStudent: (id: string) =>
    adminApiService.delete<any>(`${Api.DELETE_STUDENT}/${id}`),
  changeStudentStatus: (id: string) =>
    adminApiService.post<any>(`${Api.CHANGE_STUDENT_STATUS}/${id}`, {}),
  getStudentIdCard: (id: string) =>
    adminApiService.getFile<Blob>(`${Api.STUDENT_ID_CARD}/${id}/id-card`, {
      responseType: 'blob',
    }),
  generateRollNumbers: (payload: { classId: string; sectionId: string }) =>
    adminApiService.post<any>(Api.GENERATE_ROLL_NUMBERS, payload),

  getImportLogs: (params: { page: number; perPage: number; importType?: string; search?: string }) => {
    let url = `${Api.IMPORT_LOGS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", String(params.page));
    if (params.perPage) queryParams.append("perPageData", String(params.perPage));
    if (params.importType) queryParams.append("importType", params.importType);
    if (params.search) queryParams.append("search", params.search);
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  getImportLogById: (id: string) =>
    adminApiService.get<any>(`${Api.IMPORT_LOG_DETAIL}/${id}`),
};
