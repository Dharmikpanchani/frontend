import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import toast from "react-hot-toast";

interface DepartmentState {
  loading: boolean;
  actionLoading: boolean;
  departments: any[];
  allDepartments: any[];
  total: number;
  selectedDepartment: any;
}

const initialState: DepartmentState = {
  loading: false,
  actionLoading: false,
  departments: [],
  allDepartments: [],
  total: 0,
  selectedDepartment: null,
};

export const getDepartments = createAsyncThunk(
  "department/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getDepartments(params);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addEditDepartmentAction = createAsyncThunk(
  "department/addEdit",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.addEditDepartment(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || "Department saved successfully");
        return res;
      }
      toast.error(res.message || "Failed to save department");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.deleteDepartment(id);
      if (res.status === 200) {
        toast.success(res.message || "Department deleted successfully");
        return id;
      }
      toast.error(res.message || "Failed to delete department");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const getDepartmentById = createAsyncThunk(
  "department/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getDepartmentById(id);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const changeDepartmentStatus = createAsyncThunk(
  "department/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.changeDepartmentStatus(id);
      if (res.status === 200) {
        toast.success(res.message || "Status changed successfully");
        return { id, data: res.data };
      }
      toast.error(res.message || "Failed to change status");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDepartments.pending, (state, action) => {
        if ((action.meta.arg as any)?.type !== "filter") {
          state.loading = true;
        }
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.loading = false;
        if ((action.meta.arg as any)?.type === "filter") {
          state.allDepartments = action.payload?.data || [];
        } else {
          state.departments = action.payload?.data || [];
          state.total = action.payload?.pagination?.totalArrayLength || 0;
        }
      })
      .addCase(getDepartments.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addEditDepartmentAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditDepartmentAction.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditDepartmentAction.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.departments = state.departments.filter((d) => d._id !== action.payload);
      })
      .addCase(deleteDepartment.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(getDepartmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDepartment = action.payload?.data || null;
      })
      .addCase(getDepartmentById.rejected, (state) => {
        state.loading = false;
      })
      .addCase(changeDepartmentStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeDepartmentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, data } = action.payload;
        if (data && data._id) {
          state.departments = state.departments.map((d) =>
            d._id === data._id ? data : d
          );
        } else {
          const dept = state.departments.find((d) => d._id === id);
          if (dept) {
            dept.isActive = !dept.isActive;
          }
        }
      })
      .addCase(changeDepartmentStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export default departmentSlice.reducer;
