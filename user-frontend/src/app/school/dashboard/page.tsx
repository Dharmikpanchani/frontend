"use client";

import { Box, Typography, Container, Paper, Grid, Card, CardContent } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import { getSubdomain } from "@/utils/commonJsFunction";
import PermissionGuard from "@/components/common/PermissionGuard";
import { schoolAdminPermission } from "@/utils/staticData/StaticArrayData";

export default function SchoolDashboard() {
  const isSubdomain = getSubdomain();
  const { schoolDetails } = useSelector((state: RootState) => state.SchoolReducer);
  const { adminDetails } = useSelector((state: RootState) => state.AuthReducer);

  const themeColor = (schoolDetails as any)?.theme || (schoolDetails as any)?.themeColor || '#5c1a1a';

  return (
    <PermissionGuard permission={schoolAdminPermission.dashboard.read}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', py: 4 }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4, border: '1px solid #e0e0e0' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: themeColor, mb: 1 }}>
              Welcome to {schoolDetails?.schoolName || isSubdomain?.name || "School"} Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Hello, {adminDetails?.name || "Administrator"}! Managed your school activities here.
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            {['Students', 'Teachers', 'Exams', 'Attendance'].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: 'none', '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{item}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: themeColor, my: 1 }}>0</Typography>
                    <Typography variant="body2" color="text.secondary">Total {item}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </PermissionGuard>
  );
}
