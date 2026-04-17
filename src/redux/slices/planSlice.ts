import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { planService } from "../../api/services/plan.service";
import toast from "react-hot-toast";

interface PlanState {
  loading: boolean;
  actionLoading: boolean;
  plans: any[];
  total: number;
  selectedPlan: any;
}

const initialState: PlanState = {
  loading: false,
  actionLoading: false,
  plans: [],
  total: 0,
  selectedPlan: null,
};

export const getAllPlans = createAsyncThunk(
  "plan/getAll",
  async (
    {
      page,
      perPage,
      search,
      filters = {},
    }: {
      page: number;
      perPage: number;
      search: string;
      filters?: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: any = await planService.getAll(page, perPage, search, filters);
      if (res.status === 200) return res;
      const message = res?.message || "Failed to fetch plans";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch plans";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getPlanById = createAsyncThunk(
  "plan/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await planService.getById(id);
      if (res.status === 200) return res.data;
      const message = res?.message || "Failed to fetch plan";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch plan";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addEditPlan = createAsyncThunk(
  "plan/addEdit",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await planService.addEdit(payload);
      if (res.status === 200 || res.status === 201) {
        toast.success(res?.message || "Saved successfully");
        return res.data;
      }
      toast.error(res?.message || "Failed to save");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deletePlan = createAsyncThunk(
  "plan/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await planService.delete(id);
      if (res.status === 200) {
        toast.success(res?.message || "Deleted successfully");
        return id;
      }
      toast.error(res?.message || "Failed to delete plan");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete plan";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePlanStatus = createAsyncThunk(
  "plan/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await planService.changeStatus(id);
      if (res.status === 200) {
        toast.success(res?.message || "Status updated");
        return id;
      }
      toast.error(res?.message || "Failed to update status");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update status";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPlans.pending, (state) => { state.loading = true; })
      .addCase(getAllPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(getAllPlans.rejected, (state) => { state.loading = false; })

      .addCase(getPlanById.pending, (state) => { state.loading = true; })
      .addCase(getPlanById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(getPlanById.rejected, (state) => { state.loading = false; })

      .addCase(addEditPlan.pending, (state) => { state.actionLoading = true; })
      .addCase(addEditPlan.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(addEditPlan.rejected, (state) => { state.actionLoading = false; })

      .addCase(deletePlan.pending, (state) => { state.actionLoading = true; })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.plans = state.plans.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePlan.rejected, (state) => { state.actionLoading = false; })

      .addCase(changePlanStatus.pending, (state) => { state.actionLoading = true; })
      .addCase(changePlanStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const plan = state.plans.find((p) => p._id === action.payload);
        if (plan) {
          plan.isActive = !plan.isActive;
        }
      })
      .addCase(changePlanStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearSelectedPlan } = planSlice.actions;
export default planSlice.reducer;
