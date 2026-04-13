import { apiService } from "../client/apiClient";
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
    return apiService.get<any>(url);
  },
  addEditDepartment: (payload: any) => apiService.post<any>(Api.ADD_EDIT_DEPARTMENT, payload),
  getDepartmentById: (id: string) => apiService.get<any>(`${Api.GET_DEPARTMENT}/${id}`),
  deleteDepartment: (id: string) => apiService.delete<any>(`${Api.DEPARTMENTS}/${id}`),
  changeDepartmentStatus: (id: string) => apiService.post<any>(`${Api.CHANGE_DEPARTMENT_STATUS}/${id}`, {}),

  // Subjects
  getSubjects: (params: any) => {
    let url = `${Api.SUBJECTS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.departmentId) queryParams.append("departmentId", params.departmentId);
    if (params.isActive !== undefined && params.isActive !== "") queryParams.append("isActive", params.isActive);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return apiService.get<any>(url);
  },
  addEditSubject: (payload: any) => apiService.post<any>(Api.ADD_EDIT_SUBJECT, payload),
  getSubjectById: (id: string) => apiService.get<any>(`${Api.GET_SUBJECT}/${id}`),
  deleteSubject: (id: string) => apiService.delete<any>(`${Api.SUBJECTS}/${id}`),
  changeSubjectStatus: (id: string) => apiService.post<any>(`${Api.CHANGE_SUBJECT_STATUS}/${id}`, {}),

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
    return apiService.get<any>(url);
  },
  addEditClass: (payload: any) => apiService.post<any>(Api.ADD_EDIT_CLASS, payload),
  getClassById: (id: string) => apiService.get<any>(`${Api.GET_CLASS}/${id}`),
  deleteClass: (id: string) => apiService.delete<any>(`${Api.CLASSES}/${id}`),
  changeClassStatus: (id: string) => apiService.post<any>(`${Api.CHANGE_CLASS_STATUS}/${id}`, {}),

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
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return apiService.get<any>(url);
  },
  addEditSection: (payload: any) => apiService.post<any>(Api.ADD_EDIT_SECTION, payload),
  getSectionById: (id: string) => apiService.get<any>(`${Api.GET_SECTION}/${id}`),
  deleteSection: (id: string) => apiService.delete<any>(`${Api.SECTIONS}/${id}`),
  changeSectionStatus: (id: string) => apiService.post<any>(`${Api.CHANGE_SECTION_STATUS}/${id}`, {}),

  // Teachers
  getTeachers: (params: any) => {
    let url = `${Api.GET_ALL_TEACHERS}`;
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("pageNumber", params.page);
    if (params.perPage) queryParams.append("perPageData", params.perPage);
    if (params.search) queryParams.append("searchRequest", params.search);
    if (params.departmentId) queryParams.append("departmentId", params.departmentId);
    if (params.classId) queryParams.append("classId", params.classId);
    if (params.sectionId) queryParams.append("sectionId", params.sectionId);
    if (params.subjectId) queryParams.append("subjectId", params.subjectId);
    if (params.joiningDate) queryParams.append("joiningDate", params.joiningDate);
    if (params.designation) queryParams.append("designation", params.designation);
    if (params.employmentType) queryParams.append("employmentType", params.employmentType);
    if (params.attendanceId) queryParams.append("attendanceId", params.attendanceId);
    if (params.isActive !== undefined && params.isActive !== "") queryParams.append("isActive", params.isActive);
    if (params.isVerified !== undefined && params.isVerified !== "") queryParams.append("isVerified", params.isVerified);
    if (params.type) queryParams.append("type", params.type);

    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return apiService.get<any>(url);
  },
  addEditTeacher: (payload: any, id?: string) => {
    const url = id ? `${Api.ADD_EDIT_TEACHER}/${id}` : Api.ADD_EDIT_TEACHER;
    return apiService.post<any>(url, payload);
  },
  getTeacherById: (id: string) => apiService.get<any>(`${Api.GET_TEACHER}/${id}`),
  deleteTeacher: (id: string) => apiService.delete<any>(`${Api.DELETE_TEACHER}/${id}`),
  changeTeacherStatus: (id: string) => apiService.post<any>(`${Api.CHANGE_TEACHER_STATUS}/${id}`, {}),
};
