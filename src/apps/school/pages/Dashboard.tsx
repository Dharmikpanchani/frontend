import { Box, Typography, Tooltip } from "@mui/material";
import Svg from "../../../assets/Svg";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const cards = [
    {
      title: "Total Students",
      value: "1,240",
      icon: Svg.userList,
    },
    {
      title: "Total Teachers",
      value: "86",
      icon: Svg.userList,
    },
    {
      title: "Attendance Rate",
      value: "94%",
      icon: Svg.dashboard,
    },
    {
      title: "Active Programs",
      value: "12",
      icon: Svg.cms,
    },
  ];

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-dashboard-banner" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back 👋
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 600 }}>
            {adminDetails?.schoolData?.schoolName || "VidyaSetu School"} Portal
          </Typography>
          <Box sx={{ mt: 1.5, display: 'inline-block', px: 2, py: 0.5, borderRadius: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Academic Year: 2024-25</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {formatTime(time)}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {formatDate(time)}
          </Typography>
        </Box>
      </Box>

      <Box className="admin-dashboad-row">
        <Box className="admin-dash-card-row">
          {cards.map((card, index) => (
            <Box className="grid-column" key={index}>
              <Box
                className={`admin-dashboard-box common-card admin-dashboard-box${index + 1}`}
              >
                <Box className="admin-dashboard-inner-box">
                  <Box className="admin-dash-left">
                    <Tooltip
                      title={card.title}
                      arrow
                      placement="bottom"
                      className="admin-tooltip"
                    >
                      <Typography
                        className="admin-dash-text"
                        component="p"
                      >
                        {card.title}
                      </Typography>
                    </Tooltip>
                    <Typography
                      className="admin-dash-price"
                      variant="h1"
                      component="h1"
                      sx={{ fontSize: '24px !important', fontWeight: 700 }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box className="admin-dash-right">
                    <Box
                      className="admin-dash-icon-box"
                      sx={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      <img
                        src={card.icon}
                        className="admin-dash-icons"
                        alt="dashboard icon"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* placeholder for upcoming analytical sections */}
      <Box sx={{ mt: 5 }}>
        <Box className="table-title-main" sx={{ mb: 3 }}>
          <Typography variant="h5" className="table-title-name">
            Recent Activity
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            <Box className="common-card" sx={{ p: 4, minHeight: "300px", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #edf2f7' }}>
                <Typography color="textSecondary">Attendance Overview Chart (Coming Soon)</Typography>
            </Box>
            <Box className="common-card" sx={{ p: 4, minHeight: "300px", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #edf2f7' }}>
                <Typography color="textSecondary">Upcoming Events (Coming Soon)</Typography>
            </Box>
        </Box>
      </Box>
    </Box>
  );
}
