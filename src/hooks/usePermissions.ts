import { useSelector } from "react-redux";
import type { RootState } from "../redux/Store";
import { useCallback, useMemo } from "react";
import { config } from "../utils/config";

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION HIERARCHY (mirrors backend Rbac.js exactly)
//
// 1️⃣  super_developer_admin → FULL ACCESS (bypass everything)
// 2️⃣  developer_admin       → ROLE-BASED ACCESS (developer role permissions)
// 3️⃣  super_school_admin    → PLAN-BASED ACCESS (plan permissions only)
//                             Empty plan [] → full access as school owner
// 4️⃣  school_admin          → PLAN + ROLE-BASED ACCESS (most restricted)
// ═══════════════════════════════════════════════════════════════════════════

export const usePermissions = () => {
  const { adminDetails, loading, isAdminLogin } = useSelector(
    (state: RootState) => state.AdminReducer,
  );

  // ── User Type Flags ──────────────────────────────────────────────────────
  const isSuperDeveloper =
    adminDetails?.type === config.super_developer_admin;

  const isDeveloperAdmin =
    adminDetails?.type === config.developer_admin;

  const isSuperSchoolAdmin =
    adminDetails?.type === config.super_school_admin;

  const isSchoolSubAdmin =
    adminDetails?.type === config.school_admin;

  const isSchoolAdmin = isSuperSchoolAdmin || isSchoolSubAdmin;
  const isDeveloper = isSuperDeveloper || isDeveloperAdmin;

  // ── Role Permissions (flattened from assigned roles) ─────────────────────
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

  // ── Plan Permissions (from school's subscribed plan) ─────────────────────
  const planPermissions = useMemo((): string[] => {
    return adminDetails?.schoolData?.plan?.permissions ?? [];
  }, [adminDetails?.schoolData?.plan?.permissions]);

  // ── Core Permission Checker ───────────────────────────────────────────────
  const checkPermission = useCallback(
    (p: string): boolean => {
      // 1️⃣ super_developer_admin → full access
      if (isSuperDeveloper) return true;

      // 2️⃣ developer_admin → role-based check only
      if (isDeveloperAdmin) {
        return rolePermissions.includes(p);
      }

      // 3️⃣ super_school_admin → plan-based check only
      if (isSuperSchoolAdmin) {
        return planPermissions.includes(p);
      }

      // 4️⃣ school_admin → plan check first, then role check
      if (isSchoolSubAdmin) {
        // If plan doesn't include this permission → deny
        if (!planPermissions.includes(p)) {
          return false;
        }
        // Role check
        return rolePermissions.includes(p);
      }

      return false;
    },
    [
      isSuperDeveloper,
      isDeveloperAdmin,
      isSuperSchoolAdmin,
      isSchoolSubAdmin,
      planPermissions,
      rolePermissions,
    ],
  );

  // ── Helper: Single Permission ─────────────────────────────────────────────
  const hasPermission = useCallback(
    (permission: string): boolean => checkPermission(permission),
    [checkPermission],
  );

  // ── Helper: ALL permissions required ─────────────────────────────────────
  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (isSuperDeveloper) return true;
      return requiredPermissions.every((p) => checkPermission(p));
    },
    [isSuperDeveloper, checkPermission],
  );

  // ── Helper: ANY one permission ────────────────────────────────────────────
  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (isSuperDeveloper) return true;
      return requiredPermissions.some((p) => checkPermission(p));
    },
    [isSuperDeveloper, checkPermission],
  );

  return {
    permissions: rolePermissions,  // role-based permissions array
    planPermissions,               // plan-based permissions array
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isSuperDeveloper,
    isDeveloperAdmin,
    isDeveloper,
    isSuperSchoolAdmin,
    isSchoolSubAdmin,
    isSchoolAdmin,
    loading,
    isAdminLogin,
  };
};
