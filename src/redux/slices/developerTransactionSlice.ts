import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDeveloperTransactions } from "../../api/services/fee.service";

interface DeveloperTransactionState {
  transactions: any[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: DeveloperTransactionState = {
  transactions: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchDeveloperTransactions = createAsyncThunk(
  "developerTransaction/fetchDeveloperTransactions",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getDeveloperTransactions(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch developer transactions"
      );
    }
  }
);

const developerTransactionSlice = createSlice({
  name: "developerTransaction",
  initialState,
  reducers: {
    clearTransactionErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeveloperTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(fetchDeveloperTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionErrors } = developerTransactionSlice.actions;
export default developerTransactionSlice.reducer;
