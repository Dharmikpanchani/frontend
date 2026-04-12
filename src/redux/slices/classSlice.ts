import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import toast from "react-hot-toast";

interface ClassState {
  loading: boolean;
  actionLoading: boolean;
  classes: any[];
  allClasses: any[];
  total: number;
  selectedClass: any;
}

const initialState: ClassState = {
  loading: false,
  actionLoading: false,
  classes: [],
  allClasses: [],
  total: 0,
  selectedClass: null,
};

export const getClasses = createAsyncThunk(
  "class/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getClasses(params);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addEditClassAction = createAsyncThunk(
  "class/addEdit",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.addEditClass(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || "Class saved successfully");
        return res;
      }
      toast.error(res.message || "Failed to save class");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const getClassById = createAsyncThunk(
  "class/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getClassById(id);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteClass = createAsyncThunk(
  "class/delete",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res: any = await masterService.deleteClass(id);
      if (res.status === 200) {
        toast.success(res.message || "Class deleted successfully");
        dispatch(getClasses({ page: 1, perPage: 10 }));
        return id;
      }
      toast.error(res.message || "Failed to delete class");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const changeClassStatus = createAsyncThunk(
  "class/changeStatus",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res: any = await masterService.changeClassStatus(id);
      if (res.status === 200) {
        toast.success(res.message || "Status updated successfully");
        dispatch(getClasses({ page: 1, perPage: 10 }));
        return res.data;
      }
      toast.error(res.message || "Failed to update status");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const classSlice = createSlice({
  name: "class",
  initialState,
  reducers: {
    clearSelectedClass: (state) => {
      state.selectedClass = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClasses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getClasses.fulfilled, (state, action) => {
        state.loading = false;
        if ((action.meta.arg as any)?.type === "filter") {
          state.allClasses = action.payload?.data || [];
        } else {
          state.classes = action.payload?.data || [];
          state.total = action.payload?.pagination?.totalArrayLength || 0;
        }
      })
      .addCase(getClasses.rejected, (state) => {
        state.loading = false;
      })
      // addEditClassAction
      .addCase(addEditClassAction.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditClassAction.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditClassAction.rejected, (state) => {
        state.actionLoading = false;
      })
      // getClassById
      .addCase(getClassById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getClassById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClass = action.payload?.data || null;
      })
      .addCase(getClassById.rejected, (state) => {
        state.loading = false;
      })
      // deleteClass
      .addCase(deleteClass.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteClass.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteClass.rejected, (state) => {
        state.actionLoading = false;
      })
      // changeClassStatus
      .addCase(changeClassStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeClassStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(changeClassStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearSelectedClass } = classSlice.actions;
export default classSlice.reducer;
