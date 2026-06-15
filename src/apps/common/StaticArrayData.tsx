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
    { title: "Export", titleId: "export", is_show: false },
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
    { title: "Export", titleId: "export", is_show: false },
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
    { title: "Export", titleId: "export", is_show: false },
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
    { title: "Export", titleId: "export", is_show: true },
  ],
};

const studentModule: RoleStaticItem = {
  mainTitle: "Student",
  mainTitleId: "student",
  price: "₹ 12",
  subRole: [
    { title: "Add", titleId: "add", is_show: true },
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Delete", titleId: "delete", is_show: true },
    { title: "Status", titleId: "status", is_show: true },
    { title: "Export", titleId: "export", is_show: true },
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
    { title: "Export", titleId: "export", is_show: true },
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
    { title: "Export", titleId: "export", is_show: true },
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
    { title: "Export", titleId: "export", is_show: true },
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
    { title: "Export", titleId: "export", is_show: true },
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
    { title: "Export", titleId: "export", is_show: true },
  ],
};

const themeModule: RoleStaticItem = {
  mainTitle: "Theme Settings",
  mainTitleId: "theme",
  price: "₹ 5",
  subRole: [
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Export", titleId: "export", is_show: false },
  ],
};

const schoolProfileModule: RoleStaticItem = {
  mainTitle: "School Profile",
  mainTitleId: "school_profile",
  price: "₹ 7",
  subRole: [
    { title: "Edit", titleId: "edit", is_show: true },
    { title: "View", titleId: "view", is_show: true },
    { title: "Export", titleId: "export", is_show: false },
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
    { title: "Export", titleId: "export", is_show: true },
  ],
};

const transactionModule: RoleStaticItem = {
  mainTitle: "Transactions",
  mainTitleId: "transaction",
  price: "₹ 5",
  subRole: [
    { title: "View", titleId: "view", is_show: true },
    { title: "Export", titleId: "export", is_show: true },
  ],
};

export const developerRoleStaticData: RoleStaticItem[] = [
  dashboardModule,
  rolesModule,
  adminUserModule,
  schoolListModule,
  planModule,
  transactionModule,
];

export const planStaticData: RoleStaticItem[] = [
  dashboardModule,
  rolesModule,
  adminUserModule,
  teacherModule,
  studentModule,
  departmentModule,
  subjectModule,
  classModule,
  sectionModule,
  themeModule,
  schoolProfileModule,
  {
    mainTitle: 'School Settings',
    mainTitleId: 'school_settings',
    price: '₹ 4',
    subRole: [
      { title: 'Edit', titleId: 'edit', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Export', titleId: 'export', is_show: false },
    ],
  },
  {
    mainTitle: 'Fee Category',
    mainTitleId: 'fee_category',
    price: '₹ 3',
    subRole: [
      { title: 'Add', titleId: 'add', is_show: true },
      { title: 'Edit', titleId: 'edit', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Delete', titleId: 'delete', is_show: true },
      { title: 'Status', titleId: 'status', is_show: true },
      { title: 'Export', titleId: 'export', is_show: true },
    ],
  },
  {
    mainTitle: 'Fee Structure',
    mainTitleId: 'fee_structure',
    price: '₹ 5',
    subRole: [
      { title: 'Add', titleId: 'add', is_show: true },
      { title: 'Edit', titleId: 'edit', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Delete', titleId: 'delete', is_show: true },
      { title: 'Status', titleId: 'status', is_show: true },
      { title: 'Export', titleId: 'export', is_show: true },
    ],
  },
  {
    mainTitle: 'Fee Collection',
    mainTitleId: 'fee_collection',
    price: '₹ 8',
    subRole: [
      { title: 'Collect', titleId: 'collect', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Export', titleId: 'export', is_show: true },
    ],
  },
];

export const schoolRoleStaticData: RoleStaticItem[] = [
  dashboardModule,
  rolesModule,
  adminUserModule,
  teacherModule,
  studentModule,
  departmentModule,
  subjectModule,
  classModule,
  sectionModule,
  themeModule,
  schoolProfileModule,
  {
    mainTitle: 'School Settings',
    mainTitleId: 'school_settings',
    price: '₹ 4',
    subRole: [
      { title: 'Edit', titleId: 'edit', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Export', titleId: 'export', is_show: false },
    ],
  },
  {
    mainTitle: 'Fee Category',
    mainTitleId: 'fee_category',
    price: '₹ 3',
    subRole: [
      { title: 'Add', titleId: 'add', is_show: true },
      { title: 'Edit', titleId: 'edit', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Delete', titleId: 'delete', is_show: true },
      { title: 'Status', titleId: 'status', is_show: true },
      { title: 'Export', titleId: 'export', is_show: true },
    ],
  },
  {
    mainTitle: 'Fee Structure',
    mainTitleId: 'fee_structure',
    price: '₹ 5',
    subRole: [
      { title: 'Add', titleId: 'add', is_show: true },
      { title: 'Edit', titleId: 'edit', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Delete', titleId: 'delete', is_show: true },
      { title: 'Status', titleId: 'status', is_show: true },
      { title: 'Export', titleId: 'export', is_show: true },
    ],
  },
  {
    mainTitle: 'Fee Collection',
    mainTitleId: 'fee_collection',
    price: '₹ 8',
    subRole: [
      { title: 'Collect', titleId: 'collect', is_show: true },
      { title: 'View', titleId: 'view', is_show: true },
      { title: 'Export', titleId: 'export', is_show: true },
    ],
  },
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
    export: "school_export",
  },
  plan: {
    create: "plan_add",
    update: "plan_edit",
    read: "plan_view",
    delete: "plan_delete",
    status: "plan_status",
    export: "plan_export",
  },
  transaction: {
    read: "transaction_view",
    export: "transaction_export",
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
    export: "department_export",
  },
  subject: {
    create: "subject_add",
    update: "subject_edit",
    read: "subject_view",
    delete: "subject_delete",
    status: "subject_status",
    export: "subject_export",
  },
  class: {
    create: "class_add",
    update: "class_edit",
    read: "class_view",
    delete: "class_delete",
    status: "class_status",
    export: "class_export",
  },
  section: {
    create: "section_add",
    update: "section_edit",
    read: "section_view",
    delete: "section_delete",
    status: "section_status",
    export: "section_export",
  },
  teacher: {
    create: "teacher_add",
    update: "teacher_edit",
    read: "teacher_view",
    delete: "teacher_delete",
    status: "teacher_status",
    export: "teacher_export",
  },
  student: {
    create: "student_add",
    update: "student_edit",
    read: "student_view",
    delete: "student_delete",
    status: "student_status",
    export: "student_export",
  },
  school_settings: {
    read: "school_settings_view",
    update: "school_settings_edit",
  },
  fee_category: {
    create: "fee_category_add",
    update: "fee_category_edit",
    read: "fee_category_view",
    delete: "fee_category_delete",
    status: "fee_category_status",
    export: "fee_category_export",
  },
  fee_structure: {
    create: "fee_structure_add",
    update: "fee_structure_edit",
    read: "fee_structure_view",
    delete: "fee_structure_delete",
    status: "fee_structure_status",
    export: "fee_structure_export",
  },
  fee_collection: {
    create: "fee_collection_collect",
    read: "fee_collection_view",
    export: "fee_collection_export",
    update: "fee_collection_update",
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
      p.startsWith(`${module.mainTitleId}_`),
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
