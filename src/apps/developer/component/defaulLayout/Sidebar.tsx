import { useLocation, Link } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { developerPermission } from "@/apps/common/StaticArrayData";
import {
  Box, Button, List, ListItem, Collapse
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import Svg from "@/assets/Svg";
import Png from "@/assets/Png";
import { useEffect, useState } from "react";

export default function Sidebar(props: any) {
  const location = useLocation();
  const { hasPermission, hasAnyPermission } = usePermissions();

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

  const roleManagement = [
    {
      title: "Roles",
      pathName: "/role-list",
      icon: Png.roleIcon,
      show: hasPermission(developerPermission.role.read),
      menuHighlight: ["role-list"],
    },
    {
      title: "Admin User",
      pathName: "/admin-list",
      icon: Png.userListIcon,
      show: hasPermission(developerPermission.admin_user.read),
      menuHighlight: ["admin-list"],
    },
  ];

  const checkActive = (menuItems: any[]) => {
    return menuItems.some((item) =>
      item.menuHighlight.includes(location?.pathname?.split("/")[1])
    );
  };

  useEffect(() => {
    if (checkActive(roleManagement)) {
      setOpenRoleManagement(true);
    }
  }, [location.pathname]);

  // show menu with permissions
  const data = [
    {
      title: "Dashboard",
      pathName: "/dashboard",
      icon: Png.dashboardIcon,
      show: hasPermission(developerPermission.dashboard.read),
      menuHighlight: ["dashboard"],
    },
    {
      title: "School List",
      pathName: "/school-list",
      icon: Png.roleIcon, // Using roleIcon as a fallback if schoolIcon doesn't exist
      show: hasPermission(developerPermission.school.read),
      menuHighlight: ["school-list"],
    },
    {
      title: "Plan List",
      pathName: "/plan-list",
      icon: Png.reportsIcon,
      show: hasPermission(developerPermission.plan.read),
      menuHighlight: ["plan-list"],
    }
  ];



  const rolePermission = hasAnyPermission([
    developerPermission.role.read,
    developerPermission.admin_user.read,
  ]);

  return (
    <Box className="admin-sidebar-main">
      <Box className="admin-sidebar-inner-main">
        {/* Logo Section */}
        <Box className="admin-sidebar-logo-main">
          <Link to={"/dashboard"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src={Png.logoImg}
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
                      src={Png.roleIcon}
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

          </List>
        </Box>
      </Box>
    </Box>
  );
}
