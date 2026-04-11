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
  addEditDepartment: (payload: any) => adminApiService.post<any>(Api.ADD_EDIT_DEPARTMENT, payload),
  getDepartmentById: (id: string) => adminApiService.get<any>(`${Api.GET_DEPARTMENT}/${id}`),
  deleteDepartment: (id: string) => adminApiService.delete<any>(`${Api.DEPARTMENTS}/${id}`),
  changeDepartmentStatus: (id: string) => adminApiService.post<any>(`${Api.CHANGE_DEPARTMENT_STATUS}/${id}`, {}),

  // Subjects
  getSubjects: (params: any) => {
    let url = `${Api.SUBJECTS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.departmentId) queryParams.append("departmentId", params.departmentId);
    if (params.isActive !== undefined && params.isActive !== "") queryParams.append("isActive", params.isActive);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditSubject: (payload: any) => adminApiService.post<any>(Api.ADD_EDIT_SUBJECT, payload),
  getSubjectById: (id: string) => adminApiService.get<any>(`${Api.GET_SUBJECT}/${id}`),
  deleteSubject: (id: string) => adminApiService.delete<any>(`${Api.SUBJECTS}/${id}`),
  changeSubjectStatus: (id: string) => adminApiService.post<any>(`${Api.CHANGE_SUBJECT_STATUS}/${id}`, {}),

  // Classes
  getClasses: (params: any) => {
    let url = `${Api.CLASSES}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditClass: (payload: any) => adminApiService.post<any>(Api.ADD_EDIT_CLASS, payload),
  getClassById: (id: string) => adminApiService.get<any>(`${Api.GET_CLASS}/${id}`),
  deleteClass: (id: string) => adminApiService.delete<any>(`${Api.CLASSES}/${id}`),
  changeClassStatus: (id: string) => adminApiService.post<any>(`${Api.CHANGE_CLASS_STATUS}/${id}`, {}),

  // Sections
  getSections: (params: any) => {
    let url = `${Api.SECTIONS}`;
    const queryParams = new URLSearchParams();
    if (params.schoolId) queryParams.append("schoolId", params.schoolId);
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.classId) queryParams.append("classId", params.classId);
    if (params.isActive !== undefined && params.isActive !== "") queryParams.append("isActive", params.isActive);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return adminApiService.get<any>(url);
  },
  addEditSection: (payload: any) => adminApiService.post<any>(Api.ADD_EDIT_SECTION, payload),
  getSectionById: (id: string) => adminApiService.get<any>(`${Api.GET_SECTION}/${id}`),
  deleteSection: (id: string) => adminApiService.delete<any>(`${Api.SECTIONS}/${id}`),
  changeSectionStatus: (id: string) => adminApiService.post<any>(`${Api.CHANGE_SECTION_STATUS}/${id}`, {}),

  // Teachers
  getTeachers: (params: any) => {
    let url = `${Api.TEACHERS}?schoolId=${params.schoolId}`;
    if (params.page) url += `&pageNumber=${params.page}`;
    if (params.perPage) url += `&perPageData=${params.perPage}`;
    if (params.search) url += `&searchRequest=${encodeURIComponent(params.search)}`;
    return adminApiService.get<any>(url);
  },
  createTeacher: (payload: any) => adminApiService.post<any>(Api.TEACHERS, payload),
  verifyTeacherOtp: (payload: any) => adminApiService.post<any>(Api.VERIFY_TEACHER_OTP, payload),
};
