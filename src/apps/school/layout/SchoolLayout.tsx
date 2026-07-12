import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import Header from "../component/defaulLayout/Header";
import Sidebar from "../component/defaulLayout/Sidebar";
import PageLoader from "../../common/loader/PageLoader";
import { getProfileAdmin } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/Store";
import { useThemeManager } from "../hooks/useThemeManager";
import AICopilot from "../component/AICopilot/AICopilot";
import { usePermissions } from "@/hooks/usePermissions";

export default function SchoolLayout() {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(true);
  const { themeStyle, themeClasses } = useThemeManager();
  const location = useLocation();
  const { loading } = useSelector((state: RootState) => state.AdminReducer);

  useEffect(() => {
    dispatch(getProfileAdmin() as any);
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const mainContain = document.querySelector(".admin-dashboard-containt-main") || document.querySelector(".admin-dashboard-right-main");
    if (mainContain) {
      mainContain.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);


  if (loading) {
    return <PageLoader />;
  }

  const isUserPlanPage = location.pathname === "/user-plan";

  return (
    <div style={themeStyle} className={themeClasses}>
      <Box className="admin-dashboard-main">
        {!isUserPlanPage && (
          <Box
            className={`admin-dashboard-left-main ${open ? "active" : "admin-sidebar-deactive"}`}
          >
            <Sidebar open={open} setOpen={setOpen} />
          </Box>
        )}
        <Box
          className="admin-dashboard-right-main"
          sx={{
            width: isUserPlanPage ? "100% !important" : undefined,
            marginLeft: isUserPlanPage ? "0 !important" : undefined,
          }}
        >
          <Header setOpen={setOpen} open={open} />
          <Box
            className="admin-dashboard-containt-main"
            sx={
              isUserPlanPage
                ? {
                  backgroundColor: "var(--body-color)",
                  minHeight: "100vh",
                  padding: "85px 24px 24px 15px !important",
                  transition: "0.3s all cubic-bezier(0.4, 0, 0.2, 1)",
                  WebkitTransition: "0.3s all cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  flexDirection: "column",
                }
                : {}
            }
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
      {hasPermission("ai_copilot_use") && <AICopilot />}
    </div>
  );
}
