import { useSelector } from "react-redux";
import type { RootState } from "../redux/Store";

export const usePermissions = () => {
    const { adminDetails, loading, isAdminLogin } = useSelector(
        (state: RootState) => state.AdminReducer
    );

    const isSuperDeveloper =
        adminDetails?.type === "super_developer" || adminDetails?.isSuperAdmin;

    const permissions: string[] =
        adminDetails?.role?.permissions ?? [];

    // ✅ Single permission
    const hasPermission = (permission: string): boolean => {
        if (isSuperDeveloper) return true;
        return permissions.includes(permission);
    };

    // ✅ ALL permissions required
    const hasAllPermissions = (requiredPermissions: string[]): boolean => {
        if (isSuperDeveloper) return true;
        return requiredPermissions.every((p) => permissions.includes(p));
    };

    // ✅ ANY one permission
    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (isSuperDeveloper) return true;
        return requiredPermissions.some((p) => permissions.includes(p));
    };

    return {
        permissions,
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        isSuperDeveloper,
        loading,
        isAdminLogin,
    };
};