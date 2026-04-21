import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { schoolService } from "@/api/services/school.service";
import { getProfileAdmin, loginAdmin, verifyOtpAdmin } from "./authSlice";
import { getSchoolLogo } from "./schoolSlice";
import toast from "react-hot-toast";

export interface ThemeState {
  borderRadius: string;
  layoutStyle: "compact" | "comfortable";
  sidebarStyle: "light" | "dark" | "gradient";
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  tableStyle: "bordered" | "clean";
  cardShadow: "yes" | "no";

  buttonBg: string;
  buttonText: string;
  buttonRadius: string;
  buttonBorder: string;
  buttonHoverBg: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  linkColor: string;
  headingColor: string;

  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  headerBg: string;
  headerText: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  tableHeaderBg: string;
  tableRowHover: string;

  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
}

const defaultTheme: ThemeState = {
  borderRadius: "12px",
  layoutStyle: "comfortable",
  sidebarStyle: "gradient",
  fontFamily: "'Poppins', sans-serif",
  fontSize: "medium",
  tableStyle: "bordered",
  cardShadow: "yes",

  buttonBg: "#002147",
  buttonText: "#ffffff",
  buttonRadius: "8px",
  buttonBorder: "none",
  buttonHoverBg: "#00509d",

  textPrimary: "#002147",
  textSecondary: "#6b7280",
  textMuted: "#6b728080",
  linkColor: "#00509d",
  headingColor: "#002147",

  sidebarBg: "linear-gradient(180deg, #002147 0%, #001529 100%)",
  sidebarText: "#ffffff",
  sidebarActiveBg: "#00509d",
  sidebarActiveText: "#ffffff",
  headerBg: "#002147",
  headerText: "#ffffff",
  pageBg: "#f7f7f7",
  cardBg: "#ffffff",
  cardBorder: "#d1d5db85",
  inputBg: "#ffffff",
  inputBorder: "#d1d5db85",
  tableHeaderBg: "rgba(0, 33, 71, 0.05)",
  tableRowHover: "#f3f4f6",

  primaryColor: "#002147",
  secondaryColor: "#00509d",
  successColor: "#46c700",
  errorColor: "#ff0000",
  warningColor: "#f1b000",
  infoColor: "#0daeff",
};

const getInitialState = (): ThemeState => {
  const savedTheme = localStorage.getItem("school-theme-settings");
  if (savedTheme) {
    try {
      return { ...defaultTheme, ...JSON.parse(savedTheme) };
    } catch (e) {
      return defaultTheme;
    }
  }
  return defaultTheme;
};

export const persistTheme = createAsyncThunk(
  "theme/persistTheme",
  async (themeData: Partial<ThemeState>, { rejectWithValue }) => {
    try {
      const res: any = await schoolService.updateSchoolTheme(themeData);
      if (res.status === 200 || res.status === 201) {
        return res.data;
      }
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState: getInitialState(),
  reducers: {
    updateTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      return { ...state, ...action.payload };
    },
    saveTheme: (state) => {
      localStorage.setItem("school-theme-settings", JSON.stringify(state));
    },
    resetTheme: () => {
      localStorage.removeItem("school-theme-settings");
      return defaultTheme;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(persistTheme.fulfilled, (state) => {
        localStorage.setItem("school-theme-settings", JSON.stringify(state));
        toast.success("Theme settings saved successfully");
      })
      .addCase(persistTheme.rejected, (_, action) => {
        toast.error((action.payload as string) || "Failed to save theme");
      })
      .addMatcher(
        (action) =>
          [
            getProfileAdmin.fulfilled.type,
            loginAdmin.fulfilled.type,
            verifyOtpAdmin.fulfilled.type,
            getSchoolLogo.fulfilled.type,
          ].includes(action.type),
        (state, action: any) => {
          const schoolData = action.payload?.schoolData;
          const themeFromLogo = action.payload?.theme;
          const themeToApply = schoolData?.theme || themeFromLogo;

          if (themeToApply) {
            const backendTheme = themeToApply;
            // Map backend theme to frontend state if names differ, here they match mostly
            const newTheme = { ...state, ...backendTheme };
            localStorage.setItem("school-theme-settings", JSON.stringify(newTheme));
            return newTheme;
          }
        }
      );
  },
});

export const { updateTheme, resetTheme, saveTheme } = themeSlice.actions;
export default themeSlice.reducer;
