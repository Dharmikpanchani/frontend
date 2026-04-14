import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../redux/rootReducer";
import useIsValidToken from "./isValidToken";

import { useThemeManager } from "../apps/school/hooks/useThemeManager";
import { getSubdomain } from "../apps/common/commonJsFunction";
import { logoutAdmin } from "../redux/slices/authSlice";
import { authService } from "../api/services/auth.service";

const PublicRoutes: React.FC = () => {
  const { isSubdomain } = getSubdomain();
  const dispatch = useDispatch();

  // Conditionally call useThemeManager for school portal
  if (isSubdomain) {
    useThemeManager();
  }

  const { isAdminLogin, adminDetails, token } = useSelector(
    (state: RootState | any) => state.AdminReducer
  );

  const { pathname } = useLocation();
  const isValid = useIsValidToken(token);

  useEffect(() => {
    if (token && !isValid) {
      const performLogout = async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout API failed", error);
        } finally {
          dispatch(logoutAdmin());
        }
      };
      performLogout();
    }
  }, [token, isValid, dispatch]);

  if (isAdminLogin && adminDetails?.isLogin && isValid) {
    return <Navigate to="/dashboard" replace={true} />;
  }
  return <Outlet />;
};

export default PublicRoutes;
