
export interface SubRole {
  title: string;
  titleId: string;
  is_show: boolean;
}

// For each main section
export interface RoleStaticItem {
  mainTitle: string;
  mainTitleId: string;
  price?: string;
  subRole: SubRole[];
}

const dashboardModule: RoleStaticItem = {
  mainTitle: "Dashboard",
  mainTitleId: "dashboard",
  price: "₹ 2",
  subRole: [
    { title: "Add", titleId: "add", is_show: false },
    { title: "Edit", titleId: "edit", is_show: false },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: false },
    { title: "Status", titleId: "status", is_show: false },
  ],
};

const rolesModule: RoleStaticItem = {
  mainTitle: "Roles",
  mainTitleId: "role",
  price: "₹ 3",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: false },
  ],
};

const adminUserModule: RoleStaticItem = {
  mainTitle: "Admin User",
  mainTitleId: "admin_user",
  price: "₹ 5",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const teacherModule: RoleStaticItem = {
  mainTitle: "Teacher",
  mainTitleId: "teacher",
  price: "₹ 10",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const departmentModule: RoleStaticItem = {
  mainTitle: "Department",
  mainTitleId: "department",
  price: "₹ 4",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const subjectModule: RoleStaticItem = {
  mainTitle: "Subject",
  mainTitleId: "subject",
  price: "₹ 4",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const classModule: RoleStaticItem = {
  mainTitle: "Class",
  mainTitleId: "class",
  price: "₹ 6",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const sectionModule: RoleStaticItem = {
  mainTitle: "Section",
  mainTitleId: "section",
  price: "₹ 3",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const schoolListModule: RoleStaticItem = {
  mainTitle: "School List",
  mainTitleId: "school",
  price: "₹ 8",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: false },
    { title: "Status", titleId: "status", is_show: true },
  ],
};

const themeModule: RoleStaticItem = {
  mainTitle: "Theme Settings",
  mainTitleId: "theme",
  price: "₹ 5",
  subRole: [
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
  ],
};

const schoolProfileModule: RoleStaticItem = {
  mainTitle: "School Profile",
  mainTitleId: "school_profile",
  price: "₹ 7",
  subRole: [
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
  ],
};

const planModule: RoleStaticItem = {
  mainTitle: "Plan",
  mainTitleId: "plan",
  price: "₹ 10",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
  ],
};


export const developerRoleStaticData: RoleStaticItem[] = [
  dashboardModule,
  rolesModule,
  adminUserModule,
  schoolListModule,
  planModule,
];

export const planStaticData: RoleStaticItem[] = [
  dashboardModule,
  rolesModule,
  adminUserModule,
  teacherModule,
  departmentModule,
  subjectModule,
  classModule,
  sectionModule,
  themeModule,
  schoolProfileModule,
];

export const schoolRoleStaticData: RoleStaticItem[] = [
  dashboardModule,
  rolesModule,
  adminUserModule,
  teacherModule,
  departmentModule,
  subjectModule,
  classModule,
  sectionModule,
  themeModule,
  schoolProfileModule,
];

export const developerPermission = {
  dashboard: {
    read: "dashboard_view",
  },
  role: {
    create: "role_add",
    update: "role_edit",
    read: "role_view",
    delete: "role_delete",
    status: "role_status",
  },
  admin_user: {
    create: "admin_user_add",
    update: "admin_user_edit",
    read: "admin_user_view",
    delete: "admin_user_delete",
    status: "admin_user_status",
  },
  school: {
    create: "school_add",
    update: "school_edit",
    read: "school_view",
    delete: "school_delete",
    status: "school_status",
  },
  plan: {
    create: "plan_add",
    update: "plan_edit",
    read: "plan_view",
    delete: "plan_delete",
    status: "plan_status",
  },
};

export const schoolAdminPermission = {
  dashboard: {
    read: "dashboard_view",
  },
  role: {
    create: "role_add",
    update: "role_edit",
    read: "role_view",
    delete: "role_delete",
    status: "role_status",
  },
  admin_user: {
    create: "admin_user_add",
    update: "admin_user_edit",
    read: "admin_user_view",
    delete: "admin_user_delete",
    status: "admin_user_status",
  },
  theme: {
    read: "theme_view",
    update: "theme_edit",
  },
  school_profile: {
    read: "school_profile_view",
    update: "school_profile_edit",
  },
  department: {
    create: "department_add",
    update: "department_edit",
    read: "department_view",
    delete: "department_delete",
    status: "department_status",
  },
  subject: {
    create: "subject_add",
    update: "subject_edit",
    read: "subject_view",
    delete: "subject_delete",
    status: "subject_status",
  },
  class: {
    create: "class_add",
    update: "class_edit",
    read: "class_view",
    delete: "class_delete",
    status: "class_status",
  },
  section: {
    create: "section_add",
    update: "section_edit",
    read: "section_view",
    delete: "section_delete",
    status: "section_status",
  },
  teacher: {
    create: "teacher_add",
    update: "teacher_edit",
    read: "teacher_view",
    delete: "teacher_delete",
    status: "teacher_status",
  },
};

export const boardOptions = [
  { label: "CBSE", value: "CBSE" },
  { label: "ICSE", value: "ICSE" },
  { label: "State Board", value: "State Board" },
  { label: "IB", value: "IB" },
  { label: "IGCSE", value: "IGCSE" },
  { label: "Other", value: "Other" },
];

export const schoolTypeOptions = [
  { label: "Primary", value: "Primary" },
  { label: "Secondary", value: "Secondary" },
  { label: "Higher Secondary", value: "Higher Secondary" },
  { label: "Junior College", value: "Junior College" },
  { label: "Other", value: "Other" },
];

export const mediumOptions = [
  { label: "English", value: "English" },
  { label: "Gujarati", value: "Gujarati" },
  { label: "Hindi", value: "Hindi" },
  { label: "Other", value: "Other" },
];

export const bloodGroupOptions = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];

export const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export const employmentTypeOptions = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
];

export const salaryTypeOptions = [
  { label: "Monthly", value: "Monthly" },
  { label: "Hourly", value: "Hourly" },
];

export const calculateMinMonthlyPrice = (permissions: string[]): number => {
  let total = 0;
  planStaticData.forEach((module) => {
    // Check if any selected permission starts with this module's mainTitleId
    const isModuleSelected = permissions.some((p) =>
      p.startsWith(`${module.mainTitleId}_`)
    );
    if (isModuleSelected && module.price) {
      const priceNum = parseInt(module.price.replace(/[^\d]/g, ""), 10);
      if (!isNaN(priceNum)) {
        total += priceNum;
      }
    }
  });
  return total;
};

