
export interface SubRole {
  title: string;
  titleId: string;
  is_show: boolean;
}

// For each main section
export interface RoleStaticItem {
  mainTitle: string;
  mainTitleId: string;
  subRole: SubRole[];
}

export const roleStaticData: RoleStaticItem[] = [
  {
    mainTitle: "Dashboard",
    mainTitleId: "dashboard",
    subRole: [
      {
        title: "Add",
        titleId: "add",
        is_show: false,
      },
      {
        title: "Edit",
        titleId: "edit",
        is_show: false,
      },
      {
        title: "View",
        titleId: "view",
        is_show: true,
      },
      {
        title: "Delete",
        titleId: "delete",
        is_show: false,
      },
      {
        title: "Status",
        titleId: "status",
        is_show: false,
      },
    ],
  },
  {
    mainTitle: "Roles",
    mainTitleId: "admin_role",
    subRole: [
      {
        title: "Add",
        titleId: "add",
        is_show: true,
      },
      {
        title: "Edit",
        titleId: "edit",
        is_show: true,
      },
      {
        title: "View",
        titleId: "view",
        is_show: true,
      },
      {
        title: "Delete",
        titleId: "delete",
        is_show: true,
      },
      {
        title: "Status",
        titleId: "status",
        is_show: false,
      },
    ],
  },
  {
    mainTitle: "Admin User",
    mainTitleId: "admin_user",
    subRole: [
      {
        title: "Add",
        titleId: "add",
        is_show: true,
      },
      {
        title: "Edit",
        titleId: "edit",
        is_show: true,
      },
      {
        title: "View",
        titleId: "view",
        is_show: true,
      },
      {
        title: "Delete",
        titleId: "delete",
        is_show: true,
      },
      {
        title: "Status",
        titleId: "status",
        is_show: true,
      },
    ],
  },
  {
    mainTitle: "Teacher",
    mainTitleId: "teacher",
    subRole: [
      { title: "Add", titleId: "add", is_show: true },
      { title: "Edit", titleId: "edit", is_show: true },
      { title: "View", titleId: "view", is_show: true },
      { title: "Delete", titleId: "delete", is_show: true },
    ],
  },
  {
    mainTitle: "Department",
    mainTitleId: "department",
    subRole: [
      { title: "Add", titleId: "add", is_show: true },
      { title: "Edit", titleId: "edit", is_show: true },
      { title: "View", titleId: "view", is_show: true },
      { title: "Delete", titleId: "delete", is_show: true },
    ],
  },
  {
    mainTitle: "Subject",
    mainTitleId: "subject",
    subRole: [
      { title: "Add", titleId: "add", is_show: true },
      { title: "Edit", titleId: "edit", is_show: true },
      { title: "View", titleId: "view", is_show: true },
      { title: "Delete", titleId: "delete", is_show: true },
    ],
  },
  {
    mainTitle: "Class",
    mainTitleId: "class",
    subRole: [
      { title: "Add", titleId: "add", is_show: true },
      { title: "Edit", titleId: "edit", is_show: true },
      { title: "View", titleId: "view", is_show: true },
      { title: "Delete", titleId: "delete", is_show: true },
    ],
  },
  {
    mainTitle: "Section",
    mainTitleId: "section",
    subRole: [
      { title: "Add", titleId: "add", is_show: true },
      { title: "Edit", titleId: "edit", is_show: true },
      { title: "View", titleId: "view", is_show: true },
      { title: "Delete", titleId: "delete", is_show: true },
    ],
  },
  {
    mainTitle: "School List",
    mainTitleId: "school",
    subRole: [
      {
        title: "Add",
        titleId: "add",
        is_show: true,
      },
      {
        title: "Edit",
        titleId: "edit",
        is_show: true,
      },
      {
        title: "View",
        titleId: "view",
        is_show: true,
      },
      {
        title: "Delete",
        titleId: "delete",
        is_show: false,
      },
      {
        title: "Status",
        titleId: "status",
        is_show: true,
      },
    ],
  },
  {
    mainTitle: "Theme Settings",
    mainTitleId: "theme",
    subRole: [
      {
        title: "Edit",
        titleId: "edit",
        is_show: true,
      },
      {
        title: "View",
        titleId: "view",
        is_show: true,
      },
    ],
  },
  {
    mainTitle: "School Profile",
    mainTitleId: "school_profile",
    subRole: [
      { title: "Edit", titleId: "edit", is_show: true },
      { title: "View", titleId: "view", is_show: true },
    ],
  },
];


export const developerPermission = {
  dashboard: {
    read: "dashboard_view",
  },
  role: {
    create: "admin_role_add",
    update: "admin_role_edit",
    read: "admin_role_view",
    delete: "admin_role_delete",
    status: "admin_role_status",
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
};

export const schoolAdminPermission = {
  dashboard: {
    read: "dashboard_view",
  },
  role: {
    create: "admin_role_add",
    update: "admin_role_edit",
    read: "admin_role_view",
    delete: "admin_role_delete",
    status: "admin_role_status",
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
