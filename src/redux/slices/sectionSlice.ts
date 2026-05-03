import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { masterService } from "../../api/services/master.service";
import toast from "react-hot-toast";

interface SectionState {
  loading: boolean;
  actionLoading: boolean;
  sections: any[];
  allSections: any[];
  selectedSection: any | null;
  total: number;
}

const initialState: SectionState = {
  loading: false,
  actionLoading: false,
  sections: [],
  allSections: [],
  selectedSection: null,
  total: 0,
};

export const getSections = createAsyncThunk(
  "section/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getSections(params);
      if (res.status === 200) return res;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getSectionById = createAsyncThunk(
  "section/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await masterService.getSectionById(id);
      if (res.status === 200) return res.data;
      return rejectWithValue(res.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addEditSection = createAsyncThunk(
  "section/addEdit",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await masterService.addEditSection(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(res.message || "Section saved successfully");
        return res.data;
      }
      toast.error(res.message || "Failed to save section");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteSection = createAsyncThunk(
  "section/delete",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res: any = await masterService.deleteSection(id);
      if (res.status === 200) {
        toast.success(res.message || "Section deleted successfully");
        dispatch(getSections({}) as any);
        return id;
      }
      toast.error(res.message || "Failed to delete section");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const changeSectionStatus = createAsyncThunk(
  "section/changeStatus",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const res: any = await masterService.changeSectionStatus(id);
      if (res.status === 200) {
        toast.success(res.message || "Status changed successfully");
        dispatch(getSections({}) as any);
        return id;
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

const sectionSlice = createSlice({
  name: "section",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSections.pending, (state, action) => {
        if ((action.meta.arg as any)?.type !== "filter") {
          state.loading = true;
        }
      })
      .addCase(getSections.fulfilled, (state, action) => {
        state.loading = false;
        if ((action.meta.arg as any)?.type === "filter") {
          state.allSections = action.payload?.data || [];
        } else {
          state.sections = action.payload?.data || [];
          state.total = action.payload?.pagination?.totalArrayLength || 0;
        }
      })
      .addCase(getSections.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSectionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSection = action.payload;
      })
      .addCase(getSectionById.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addEditSection.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditSection.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditSection.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteSection.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteSection.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteSection.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(changeSectionStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeSectionStatus.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(changeSectionStatus.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export default sectionSlice.reducer;
