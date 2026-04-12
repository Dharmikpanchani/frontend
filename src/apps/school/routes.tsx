import { lazy } from "react";
import type { RouteConfig } from "@/types/interfaces/routeInterface";
import PrivateRoutes from "@/routes/PrivateRoutes";
import PublicRoutes from "@/routes/PublicRoutes";
import NotAllowPermission from "./pages/RolePermission/NotAllowPermission";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import PageLoader from "../common/loader/PageLoader";
import PageNotFound from "./component/schoolCommon/pageNotFound/PageNotFound";
import ErrorPage from "../common/error/ErrorPage";



/* Lazy Loading */
/* auth */
const Login = lazy(() => import("./auth/Login"));
const LoginOtp = lazy(() => import("./auth/LoginOtp"));
const TeacherOtp = lazy(() => import("./auth/TeacherOtp"));
const AdminUserOtp = lazy(() => import("./auth/AdminUserOtp"));
const ForgotPasswordOtp = lazy(() => import("./auth/ForgotPasswordOtp"));
const EmailChangeOtp = lazy(() => import("./auth/EmailChangeOtp"));

const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const SetPassWord = lazy(() => import("./auth/SetPassword"));

/* layout */
const AdminLayOut = lazy(
    () => import("./layout/SchoolLayout")
);
const AdminDashboard = lazy(
    () => import("./pages/Dashboard")
);
const Profile = lazy(
    () => import("./pages/Profile/AccountLayout")
);
const RoleList = lazy(
    () => import("./pages/RolePermission/RolePermission")
);
const AddEditRole = lazy(
    () => import("./pages/RolePermission/AddEditRole")
);
const AdminUser = lazy(
    () => import("./pages/AdminUser/AdminUser")
);
const AddEditAdminUser = lazy(
    () => import("./pages/AdminUser/AddEditAdminUser")
);
const ThemeSettings = lazy(
    () => import("./pages/Profile/ThemeSettings")
);

/* master */
const DepartmentList = lazy(() => import("./pages/Master/Department/Department"));
const AddEditDepartment = lazy(() => import("./pages/Master/Department/AddEditDepartment"));
const SubjectList = lazy(() => import("./pages/Master/Subject/Subject"));
const AddEditSubject = lazy(() => import("./pages/Master/Subject/AddEditSubject"));
const ClassList = lazy(() => import("./pages/Master/Class/Class"));
const AddEditClass = lazy(() => import("./pages/Master/Class/AddEditClass"));
const SectionList = lazy(() => import("./pages/Master/Section/Section"));
const AddEditSection = lazy(() => import("./pages/Master/Section/AddEditSection"));
const TeacherList = lazy(() => import("./pages/Teacher/Teacher"));
const AddEditTeacher = lazy(() => import("./pages/Teacher/AddEditTeacher"));

/**
 * Wrapper component that reads permissions from the store (inside a component body,
 * satisfying the Rules of Hooks) and conditionally renders the guarded page.
 */
function PermissionRoute({
    permission,
    children,
}: {
    permission: string;
    children: React.ReactNode;
}): React.ReactElement {
    const { hasPermission, loading, permissions, isAdminLogin, isSuperDeveloper } = usePermissions();

    if (loading || (isAdminLogin && permissions.length === 0 && !isSuperDeveloper)) {
        return <PageLoader />;
    }

    return hasPermission(permission) ? (
        <>{children}</>
    ) : (
        <NotAllowPermission />
    );
}

function ErrorBoundary(): React.ReactElement {
    return <ErrorPage />;
}
export const schoolRoutes: RouteConfig[] = [
    // Auth / Public Routes
    {
        path: "/",
        element: <PublicRoutes />,
        children: [
            { path: "/", element: <Login /> },
            { path: "/login/otp", element: <LoginOtp /> },
            { path: "/teacher/otp", element: <TeacherOtp /> },
            { path: "/admin-user/otp", element: <AdminUserOtp /> },
            { path: "/forgot-password/otp", element: <ForgotPasswordOtp /> },
            { path: "/email-change/otp", element: <EmailChangeOtp /> },
            { path: "/forgot-password", element: <ForgotPassword /> },
            { path: "/set-password", element: <SetPassWord /> },
        ],
    },

    // Private Routes
    {
        path: "/",
        element: <PrivateRoutes />,
        children: [
            {
                element: <AdminLayOut />,
                errorElement: <ErrorBoundary />,
                children: [
                    {
                        path: "/dashboard",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.dashboard?.read}>
                                <AdminDashboard />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/profile",
                        element: (
                            <Profile />
                        ),
                    },
                    {
                        path: "/theme-settings",
                        element: (
                            <ThemeSettings />
                        ),
                    },
                    {
                        path: "/role-list",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.role?.read}>
                                <RoleList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/role-list/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.role?.create}>
                                <AddEditRole />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/role-list/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.role?.update}>
                                <AddEditRole />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/role-list/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.role?.read}>
                                <AddEditRole />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.admin_user?.read}>
                                <AdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.admin_user?.create}>
                                <AddEditAdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.admin_user?.update}>
                                <AddEditAdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.admin_user?.read}>
                                <AddEditAdminUser />
                            </PermissionRoute>
                        ),
                    },
                    // Department
                    {
                        path: "/master/department",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.department?.read}>
                                <DepartmentList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/department/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.department?.create}>
                                <AddEditDepartment />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/department/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.department?.update}>
                                <AddEditDepartment />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/department/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.department?.read}>
                                <AddEditDepartment />
                            </PermissionRoute>
                        ),
                    },
                    // Subject
                    {
                        path: "/master/subject",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.subject?.read}>
                                <SubjectList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/subject/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.subject?.create}>
                                <AddEditSubject />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/subject/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.subject?.update}>
                                <AddEditSubject />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/subject/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.subject?.read}>
                                <AddEditSubject />
                            </PermissionRoute>
                        ),
                    },
                    // Class
                    {
                        path: "/master/class",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.class?.read}>
                                <ClassList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/class/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.class?.create}>
                                <AddEditClass />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/class/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.class?.update}>
                                <AddEditClass />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/class/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.class?.read}>
                                <AddEditClass />
                            </PermissionRoute>
                        ),
                    },
                    // Section
                    {
                        path: "/master/section",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.section?.read}>
                                <SectionList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/section/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.section?.create}>
                                <AddEditSection />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/section/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.section?.update}>
                                <AddEditSection />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/master/section/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.section?.read}>
                                <AddEditSection />
                            </PermissionRoute>
                        ),
                    },
                    // Teacher
                    {
                        path: "/teacher",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.teacher?.read}>
                                <TeacherList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/teacher/add",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.teacher?.create}>
                                <AddEditTeacher />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/teacher/edit/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.teacher?.update}>
                                <AddEditTeacher />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/teacher/view/:id",
                        element: (
                            <PermissionRoute permission={schoolAdminPermission?.teacher?.read}>
                                <AddEditTeacher />
                            </PermissionRoute>
                        ),
                    },
                ],
            },
        ],
    },


    {
        path: "*",
        element: <PageNotFound />,
    },
];
