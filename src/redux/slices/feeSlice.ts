import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getFeeCategories,
  addFeeCategory,
  updateFeeCategory,
  deleteFeeCategory,
  getFeeStructures,
  addFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeCollections,
  collectFee,
  getFeeDues,
  sendDueReminder,
  getSchoolSettings,
  updateSchoolSettings,
  getFeeStats,
  updateFeeClearance,
} from "../../api/services/fee.service";

interface FeeState {
  categories: any[];
  structures: any[];
  collections: any[];
  dues: any[];
  settings: any | null;
  stats: any | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: FeeState = {
  categories: [],
  structures: [],
  collections: [],
  dues: [],
  settings: null,
  stats: null,
  loading: false,
  error: null,
  success: false,
};

// --- Clearance Thunk ---
export const clearFeePayment = createAsyncThunk(
  "fee/clearFeePayment",
  async ({ id, status, remarks }: { id: string; status: string; remarks?: string }, { rejectWithValue }) => {
    try {
      const response = await updateFeeClearance(id, { status, remarks });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update fee clearance");
    }
  }
);

// --- Settings Thunks ---
export const fetchSchoolSettings = createAsyncThunk(
  "fee/fetchSchoolSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSchoolSettings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch school settings");
    }
  }
);

export const updateSchoolSettingsAsync = createAsyncThunk(
  "fee/updateSchoolSettings",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await updateSchoolSettings(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update school settings");
    }
  }
);

// --- Category Thunks ---
export const fetchFeeCategories = createAsyncThunk(
  "fee/fetchFeeCategories",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeCategories(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fee categories");
    }
  }
);

export const createFeeCategory = createAsyncThunk(
  "fee/createFeeCategory",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await addFeeCategory(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add fee category");
    }
  }
);

export const editFeeCategory = createAsyncThunk(
  "fee/editFeeCategory",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateFeeCategory(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update fee category");
    }
  }
);

export const removeFeeCategory = createAsyncThunk(
  "fee/removeFeeCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteFeeCategory(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete fee category");
    }
  }
);

// --- Structure Thunks ---
export const fetchFeeStructures = createAsyncThunk(
  "fee/fetchFeeStructures",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeStructures(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fee structures");
    }
  }
);

export const createFeeStructure = createAsyncThunk(
  "fee/createFeeStructure",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await addFeeStructure(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add fee structure");
    }
  }
);

export const editFeeStructure = createAsyncThunk(
  "fee/editFeeStructure",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateFeeStructure(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update fee structure");
    }
  }
);

export const removeFeeStructure = createAsyncThunk(
  "fee/removeFeeStructure",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteFeeStructure(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete fee structure");
    }
  }
);

// --- Collection Thunks ---
export const fetchFeeCollections = createAsyncThunk(
  "fee/fetchFeeCollections",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeCollections(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fee collections");
    }
  }
);

export const collectNewFee = createAsyncThunk(
  "fee/collectNewFee",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await collectFee(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to collect fee");
    }
  }
);

// --- Dues Thunks ---
export const fetchFeeDues = createAsyncThunk(
  "fee/fetchFeeDues",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeDues(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fee dues");
    }
  }
);

export const sendReminder = createAsyncThunk(
  "fee/sendReminder",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await sendDueReminder(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send reminder");
    }
  }
);

// --- Stats Thunks ---
export const fetchFeeStats = createAsyncThunk(
  "fee/fetchFeeStats",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeStats(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch fee stats");
    }
  }
);

const feeSlice = createSlice({
  name: "fee",
  initialState,
  reducers: {
    clearFeeErrors: (state) => {
      state.error = null;
    },
    resetFeeSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSchoolSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchoolSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.data;
      })
      .addCase(fetchSchoolSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Categories
      .addCase(fetchFeeCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeeCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data?.docs || action.payload.data || [];
      })
      .addCase(fetchFeeCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Structures
      .addCase(fetchFeeStructures.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeeStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.structures = action.payload.data?.docs || action.payload.data || [];
      })
      .addCase(fetchFeeStructures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Collections
      .addCase(fetchFeeCollections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeeCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.data?.docs || action.payload.data || [];
      })
      .addCase(fetchFeeCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Dues
      .addCase(fetchFeeDues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeeDues.fulfilled, (state, action) => {
        state.loading = false;
        state.dues = action.payload.data?.dues || action.payload.data?.docs || (Array.isArray(action.payload.data) ? action.payload.data : []);
      })
      .addCase(fetchFeeDues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchFeeStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchFeeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear Fee Payment
      .addCase(clearFeePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearFeePayment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        if (updated) {
          state.collections = state.collections.map((c: any) =>
            c._id === updated._id ? updated : c
          );
        }
      })
      .addCase(clearFeePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFeeErrors, resetFeeSuccess } = feeSlice.actions;

export default feeSlice.reducer;
