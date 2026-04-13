"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import Png from "@/assets/Png";

export default function DeveloperLanding() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0000 0%, #3a0000 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Blur Circles */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(92, 26, 26, 0.2)', filter: 'blur(80px)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(92, 26, 26, 0.1)', filter: 'blur(80px)' }} />

      <Container maxWidth="sm">
        <Box 
          sx={{ 
            textAlign: 'center', 
            bgcolor: 'rgba(255, 255, 255, 0.03)', 
            backdropFilter: 'blur(10px)', 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4, 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Box 
            component="img" 
            src={typeof Png?.logoImg === 'object' ? Png.logoImg.src : Png?.logoImg} 
            alt="Developer Logo" 
            sx={{ width: 'auto', height: 60, mb: 3 }} 
          />
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#fff', 
              fontWeight: 700, 
              mb: 1.5, 
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              letterSpacing: '-0.5px'
            }}
          >
            Welcome to <span style={{ color: '#ff4d4d' }}>Developer</span> Portal
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              mb: 4, 
              fontWeight: 400,
              maxWidth: '500px',
              mx: 'auto',
              fontSize: '0.95rem'
            }}
          >
            Empower your school management with our advanced developer tools and integrations.
          </Typography>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              sx={{ 
                px: 5, 
                py: 1.5, 
                fontSize: '1rem',
                borderRadius: '50px',
                background: 'linear-gradient(90deg, #5c1a1a 0%, #ad1e1e 100%)',
                boxShadow: '0 10px 20px rgba(92, 26, 26, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(90deg, #ad1e1e 0%, #5c1a1a 100%)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s'
              }}
            >
              Login to Console
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
