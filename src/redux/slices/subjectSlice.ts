import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import toast from "react-hot-toast";

interface SubjectState {
  loading: boolean;
  actionLoading: boolean;
  subjects: any[];
  total: number;
  selectedSubject: any;
}

const initialState: SubjectState = {
  loading: false,
  actionLoading: false,
  subjects: [],
  total: 0,
  selectedSubject: null,
};

export const getSubjects = createAsyncThunk(
  "subject/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getSubjects(params);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addEditSubjectAction = createAsyncThunk(
  "subject/addEdit",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.addEditSubject(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || "Subject saved successfully");
        return res;
      }
      toast.error(res.message || "Failed to save subject");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteSubject = createAsyncThunk(
  "subject/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.deleteSubject(id);
      if (res.status === 200) {
        toast.success(res.message || "Subject deleted successfully");
        return id;
      }
      toast.error(res.message || "Failed to delete subject");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const getSubjectById = createAsyncThunk(
  "subject/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getSubjectById(id);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const changeSubjectStatus = createAsyncThunk(
  "subject/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.changeSubjectStatus(id);
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

const subjectSlice = createSlice({
  name: "subject",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(getSubjects.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addEditSubjectAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditSubjectAction.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditSubjectAction.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteSubject.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.subjects = state.subjects.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSubject.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(getSubjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubject = action.payload?.data || null;
      })
      .addCase(getSubjectById.rejected, (state) => {
        state.loading = false;
      })
      .addCase(changeSubjectStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeSubjectStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { id, data } = action.payload;
        if (data && data._id) {
          state.subjects = state.subjects.map((s) =>
            s._id === data._id ? data : s
          );
        } else {
          const subject = state.subjects.find((s) => s._id === id);
          if (subject) {
            subject.isActive = !subject.isActive;
          }
        }
      })
      .addCase(changeSubjectStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export default subjectSlice.reducer;
