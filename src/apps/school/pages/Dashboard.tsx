import { Box, Typography, Grid, Card } from "@mui/material";
import Svg from "../../../assets/Svg";
import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";

const DashboardBanner = styled(Box)(() => ({
  background: "var(--theme-gradient, linear-gradient(90deg, #002147 0%, #00509d 100%))",
  borderRadius: "24px",
  padding: "40px",
  color: "#ffffff",
  marginBottom: "32px",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 20px 40px -10px rgba(0, 33, 71, 0.3)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
  }
}));

const StatCard = styled(Card)(() => ({
  padding: "24px",
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "var(--card-shadow, 0 10px 30px -5px rgba(0, 0, 0, 0.05))",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 20px 40px -10px rgba(0, 33, 71, 0.15)",
    borderColor: "var(--primary-color)",
  }
}));

const IconWrapper = styled(Box)(({ color }: { color?: string }) => ({
  width: "56px",
  height: "56px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: color || "rgba(0, 33, 71, 0.1)",
  marginBottom: "16px",
  "& img": {
    width: "28px",
    height: "28px",
    filter: "brightness(0) invert(1)",
  }
}));

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
      title: "Total Students",
      value: "1,240",
      icon: Svg.userList,
      color: "linear-gradient(135deg, #002147 0%, #00509d 100%)",
    },
    {
      title: "Total Teachers",
      value: "86",
      icon: Svg.userList,
      color: "linear-gradient(135deg, #f1b000 0%, #d48806 100%)",
    },
    {
      title: "Attendance Rate",
      value: "94%",
      icon: Svg.dashboard,
      color: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
    },
    {
      title: "Active Programs",
      value: "12",
      icon: Svg.cms,
      color: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f8fafc", minHeight: "100%" }}>
      <DashboardBanner>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-1px" }}>
            Welcome back! 👋
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 500, mb: 2 }}>
            VidyaSetu School Management Portal
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ px: 2, py: 0.5, borderRadius: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(5px)" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Academic Year: 2024-25</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
            {formatTime(time)}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
            {formatDate(time)}
          </Typography>
        </Box>
      </DashboardBanner>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard elevation={0}>
              <IconWrapper color={card.color}>
                <img src={card.icon} alt={card.title} />
              </IconWrapper>
              <Typography variant="body2" sx={{ color: "var(--text-secondary)", fontWeight: 600, mb: 0.5 }}>
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--text-primary)" }}>
                {card.value}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "var(--text-primary)" }}>
          Recent Activity
        </Typography>
        <Grid container spacing={3}>
           {/* Placeholders for upcoming sections */}
           <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ p: 4, borderRadius: "20px", minHeight: "300px", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #edf2f7' }}>
                <Typography color="textSecondary">Attendance Overview Chart (Coming Soon)</Typography>
              </Card>
           </Grid>
           <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 4, borderRadius: "20px", minHeight: "300px", display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #edf2f7' }}>
                <Typography color="textSecondary">Upcoming Events (Coming Soon)</Typography>
              </Card>
           </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
