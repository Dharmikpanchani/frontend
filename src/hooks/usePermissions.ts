import { useSelector } from "react-redux";
import type { RootState } from "../redux/Store";

export const usePermissions = () => {
    const { adminDetails, loading, isAdminLogin } = useSelector(
        (state: RootState) => state.AdminReducer
    );


    const isSuperDeveloper = adminDetails?.type === "super_developer";
    const isSchoolAdmin = adminDetails?.type === "school_admin";
    const isSuperAdmin = adminDetails?.isSuperAdmin;

    const rolePermissions: string[] = adminDetails?.role?.permissions ?? [];
    const planPermissions: string[] = adminDetails?.schoolData?.planId?.permissions ?? [];
    const checkPermission = (p: string): boolean => {
        if (isSuperDeveloper) return true;

        if (isSchoolAdmin) {
            // First layer: Plan check
            if (!planPermissions.includes(p)) return false;
            // Second layer: Super Admin bypass within the plan
            if (isSuperAdmin) return true;
        } else if (isSuperAdmin) {
            // Non-school Super Admin bypass (e.g. platform admin)
            return true;
        }

        // Third layer: Role check
        return rolePermissions.includes(p);
    };

    // ✅ Single permission
    const hasPermission = (permission: string): boolean => {
        return checkPermission(permission);
    };

    // ✅ ALL permissions required
    const hasAllPermissions = (requiredPermissions: string[]): boolean => {
        if (isSuperDeveloper) return true;
        return requiredPermissions.every((p) => checkPermission(p));
    };

    // ✅ ANY one permission
    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (isSuperDeveloper) return true;
        return requiredPermissions.some((p) => checkPermission(p));
    };

    return {
        permissions: rolePermissions,
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        isSuperDeveloper: isSuperDeveloper || isSuperAdmin,
        loading,
        isAdminLogin,
    };
};