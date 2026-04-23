import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import useIsValidToken from "./isValidToken";

const PrivateRoutes: React.FC = () => {
  const location = useLocation();
  const { isAdminLogin, adminDetails, token } = useSelector(
    (state: any) => state.AdminReducer
  );

  const cookieToken = Cookies.get("auth_token");
  // Check validity of either the redux token or the cookie token
  const isValid = useIsValidToken(token || cookieToken || null);

  // If Redux says logged in AND it's valid, OR a valid cookie exists
  const canAccess = (isAdminLogin && adminDetails?.isLogin && isValid) || (!!cookieToken && isValid);

  const isSchoolAdmin = adminDetails?.type === "school_admin";
  const isActivePlan = adminDetails?.schoolData?.isActivePlan;

  // Safeguard: Only check plan status if the profile is fully loaded and the user is a school admin
  const isPlanInactive = !!(
    isSchoolAdmin &&
    adminDetails?._id && // Ensure profile is loaded
    isActivePlan === false
  );

  // If they should be on the plan page but aren't
  const isPlanPage =
    location.pathname === "/user-plan" ||
    location.pathname === "/login/otp";

  if (canAccess && isPlanInactive && !isPlanPage) {
    return <Navigate to="/user-plan" replace={true} />;
  }

  return canAccess ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export default PrivateRoutes;
