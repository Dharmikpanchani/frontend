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

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
