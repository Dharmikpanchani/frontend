import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Business as SchoolIcon,
  AlternateEmail as EmailIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon
} from "@mui/icons-material";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Svg from "@/assets/Svg";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import SchoolDetails from "./SchoolDetails";
import ChangeEmail from "./ChangeEmail";
import PlanView from "./PlanView";
import TeacherDocuments from "./TeacherDocuments";

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
  const [value, setValue] = useState(0);
  const { hasPermission } = usePermissions();
  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const showSchoolDetails = hasPermission(schoolAdminPermission.school_profile.read);
  const isTeacher = adminDetails?.userType === "teacher";

  const tabsConfig = [
    {
      label: "Edit Profile",
      icon: <PersonIcon />,
      component: <EditProfile />,
      show: true
    },
    {
      label: "Change Password",
      icon: <LockIcon />,
      component: <ChangePassword />,
      show: true
    },
    {
      label: "School Details",
      icon: <SchoolIcon />,
      component: <SchoolDetails />,
      show: showSchoolDetails
    },
    {
      label: "Change Email",
      icon: <EmailIcon />,
      component: <ChangeEmail />,
      show: true
    },
    {
      label: "My Plan",
      icon: <AssignmentIcon />,
      component: <PlanView />,
      show: showSchoolDetails
    },
    {
      label: "My Documents",
      icon: <DocumentIcon />,
      component: <TeacherDocuments />,
      show: isTeacher
    }
  ].filter(t => t.show);

  return (
    <Box className="admin-dashboard-content admin-edit-profile-containt" sx={{ backgroundColor: "#F8F9FA", minHeight: '100vh', p: { xs: 0, sm: 3 } }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, px: { xs: 2, sm: 0 }, pt: { xs: 2, sm: 0 } }}>
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
          borderRadius: { xs: 0, sm: "12px" },
          p: "0",
          boxShadow: { xs: 'none', sm: '0px 4px 20px rgba(0, 0, 0, 0.05)' },
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "#E9ECEF", px: { xs: 2, sm: "32px" }, pt: "20px" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="account settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
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
                mr: { xs: 2, sm: 5 },
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                whiteSpace: 'nowrap',
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
            {tabsConfig.map((tab, idx) => (
              <Tab
                key={tab.label}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                {...a11yprops(idx)}
                className="admin-tab"
              />
            ))}
          </Tabs>
        </Box>
        {tabsConfig.map((tab, idx) => (
          <TabPanel key={tab.label} value={value} index={idx} className="admin-tabpanel">
            <Box className="admin-tabpanel-main" sx={{ p: { xs: 2, sm: "32px" } }}>
              {tab.component}
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
