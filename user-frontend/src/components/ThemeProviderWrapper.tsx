"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/Store";
import { useEffect, useMemo } from "react";
import { ReactNode } from "react";
import { getSubdomain } from "@/utils/commonJsFunction";
import { getSchoolLogo } from "@/redux/slices/schoolSlice";

const theme = createTheme({
  // We keep MUI theme minimal as most styling is in global.css
  typography: {
    fontFamily: 'var(--font-family, "Poppins", sans-serif)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "var(--button-radius, 5px)",
          textTransform: 'none',
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            background: "var(--theme-gradient, linear-gradient(90deg, #5c1a1a 0%, #3a0000 100%))",
            color: "#ffffff",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              opacity: 0.9,
              background: "var(--theme-gradient, linear-gradient(90deg, #3a0000 0%, #5c1a1a 100%))",
              transform: "translateY(-1px)",
            },
          },
        },
      ],
    },
  },
});

export default function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const isSubdomain = getSubdomain();
  const { schoolDetails, schoolLogo } = useSelector((state: RootState) => state.SchoolReducer);

  // Fetch school details on subdomain visit
  useEffect(() => {
    if (isSubdomain?.isSubdomain && isSubdomain.name) {
      dispatch(getSchoolLogo({ schoolCode: isSubdomain.name }));
    }
  }, [isSubdomain?.isSubdomain, isSubdomain?.name, dispatch]);

  // Apply school colors to CSS variables
  useEffect(() => {
    const themeToApply = (schoolDetails as any)?.theme || (schoolDetails as any)?.themeColor;
    if (themeToApply) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', themeToApply);
      root.style.setProperty('--button-bg', themeToApply);
      root.style.setProperty('--selected-color', themeToApply);
    }
  }, [schoolDetails]);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
