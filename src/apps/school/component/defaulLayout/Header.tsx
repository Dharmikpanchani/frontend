import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Button, Typography, Menu, MenuItem
} from "@mui/material";
import { ExpandMore, Settings as SettingsIcon, Logout as LogoutIcon, Palette as PaletteIcon } from "@mui/icons-material";
import { authService } from "@/api/services/auth.service";
import { logoutAdmin, getProfileAdmin } from "@/redux/slices/authSlice";
import Svg from "@/assets/Svg";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import type { RootState } from "@/redux/Store";

// const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;

export default function Header(props: any) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGetData = async () => {
    dispatch(getProfileAdmin() as any);
  };



  useEffect(() => {
    handleGetData();
  }, []);

  const handleLogOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API failed", error);
    }
    navigate("/", { replace: true });
    dispatch(logoutAdmin());
    handleClose();
  };

  const isUserPlanPage = location.pathname === '/user-plan';

  return (
    <Box
      className={`admin-header-main ${props?.open ? "active" : "admin-header-deactive"}`}
      sx={{ left: isUserPlanPage ? '0 !important' : undefined, width: isUserPlanPage ? '100% !important' : undefined }}
    >
      <Box className="header-flex">
        <Box className="admin-header-left">
          {!isUserPlanPage && (
            <Box className="admin-header-logo-main">
              <Button
                className="admin-bergur-button"
                onClick={() => {
                  const isOpen = !props?.open;
                  props?.setOpen?.(isOpen);
                  if (window.innerWidth < 1024) {
                    document.body.classList[isOpen ? "add" : "remove"]("admin-body-overflow");
                  }
                }}
                sx={{ minWidth: 'auto', p: 0 }}
              >
                <img
                  src={Svg.bergerMenu}
                  className="berger-menu-icon"
                  alt="toggle menu"
                  style={{ width: '22px', height: 'auto' }}
                />
              </Button>
            </Box>
          )}
        </Box>
        <Box className="admin-header-right">

          <Box className="admin-header-drop-main">
            <Button
              className="admin-drop-header-btn"
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              style={{ textTransform: 'none', padding: '4px 8px', borderRadius: '8px' }}
            >
              <Box className="admin-flex-drop-main" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Box
                  className="avatar-circle"
                  sx={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "5px",
                    background: "var(--primary-color, linear-gradient(135deg, #9c0000 0%, #3a0000 100%))",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "var(--button-text, #fff)",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {adminDetails?.image ? (
                    <img
                      src={import.meta.env.VITE_BASE_URL_IMAGE + "/" + adminDetails.image}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    adminDetails?.name?.charAt(0)?.toUpperCase() || "A"
                  )}
                </Box>
                <Box className="title-admin-drop" sx={{ textAlign: 'left', display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    className="admin-header-drop"
                    style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: 'var(--header-text, #fff)', letterSpacing: '0.5px', fontFamily: 'var(--font-family)' }}
                  >
                    {adminDetails?.name || "Admin Name"}
                  </Typography>
                  <Typography
                    style={{ margin: 0, fontSize: '11px', color: 'var(--header-text, rgba(255, 255, 255, 0.6))', opacity: 0.8, fontWeight: '400', fontFamily: 'var(--font-family)' }}
                  >
                    {adminDetails?.email || "admin@example.com"}
                  </Typography>
                </Box>
                <ExpandMore style={{ color: 'var(--header-text, rgba(255,255,255,0.7))', fontSize: '20px' }} />
              </Box>
            </Button>
          </Box>
          <Menu
            className="admin-drop-header-menu"
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disableScrollLock={true}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 'var(--border-radius, 12px)',
                boxShadow: 'var(--card-shadow, 0 10px 25px rgba(0,0,0,0.15))',
                border: '1px solid var(--card-border, rgba(0,0,0,0.05))',
                backgroundColor: 'var(--card-bg, #fff)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  fontSize: '14px',
                  fontFamily: 'var(--font-family, Poppins, sans-serif)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  '& .MuiSvgIcon-root': {
                    color: 'var(--primary-color)',
                    transition: 'all 0.2s ease',
                  },
                  '&:hover': {
                    backgroundColor: 'var(--primary-color, #9c0000)',
                    color: '#fff !important',
                    '& .MuiSvgIcon-root': {
                      color: '#fff !important',
                    },
                  }
                }
              }
            }}
          >
            {!isUserPlanPage && (
              <>
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    handleClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SettingsIcon sx={{ fontSize: '18px' }} />
                    Account Settings
                  </Box>
                </MenuItem>

                {hasPermission(schoolAdminPermission.theme.read) && (
                  <MenuItem
                    onClick={() => {
                      navigate("/theme-settings");
                      handleClose();
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PaletteIcon sx={{ fontSize: '18px' }} />
                      Theme Settings
                    </Box>
                  </MenuItem>
                )}
              </>
            )}

            <MenuItem
              onClick={() => {
                handleLogOut();
              }}
              sx={{ color: '#d32f2f !important' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LogoutIcon sx={{ fontSize: '18px' }} />
                Logout
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
