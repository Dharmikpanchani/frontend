import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoutes: React.FC = () => {
  const { isAdminLogin, adminDetails } = useSelector(
    (state: any) => state.AdminReducer
  );

  // Also check cookie directly — covers the case where Redux state is
  // hydrated from cookie but isAdminLogin isn't set yet.
  const hasCookieToken = !!Cookies.get("auth_token");

  // If Redux says logged in OR a valid cookie exists, allow access.
  // The Axios interceptor handles 401s and will call logoutAdmin() if
  // the refresh token is also expired — only then do we redirect.
  const canAccess = (isAdminLogin && adminDetails?.isLogin) || hasCookieToken;

  return canAccess ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export default PrivateRoutes;
