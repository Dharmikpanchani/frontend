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
    { title: "Import", titleId: "import", is_show: true },
    { title: "Export", titleId: "export", is_show: true },
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
    { title: "Import", titleId: "import", is_show: true },
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
    { title: "Import", titleId: "import", is_show: true },
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
    { title: "Import", titleId: "import", is_show: true },
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
    { title: "Import", titleId: "import", is_show: true },
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
    { title: "Import", titleId: "import", is_show: true },
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
    { title: "Import", titleId: "import", is_show: true },
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
      { title: 'Import', titleId: 'import', is_show: true },
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
      { title: 'Import', titleId: 'import', is_show: true },
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

// ─── Plan Module Groups ────────────────────────────────────────────────────────
// Each group bundles multiple sub-modules.
// "Select" (default) adds all non-export/import permissions.
// Export / Import are shown as separate optional add-ons per group.

export interface PlanModuleGroup {
  /** Display label */
  groupTitle: string;
  /** Unique group key */
  groupId: string;
  /** Monthly price label for the whole group */
  price: string;
  /** Sub-module mainTitleIds that belong to this group */
  subModuleIds: string[];
  /** Whether this group supports export as an add-on */
  hasExport: boolean;
  /** Whether this group supports import as an add-on */
  hasImport: boolean;
  /** Icon name (optional, for display) */
  icon?: string;
}

export const planModuleGroups: PlanModuleGroup[] = [
  {
    groupTitle: 'Dashboard',
    groupId: 'dashboard',
    price: '₹ 2',
    subModuleIds: ['dashboard'],
    hasExport: false,
    hasImport: false,
    icon: 'dashboard',
  },
  {
    groupTitle: 'Admin & Roles',
    groupId: 'admin_roles',
    price: '₹ 2',
    subModuleIds: ['role', 'admin_user'],
    hasExport: true,
    hasImport: true,
    icon: 'admin',
  },
  {
    groupTitle: 'Teacher Management',
    groupId: 'teacher_mgmt',
    price: '₹ 2',
    subModuleIds: ['teacher', 'department', 'subject', 'class', 'section'],
    hasExport: true,
    hasImport: true,
    icon: 'teacher',
  },
  {
    groupTitle: 'Student Management',
    groupId: 'student_mgmt',
    price: '₹ 2',
    subModuleIds: ['student'],
    hasExport: true,
    hasImport: true,
    icon: 'student',
  },
  {
    groupTitle: 'Fee Management',
    groupId: 'fee_mgmt',
    price: '₹ 2',
    // fee_category, fee_structure, fee_collection + school_settings payment config
    subModuleIds: ['fee_category', 'fee_structure', 'fee_collection', 'school_settings'],
    hasExport: true,
    hasImport: true,
    icon: 'fee',
  },
  {
    groupTitle: 'Theme & Appearance',
    groupId: 'theme_mgmt',
    price: '₹ 2',
    subModuleIds: ['theme'],
    hasExport: false,
    hasImport: false,
    icon: 'theme',
  },
  {
    groupTitle: 'School Settings',
    groupId: 'settings_mgmt',
    price: '₹ 2',
    subModuleIds: ['school_profile'],
    hasExport: false,
    hasImport: false,
    icon: 'settings',
  },
];

/** Global Export add-on price (applies to all eligible modules) */
export const planExportPrice = '₹ 2';

/** Global Import add-on price (applies to all eligible modules) */
export const planImportPrice = '₹ 2';


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
      { title: 'Import', titleId: 'import', is_show: true },
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
      { title: 'Import', titleId: 'import', is_show: true },
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
  {
    mainTitle: "Import Logs",
    mainTitleId: "import_log",
    subRole: [
      { title: "View", titleId: "view", is_show: true },
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
    import: "role_import",
    export: "role_export",
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
    import: "department_import",
    export: "department_export",
  },
  subject: {
    create: "subject_add",
    update: "subject_edit",
    read: "subject_view",
    delete: "subject_delete",
    status: "subject_status",
    import: "subject_import",
    export: "subject_export",
  },
  class: {
    create: "class_add",
    update: "class_edit",
    read: "class_view",
    delete: "class_delete",
    status: "class_status",
    import: "class_import",
    export: "class_export",
  },
  section: {
    create: "section_add",
    update: "section_edit",
    read: "section_view",
    delete: "section_delete",
    status: "section_status",
    import: "section_import",
    export: "section_export",
  },
  teacher: {
    create: "teacher_add",
    update: "teacher_edit",
    read: "teacher_view",
    delete: "teacher_delete",
    status: "teacher_status",
    import: "teacher_import",
    export: "teacher_export",
  },
  student: {
    create: "student_add",
    update: "student_edit",
    read: "student_view",
    delete: "student_delete",
    status: "student_status",
    import: "student_import",
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
    import: "fee_category_import",
    export: "fee_category_export",
  },
  fee_structure: {
    create: "fee_structure_add",
    update: "fee_structure_edit",
    read: "fee_structure_view",
    delete: "fee_structure_delete",
    status: "fee_structure_status",
    import: "fee_structure_import",
    export: "fee_structure_export",
  },
  fee_collection: {
    create: "fee_collection_collect",
    read: "fee_collection_view",
    export: "fee_collection_export",
    update: "fee_collection_update",
  },
  import_log: {
    read: "import_log_view",
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
  
  planModuleGroups.forEach((group) => {
    const isSelected = group.subModuleIds.some((subId) =>
      permissions.some((p) => p.startsWith(`${subId}_`))
    );
    if (isSelected) {
      total += 2;
    }
  });

  const hasExport = permissions.some((p) => p.endsWith("_export"));
  if (hasExport) {
    total += 2;
  }

  const hasImport = permissions.some((p) => p.endsWith("_import"));
  if (hasImport) {
    total += 2;
  }

  return total;
};
