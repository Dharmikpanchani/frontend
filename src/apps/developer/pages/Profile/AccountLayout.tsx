import React from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  AlternateEmail as EmailIcon,
} from "@mui/icons-material";
import Svg from "@/assets/Svg";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import ChangeEmail from "./ChangeEmail";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, className, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      className={`${className} ${value !== index ? "hidden" : ""}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

function a11yprops(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function AccountLayout() {
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className="admin-dashboard-content admin-edit-profile-containt" sx={{ backgroundColor: "#F8F9FA", minHeight: '100vh', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 35,
            height: 35,
            backgroundColor: 'var(--primary-color)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 12px var(--divider-color, rgba(0,0,0,0.1))'
          }}
        >
          <img src={Svg.settings} style={{ width: 18, filter: 'brightness(0) invert(1)' }} alt="settings" />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#344054",
              fontFamily: "'PlusJakartaSans-Bold', sans-serif",
              lineHeight: 1.2
            }}
          >
            Account Settings
          </Typography>
          <Typography
            sx={{
              fontSize: "12px",
              color: "#667085",
              fontFamily: "'PlusJakartaSans-Medium', sans-serif"
            }}
          >
            Manage your profile and security
          </Typography>
        </Box>
      </Box>

      <Box
        className="admin-tabs-main-box"
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          p: "0",
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "#E9ECEF", px: "32px", pt: "20px" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="account settings tabs"
            className="admin-tabs-main"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--primary-color)',
                height: '2px',
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 600,
                minHeight: '48px',
                color: '#667085',
                px: 0,
                mr: 5,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                  marginBottom: '0 !important',
                },
                '&.Mui-selected': {
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  backgroundColor: 'transparent',
                },
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="Edit Profile"
              {...a11yprops(0)}
              className="admin-tab"
            />
            <Tab
              icon={<LockIcon />}
              iconPosition="start"
              label="Change Password"
              {...a11yprops(1)}
              className="admin-tab"
            />
            <Tab
              icon={<EmailIcon />}
              iconPosition="start"
              label="Change Email"
              {...a11yprops(2)}
              className="admin-tab"
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0} className="admin-tabpanel">
          <Box className="admin-tabpanel-main" sx={{ p: "32px" }}>
            <EditProfile />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1} className="admin-tabpanel">
          <Box className="admin-tabpanel-main" sx={{ p: "32px" }}>
            <ChangePassword />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={2} className="admin-tabpanel">
          <Box className="admin-tabpanel-main" sx={{ p: "32px" }}>
            <ChangeEmail />
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
}
