import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { faqService } from "../../api/services/faq.service";
import toast from "react-hot-toast";

interface FaqState {
  loading: boolean;
  actionLoading: boolean;
  faqs: any[];
  total: number;
}

const initialState: FaqState = {
  loading: false,
  actionLoading: false,
  faqs: [],
  total: 0,
};

export const getAllFaqs = createAsyncThunk(
  "faq/getAll",
  async ({ page, perPage }: { page: number; perPage: number }, { rejectWithValue }) => {
    try {
      const res: any = await faqService.getAll(page, perPage);
      if (res.status === 200 || res.status === 201) return res.data;
      const message = res.message || "Failed to fetch FAQs";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch FAQs";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addEditFaq = createAsyncThunk(
  "faq/addEdit",
  async (payload: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await faqService.addEdit(payload);
      if (res.status === 200 || res.status === 201) {
        toast.success(res?.message || "Saved successfully");
        return res.data;
      }
      toast.error(res?.message || "Failed to save FAQ");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save FAQ";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteFaq = createAsyncThunk(
  "faq/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await faqService.delete(id);
      if (res.status === 200) {
        toast.success(res?.message || "Deleted successfully");
        return id;
      }
      toast.error(res?.message || "Failed to delete FAQ");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to delete FAQ";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeFaqStatus = createAsyncThunk(
  "faq/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await faqService.changeStatus(id);
      if (res.status === 200) {
        toast.success(res.message || "Status updated");
        return id;
      }
      toast.error(res.message || "Failed to update status");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update status";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllFaqs.pending, (state) => { state.loading = true; })
      .addCase(getAllFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload?.data || [];
        state.total = action.payload?.totalArrayLength || 0;
      })
      .addCase(getAllFaqs.rejected, (state) => { state.loading = false; })

      .addCase(addEditFaq.pending, (state) => { state.actionLoading = true; })
      .addCase(addEditFaq.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(addEditFaq.rejected, (state) => { state.actionLoading = false; })

      .addCase(deleteFaq.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.faqs = state.faqs.filter((f) => f._id !== action.payload);
      })
      .addCase(deleteFaq.rejected, (state) => { state.actionLoading = false; })

      .addCase(changeFaqStatus.pending, (state) => { state.actionLoading = true; })
      .addCase(changeFaqStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const faq = state.faqs.find((f) => f._id === action.payload);
        if (faq) faq.isActive = !faq.isActive;
      })
      .addCase(changeFaqStatus.rejected, (state) => { state.actionLoading = false; });
  },
});

export default faqSlice.reducer;
