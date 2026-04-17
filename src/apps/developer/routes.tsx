import { lazy } from "react";
import type { RouteConfig } from "@/types/interfaces/routeInterface";
import PrivateRoutes from "@/routes/PrivateRoutes";
import PublicRoutes from "@/routes/PublicRoutes";
import { usePermissions } from "@/hooks/usePermissions";
import { developerPermission } from "@/apps/common/StaticArrayData";
import PageLoader from "../common/loader/PageLoader";
import PageNotFound from "./component/developerCommon/pageNotFound/PageNotFound";
import NotAllowPermission from "../developer/pages/RolePermission/NotAllowPermission";
import ErrorPage from "../common/error/ErrorPage";



/* Lazy Loading */
/* auth */
const Login = lazy(() => import("./auth/Login"));
const LoginOtp = lazy(() => import("./auth/LoginOtp"));
const RegisterSchoolOtp = lazy(() => import("./auth/RegisterSchoolOtp"));
const AdminUserOtp = lazy(() => import("./auth/AdminUserOtp"));
const EmailChangeOtp = lazy(() => import("./auth/EmailChangeOtp"));
const ForgotPasswordOtp = lazy(() => import("./auth/ForgotPasswordOtp"));



const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const SetPassWord = lazy(() => import("./auth/SetPassword"));

/* layout */
const AdminLayOut = lazy(
    () => import("./layout/DeveloperLayout")
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
const SchoolList = lazy(
    () => import("./pages/SchoolListing/SchoolList")
);
const RegisterSchool = lazy(
    () => import("./pages/SchoolListing/RegisterSchool")
);
const AddEditPlan = lazy(
    () => import("./pages/Profile/AddEditPlan")
);
const PlanList = lazy(
    () => import("./pages/PlanList/PlanList")
);

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
export const developerRoutes: RouteConfig[] = [
    // Auth / Public Routes
    {
        path: "/",
        element: <PublicRoutes />,
        children: [
            { path: "/", element: <Login /> },
            { path: "/login/otp", element: <LoginOtp /> },
            { path: "/forgot-password/otp", element: <ForgotPasswordOtp /> },
            { path: "/forgot-password", element: <ForgotPassword /> },
            { path: "/set-password", element: <SetPassWord /> },
        ],
    },

    // Private Routes
    {
        path: "/",
        element: <PrivateRoutes />,
        children: [
            { path: "/school-register/otp", element: <RegisterSchoolOtp /> },
            { path: "/admin-user/otp", element: <AdminUserOtp /> },
            { path: "/email-change/otp", element: <EmailChangeOtp /> },
            {
                element: <AdminLayOut />,
                errorElement: <ErrorBoundary />,
                children: [
                    {
                        path: "/dashboard",
                        element: (
                            <PermissionRoute permission={developerPermission?.dashboard?.read}>
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
                        path: "/role-list",
                        element: (
                            <PermissionRoute permission={developerPermission?.role?.read}>
                                <RoleList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/role-list/add",
                        element: (
                            <PermissionRoute permission={developerPermission?.role?.create}>
                                <AddEditRole />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/role-list/edit/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.role?.update}>
                                <AddEditRole />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/role-list/view/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.role?.read}>
                                <AddEditRole />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list",
                        element: (
                            <PermissionRoute permission={developerPermission?.admin_user?.read}>
                                <AdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list/add",
                        element: (
                            <PermissionRoute permission={developerPermission?.admin_user?.create}>
                                <AddEditAdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list/edit/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.admin_user?.update}>
                                <AddEditAdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/admin-list/view/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.admin_user?.read}>
                                <AddEditAdminUser />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/school-list",
                        element: (
                            <PermissionRoute permission={developerPermission?.school?.read}>
                                <SchoolList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/school-list/add",
                        element: (
                            <PermissionRoute permission={developerPermission?.school?.create}>
                                <RegisterSchool />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/school-list/edit/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.school?.update}>
                                <RegisterSchool />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/school-list/view/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.school?.read}>
                                <RegisterSchool />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/plan-list",
                        element: (
                            <PermissionRoute permission={developerPermission?.plan?.read}>
                                <PlanList />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/plan-list/add",
                        element: (
                            <PermissionRoute permission={developerPermission?.plan?.create}>
                                <AddEditPlan />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/plan-list/edit/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.plan?.update}>
                                <AddEditPlan />
                            </PermissionRoute>
                        ),
                    },
                    {
                        path: "/plan-list/view/:id",
                        element: (
                            <PermissionRoute permission={developerPermission?.plan?.read}>
                                <AddEditPlan />
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
