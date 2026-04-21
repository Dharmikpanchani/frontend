import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Typography, Menu, MenuItem
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { authService } from "@/api/services/auth.service";
import { logoutAdmin, getProfileAdmin } from "@/redux/slices/authSlice";
import Svg from "@/assets/Svg";
import type { RootState } from "@/redux/Store";

// const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;

export default function Header(props: any) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  return (
    <Box
      className={`admin-header-main ${props?.open ? "active" : "admin-header-deactive"}`}
    >
      <Box className="header-flex">
        <Box className="admin-header-left">
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
                    borderRadius: "10px",
                    background: "var(--theme-gradient, var(--primary-color))",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    overflow: "hidden",
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
                    style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#fff', letterSpacing: '0.5px' }}
                  >
                    {adminDetails?.name || "Admin Name"}
                  </Typography>
                  <Typography
                    style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '400' }}
                  >
                    {adminDetails?.email || "admin@example.com"}
                  </Typography>
                </Box>
                <ExpandMore style={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px' }} />
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
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.05)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 33, 71, 0.05)',
                  }
                }
              }
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleClose();
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <img
                  src={Svg.settings}
                  style={{ width: '18px', height: '18px', filter: 'brightness(0) saturate(100%) invert(8%) sepia(87%) saturate(3065%) hue-rotate(200deg) brightness(92%) contrast(106%)' }}
                  alt="Settings"
                />
                Account Settings
              </Box>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleLogOut();
              }}
              sx={{ color: '#d32f2f !important' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <img
                  src={Svg.logout}
                  style={{ width: '18px', height: '18px', filter: 'brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(3000%) hue-rotate(345deg) brightness(95%) contrast(105%)' }}
                  alt="Logout"
                />
                Logout
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
