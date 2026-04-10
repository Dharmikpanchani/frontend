import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { roleService } from "../../api/services/role.service";
import toast from "react-hot-toast";

interface RoleState {
  loading: boolean;
  actionLoading: boolean;
  roles: any[];
  allRoles: any[];
  total: number;
  selectedRole: any;
}

const initialState: RoleState = {
  loading: false,
  actionLoading: false,
  roles: [],
  allRoles: [],
  total: 0,
  selectedRole: null,
};

export const getAllRoles = createAsyncThunk(
  "role/getAll",
  async ({ page, perPage, search }: { page: number; perPage: number; search: string }, { rejectWithValue }) => {
    try {
      const res: any = await roleService.getAll(page, perPage, search);
      if (res.status === 200) return res;
      const message = res.message || "Failed to fetch roles";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch roles";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAllRolesSimple = createAsyncThunk(
  "role/getAllSimple",
  async (search: string, { rejectWithValue }) => {
    try {
      const res: any = await roleService.getAllSimple(search);
      if (res.status === 200) return res;
      const message = res.message || "Failed to fetch roles";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch roles";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getRoleById = createAsyncThunk(
  "role/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await roleService.getById(id);
      if (res.status === 200) return res.data;
      const message = res.message || "Failed to fetch role";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch role";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addEditRole = createAsyncThunk(
  "role/addEdit",
  async (payload: object, { rejectWithValue }) => {
    try {
      const res: any = await roleService.addEdit(payload);
      if (res.status === 200 || res.status === 201) {
        toast.success(res?.message || "Saved successfully");
        return res.data;
      }
      toast.error(res?.message || "Failed to save role");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save role";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "role/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await roleService.delete(id);
      if (res.status === 200) {
        toast.success(res?.message || "Deleted successfully");
        return id;
      }
      toast.error(res?.message || "Failed to delete role");
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete role";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);


const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllRoles.pending, (state) => { state.loading = true; })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(getAllRoles.rejected, (state) => { state.loading = false; })

      .addCase(getAllRolesSimple.fulfilled, (state, action) => {
        state.allRoles = action.payload?.data || [];
      })

      .addCase(getRoleById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRole = action.payload;
      })
      .addCase(getRoleById.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addEditRole.pending, (state) => { state.actionLoading = true; })
      .addCase(addEditRole.fulfilled, (state) => { state.actionLoading = false; })
      .addCase(addEditRole.rejected, (state) => { state.actionLoading = false; })

      .addCase(deleteRole.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.roles = state.roles.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state) => { state.actionLoading = false; })
  },
});

export const { clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;
