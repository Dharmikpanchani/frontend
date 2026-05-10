import { useSelector } from "react-redux";
import type { RootState } from "../redux/Store";
import { useCallback, useMemo } from "react";

export const usePermissions = () => {
    const { adminDetails, loading, isAdminLogin } = useSelector(
        (state: RootState) => state.AdminReducer
    );


    const isSuperDeveloper = adminDetails?.type === "super_developer";
    const isSchoolAdmin = adminDetails?.type === "school_admin";
    const isSuperAdmin = adminDetails?.isSuperAdmin;

    const rolePermissions = useMemo((): string[] => {
        return adminDetails?.role?.permissions ?? [];
    }, [adminDetails?.role?.permissions]);

    const planPermissions = useMemo((): string[] => {
        return adminDetails?.schoolData?.plan?.permissions ?? [];
    }, [adminDetails?.schoolData?.plan?.permissions]);

    const checkPermission = useCallback((p: string): boolean => {
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
    }, [isSuperDeveloper, isSchoolAdmin, planPermissions, isSuperAdmin, rolePermissions]);

    // ✅ Single permission
    const hasPermission = useCallback((permission: string): boolean => {
        return checkPermission(permission);
    }, [checkPermission]);

    // ✅ ALL permissions required
    const hasAllPermissions = useCallback((requiredPermissions: string[]): boolean => {
        if (isSuperDeveloper) return true;
        return requiredPermissions.every((p) => checkPermission(p));
    }, [isSuperDeveloper, checkPermission]);

    // ✅ ANY one permission
    const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
        if (isSuperDeveloper) return true;
        return requiredPermissions.some((p) => checkPermission(p));
    }, [isSuperDeveloper, checkPermission]);

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