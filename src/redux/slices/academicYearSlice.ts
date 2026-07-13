import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AcademicYearState {
  startYear: number;
  endYear: number;
  /** MongoDB _id of the currently viewed year (null = current year) */
  viewingYearId: string | null;
  /** Label of the currently viewed year e.g. "2024-2025" */
  viewingYearLabel: string | null;
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
      const parsed = JSON.parse(saved);
      return {
        startYear: parsed.startYear || getDefaultYear(),
        endYear: parsed.endYear || getDefaultYear(),
        viewingYearId: parsed.viewingYearId || null,
        viewingYearLabel: parsed.viewingYearLabel || null,
      };
    } catch {
      // fall through to default
    }
  }
  const year = getDefaultYear();
  return { startYear: year, endYear: year, viewingYearId: null, viewingYearLabel: null };
};

const academicYearSlice = createSlice({
  name: "academicYear",
  initialState: getInitialState(),
  reducers: {
    setAcademicYear: (state, action: PayloadAction<AcademicYearState>) => {
      state.startYear = action.payload.startYear;
      state.endYear = action.payload.endYear;
      state.viewingYearId = action.payload.viewingYearId ?? null;
      state.viewingYearLabel = action.payload.viewingYearLabel ?? null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startYear: state.startYear,
        endYear: state.endYear,
        viewingYearId: state.viewingYearId,
        viewingYearLabel: state.viewingYearLabel,
      }));
    },
    setViewingYear: (state, action: PayloadAction<{ _id: string; label: string; startYear: number; endYear: number } | null>) => {
      if (action.payload === null) {
        state.viewingYearId = null;
        state.viewingYearLabel = null;
      } else {
        state.viewingYearId = action.payload._id;
        state.viewingYearLabel = action.payload.label;
        state.startYear = action.payload.startYear;
        state.endYear = action.payload.endYear;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startYear: state.startYear,
        endYear: state.endYear,
        viewingYearId: state.viewingYearId,
        viewingYearLabel: state.viewingYearLabel,
      }));
    },
  },
});

export const { setAcademicYear, setViewingYear } = academicYearSlice.actions;
export default academicYearSlice.reducer;
