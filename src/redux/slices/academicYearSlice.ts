import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AcademicYearState {
  startYear: number;
  endYear: number;
}

const STORAGE_KEY = "academic-year-filter";

const getDefaultYear = (): number => {
  const now = new Date();
  const month = now.getMonth() + 1;
  return month >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

const getInitialState = (): AcademicYearState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fall through to default
    }
  }
  const year = getDefaultYear();
  return { startYear: year, endYear: year };
};

const academicYearSlice = createSlice({
  name: "academicYear",
  initialState: getInitialState(),
  reducers: {
    setAcademicYear: (state, action: PayloadAction<AcademicYearState>) => {
      state.startYear = action.payload.startYear;
      state.endYear = action.payload.endYear;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
  },
});

export const { setAcademicYear } = academicYearSlice.actions;
export default academicYearSlice.reducer;
