"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface PermissionGuardProps {
  permission?: string;
  requiredPermissions?: string[];
  anyPermission?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  permission,
  requiredPermissions,
  anyPermission,
  children,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions();
  const router = useRouter();

  if (loading) return null; // Or a loader

  let allowed = true;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (requiredPermissions) {
    allowed = hasAllPermissions(requiredPermissions);
  } else if (anyPermission) {
    allowed = hasAnyPermission(anyPermission);
  }

  if (!allowed) {
    return fallback || (
      <Box 
        sx={{ 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          p: 3 
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          You don't have permission to view this page.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/login')}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
