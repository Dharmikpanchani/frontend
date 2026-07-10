import { useLocation, Link } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { Box, Button, List, ListItem, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Svg from "@/assets/Svg";
import Png from "@/assets/Png";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/Store";
import { getPendingTeachers } from "@/redux/slices/teacherSlice";
import { getPendingAdmissionsCount } from "@/redux/slices/studentSlice";

export default function Sidebar(props: any) {
  const location = useLocation();
  const dispatch = useDispatch<any>();
  const { hasPermission, hasAnyPermission, planPermissions } = usePermissions();
  const { adminDetails } = useSelector(
    (state: RootState) => state.AdminReducer,
  );
  const { pendingTeachers } = useSelector(
    (state: RootState) => state.TeacherReducer,
  );
  const pendingDocCount = pendingTeachers.length;

  const { pendingAdmissionsCount } = useSelector(
    (state: RootState) => state.StudentReducer,
  );

  useEffect(() => {
    if (hasPermission(schoolAdminPermission.teacher.read)) {
      dispatch(getPendingTeachers());
    }
    if (hasPermission(schoolAdminPermission.student?.read)) {
      dispatch(getPendingAdmissionsCount());
    }
  }, [location.pathname, dispatch, hasPermission]);

  // Handle responsive menu open/close
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        props?.setOpen?.(false);
      } else {
        props?.setOpen?.(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.classList[props?.open ? "add" : "remove"](
        "admin-body-overflow",
      );
    } else {
      document.body.classList.remove("admin-body-overflow");
    }
  }, [props?.open]);

  const [openRoleManagement, setOpenRoleManagement] = useState(false);
  const handleClickRoleManagement = () => setOpenRoleManagement(!openRoleManagement);

  const [openCmsManagement, setOpenCmsManagement] = useState(false);
  const handleClickCmsManagement = () => setOpenCmsManagement(!openCmsManagement);

  const [openMasterManagement, setOpenMasterManagement] = useState(false);
  const handleClickMasterManagement = () => setOpenMasterManagement(!openMasterManagement);

  const [openFeeManagement, setOpenFeeManagement] = useState(false);
  const handleClickFeeManagement = () => setOpenFeeManagement(!openFeeManagement);

  const [openSettingsManagement, setOpenSettingsManagement] = useState(false);
  const handleClickSettingsManagement = () => setOpenSettingsManagement(!openSettingsManagement);

  const [openImportLogs, setOpenImportLogs] = useState(false);
  const handleClickImportLogs = () => setOpenImportLogs(!openImportLogs);

  // ─── Menu Data ──────────────────────────────────────────────────────────────
  const roleManagement = [
    {
      title: "Roles",
      pathName: "/role-list",
      icon: Svg.roleIcon,
      show: hasPermission(schoolAdminPermission.role.read),
      menuHighlight: ["role-list"],
    },
    {
      title: "Admin User",
      pathName: "/admin-list",
      icon: Svg.userList,
      show: hasPermission(schoolAdminPermission.admin_user.read),
      menuHighlight: ["admin-list"],
    },
  ];

  const masterManagement = [
    {
      title: "Teachers",
      pathName: "/teacher",
      icon: Svg.userList,
      show: hasPermission(schoolAdminPermission.teacher.read),
      menuHighlight: ["teacher"],
    },
    {
      title: "Teacher Assignments",
      pathName: "/teacher/assignments",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.teacher.read),
      menuHighlight: ["teacher", "assignments"],
    },
    {
      title: "Students",
      pathName: "/student",
      icon: Svg.userList,
      show: hasPermission(schoolAdminPermission.student?.read),
      menuHighlight: ["student"],
    },
    {
      title: "Inquiries",
      pathName: "/student/inquiries",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.student?.read),
      menuHighlight: ["student", "inquiries"],
    },
    {
      title: "Student Promotion",
      pathName: "/student/promote",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.student?.update),
      menuHighlight: ["student", "promote"],
    },
    {
      title: "Department",
      pathName: "/master/department",
      icon: Svg.roleIcon,
      show: hasPermission(schoolAdminPermission.department.read),
      menuHighlight: ["department"],
    },
    {
      title: "Subject",
      pathName: "/master/subject",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.subject.read),
      menuHighlight: ["subject"],
    },
    {
      title: "Class",
      pathName: "/master/class",
      icon: Svg.brand,
      show: hasPermission(schoolAdminPermission.class.read),
      menuHighlight: ["class"],
    },
    {
      title: "Section",
      pathName: "/master/section",
      icon: Svg.filter,
      show: hasPermission(schoolAdminPermission.section.read),
      menuHighlight: ["section"],
    },
  ];

  const feeManagement = [
    {
      title: "Fee Category",
      pathName: "/fee/categories",
      icon: Svg.brand,
      show: hasPermission(schoolAdminPermission.fee_category?.read),
      menuHighlight: ["fee", "categories"],
    },
    {
      title: "Fee Structure",
      pathName: "/fee/structures",
      icon: Svg.dashboard,
      show: hasPermission(schoolAdminPermission.fee_structure?.read),
      menuHighlight: ["fee", "structures"],
    },
    {
      title: "Collect Fees",
      pathName: "/fee/collections",
      icon: Svg.filter,
      show: hasPermission(schoolAdminPermission.fee_collection?.read),
      menuHighlight: ["fee", "collections"],
    },
    {
      title: "Dues & Defaulters",
      pathName: "/fee/dues",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.fee_collection?.read),
      menuHighlight: ["fee", "dues"],
    },
  ];

  // ✅ New Settings dropdown (School Theme + Settings)
  const settingsManagement = [
    {
      title: "School Theme",
      pathName: "/theme-settings",
      icon: Svg.settings,
      show: hasPermission(schoolAdminPermission.theme?.read),
      menuHighlight: ["theme-settings"],
    },
    {
      title: "Settings",
      pathName: "/settings",
      icon: Svg.settings,
      show: hasPermission(schoolAdminPermission.school_settings?.read),
      menuHighlight: ["settings"],
    },
  ];

  const importLogsManagement = [
    {
      title: "Teacher Logs",
      pathName: "/import-logs/teacher",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.teacher.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Student Logs",
      pathName: "/import-logs/student",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.student?.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Fee Structure Logs",
      pathName: "/import-logs/fee_structure",
      icon: Svg.dashboard,
      show: hasPermission(schoolAdminPermission.fee_structure?.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Fee Category Logs",
      pathName: "/import-logs/fee_category",
      icon: Svg.brand,
      show: hasPermission(schoolAdminPermission.fee_category?.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Class Logs",
      pathName: "/import-logs/class",
      icon: Svg.brand,
      show: hasPermission(schoolAdminPermission.class.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Section Logs",
      pathName: "/import-logs/section",
      icon: Svg.filter,
      show: hasPermission(schoolAdminPermission.section.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Department Logs",
      pathName: "/import-logs/department",
      icon: Svg.roleIcon,
      show: hasPermission(schoolAdminPermission.department.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Subject Logs",
      pathName: "/import-logs/subject",
      icon: Svg.latestUpdate,
      show: hasPermission(schoolAdminPermission.subject.import),
      menuHighlight: ["import-logs"],
    },
    {
      title: "Role Logs",
      pathName: "/import-logs/role",
      icon: Svg.roleIcon,
      show: hasPermission(schoolAdminPermission.role.import),
      menuHighlight: ["import-logs"],
    },
  ];

  const cms: any = [];

  const checkActive = (menuItems: any[]) => {
    return menuItems.some((item) =>
      item.menuHighlight.includes(location?.pathname?.split("/")[1]),
    );
  };

  useEffect(() => {
    if (checkActive(roleManagement)) setOpenRoleManagement(true);
    if (checkActive(cms)) setOpenCmsManagement(true);
    if (checkActive(masterManagement)) setOpenMasterManagement(true);
    if (checkActive(feeManagement)) setOpenFeeManagement(true);
    if (checkActive(settingsManagement)) setOpenSettingsManagement(true);
    if (location.pathname.startsWith("/import-logs")) setOpenImportLogs(true);
  }, [location.pathname]);

  // show menu with permissions
  const data = [
    {
      title: "Dashboard",
      pathName: "/dashboard",
      icon: Svg.dashboard,
      show: hasPermission(schoolAdminPermission.dashboard.read),
      menuHighlight: ["dashboard"],
    },
  ];

  const cmsPermission = true;

  const rolePermission = hasAnyPermission([
    schoolAdminPermission.role.read,
    schoolAdminPermission.admin_user.read,
  ]);

  const masterPermission = hasAnyPermission([
    schoolAdminPermission.department.read,
    schoolAdminPermission.subject.read,
    schoolAdminPermission.class.read,
    schoolAdminPermission.section.read,
    schoolAdminPermission.teacher.read,
    schoolAdminPermission.student?.read,
  ]);

  const feePermission = hasAnyPermission([
    schoolAdminPermission.fee_category?.read,
    schoolAdminPermission.fee_structure?.read,
    schoolAdminPermission.fee_collection?.read,
  ]);

  const settingsPermission = hasAnyPermission([
    schoolAdminPermission.theme?.read,
    schoolAdminPermission.school_settings?.read,
  ]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box className="admin-sidebar-main">
      <Box className="admin-sidebar-inner-main">
        {/* Logo Section */}
        <Box className="admin-sidebar-logo-main">
          <Link
            to={"/dashboard"}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", textDecoration: "none" }}
          >
            <img
              src={
                adminDetails?.schoolData?.logo
                  ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + adminDetails?.schoolData?.logo
                  : Png.logoImg
              }
              className="admin-sidebar-logo"
              alt="logo"
            />
          </Link>
          <Button
            onClick={(e) => {
              e.preventDefault();
              props?.setOpen?.(false);
              document.body.classList.remove("admin-body-overflow");
            }}
            className="admin-sidebar-close-btn"
            sx={{ minWidth: "auto", p: 0.5, display: { xs: "block", lg: "none" }, position: "absolute", right: "15px" }}
          >
            <img src={Svg.close} className="admin-close-icon" alt="close" style={{ width: "24px", height: "24px", filter: "brightness(0) invert(1)" }} />
          </Button>
        </Box>

        {/* Menu List */}
        <Box className="admin-sidebar-list-main scrollbar">
          <List className="admin-sidebar-list">

            {/* Dashboard */}
            {data.map((ele, index) =>
              ele?.show ? (
                <ListItem className="admin-sidebar-listitem" key={index}>
                  <Link
                    to={ele?.pathName}
                    onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                    className={ele?.menuHighlight?.includes(location?.pathname?.split("/")[1]) ? "admin-sidebar-link active" : "admin-sidebar-link"}
                  >
                    <img src={ele?.icon} alt={ele?.title} className="admin-sidebar-icons" />
                    <span className="admin-sidebar-link-text">{ele?.title}</span>
                  </Link>
                </ListItem>
              ) : null,
            )}

            {/* Fee Management */}
            {feePermission && (
              <ListItem component="div" className="admin-sidebar-listitem flex-column align-items-start">
                <Box className="admin-submenu-link-box w-100">
                  <Box className="admin-sidebar-link" onClick={handleClickFeeManagement}>
                    <img src={Svg.roleIcon} alt="Fee Management" className="admin-sidebar-icons" />
                    <span className="admin-sidebar-link-text">Fee Management</span>
                    {openFeeManagement ? <ExpandLess className="expandless-icon" /> : <ExpandMore className="expandmore-icon" />}
                  </Box>
                  <Box className="admin-submenu-main">
                    <Collapse in={openFeeManagement} timeout="auto" unmountOnExit className="admin-submenu-collapse">
                      <List component="div" disablePadding className="admin-sidebar-submenulist">
                        {feeManagement.map((dt) =>
                          dt.show ? (
                            <ListItem className="admin-sidebar-listitem" key={dt.pathName}>
                              <Link
                                to={dt?.pathName}
                                onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                                className={
                                  dt?.menuHighlight?.includes(location?.pathname?.split("/")[1]) &&
                                    dt?.menuHighlight?.includes(location?.pathname?.split("/")[2] || "")
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img src={dt?.icon} alt={dt?.title} className="admin-sidebar-icons" />
                                <span className="admin-sidebar-link-text">{dt?.title}</span>
                              </Link>
                            </ListItem>
                          ) : null,
                        )}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

            {/* Role Management (Admin) */}
            {rolePermission && (
              <ListItem component="div" className="admin-sidebar-listitem flex-column align-items-start">
                <Box className="admin-submenu-link-box w-100">
                  <Box className="admin-sidebar-link" onClick={handleClickRoleManagement}>
                    <img src={Svg.roleIcon} alt="Admin" className="admin-sidebar-icons" />
                    <span className="admin-sidebar-link-text">Admin</span>
                    {openRoleManagement ? <ExpandLess className="expandless-icon" /> : <ExpandMore className="expandmore-icon" />}
                  </Box>
                  <Box className="admin-submenu-main">
                    <Collapse in={openRoleManagement} timeout="auto" unmountOnExit className="admin-submenu-collapse">
                      <List component="div" disablePadding className="admin-sidebar-submenulist">
                        {roleManagement.map((data) =>
                          data.show ? (
                            <ListItem className="admin-sidebar-listitem" key={data.pathName}>
                              <Link
                                to={data?.pathName}
                                onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                                className={data?.menuHighlight?.includes(location?.pathname?.split("/")[1]) ? "admin-sidebar-link active" : "admin-sidebar-link"}
                              >
                                <img src={data?.icon} alt={data?.title} className="admin-sidebar-icons" />
                                <span className="admin-sidebar-link-text">{data?.title}</span>
                              </Link>
                            </ListItem>
                          ) : null,
                        )}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

            {/* Master Management */}
            {masterPermission && (
              <ListItem component="div" className="admin-sidebar-listitem flex-column align-items-start">
                <Box className="admin-submenu-link-box w-100">
                  <Box className="admin-sidebar-link" onClick={handleClickMasterManagement}>
                    <img src={Svg.brand} alt="Master" className="admin-sidebar-icons" />
                    <span className="admin-sidebar-link-text">Student Master</span>
                    {openMasterManagement ? <ExpandLess className="expandless-icon" /> : <ExpandMore className="expandmore-icon" />}
                  </Box>
                  <Box className="admin-submenu-main">
                    <Collapse in={openMasterManagement} timeout="auto" unmountOnExit className="admin-submenu-collapse">
                      <List component="div" disablePadding className="admin-sidebar-submenulist">
                        {masterManagement.map((dt) =>
                          dt.show ? (
                            <ListItem className="admin-sidebar-listitem" key={dt.pathName}>
                              <Link
                                to={dt?.pathName}
                                onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                                className={
                                  (() => {
                                    const path1 = location?.pathname?.split("/")[1];
                                    const path2 = location?.pathname?.split("/")[2] || "";
                                    if (dt?.title === "Student Promotion") {
                                      return path1 === "student" && path2 === "promote";
                                    }
                                    if (dt?.title === "Inquiries") {
                                      return path1 === "student" && path2 === "inquiries";
                                    }
                                    if (dt?.title === "Students") {
                                      return path1 === "student" && path2 !== "inquiries" && path2 !== "promote";
                                    }
                                    if (dt?.title === "Teacher Assignments") {
                                      return path1 === "teacher" && path2 === "assignments";
                                    }
                                    if (dt?.title === "Teachers") {
                                      return path1 === "teacher" && path2 !== "assignments";
                                    }
                                    return (
                                      dt?.menuHighlight?.includes(path1) ||
                                      (path1 === "master" && dt?.menuHighlight?.includes(path2))
                                    );
                                  })()
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img src={dt?.icon} alt={dt?.title} className="admin-sidebar-icons" />
                                <span className="admin-sidebar-link-text">{dt?.title}</span>
                                {dt?.title === "Teachers" && pendingDocCount > 0 && (
                                  <span
                                    style={{
                                      position: "absolute", right: "15px", top: "50%",
                                      transform: "translateY(-50%)", backgroundColor: "#d92d20",
                                      color: "#fff", fontSize: "10px", fontWeight: 700,
                                      borderRadius: "10px", padding: "2px 8px",
                                      lineHeight: 1, display: "inline-block", zIndex: 10,
                                    }}
                                  >
                                    {pendingDocCount}
                                  </span>
                                )}
                                {dt?.title === "Students" && pendingAdmissionsCount > 0 && (
                                  <span
                                    style={{
                                      position: "absolute", right: "15px", top: "50%",
                                      transform: "translateY(-50%)", backgroundColor: "#d92d20",
                                      color: "#fff", fontSize: "10px", fontWeight: 700,
                                      borderRadius: "10px", padding: "2px 8px",
                                      lineHeight: 1, display: "inline-block", zIndex: 10,
                                    }}
                                  >
                                    {pendingAdmissionsCount}
                                  </span>
                                )}
                              </Link>
                            </ListItem>
                          ) : null,
                        )}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

            {/* CMS Management */}
            {cmsPermission && (
              <ListItem component="div" className="admin-sidebar-listitem flex-column align-items-start">
                <Box className="admin-submenu-link-box w-100">
                  <Box className="admin-sidebar-link" onClick={handleClickCmsManagement}>
                    <img src={Svg.cms} alt="CMS" className="admin-sidebar-icons" />
                    <span className="admin-sidebar-link-text">CMS</span>
                    {openCmsManagement ? <ExpandLess className="expandless-icon" /> : <ExpandMore className="expandmore-icon" />}
                  </Box>
                  <Box className="admin-submenu-main">
                    <Collapse in={openCmsManagement} timeout="auto" unmountOnExit className="admin-submenu-collapse">
                      <List component="div" disablePadding className="admin-sidebar-submenulist">
                        {cms?.map((data: any) => {
                          const pathSegments = location?.pathname?.split("/") || [];
                          const isActive = pathSegments.some((segment: string) => data?.menuHighlight?.includes(segment));
                          return data.show ? (
                            <ListItem className="admin-sidebar-listitem" key={data.pathName}>
                              <Link
                                to={data?.pathName}
                                onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                                className={isActive ? "admin-sidebar-link active" : "admin-sidebar-link"}
                              >
                                <img src={data?.icon} alt={data?.title} className="admin-sidebar-icons" />
                                <span className="admin-sidebar-link-text">{data?.title}</span>
                              </Link>
                            </ListItem>
                          ) : null;
                        })}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

            {/* Import Logs collapsible dropdown */}
            {hasPermission(schoolAdminPermission.import_log.read) &&
              planPermissions.some((p) => p.endsWith("_import")) &&
              importLogsManagement.some((item) => item.show) && (
                <ListItem component="div" className="admin-sidebar-listitem flex-column align-items-start">
                  <Box className="admin-submenu-link-box w-100">
                    <Box className="admin-sidebar-link" onClick={handleClickImportLogs}>
                      <img src={Svg.latestUpdate} alt="Import Logs" className="admin-sidebar-icons" />
                      <span className="admin-sidebar-link-text">Import Logs</span>
                      {openImportLogs ? <ExpandLess className="expandless-icon" /> : <ExpandMore className="expandmore-icon" />}
                    </Box>
                    <Box className="admin-submenu-main">
                      <Collapse in={openImportLogs} timeout="auto" unmountOnExit className="admin-submenu-collapse">
                        <List component="div" disablePadding className="admin-sidebar-submenulist">
                          {importLogsManagement.map((dt) =>
                            dt.show ? (
                              <ListItem className="admin-sidebar-listitem" key={dt.pathName}>
                                <Link
                                  to={dt?.pathName}
                                  onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                                  className={
                                    location?.pathname === dt.pathName
                                      ? "admin-sidebar-link active"
                                      : "admin-sidebar-link"
                                  }
                                >
                                  <img src={dt?.icon} alt={dt?.title} className="admin-sidebar-icons" />
                                  <span className="admin-sidebar-link-text">{dt?.title}</span>
                                </Link>
                              </ListItem>
                            ) : null,
                          )}
                        </List>
                      </Collapse>
                    </Box>
                  </Box>
                </ListItem>
              )}

            {/* ✅ Settings Management (School Theme + Settings) */}
            {settingsPermission && (
              <ListItem component="div" className="admin-sidebar-listitem flex-column align-items-start">
                <Box className="admin-submenu-link-box w-100">
                  <Box className="admin-sidebar-link" onClick={handleClickSettingsManagement}>
                    <img src={Svg.settings} alt="Settings" className="admin-sidebar-icons" />
                    <span className="admin-sidebar-link-text">Settings</span>
                    {openSettingsManagement ? <ExpandLess className="expandless-icon" /> : <ExpandMore className="expandmore-icon" />}
                  </Box>
                  <Box className="admin-submenu-main">
                    <Collapse in={openSettingsManagement} timeout="auto" unmountOnExit className="admin-submenu-collapse">
                      <List component="div" disablePadding className="admin-sidebar-submenulist">
                        {settingsManagement.map((dt) =>
                          dt.show ? (
                            <ListItem className="admin-sidebar-listitem" key={dt.pathName}>
                              <Link
                                to={dt?.pathName}
                                onClick={() => { if (window.innerWidth < 786) props?.setOpen?.(false); }}
                                className={
                                  dt?.menuHighlight?.includes(location?.pathname?.split("/")[1])
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img src={dt?.icon} alt={dt?.title} className="admin-sidebar-icons" />
                                <span className="admin-sidebar-link-text">{dt?.title}</span>
                              </Link>
                            </ListItem>
                          ) : null,
                        )}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

          </List>
        </Box>
      </Box>
    </Box>
  );
}
