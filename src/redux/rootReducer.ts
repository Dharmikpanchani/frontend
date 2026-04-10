import { combineReducers } from "redux";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import roleReducer from "./slices/roleSlice";
import adminUserReducer from "./slices/adminUserSlice";
import faqReducer from "./slices/faqSlice";
import generalReducer from "./slices/generalSlice";
import schoolReducer from "./slices/schoolSlice";
import themeReducer from "./slices/themeSlice";
import departmentReducer from "./slices/departmentSlice";
import subjectReducer from "./slices/subjectSlice";
import classReducer from "./slices/classSlice";
import sectionReducer from "./slices/sectionSlice";
import teacherReducer from "./slices/teacherSlice";
import type { AuthState } from "./slices/authSlice";

export interface RootState {
  AdminReducer: AuthState;
  UserReducer: ReturnType<typeof userReducer>;
  RoleReducer: ReturnType<typeof roleReducer>;
  AdminUserReducer: ReturnType<typeof adminUserReducer>;
  FaqReducer: ReturnType<typeof faqReducer>;
  GeneralReducer: ReturnType<typeof generalReducer>;
  SchoolReducer: ReturnType<typeof schoolReducer>;
  ThemeReducer: ReturnType<typeof themeReducer>;
  DepartmentReducer: ReturnType<typeof departmentReducer>;
  SubjectReducer: ReturnType<typeof subjectReducer>;
  ClassReducer: ReturnType<typeof classReducer>;
  SectionReducer: ReturnType<typeof sectionReducer>;
  TeacherReducer: ReturnType<typeof teacherReducer>;
}

const rootReducer = combineReducers({
  AdminReducer: authReducer,
  UserReducer: userReducer,
  RoleReducer: roleReducer,
  AdminUserReducer: adminUserReducer,
  FaqReducer: faqReducer,
  GeneralReducer: generalReducer,
  SchoolReducer: schoolReducer,
  ThemeReducer: themeReducer,
  DepartmentReducer: departmentReducer,
  SubjectReducer: subjectReducer,
  ClassReducer: classReducer,
  SectionReducer: sectionReducer,
  TeacherReducer: teacherReducer,
});

export default rootReducer;
