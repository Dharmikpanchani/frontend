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
  borderRadius: "6px",
  layoutStyle: "comfortable",
  sidebarStyle: "gradient",
  fontFamily: "'Poppins', sans-serif",
  fontSize: "medium",
  tableStyle: "bordered",
  cardShadow: "yes",

  buttonBg: "#5c1a1a",
  buttonText: "#ffffff",
  buttonRadius: "5px",
  buttonBorder: "none",
  buttonHoverBg: "#3a0000",

  textPrimary: "#3a0000",
  textSecondary: "#6b7280",
  textMuted: "#6b728080",
  linkColor: "#9c0000",
  headingColor: "#3a0000",

  sidebarBg: "linear-gradient(180deg, #3d0000 0%, #1a0000 100%)",
  sidebarText: "#ffffff",
  sidebarActiveBg: "#5c1a1a",
  sidebarActiveText: "#ffffff",
  headerBg: "#4E1111",
  headerText: "#ffffff",
  pageBg: "#f7f7f7",
  cardBg: "#ffffff",
  cardBorder: "#d1d5db85",
  inputBg: "#ededed",
  inputBorder: "#d1d5db85",
  tableHeaderBg: "rgba(4, 46, 93, 0.07)",
  tableRowHover: "#f3f4f6",

  primaryColor: "#5c1a1a",
  secondaryColor: "#6b7280",
  successColor: "#46c700",
  errorColor: "#ff0000",
  warningColor: "#ff6200",
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
