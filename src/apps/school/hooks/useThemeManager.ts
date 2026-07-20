import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import Png from "@/assets/Png";

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(
    shorthandRegex,
    (_, r, g, b) => r + r + g + g + b + b,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 0, 0";
};

export const useThemeManager = () => {
  const reduxTheme = useSelector((state: RootState) => state.ThemeReducer);
  const { adminDetails } = useSelector(
    (state: RootState) => state.AdminReducer,
  );
  const { schoolLogo, selectedSchool } = useSelector(
    (state: RootState) => state.SchoolReducer,
  );

  const theme = useMemo(() => {
    return {
      ...(adminDetails?.schoolData?.theme || {}),
      ...reduxTheme,
    };
  }, [reduxTheme, adminDetails?.schoolData?.theme]);

  const themeVariables = useMemo(() => {
    const gradient = `linear-gradient(${theme.gradientDirection || "135deg"}, ${theme.primaryColor} 0%, ${theme.secondaryColor || theme.primaryColor} 100%)`;
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
      // sidebar and header always use the gradient
      "--sidebar-bg": gradient,
      "--sidebar-text": theme.sidebarText,
      "--sidebar-active-bg": theme.sidebarActiveBg,
      "--sidebar-active-text": theme.sidebarActiveText,
      "--header-bg": gradient,
      "--header-text": theme.headerText,
      "--page-bg": theme.pageBg,
      "--card-bg": theme.cardBg,
      "--card-border": theme.cardBorder,
      "--input-bg": theme.inputBg,
      "--input-border": theme.inputBorder,
      "--table-header-bg": theme.tableHeaderBg,
      "--table-row-hover": theme.tableRowHover,
      "--button-bg": gradient,
      "--button-text": theme.buttonText,
      "--button-radius": "6px",
      "--button-border": theme.buttonBorder,
      "--button-hover-bg": gradient,
      "--theme-gradient": gradient,
      "--card-shadow":
        theme.cardShadow === "yes"
          ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
          : "none",
    };
  }, [theme]);

  const themeClasses = useMemo(() => {
    return [
      `font-${theme.fontSize}`,
      `layout-${theme.layoutStyle}`,
      `sidebar-${theme.sidebarStyle}`,
      `table-style-${theme.tableStyle}`,
    ];
  }, [theme]);

  useEffect(() => {
    // Apply variables to body instead of documentElement to avoid affecting developer portal
    const body = document.body;
    Object.entries(themeVariables).forEach(([key, value]) => {
      body.style.setProperty(key, value);
    });

    // Apply classes to body
    const isCustomTheme = true;
    document.body.classList.add("portal-school", ...themeClasses);
    if (isCustomTheme) {
      document.body.classList.add("is-custom-theme");
    } else {
      document.body.classList.remove("is-custom-theme");
    }

    // Update Title and Favicon based on school details
    const schoolName =
      adminDetails?.schoolData?.schoolName || selectedSchool?.schoolName;

    if (schoolName) {
      document.title = `${schoolName} | ${adminDetails?.isLogin ? "Admin" : "Login"}`;
    }

    const updateFaviconLinks = (href: string) => {
      let faviconLinks = document.querySelectorAll("link[rel*='icon']");
      if (faviconLinks.length === 0) {
        const link = document.createElement("link");
        link.rel = "shortcut icon";
        document.head.appendChild(link);
        faviconLinks = document.querySelectorAll("link[rel*='icon']");
      }
      faviconLinks.forEach((link: any) => {
        link.href = href;
      });
    };

    const getFullImageUrl = (path?: string | null) => {
      if (!path) return "";
      if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:") ||
        path.startsWith("blob:")
      ) {
        return path;
      }
      const baseUrl = (import.meta.env.VITE_BASE_URL_IMAGE || "").replace(
        /\/+$/,
        "",
      );
      const cleanPath = path.replace(/^\/+/, "");
      return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
    };

    const setRoundedFavicon = (url: string) => {
      // Step 1: Immediately set direct URL so favicon displays without waiting or CORS issues
      updateFaviconLinks(url);

      // Step 2: Try creating rounded icon canvas enhancement if possible
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      img.onload = () => {
        try {
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

            const dataUrl = canvas.toDataURL("image/png");
            updateFaviconLinks(dataUrl);
          }
        } catch (_err) {
          // Direct URL was already set in step 1
        }
      };
    };

    const rawSchoolLogo =
      adminDetails?.schoolData?.logo ||
      adminDetails?.schoolData?.schoolLogo ||
      selectedSchool?.logo ||
      selectedSchool?.schoolLogo ||
      schoolLogo;

    if (rawSchoolLogo) {
      setRoundedFavicon(getFullImageUrl(rawSchoolLogo));
    } else {
      setRoundedFavicon(Png.logoImg);
    }

    return () => {
      // Clean up on unmount (when leaving school app)
      Object.keys(themeVariables).forEach((key) => {
        document.body.style.removeProperty(key);
      });
      document.body.classList.remove(
        "portal-school",
        "is-custom-theme",
        ...themeClasses,
      );
    };
  }, [themeVariables, themeClasses, adminDetails, schoolLogo, selectedSchool]);

  return {
    themeStyle: themeVariables as React.CSSProperties,
    themeClasses: themeClasses.join(" "),
  };
};
