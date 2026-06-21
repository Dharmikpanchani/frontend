import React from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import type { RootState } from "../redux/rootReducer";
import useIsValidToken from "./isValidToken";

import { useThemeManager } from "../apps/school/hooks/useThemeManager";
import { getSubdomain } from "../apps/common/commonJsFunction";
import Cookies from "js-cookie";
import ScrollToTop from "../apps/common/ScrollToTop";

const PublicRoutes: React.FC = () => {
  const { isSubdomain } = getSubdomain();

  // Conditionally call useThemeManager for school portal
  if (isSubdomain) {
    useThemeManager();
  }

  const { isAdminLogin, adminDetails, token } = useSelector(
    (state: RootState | any) => state.AdminReducer,
  );

  const cookieToken = Cookies.get("auth_token");
  // Cookie is the source of truth — interceptor updates it on refresh but not Redux state
  const isValid = useIsValidToken(cookieToken || token || null);

  // Only redirect to dashboard when the token is actually valid.
  // Do NOT call logout here for an expired cookie — the Axios interceptor handles
  // token refresh on 401. Calling logout here races against the interceptor and
  // destroys the session before the refresh can complete.
  if (
    (isAdminLogin && adminDetails?.isLogin && isValid) ||
    (!!cookieToken && isValid)
  ) {
    return <Navigate to="/dashboard" replace={true} />;
  }
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default PublicRoutes;
