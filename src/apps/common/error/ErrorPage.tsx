import { Box, Typography, Button, Paper } from "@mui/material";
import { ErrorOutline, Home, Refresh } from "@mui/icons-material";
import { useRouteError, useNavigate } from "react-router-dom";

interface RouteError {
    data?: string;
    statusText?: string;
    message?: string;
}

export default function ErrorPage() {
    const error = useRouteError() as RouteError | null;
    const navigate = useNavigate();

    const errorMessage = error?.data || error?.statusText || error?.message || "An unexpected error occurred.";

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                p: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '16px',
                    maxWidth: '450px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: '1px solid #e5e7eb',
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '14px',
                        backgroundColor: '#fff1f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                    }}
                >
                    <ErrorOutline sx={{ fontSize: 32, color: '#ff4d4f' }} />
                </Box>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: '#111827',
                        mb: 1,
                        fontSize: '1.25rem'
                    }}
                >
                    Unexpected Error Occurred
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: '#6b7280',
                        mb: 3,
                        lineHeight: 1.5,
                        px: 2
                    }}
                >
                    Something went wrong while loading this page. Please try refreshing or return to the dashboard.
                </Typography>

                <Box
                    sx={{
                        p: 1.5,
                        backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                        width: '100%',
                        mb: 3,
                        textAlign: 'left',
                        borderLeft: '3px solid #ff4d4f'
                    }}
                >
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: '#9ca3af', 
                            display: 'block', 
                            mb: 0.5, 
                            fontWeight: 700, 
                            fontSize: '10px', 
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase' 
                        }}
                    >
                        Debug Information
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#374151', 
                            fontFamily: 'monospace', 
                            fontSize: '11px',
                            wordBreak: 'break-all'
                        }}
                    >
                        {errorMessage}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Refresh sx={{ fontSize: '18px !important' }} />}
                        onClick={() => window.location.reload()}
                        sx={{
                            bgcolor: '#ad1e1e',
                            '&:hover': { bgcolor: '#8e1818' },
                            px: 2.5,
                            py: 1,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            fontSize: '13px'
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Home sx={{ fontSize: '18px !important' }} />}
                        onClick={() => navigate("/dashboard")}
                        sx={{
                            color: '#4b5563',
                            borderColor: '#d1d5db',
                            '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                            px: 2.5,
                            py: 1,
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '13px'
                        }}
                    >
                        Dashboard
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
