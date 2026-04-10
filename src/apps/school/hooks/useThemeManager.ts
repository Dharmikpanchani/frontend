import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : "0, 0, 0";
};

export const useThemeManager = () => {
  const theme = useSelector((state: RootState) => state.ThemeReducer);

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

    return () => {
      // Clean up on unmount (when leaving school app)
      Object.keys(themeVariables).forEach((key) => {
        document.body.style.removeProperty(key);
      });
      document.body.classList.remove("portal-school", "is-custom-theme", ...themeClasses);
    };
  }, [themeVariables, themeClasses]);

  return { themeStyle: themeVariables as React.CSSProperties, themeClasses: themeClasses.join(" ") };
};
