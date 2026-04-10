import { Box, Typography, Tooltip } from "@mui/material";
import Svg from "../../../assets/Svg";
import { useEffect, useState } from "react";

export default function Dashboard() {
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
      title: "Total Users",
      value: "0",
      icon: Svg.userList,
      boxClass: "admin-dashboard-box1",
    },
    {
      title: "Total Revenue",
      value: "0",
      icon: Svg.dashboard,
      boxClass: "admin-dashboard-box2",
    },
    {
      title: "Total Active Agreement",
      value: "0",
      icon: Svg.cms,
      boxClass: "admin-dashboard-box1",
    },
    {
      title: "Total Pending Agreement",
      value: "0",
      icon: Svg.cms,
      boxClass: "admin-dashboard-box2",
    },
    {
      title: "Total Completed Agreement",
      value: "0",
      icon: Svg.cms,
      boxClass: "admin-dashboard-box2",
    },
    {
      title: "Total Rejected Agreement",
      value: "0",
      icon: Svg.cms,
      boxClass: "admin-dashboard-box1",
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
            Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
            School Management Platform
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
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
    </Box>
  );
}
