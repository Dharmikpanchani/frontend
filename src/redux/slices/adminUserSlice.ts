import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminUserService } from "../../api/services/adminUser.service";
import toast from "react-hot-toast";

interface AdminUserState {
  loading: boolean;
  actionLoading: boolean;
  adminUsers: any[];
  total: number;
  selectedAdminUser: any;
  schoolPagination: any;
}

const initialState: AdminUserState = {
  loading: false,
  actionLoading: false,
  adminUsers: [],
  total: 0,
  selectedAdminUser: null,
  schoolPagination: null,
};

export const getAllAdminUsers = createAsyncThunk(
  "adminUser/getAll",
  async ({ page, perPage, search, role, isActive, isLogin, adminType, isVerified }: { page: number; perPage: number; search: string, role?: string, isActive?: string, isLogin?: string, adminType?: string, isVerified?: string }, { rejectWithValue }) => {
    try {
      const res: any = await adminUserService.getAll(page, perPage, search, role, isActive, isLogin, adminType, isVerified);
      if (res.status === 200) return res;
      const message = res?.message || "Failed to fetch admin users";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch admin users";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminUserById = createAsyncThunk(
  "adminUser/getById",
  async ({ id, params }: { id: string; params?: any }, { rejectWithValue }) => {
    try {
      const res: any = await adminUserService.getById(id, params);
      if (res.status === 200) return res;
      const message = res?.message || "Failed to fetch admin user";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch admin user";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addEditAdminUser = createAsyncThunk(
  "adminUser/addEdit",
  async (payload: URLSearchParams, { rejectWithValue }) => {
    try {
      const res: any = await adminUserService.addEdit(payload);
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

export const deleteAdminUser = createAsyncThunk(
  "adminUser/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await adminUserService.delete(id);
      if (res.status === 200) {
        toast.success(res?.message || "Deleted successfully");
        return id;
      }
      toast.error(res?.message || "Failed to delete admin user");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete admin user";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeAdminUserStatus = createAsyncThunk(
  "adminUser/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await adminUserService.changeStatus(id);
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

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {
    setSelectedAdminUser: (state, action) => {
      state.selectedAdminUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllAdminUsers.pending, (state) => { state.loading = true; })
      .addCase(getAllAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.adminUsers = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(getAllAdminUsers.rejected, (state) => { state.loading = false; })

      .addCase(getAdminUserById.pending, (state) => { state.loading = true; })
      .addCase(getAdminUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAdminUser = action.payload?.data || null;
        state.schoolPagination = action.payload?.pagination || null;
      })
      .addCase(getAdminUserById.rejected, (state) => { state.loading = false; })

      .addCase(addEditAdminUser.pending, (state) => { state.actionLoading = true; })
      .addCase(addEditAdminUser.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(addEditAdminUser.rejected, (state) => { state.actionLoading = false; })

      .addCase(deleteAdminUser.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.adminUsers = state.adminUsers.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteAdminUser.rejected, (state) => { state.actionLoading = false; })

      .addCase(changeAdminUserStatus.pending, (state) => { state.actionLoading = true; })
      .addCase(changeAdminUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const admin = state.adminUsers.find((u) => u._id === action.payload);
        if (admin) {
          admin.isActive = !admin.isActive;
        }
      })
      .addCase(changeAdminUserStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { setSelectedAdminUser } = adminUserSlice.actions;
export default adminUserSlice.reducer;
