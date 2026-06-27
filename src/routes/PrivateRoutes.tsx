import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import ScrollToTop from "../apps/common/ScrollToTop";
import { config } from "../utils/config";

const PrivateRoutes: React.FC = () => {
  const location = useLocation();
  const { isAdminLogin, adminDetails } = useSelector(
    (state: any) => state.AdminReducer,
  );

  const cookieToken = Cookies.get("auth_token");

  // Do NOT check JWT expiry here. An expired cookie still means a session MAY be valid
  // (the refresh token is httpOnly and invisible to JS). The Axios interceptor handles
  // 401s by calling the refresh endpoint. If we redirect on expiry, we race against the
  // interceptor and log the user out before it can refresh.
  const canAccess = !!cookieToken || (isAdminLogin && adminDetails?.isLogin);

  const isSchoolAdmin =
    adminDetails?.type === config.school_admin ||
    adminDetails?.type === config.super_school_admin;
  const isActivePlan = adminDetails?.schoolData?.isActivePlan;
  const hasPlan = !!adminDetails?.schoolData?.plan?.planName;

  // Safeguard: Only check plan status if the profile is fully loaded and the user is a school admin
  const isPlanInactive = !!(
    isSchoolAdmin &&
    adminDetails?._id && // Ensure profile is loaded
    (isActivePlan === false || !hasPlan)
  );

  // If they should be on the plan page but aren't
  const isPlanPage =
    location.pathname === "/user-plan" || location.pathname === "/login/otp";

  if (canAccess && isPlanInactive && !isPlanPage) {
    return <Navigate to="/user-plan" replace={true} />;
  }

  return canAccess ? (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  ) : (
    <Navigate to="/" replace={true} />
  );
};

export default PrivateRoutes;
