import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../../api/services/user.service";
import toast from "react-hot-toast";

interface UserState {
  loading: boolean;
  actionLoading: boolean;
  users: any[];
  total: number;
}

const initialState: UserState = {
  loading: false,
  actionLoading: false,
  users: [],
  total: 0,
};

export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async ({ page, perPage, search, status, zodiacSign, startDate, endDate }: { page: number; perPage: number; search: string, status?: string, zodiacSign?: string, startDate?: string, endDate?: string }, { rejectWithValue }) => {
    try {
      const res: any = await userService.getAll(page, perPage, search, status, zodiacSign, startDate, endDate);
      if (res.status === 200) return res.data;
      const message = res.message || "Failed to fetch users";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch users";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await userService.delete(id);
      if (res.status === 200) {
        toast.success(res?.message || "User deleted successfully");
        return id;
      }
      toast.error(res?.message || "Failed to delete user");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err?.message || "Failed to delete user";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeUserStatus = createAsyncThunk(
  "user/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await userService.changeStatus(id);
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => { state.loading = true; })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.data || [];
        state.total = action.payload?.totalArrayLength || 0;
      })
      .addCase(getAllUsers.rejected, (state) => { state.loading = false; })

      .addCase(deleteUser.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state) => { state.actionLoading = false; })

      .addCase(changeUserStatus.pending, (state) => { state.actionLoading = true; })
      .addCase(changeUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const user = state.users.find((u) => u._id === action.payload);
        if (user) user.isActive = !user.isActive;
      })
      .addCase(changeUserStatus.rejected, (state) => { state.actionLoading = false; });
  },
});

export default userSlice.reducer;
