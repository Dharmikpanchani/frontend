import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import toast from "react-hot-toast";

interface TeacherState {
  loading: boolean;
  actionLoading: boolean;
  teachers: any[];
  total: number;
  pendingTeachers: any[];
  pendingLoading: boolean;
}

const initialState: TeacherState = {
  loading: false,
  actionLoading: false,
  teachers: [],
  total: 0,
  pendingTeachers: [],
  pendingLoading: false,
};

export const getTeachers = createAsyncThunk(
  "teacher/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getTeachers(params);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getPendingTeachers = createAsyncThunk(
  "teacher/getPending",
  async (_, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getPendingTeachers();
      if (res.status === 200) return res.data || [];
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addEditTeacher = createAsyncThunk(
  "teacher/addEdit",
  async ({ payload, id }: { payload: any; id?: string }, { rejectWithValue }) => {
    try {
      const res: any = await masterService.addEditTeacher(payload, id);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || (id ? "Teacher updated successfully" : "Teacher added successfully"));
        return res.data;
      }
      toast.error(res.message || "Operation failed");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const getTeacherById = createAsyncThunk(
  "teacher/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getTeacherById(id);
      if (res.status === 200) return res.data;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const changeTeacherStatus = createAsyncThunk(
  "teacher/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.changeTeacherStatus(id);
      if (res.status === 200) {
        toast.success(res.message || "Teacher status updated");
        return res.data;
      }
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "teacher/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.deleteTeacher(id);
      if (res.status === 200) {
        toast.success(res.message || "Teacher deleted successfully");
        return id;
      }
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTeachers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(getTeachers.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addEditTeacher.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditTeacher.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditTeacher.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(getTeacherById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeacherById.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getTeacherById.rejected, (state) => {
        state.loading = false;
      })

      .addCase(changeTeacherStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeTeacherStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(changeTeacherStatus.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(deleteTeacher.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteTeacher.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteTeacher.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(getPendingTeachers.pending, (state) => {
        state.pendingLoading = true;
      })
      .addCase(getPendingTeachers.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pendingTeachers = action.payload || [];
      })
      .addCase(getPendingTeachers.rejected, (state) => {
        state.pendingLoading = false;
      });
  },
});

export default teacherSlice.reducer;
