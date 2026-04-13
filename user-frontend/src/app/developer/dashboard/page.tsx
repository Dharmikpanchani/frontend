"use client";

import { Box, Typography, Container, Paper, Grid, Card, CardContent, Button } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import PermissionGuard from "@/components/common/PermissionGuard";
import { developerPermission } from "@/utils/staticData/StaticArrayData";

export default function DeveloperDashboard() {
  const { adminDetails } = useSelector((state: RootState) => state.AuthReducer);

  return (
    <PermissionGuard permission={developerPermission.dashboard.read}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#111', color: '#fff', py: 4 }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4, bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff4d4d', mb: 1 }}>
              Developer Control Center
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Welcome back, {adminDetails?.name || "Developer"}. Access your school management APIs and tools.
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            {['Active Schools', 'API Usage', 'Errors', 'System Status'].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card sx={{ bgcolor: '#1a1a1a', borderRadius: 3, border: '1px solid #333', color: '#fff' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{item}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#ff4d4d', my: 1 }}>
                      {item === 'System Status' ? '99%' : '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>Last 24 hours</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" color="inherit" sx={{ borderRadius: '50px', px: 4 }}>
              Generate New API Key
            </Button>
          </Box>
        </Container>
      </Box>
    </PermissionGuard>
  );
}
