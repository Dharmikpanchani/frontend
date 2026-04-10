import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { contactUsService, settingService } from "../../api/services/general.service";
import toast from "react-hot-toast";

interface ContactUsState {
  loading: boolean;
  contacts: any[];
  total: number;
}

interface SettingState {
  loading: boolean;
  saving: boolean;
  setting: any | null;
}

interface GeneralState {
  contactUs: ContactUsState;
  setting: SettingState;
}

const initialState: GeneralState = {
  contactUs: { loading: false, contacts: [], total: 0 },
  setting: { loading: false, saving: false, setting: null },
};

export const getAllContacts = createAsyncThunk(
  "general/getAllContacts",
  async ({ page, perPage, search }: { page: number; perPage: number; search: string }, { rejectWithValue }) => {
    try {
      const res: any = await contactUsService.getAll(page, perPage, search);
      if (res.status === 200) return res.data;
      const message = res.message || "Failed to fetch contact requests";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch contact requests";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getSetting = createAsyncThunk(
  "general/getSetting",
  async (_, { rejectWithValue }) => {
    try {
      const res: any = await settingService.get();
      if (res.status === 200) return res.data;
      const message = res.message || "Failed to fetch settings";
      toast.error(message);
      return rejectWithValue(message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch settings";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSetting = createAsyncThunk(
  "general/updateSetting",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res: any = await settingService.update(formData);
      if (res.status === 200 || res.status === 201) {
        toast.success(res.message || "Settings updated successfully");
        return res.data;
      }
      toast.error(res.message || "Failed to update settings");
      return rejectWithValue(res.message);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update settings";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllContacts.pending, (state) => { state.contactUs.loading = true; })
      .addCase(getAllContacts.fulfilled, (state, action) => {
        state.contactUs.loading = false;
        state.contactUs.contacts = action.payload?.data || [];
        state.contactUs.total = action.payload?.totalArrayLength || 0;
      })
      .addCase(getAllContacts.rejected, (state) => { state.contactUs.loading = false; })

      .addCase(getSetting.pending, (state) => { state.setting.loading = true; })
      .addCase(getSetting.fulfilled, (state, action) => {
        state.setting.loading = false;
        state.setting.setting = action.payload;
      })
      .addCase(getSetting.rejected, (state) => { state.setting.loading = false; })

      .addCase(updateSetting.pending, (state) => { state.setting.saving = true; })
      .addCase(updateSetting.fulfilled, (state) => { state.setting.saving = false; })
      .addCase(updateSetting.rejected, (state) => { state.setting.saving = false; });
  },
});

export default generalSlice.reducer;
