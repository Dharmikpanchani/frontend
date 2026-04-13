import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { schoolService } from "../../api/services/school.service";
import toast from "react-hot-toast";

interface SchoolState {
  loading: boolean;
  actionLoading: boolean;
  schools: any[];
  total: number;
  selectedSchool: any;
  schoolLogo: string;
  schoolDetails: any;
}

const initialState: SchoolState = {
  loading: false,
  actionLoading: false,
  schools: [],
  total: 0,
  selectedSchool: null,
  schoolLogo: "",
  schoolDetails: null,
};

export const getAllSchools = createAsyncThunk(
  "school/getAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const res: any = await schoolService.getAll(params);
      if (res.status === 200) return res;
      const message = res?.message || "Failed to fetch schools";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch schools";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const addEditSchool = createAsyncThunk(
  "school/addEdit",
  async (payload: FormData, { rejectWithValue }) => {
    try {
      const isUpdate = !!payload.get("id");
      const res: any = await schoolService.addEditSchool(payload);
      if (res.status === 201 || res.status === 200) {
        toast.success(
          res?.message || 
          (isUpdate ? "School updated successfully" : "School registered successfully")
        );
        return res.data;
      }
      toast.error(res?.message || (isUpdate ? "Update failed" : "Registration failed"));
      return rejectWithValue(res?.message);
    } catch (err: any) {
      const isUpdate = !!payload.get("id");
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        (isUpdate ? "Update failed" : "Registration failed");
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteSchool = createAsyncThunk(
  "school/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await schoolService.delete(id);
      if (res.status === 200) {
        toast.success(res.message || "School deleted successfully");
        return id;
      }
      toast.error(res.message || "Failed to delete school");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete school";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeSchoolStatus = createAsyncThunk(
  "school/changeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await schoolService.changeStatus(id);
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

export const getSchoolById = createAsyncThunk(
  "school/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res: any = await schoolService.getById(id);
      if (res.status === 200) return res.data;
      const message = res?.message || "Failed to fetch school";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch school";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getSchoolLogo = createAsyncThunk(
  "school/getLogo",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res: any = await schoolService.getSchoolImageByCode(payload);
      if (res.status === 200 || res.status === 201) return res.data;
      const message = res?.message || "Failed to fetch school logo";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch school logo";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    setSelectedSchool: (state, action) => {
      state.selectedSchool = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSchools.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.schools = action.payload?.data || [];
        state.total = action.payload?.pagination?.totalArrayLength || 0;
      })
      .addCase(getAllSchools.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addEditSchool.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addEditSchool.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addEditSchool.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(deleteSchool.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteSchool.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.schools = state.schools.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSchool.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(changeSchoolStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(changeSchoolStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const school = state.schools.find((s) => s._id === action.payload);
        if (school) {
          school.isActive = !school.isActive;
        }
      })
      .addCase(changeSchoolStatus.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(getSchoolById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSchoolById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSchool = action.payload || null;
      })
      .addCase(getSchoolById.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSchoolLogo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSchoolLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolLogo = action.payload?.logo || "";
        state.schoolDetails = action.payload || null;
      })
      .addCase(getSchoolLogo.rejected, (state) => {
        state.loading = false;
        state.schoolLogo = "";
        state.schoolDetails = null;
      });
  },
});

export const { setSelectedSchool } = schoolSlice.actions;
export default schoolSlice.reducer;
