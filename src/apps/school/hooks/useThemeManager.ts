import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import Png from "@/assets/Png";

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 0, 0";
};

export const useThemeManager = () => {
  const reduxTheme = useSelector((state: RootState) => state.ThemeReducer);
  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);
  const { schoolLogo, selectedSchool } = useSelector((state: RootState) => state.SchoolReducer);

  // Prioritize theme from adminDetails (backend response) over redux initial state
  const theme = useMemo(() => {
    return {
      ...reduxTheme,
      ...(adminDetails?.schoolData?.theme || {})
    };
  }, [reduxTheme, adminDetails?.schoolData?.theme]);

  const themeVariables = useMemo(() => {
    return {
      "--border-radius": theme.borderRadius,
      "--font-family": theme.fontFamily,
      "--primary-color": theme.primaryColor,
      "--primary-color-rgb": hexToRgb(theme.primaryColor),
      "--selected-color": theme.primaryColor,
      "--secondary-color": theme.secondaryColor,
      "--secondary-color-rgb": hexToRgb(theme.secondaryColor),
      "--success-color": theme.successColor,
      "--error-color": theme.errorColor,
      "--warning-color": theme.warningColor,
      "--info-color": theme.infoColor,
      "--text-primary": theme.textPrimary,
      "--text-secondary": theme.textSecondary,
      "--text-muted": theme.textMuted,
      "--link-color": theme.linkColor,
      "--heading-color": theme.headingColor,
      "--sidebar-bg": theme.sidebarBg,
      "--sidebar-text": theme.sidebarText,
      "--sidebar-active-bg": theme.sidebarActiveBg,
      "--sidebar-active-text": theme.sidebarActiveText,
      "--header-bg": theme.headerBg,
      "--header-text": theme.headerText,
      "--page-bg": theme.pageBg,
      "--card-bg": theme.cardBg,
      "--card-border": theme.cardBorder,
      "--input-bg": theme.inputBg,
      "--input-border": theme.inputBorder,
      "--table-header-bg": theme.tableHeaderBg,
      "--table-row-hover": theme.tableRowHover,
      "--button-bg": theme.buttonBg,
      "--button-text": theme.buttonText,
      "--button-radius": theme.buttonRadius,
      "--button-border": theme.buttonBorder,
      "--button-hover-bg": theme.buttonHoverBg,
      "--theme-gradient": `linear-gradient(45deg, ${theme.primaryColor} 30%, ${theme.secondaryColor || theme.primaryColor} 90%)`,
      "--card-shadow": theme.cardShadow === "yes"
        ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
        : "none",
    };
  }, [theme]);

  const themeClasses = useMemo(() => {
    return [
      `font-${theme.fontSize}`,
      `layout-${theme.layoutStyle}`,
      `sidebar-${theme.sidebarStyle}`,
      `table-style-${theme.tableStyle}`
    ];
  }, [theme]);

  useEffect(() => {
    // Apply variables to body instead of documentElement to avoid affecting developer portal
    const body = document.body;
    Object.entries(themeVariables).forEach(([key, value]) => {
      body.style.setProperty(key, value);
    });

    // Apply classes to body
    const isCustomTheme = theme.primaryColor !== "#5c1a1a";
    document.body.classList.add("portal-school", ...themeClasses);
    if (isCustomTheme) {
      document.body.classList.add("is-custom-theme");
    } else {
      document.body.classList.remove("is-custom-theme");
    }

    // Update Title and Favicon based on school details
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    const schoolName = adminDetails?.schoolData?.schoolName || selectedSchool?.schoolName;

    // Store original title and favicon to restore on unmount
    const originalTitle = document.title;

    if (schoolName) {
      document.title = `${schoolName} | ${adminDetails?.isLogin ? 'Admin' : 'Login'}`;
    }

    const setRoundedFavicon = (url: string) => {
      const drawFavicon = (imgSrc: string, withCors: boolean) => {
        const img = new Image();
        if (withCors) {
          img.crossOrigin = "anonymous";
        }
        img.src = imgSrc;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 128;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, size, size);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            const radius = 32;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(size - radius, 0);
            ctx.quadraticCurveTo(size, 0, size, radius);
            ctx.lineTo(size, size - radius);
            ctx.quadraticCurveTo(size, size, size - radius, size);
            ctx.lineTo(radius, size);
            ctx.quadraticCurveTo(0, size, 0, size - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();

            const scale = Math.min(size / img.width, size / img.height);
            const x = (size - img.width * scale) / 2;
            const y = (size - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            try {
              const dataUrl = canvas.toDataURL("image/png");
              const faviconLinks = document.querySelectorAll("link[rel*='icon']");
              faviconLinks.forEach((link: any) => {
                link.href = dataUrl;
              });
            } catch (_err) {
              if (withCors) {
                // CORS blocked — retry WITHOUT crossOrigin (no rounding but image shows)
                drawFavicon(imgSrc, false);
              }
            }
          }
        };

        img.onerror = () => {
          if (withCors) {
            // Image failed with CORS header — retry without it
            drawFavicon(imgSrc, false);
          }
        };
      };

      drawFavicon(url, true);
    };

    const schoolLogoUrl = adminDetails?.schoolData?.logo || schoolLogo;

    if (favicon) {
      if (schoolLogoUrl) {
        setRoundedFavicon(`${import.meta.env.VITE_BASE_URL_IMAGE}/${schoolLogoUrl}`);
      } else {
        setRoundedFavicon(Png.logoImg);
      }
    }

    return () => {
      // Clean up on unmount (when leaving school app)
      Object.keys(themeVariables).forEach((key) => {
        document.body.style.removeProperty(key);
      });
      document.body.classList.remove("portal-school", "is-custom-theme", ...themeClasses);

      // Restore original title and favicon
      document.title = originalTitle;
      const faviconLinks = document.querySelectorAll("link[rel*='icon']");
      faviconLinks.forEach((link: any) => {
        link.href = "/src/assets/images/svg/logo.svg";
      });
    };
  }, [themeVariables, themeClasses, adminDetails, schoolLogo, selectedSchool]);

  return { themeStyle: themeVariables as React.CSSProperties, themeClasses: themeClasses.join(" ") };
};
