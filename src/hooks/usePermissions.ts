import { useSelector } from "react-redux";
import type { RootState } from "../redux/Store";
import { useCallback, useMemo } from "react";
import { config } from "../utils/config";

export const usePermissions = () => {
  const { adminDetails, loading, isAdminLogin } = useSelector(
    (state: RootState) => state.AdminReducer,
  );

  const isSuperDeveloper =
    adminDetails?.type === "super_developer" ||
    adminDetails?.type === config.super_developer_admin;
  const isSchoolAdmin =
    adminDetails?.type === config.super_school_admin ||
    adminDetails?.type === config.school_admin;
  const isSuperSchoolAdmin = adminDetails?.type === config.super_school_admin;

  const rolePermissions = useMemo((): string[] => {
    const roles = adminDetails?.roles;
    if (roles && Array.isArray(roles)) {
      const allPerms = new Set<string>();
      roles.forEach((r: any) => {
        if (r && r.isActive !== false && Array.isArray(r.permissions)) {
          r.permissions.forEach((p: string) => allPerms.add(p));
        }
      });
      return Array.from(allPerms);
    }
    return adminDetails?.role?.permissions ?? [];
  }, [adminDetails?.roles, adminDetails?.role?.permissions]);

  const planPermissions = useMemo((): string[] => {
    return adminDetails?.schoolData?.plan?.permissions ?? [];
  }, [adminDetails?.schoolData?.plan?.permissions]);

  const checkPermission = useCallback(
    (p: string): boolean => {
      if (isSuperDeveloper) return true;

      if (isSchoolAdmin) {
        // First layer: Plan check
        if (planPermissions.length > 0 && !planPermissions.includes(p)) return false;
        // Second layer: School Admin bypass within the plan
        if (isSuperSchoolAdmin) return true;
      }

      // Third layer: Role check
      return rolePermissions.includes(p);
    },
    [
      isSuperDeveloper,
      isSchoolAdmin,
      planPermissions,
      isSuperSchoolAdmin,
      rolePermissions,
    ],
  );

  // ✅ Single permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return checkPermission(permission);
    },
    [checkPermission],
  );

  // ✅ ALL permissions required
  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (isSuperDeveloper) return true;
      return requiredPermissions.every((p) => checkPermission(p));
    },
    [isSuperDeveloper, checkPermission],
  );

  // ✅ ANY one permission
  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (isSuperDeveloper) return true;
      return requiredPermissions.some((p) => checkPermission(p));
    },
    [isSuperDeveloper, checkPermission],
  );

  return {
    permissions: rolePermissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isSuperDeveloper,
    isSuperSchoolAdmin,
    loading,
    isAdminLogin,
  };
};
