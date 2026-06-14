import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./assets/style/global.css";
import "./assets/style/global.responsive.css";
import { Toaster } from "react-hot-toast";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Router from "./routes";
import { Box, Button, Typography } from "@mui/material";
import { getSubdomain } from "./apps/common/commonJsFunction";
import { getSchoolLogo } from "./redux/slices/schoolSlice";
import { toasterError } from "./utils/toaster/Toaster";
import PageLoader from "./apps/common/loader/PageLoader";
import type { RootState } from "./redux/Store";
import { adminApiService } from "./api/client/apiClient";
import { Api } from "./api/EndPoint";

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "var(--font-family, 'PlusJakartaSans', sans-serif)",
      fontWeight: "400",
      lineHeight: "normal",
    },
  },
  palette: {
    primary: {
      main: "#002147", // Updated from maroon to Navy Blue
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "var(--button-radius, 5px)",
        },
        containedPrimary: {
          background: "var(--theme-gradient, var(--button-bg, #002147))",
          color: "var(--button-text, #ffffff)",
          transition: "all 0.3s ease",
          "&:hover": {
            opacity: 0.9,
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        popper: {
          zIndex: "auto !important",
        },
      },
    },
  },
});

function App() {
  const isSubdomain = getSubdomain();
  const dispatch = useDispatch();
  const { loading: schoolLoading } = useSelector(
    (state: RootState) => state.SchoolReducer,
  );
  const { isAdminLogin, token } = useSelector(
    (state: RootState) => state.AdminReducer,
  );
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);

  // Heartbeat ping interval when logged in
  useEffect(() => {
    if (!isAdminLogin || !token) return;

    const sendPing = () => {
      adminApiService.get(Api.PING).catch((err) => {
        console.error("Heartbeat error:", err);
      });
    };

    sendPing();
    const interval = setInterval(sendPing, 2 * 60 * 1000); // every 2 minutes

    return () => clearInterval(interval);
  }, [isAdminLogin, token]);

  useEffect(() => {
    if (isSubdomain?.isSubdomain) {
      const urlencoded = new URLSearchParams();
      urlencoded.append("schoolCode", isSubdomain.name);

      const adminUrl = import.meta.env.VITE_MAIN_URL || "http://localhost:5173";

      dispatch(getSchoolLogo(urlencoded) as any).then((actionResult: any) => {
        if (getSchoolLogo.rejected.match(actionResult)) {
          setIsRedirecting(true);
          const errorMsg =
            (actionResult.payload as any) || "School domain not found!";
          toasterError(errorMsg);
          setTimeout(() => {
            window.location.href = adminUrl;
          }, 2000);
        } else if (getSchoolLogo.fulfilled.match(actionResult)) {
          const logoData = actionResult.payload;
          if (!logoData || (!logoData.logo && !logoData.schoolName)) {
            setIsRedirecting(true);
            toasterError("School details not found!");
            setTimeout(() => {
              window.location.href = adminUrl;
            }, 2000);
          }
        }
      });
    }
  }, []);

  // Safety timer to prevent infinite loading spinner
  useEffect(() => {
    let timer: any;
    const isInitialLoading = !!(isSubdomain?.isSubdomain && (schoolLoading || isRedirecting));
    if (isInitialLoading) {
      timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds safety timeout
    } else {
      setLoadingTimeout(false);
    }
    return () => clearTimeout(timer);
  }, [isSubdomain?.isSubdomain, schoolLoading, isRedirecting]);

  if (isSubdomain?.isSubdomain && (schoolLoading || isRedirecting)) {
    return (
      <ThemeProvider theme={theme}>
        {!loadingTimeout ? (
          <PageLoader />
        ) : (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              backgroundColor: "#fff",
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: "center", p: 3, maxWidth: "400px" }}>
              <Typography variant="h6" color="error" sx={{ mb: 2, fontWeight: 600 }}>
                Connection Timeout
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                The server is taking too long to respond. Please check your internet connection or try again.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{ backgroundColor: "#002147", "&:hover": { backgroundColor: "#002147" } }}
                >
                  Retry
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = import.meta.env.VITE_MAIN_URL || "http://localhost:5173"}
                  sx={{ color: "#002147", borderColor: "#002147", "&:hover": { borderColor: "#002147" } }}
                >
                  Go to Home
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Toaster
          reverseOrder={false}
          containerStyle={{ zIndex: 999999 }}
          toastOptions={{
            duration: 3000,
            style: {
              maxWidth: "unset",
            },
          }}
        />
        <Router />
      </div>
    </ThemeProvider>
  );
}

export default App;
