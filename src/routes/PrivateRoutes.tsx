import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import useIsValidToken from "./isValidToken";

const PrivateRoutes: React.FC = () => {
  const { isAdminLogin, adminDetails, token } = useSelector(
    (state: any) => state.AdminReducer
  );

  const cookieToken = Cookies.get("auth_token");
  // Check validity of either the redux token or the cookie token
  const isValid = useIsValidToken(token || cookieToken || null);

  // If Redux says logged in AND it's valid, OR a valid cookie exists
  const canAccess = (isAdminLogin && adminDetails?.isLogin && isValid) || (!!cookieToken && isValid);

  const isSchoolAdmin = adminDetails?.type === "school_admin";
  const planExptyDate = adminDetails?.schoolData?.PlanExptyDate;
  const isExpired = !!(isSchoolAdmin && planExptyDate && (planExptyDate < Math.floor(Date.now() / 1000)));
  console.log("ddddd", isExpired, isSchoolAdmin, planExptyDate, Math.floor(Date.now() / 1000))
  // If they should be on the plan page but aren't
  const isPlanPage = window.location.pathname === "/user-plan" || window.location.pathname === "/login/otp"; // Add any exceptions here

  if (canAccess && isExpired && !isPlanPage) {
    return <Navigate to="/user-plan" replace={true} />;
  }

  return canAccess ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export default PrivateRoutes;
