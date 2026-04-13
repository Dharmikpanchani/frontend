"use client";

import { Box, Button, Container, Typography, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import { getSubdomain } from "@/utils/commonJsFunction";
import Png from "@/assets/Png";

export default function SchoolLanding() {
  const isSubdomain = getSubdomain();
  const { schoolDetails, loading } = useSelector((state: RootState) => state.SchoolReducer);

  const themeColor = (schoolDetails as any)?.theme || (schoolDetails as any)?.themeColor || '#5c1a1a';
  const schoolLogo = (schoolDetails as any)?.logo;

  if (loading && !schoolDetails) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7f7f7' }}>
        <CircularProgress sx={{ color: themeColor }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `linear-gradient(135deg, #fdfdfd 0%, #f0f0f0 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Background Accents */}
      <Box sx={{ position: 'absolute', top: -150, left: -150, width: 500, height: 500, borderRadius: '50%', background: `${themeColor}15`, filter: 'blur(100px)' }} />
      <Box sx={{ position: 'absolute', bottom: -150, right: -150, width: 500, height: 500, borderRadius: '50%', background: `${themeColor}10`, filter: 'blur(100px)' }} />

      <Container maxWidth="sm">
        <Box 
          sx={{ 
            textAlign: 'center', 
            bgcolor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(20px)', 
            p: { xs: 3, md: 5 }, 
            borderRadius: 5, 
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box 
            component="img" 
            src={schoolLogo ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}/${schoolLogo}` : (typeof Png?.logoImg === 'object' ? Png.logoImg.src : Png?.logoImg)} 
            alt="School Logo" 
            sx={{ width: 'auto', height: 75, mb: 3, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }} 
          />
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#333', 
              fontWeight: 700, 
              mb: 1.5, 
              fontSize: { xs: '1.6rem', md: '2.5rem' },
              textTransform: 'capitalize'
            }}
          >
            Welcome to <span style={{ color: themeColor }}>{schoolDetails?.schoolName || isSubdomain?.name || "Our School"}</span>
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666', 
              mb: 5, 
              fontWeight: 400,
              maxWidth: '500px',
              mx: 'auto',
              lineHeight: 1.5,
              fontSize: '0.95rem'
            }}
          >
            Your complete portal for academic excellence and school administration. Please log in to continue.
          </Typography>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              sx={{ 
                px: 6, 
                py: 1.5, 
                fontSize: '1rem',
                borderRadius: '50px',
                background: themeColor,
                textTransform: 'none',
                boxShadow: `0 10px 20px ${themeColor}30`,
                '&:hover': {
                  background: themeColor,
                  filter: 'brightness(1.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              Log In to Portal
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
