import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import toast from "react-hot-toast";

interface TeacherState {
  loading: boolean;
  actionLoading: boolean;
  teachers: any[];
  total: number;
}

const initialState: TeacherState = {
  loading: false,
  actionLoading: false,
  teachers: [],
  total: 0,
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

export const createTeacher = createAsyncThunk(
  "teacher/create",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.createTeacher(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || "Teacher created successfully");
        return res.data;
      }
      toast.error(res.message || "Failed to create teacher");
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
      .addCase(createTeacher.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createTeacher.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createTeacher.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export default teacherSlice.reducer;
