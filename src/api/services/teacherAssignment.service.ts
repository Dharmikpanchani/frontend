import { adminApiService } from "../client/apiClient";
import { Api } from "../EndPoint";

export const teacherAssignmentService = {
  getAssignments: () =>
    adminApiService.get<any>(Api.TEACHER_ASSIGNMENTS),

  saveAssignment: (payload: {
    teacherId: string;
    subjects?: string[];
    assignments?: Array<{
      classId: string;
      sectionId: string | null;
      isClassTeacher?: boolean;
    }>;
    employmentType?: string | null;
    salaryForYear?: number | null;
    status?: string;
    remarks?: string;
  }) =>
    adminApiService.post<any>(Api.TEACHER_ASSIGNMENTS, payload),

  getHistory: (teacherId: string) =>
    adminApiService.get<any>(`${Api.TEACHER_ASSIGNMENTS_HISTORY}/${teacherId}`),

  cloneAssignments: (fromAcademicYearId: string) =>
    adminApiService.post<any>(Api.TEACHER_ASSIGNMENTS_CLONE, { fromAcademicYearId }),
};
