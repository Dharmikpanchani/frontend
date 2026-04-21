import { useLocation, Link } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import {
  Box, Button, List, ListItem, Collapse
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Svg from "@/assets/Svg";
import Png from "@/assets/Png";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";

export default function Sidebar(props: any) {
  const location = useLocation();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);
  // Handle responsive menu open/close
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        props?.setOpen?.(false);
      } else {
        props?.setOpen?.(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.classList[props?.open ? "add" : "remove"](
        "admin-body-overflow"
      );
    } else {
      document.body.classList.remove("admin-body-overflow");
    }
  }, [props?.open]);



  const [openRoleManagement, setOpenRoleManagement] = useState(false);
  const handleClickRoleManagement = () => {
    setOpenRoleManagement(!openRoleManagement);
  };

  const [openCmsManagement, setOpenCmsManagement] = useState(false);
  const handleClickCmsManagement = () => {
    setOpenCmsManagement(!openCmsManagement);
  };

  const [openMasterManagement, setOpenMasterManagement] = useState(false);
  const handleClickMasterManagement = () => {
    setOpenMasterManagement(!openMasterManagement);
  };

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

  const cms: any = [];

  const checkActive = (menuItems: any[]) => {
    return menuItems.some((item) =>
      item.menuHighlight.includes(location?.pathname?.split("/")[1])
    );
  };

  useEffect(() => {
    if (checkActive(roleManagement)) {
      setOpenRoleManagement(true);
    }
    if (checkActive(cms)) {
      setOpenCmsManagement(true);
    }
    if (checkActive(masterManagement)) {
      setOpenMasterManagement(true);
    }
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
  ]);

  return (
    <Box className="admin-sidebar-main">
      <Box className="admin-sidebar-inner-main">
        {/* Logo Section */}
        <Box className="admin-sidebar-logo-main">
          <Link to={"/dashboard"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', width: '100%' }}>
            <img
              src={adminDetails?.schoolData?.logo ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + adminDetails?.schoolData?.logo : Png.logoImg}
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
            sx={{
              minWidth: 'auto',
              p: 0.5,
              display: { xs: 'block', lg: 'none' },
              position: 'absolute',
              right: '15px'
            }}
          >
            <img
              src={Svg.close}
              className="admin-close-icon"
              alt="close"
              style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }}
            />
          </Button>
        </Box>

        {/* Menu List */}
        <Box className="admin-sidebar-list-main scrollbar">
          <List className="admin-sidebar-list">
            {data.map((ele, index) =>
              ele?.show ? (
                <ListItem className="admin-sidebar-listitem" key={index}>
                  <Link
                    to={ele?.pathName}
                    onClick={() => {
                      if (window.innerWidth < 786) {
                        props?.setOpen?.(false);
                      }
                    }}
                    className={
                      ele?.menuHighlight?.includes(
                        location?.pathname?.split("/")[1]
                      )
                        ? "admin-sidebar-link active"
                        : "admin-sidebar-link"
                    }
                  >
                    <img
                      src={ele?.icon}
                      alt={ele?.title}
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">{ele?.title}</span>
                  </Link>
                </ListItem>
              ) : null
            )}



            {/* Role Management */}
            {rolePermission && (
              <ListItem
                component="div"
                className="admin-sidebar-listitem flex-column align-items-start"
              >
                <Box className="admin-submenu-link-box w-100">
                  <Box
                    className="admin-sidebar-link"
                    onClick={handleClickRoleManagement}
                  >
                    <img
                      src={Svg.roleIcon}
                      alt="Admin"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">
                      Admin
                    </span>
                    {openRoleManagement ? (
                      <ExpandLess className="expandless-icon" />
                    ) : (
                      <ExpandMore className="expandmore-icon" />
                    )}
                  </Box>

                  <Box className="admin-submenu-main">
                    <Collapse
                      in={openRoleManagement}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        {roleManagement.map((data) =>
                          data.show ? (
                            <ListItem
                              className="admin-sidebar-listitem"
                              key={data.pathName}
                            >
                              <Link
                                to={data?.pathName}
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props?.setOpen?.(false);
                                  }
                                }}
                                className={
                                  data?.menuHighlight?.includes(
                                    location?.pathname?.split("/")[1]
                                  )
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={data?.icon}
                                  alt={data?.title}
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  {data?.title}
                                </span>
                              </Link>
                            </ListItem>
                          ) : null
                        )}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

            {/* Master Management */}
            {masterPermission && (
              <ListItem
                component="div"
                className="admin-sidebar-listitem flex-column align-items-start"
              >
                <Box className="admin-submenu-link-box w-100">
                  <Box
                    className="admin-sidebar-link"
                    onClick={handleClickMasterManagement}
                  >
                    <img
                      src={Svg.brand}
                      alt="Master"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">
                      Student Master
                    </span>
                    {openMasterManagement ? (
                      <ExpandLess className="expandless-icon" />
                    ) : (
                      <ExpandMore className="expandmore-icon" />
                    )}
                  </Box>

                  <Box className="admin-submenu-main">
                    <Collapse
                      in={openMasterManagement}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        {masterManagement.map((dt) =>
                          dt.show ? (
                            <ListItem
                              className="admin-sidebar-listitem"
                              key={dt.pathName}
                            >
                              <Link
                                to={dt?.pathName}
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props?.setOpen?.(false);
                                  }
                                }}
                                className={
                                  dt?.menuHighlight?.includes(
                                    location?.pathname?.split("/")[1]
                                  ) || (location?.pathname?.split("/")[1] === "master" && dt?.menuHighlight?.includes(location?.pathname?.split("/")[2]))
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={dt?.icon}
                                  alt={dt?.title}
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  {dt?.title}
                                </span>
                              </Link>
                            </ListItem>
                          ) : null
                        )}
                      </List>
                    </Collapse>
                  </Box>
                </Box>
              </ListItem>
            )}

            {/* CMS Management */}
            {cmsPermission && (
              <ListItem
                component="div"
                className="admin-sidebar-listitem flex-column align-items-start"
              >
                <Box className="admin-submenu-link-box w-100">
                  <Box
                    className="admin-sidebar-link"
                    onClick={handleClickCmsManagement}
                  >
                    <img
                      src={Svg.cms}
                      alt="CMS"
                      className="admin-sidebar-icons"
                    />
                    <span className="admin-sidebar-link-text">CMS</span>
                    {openCmsManagement ? (
                      <ExpandLess className="expandless-icon" />
                    ) : (
                      <ExpandMore className="expandmore-icon" />
                    )}
                  </Box>

                  <Box className="admin-submenu-main">
                    <Collapse
                      in={openCmsManagement}
                      timeout="auto"
                      unmountOnExit
                      className="admin-submenu-collapse"
                    >
                      <List
                        component="div"
                        disablePadding
                        className="admin-sidebar-submenulist"
                      >
                        {cms?.map((data: any) => {
                          const pathSegments = location?.pathname?.split("/") || [];
                          const isActive = pathSegments.some((segment: string) =>
                            data?.menuHighlight?.includes(segment)
                          );
                          return data.show ? (
                            <ListItem
                              className="admin-sidebar-listitem"
                              key={data.pathName}
                            >
                              <Link
                                to={data?.pathName}
                                onClick={() => {
                                  if (window.innerWidth < 786) {
                                    props?.setOpen?.(false);
                                  }
                                }}
                                className={
                                  isActive
                                    ? "admin-sidebar-link active"
                                    : "admin-sidebar-link"
                                }
                              >
                                <img
                                  src={data?.icon}
                                  alt={data?.title}
                                  className="admin-sidebar-icons"
                                />
                                <span className="admin-sidebar-link-text">
                                  {data?.title}
                                </span>
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
          </List>
        </Box>
      </Box>
    </Box>
  );
}
