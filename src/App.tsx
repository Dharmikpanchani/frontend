import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./assets/style/global.css";
import "./assets/style/global.responsive.css";
import { Toaster } from "react-hot-toast";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Router from "./routes";
import { getSubdomain } from "./apps/common/commonJsFunction";
import { getSchoolLogo } from "./redux/slices/schoolSlice";
import { toasterError } from "./utils/toaster/Toaster";
import PageLoader from "./apps/common/loader/PageLoader";
import type { RootState } from "./redux/Store";

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
          zIndex: 'auto !important'
        }
      }
    }
  },
});

function App() {
  const isSubdomain = getSubdomain();
  const dispatch = useDispatch();
  const { loading: schoolLoading } = useSelector((state: RootState) => state.SchoolReducer);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    if (isSubdomain?.isSubdomain) {
      const urlencoded = new URLSearchParams();
      urlencoded.append("schoolCode", isSubdomain.name);
      
      const adminUrl = import.meta.env.VITE_MAIN_URL || "http://localhost:5173";

      dispatch(getSchoolLogo(urlencoded) as any).then((actionResult: any) => {
        if (getSchoolLogo.rejected.match(actionResult)) {
          setIsRedirecting(true);
          const errorMsg = (actionResult.payload as any) || "School domain not found!";
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

  if (isSubdomain?.isSubdomain && (schoolLoading || isRedirecting)) {
    return (
      <ThemeProvider theme={theme}>
        <PageLoader />
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
