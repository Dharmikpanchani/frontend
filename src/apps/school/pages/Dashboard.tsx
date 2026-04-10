import { Box, Typography, Tooltip } from "@mui/material";
import Svg from "../../../assets/Svg";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/rootReducer";

export default function Dashboard() {
  const theme = useSelector((state: RootState) => state.ThemeReducer);
  const isCustomTheme = theme.primaryColor !== "#5c1a1a";
  const [time, setTime] = useState(new Date());

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
      value: "0",
      icon: Svg.userList,
      boxClass: "admin-dashboard-box1",
    },
    {
      title: "Total Teachers",
      value: "0",
      icon: Svg.userList,
      boxClass: "admin-dashboard-box2",
    },
    {
      title: "Attendance Rate",
      value: "0%",
      icon: Svg.dashboard,
      boxClass: "admin-dashboard-box1",
    },
    {
      title: "Active Programs",
      value: "0",
      icon: Svg.cms,
      boxClass: "admin-dashboard-box2",
    },
  ];

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-dashboard-banner" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#fff', fontFamily: 'var(--font-family)' }}>
            School Portal 👋
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-family)' }}>
            School Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family)' }}>
            Manage your school operations
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-family)' }}>
            {formatTime(time)}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family)' }}>
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
                        sx={{ color: isCustomTheme ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}
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
    </Box>
  );
}
