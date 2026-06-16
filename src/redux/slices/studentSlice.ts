import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import { admissionService } from "../../api/services/admission.service";
import toast from "react-hot-toast";

interface studentState {
  loading: boolean;
  actionLoading: boolean;
  students: any[];
  allstudents: any[];
  total: number;
  selectedStudent: any;
  pendingAdmissionsCount: number;
}

const initialState: studentState = {
  loading: false,
  actionLoading: false,
  students: [],
  allstudents: [],
  total: 0,
  selectedStudent: null,
  pendingAdmissionsCount: 0,
};

export const getstudents = createAsyncThunk(
  "student/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getStudents(params);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const addEditStudentAction = createAsyncThunk(
  "student/addEdit",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.addEditStudent(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || "student saved successfully");
        return res;
      }
      toast.error(res.message || "Failed to save student");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const getStudentById = createAsyncThunk(
  "student/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getStudentById(id);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const deleteStudent = createAsyncThunk(
  "student/delete",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res: any = await masterService.deleteStudent(id);
      if (res.status === 200) {
        toast.success(res.message || "student deleted successfully");
        dispatch(getstudents({ page: 1, perPage: 10 }));
        return id;
      }
      toast.error(res.message || "Failed to delete student");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

export const getPendingAdmissionsCount = createAsyncThunk(
  "student/pendingAdmissionsCount",
  async (_, { rejectWithValue }) => {
    try {
      const res: any = await admissionService.getPendingAdmissions({ perPageData: 1 });
      return res?.data?.pagination?.totalArrayLength || 0;
    } catch {
      return 0;
    }
  },
);

export const changeStudentStatus = createAsyncThunk(
  "student/changeStatus",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res: any = await masterService.changeStudentStatus(id);
      if (res.status === 200) {
        toast.success(res.message || "Status updated successfully");
        dispatch(getstudents({ page: 1, perPage: 10 }));
        return res.data;
      }
      toast.error(res.message || "Failed to update status");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearSelectedstudent: (state) => {
      state.selectedStudent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getstudents.pending, (state, action) => {
        if ((action.meta.arg as any)?.type !== "filter") {
          state.loading = true;
        }
      })
      .addCase(getstudents.fulfilled, (state, action) => {
        state.loading = false;
        if ((action.meta.arg as any)?.type === "filter") {
          state.allstudents = action.payload?.data || [];
        } else {
          state.students = action.payload?.data || [];
          state.total = action.payload?.pagination?.totalArrayLength || 0;
        }
      })
      .addCase(getstudents.rejected, (state) => {
        state.loading = false;
      })
      // addEditStudentAction
      .addCase(addEditStudentAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditStudentAction.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditStudentAction.rejected, (state) => {
        state.actionLoading = false;
      })
      // getStudentById
      .addCase(getStudentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStudent = action.payload?.data || null;
      })
      .addCase(getStudentById.rejected, (state) => {
        state.loading = false;
      })
      // deleteStudent
      .addCase(deleteStudent.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteStudent.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteStudent.rejected, (state) => {
        state.actionLoading = false;
      })
      // getPendingAdmissionsCount
      .addCase(getPendingAdmissionsCount.fulfilled, (state, action) => {
        state.pendingAdmissionsCount = action.payload;
      })
      // changeStudentStatus
      .addCase(changeStudentStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeStudentStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(changeStudentStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearSelectedstudent } = studentSlice.actions;
export default studentSlice.reducer;

// Aliases for component imports
export const getStudents = getstudents;
export const addEditStudent = addEditStudentAction;
