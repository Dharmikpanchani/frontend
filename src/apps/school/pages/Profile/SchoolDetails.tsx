import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
  Box,
  Button,
  FormHelperText,
  Typography,
  Grid,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Tooltip,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CameraAlt as CameraAltIcon,
  PhoneAndroid as PhoneIcon,
  LocationOn as LocationIcon,
  Language as MediumIcon,
  Domain as BoardIcon,
  CalendarToday as DateIcon,
  Description as RegIcon,
  FileUpload as UploadIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { authService } from "@/api/services/auth.service";
import { getProfileAdmin } from "@/redux/slices/authSlice";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { toasterError, toasterSuccess } from "@/utils/toaster/Toaster";
import { schoolProfileUpdateValidationSchema } from "@/utils/validation/FormikValidation";
import Png from "@/assets/Png";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import Spinner from "../../component/schoolCommon/spinner/Spinner";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission, boardOptions, schoolTypeOptions, mediumOptions } from "@/apps/common/StaticArrayData";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;


interface SchoolProfileValues {
  id?: string;
  schoolCode: string;
  schoolName: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  board: string;
  schoolType: string;
  medium: string;
  establishedYear: any; // Moment object
  registrationNumber: string;
  gstNumber: string;
  panNumber: string;
  latitude?: string;
  longitude?: string;
  logo: any;
  logoUrl: string;
  banner: any;
  bannerUrl: string;
  affiliationCertificate: any;
  affiliationCertificateUrl: string;
}

export default function SchoolDetails() {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [initialData, setInitialData] = useState<SchoolProfileValues | null>(null);

  const { adminDetails } = useSelector(
    (state: RootState) => state.AdminReducer
  );

  const [copyCodeLabel, setCopyCodeLabel] = useState("Copy");
  const [copyUrlLabel, setCopyUrlLabel] = useState("Copy");
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleCopy = (text: string, type: "code" | "url") => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback for non-secure contexts (like http://school-code.lvh.me)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Ensure the textarea is not visible or affecting layout
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textArea);
    }

    if (type === "code") {
      setCopyCodeLabel("Copied!");
      setTimeout(() => setCopyCodeLabel("Copy"), 2000);
    } else {
      setCopyUrlLabel("Copied!");
      setTimeout(() => setCopyUrlLabel("Copy"), 2000);
    }
  };

  const fetchSchoolProfile = async () => {
    try {
      setLoading(true);
      const res: any = await authService.getSchoolProfile();
      if (res.status === 200) {
        const data = res.data;
        const currentSchoolCode = data.schoolCode || adminDetails?.schoolCode || window.location.hostname.split('.')[0];
        setInitialData({
          schoolCode: currentSchoolCode,
          schoolName: data.schoolName || "",
          ownerName: data.ownerName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          country: data.country || "",
          board: data.board || "",
          schoolType: data.schoolType || "",
          medium: data.medium || "",
          establishedYear: data.establishedYear ? moment(data.establishedYear) : null,
          registrationNumber: data.registrationNumber || "",
          gstNumber: data.gstNumber || "",
          panNumber: data.panNumber || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          logo: null,
          logoUrl: data.logo ? `${imageBaseUrl}/${data.logo}` : "",
          banner: null,
          bannerUrl: data.banner ? `${imageBaseUrl}/${data.banner}` : "",
          affiliationCertificate: null,
          affiliationCertificateUrl: data.affiliationCertificate ? `${imageBaseUrl}/${data.affiliationCertificate}` : "",
        });
      } else {
        toasterError(res.message || "Failed to fetch school profile");
      }
    } catch (error: any) {
      toasterError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const handleSubmit = async (values: SchoolProfileValues) => {
    const formData = new FormData();
    formData.append("schoolName", values.schoolName);
    formData.append("ownerName", values.ownerName);
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("address", values.address);
    formData.append("city", values.city);
    formData.append("state", values.state);
    formData.append("zipCode", values.zipCode);
    formData.append("country", values.country);
    formData.append("board", values.board);
    formData.append("schoolType", values.schoolType);
    formData.append("medium", values.medium);
    if (values.establishedYear) formData.append("establishedYear", moment(values.establishedYear).format("YYYY-MM-DD"));
    formData.append("registrationNumber", values.registrationNumber);
    formData.append("gstNumber", values.gstNumber);
    formData.append("panNumber", values.panNumber);
    if (values.latitude) formData.append("latitude", values.latitude);
    if (values.longitude) formData.append("longitude", values.longitude);

    if (values.logo instanceof File) formData.append("logo", values.logo);
    if (values.banner instanceof File) formData.append("banner", values.banner);
    if (values.affiliationCertificate instanceof File) formData.append("affiliationCertificate", values.affiliationCertificate);

    setButtonSpinner(true);
    try {
      const res: any = await authService.updateSchoolProfile(formData);

      // Check for success status in body, or if the call simply succeeded (since it didn't catch)
      if (res.status === 200 || res.status === 201 || res.status === "200") {
        toasterSuccess(res.message || "School profile updated successfully");
        fetchSchoolProfile();
        dispatch(getProfileAdmin() as any);
      } else {
        // If status is missing or not a success code, handle it as a potential error
        toasterError(res.message || "Failed to update school profile");
      }
    } catch (error: any) {
      console.error("updateSchoolProfile error:", error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred";
      toasterError(errorMessage);
    } finally {
      setButtonSpinner(false);
    }
  };

  if (loading || !initialData) {
    return <CommonLoader />;
  }


  return (
    <Formik
      enableReinitialize
      initialValues={initialData}
      validationSchema={schoolProfileUpdateValidationSchema}
      onSubmit={handleSubmit}
    >
      {(formikProps: FormikProps<SchoolProfileValues>) => {
        const {
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: formikSubmit,
          setFieldValue,
          isSubmitting,
          resetForm,
        } = formikProps;

        return (
          <Form onSubmit={formikSubmit}>
            <Box className="common-card profile-main" sx={{ p: { xs: 2.5, sm: 4 } }}>
              {/* Branding Header */}
              <Box sx={{
                mb: 4,
                display: 'flex',
                gap: { xs: 2, sm: 4 },
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' },
                pb: 4,
                borderBottom: '1px solid #F0F0F0'
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      width: { xs: 120, sm: 100 },
                      height: { xs: 120, sm: 100 },
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#F0F2F5',
                      border: '1px solid #E4E7EC',
                    }}
                  >
                    <img
                      src={values.logoUrl || Png.dummyUser}
                      alt="Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      right: -10,
                      minWidth: 32,
                      width: 32,
                      height: 32,
                      background: 'var(--theme-gradient, var(--primary-color, #942F15)) !important',
                      borderRadius: '50%',
                      p: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': { background: 'var(--theme-gradient, var(--primary-color))', opacity: 0.8, transform: 'scale(1.1)' }
                    }}
                  >
                    <CameraAltIcon sx={{ fontSize: 16, color: 'var(--button-text, white)' }} />
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) {
                          setFieldValue("logo", file);
                          setFieldValue("logoUrl", URL.createObjectURL(file));
                        }
                      }}
                    />
                  </Button>
                </Box>
                {touched.logo && errors.logo && (
                  <FormHelperText error sx={{ mt: 1, textAlign: 'center' }}>{errors.logo as string}</FormHelperText>
                )}
                <Box>
                  <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #344054)', fontFamily: 'var(--font-family)' }}>
                    {values.schoolName || "School Name"}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: 'var(--text-secondary, #667085)', fontFamily: 'var(--font-family)' }}>
                    {values.email}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* School Access Info */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={labelSx}><SchoolIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> School Code</Typography>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={values.schoolCode}
                    sx={{ ...inputSx, backgroundColor: '#F9FAFB' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <Tooltip title={copyCodeLabel === "Copied!" ? "School Code Copied!" : "Copy School Code"} placement="top" arrow>
                          <IconButton
                            onClick={() => handleCopy(values.schoolCode, "code")}
                            edge="end"
                            size="small"
                            sx={{
                              color: copyCodeLabel === "Copied!" ? "var(--primary-color)" : "inherit",
                              backgroundColor: copyCodeLabel === "Copied!" ? "rgba(148, 47, 21, 0.05)" : "transparent",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "rgba(148, 47, 21, 0.1)",
                              }
                            }}
                          >
                            <CopyIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={labelSx}><LinkIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> School URL</Typography>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={`${values.schoolCode}.lvh.me:5173`}
                    sx={{ ...inputSx, backgroundColor: '#F9FAFB' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <Tooltip title={copyUrlLabel === "Copied!" ? "School URL Copied!" : "Copy School URL"} placement="top" arrow>
                          <IconButton
                            onClick={() => handleCopy(`${values.schoolCode}.lvh.me:5173`, "url")}
                            edge="end"
                            size="small"
                            sx={{
                              color: copyUrlLabel === "Copied!" ? "var(--primary-color, #942F15)" : "inherit",
                              backgroundColor: copyUrlLabel === "Copied!" ? "rgba(148, 47, 21, 0.05)" : "transparent",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "rgba(148, 47, 21, 0.1)",
                              }
                            }}
                          >
                            <CopyIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    }
                  />
                </Grid>

                {/* Basic Info */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={labelSx}><SchoolIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> School Name <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="schoolName"
                    value={values.schoolName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.schoolName && Boolean(errors.schoolName)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.schoolName && (errors.schoolName as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={labelSx}><PersonIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> Owner Name <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="ownerName"
                    value={values.ownerName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.ownerName && Boolean(errors.ownerName)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.ownerName && (errors.ownerName as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={labelSx}><EmailIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> Email</Typography>
                  <OutlinedInput
                    fullWidth
                    disabled
                    value={values.email}
                    sx={{ ...inputSx, backgroundColor: '#F9FAFB' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={labelSx}><PhoneIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> Phone Number <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="phoneNumber"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.phoneNumber && (errors.phoneNumber as string)}</FormHelperText>
                </Grid>

                {/* School Specifics */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={labelSx}><BoardIcon sx={{ fontSize: 16, color: 'var(--primary-color, #942F15)' }} /> Board <span className="astrick-sing">*</span></Typography>
                  <Autocomplete
                    options={boardOptions}
                    getOptionLabel={(option: any) => option.label}
                    value={boardOptions.find((opt: any) => opt.value === values.board) || null}
                    onChange={(_, newValue) => setFieldValue("board", newValue ? newValue.value : "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Board"
                        variant="outlined"
                        sx={inputSx}
                        error={touched.board && Boolean(errors.board)}
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 12px !important' } }}
                  />
                  <FormHelperText error>{touched.board && (errors.board as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography sx={labelSx}><SchoolIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> School Type <span className="astrick-sing">*</span></Typography>
                  <Autocomplete
                    options={schoolTypeOptions}
                    getOptionLabel={(option: any) => option.label}
                    value={schoolTypeOptions.find((opt: any) => opt.value === values.schoolType) || null}
                    onChange={(_, newValue) => setFieldValue("schoolType", newValue ? newValue.value : "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Type"
                        variant="outlined"
                        sx={inputSx}
                        error={touched.schoolType && Boolean(errors.schoolType)}
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 12px !important' } }}
                  />
                  <FormHelperText error>{touched.schoolType && (errors.schoolType as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <Typography sx={labelSx}><MediumIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> Medium <span className="astrick-sing">*</span></Typography>
                  <Autocomplete
                    options={mediumOptions}
                    getOptionLabel={(option: any) => option.label}
                    value={mediumOptions.find((opt: any) => opt.value === values.medium) || null}
                    onChange={(_, newValue) => setFieldValue("medium", newValue ? newValue.value : "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Medium"
                        variant="outlined"
                        sx={inputSx}
                        error={touched.medium && Boolean(errors.medium)}
                      />
                    )}
                    sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 12px !important' } }}
                  />
                  <FormHelperText error>{touched.medium && (errors.medium as string)}</FormHelperText>
                </Grid>

                {/* Logistics */}
                <Grid size={{ xs: 12 }}>
                  <Typography sx={labelSx}><LocationIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> Address <span className="astrick-sing">*</span></Typography>
                  <AutoCompleteLocation
                    name="address"
                    placeholder="Enter address"
                    values={values}
                    setFieldValue={setFieldValue}
                    touched={touched}
                    errors={errors}
                    focusedColor="var(--primary-color)"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}>City <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.city && Boolean(errors.city)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.city && (errors.city as string)}</FormHelperText>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}>State <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.state && Boolean(errors.state)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.state && (errors.state as string)}</FormHelperText>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}>Zip Code <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="zipCode"
                    value={values.zipCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.zipCode && Boolean(errors.zipCode)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.zipCode && (errors.zipCode as string)}</FormHelperText>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}>Country <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.country && Boolean(errors.country)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.country && (errors.country as string)}</FormHelperText>
                </Grid>

                {/* Legal & Branding */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}><RegIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> Registration Number <span className="astrick-sing">*</span></Typography>
                  <OutlinedInput
                    fullWidth
                    name="registrationNumber"
                    value={values.registrationNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.registrationNumber && Boolean(errors.registrationNumber)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.registrationNumber && (errors.registrationNumber as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}><RegIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> GST Number</Typography>
                  <OutlinedInput
                    fullWidth
                    name="gstNumber"
                    value={values.gstNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.gstNumber && Boolean(errors.gstNumber)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.gstNumber && (errors.gstNumber as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}><RegIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> PAN Number</Typography>
                  <OutlinedInput
                    fullWidth
                    name="panNumber"
                    value={values.panNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.panNumber && Boolean(errors.panNumber)}
                    sx={inputSx}
                  />
                  <FormHelperText error>{touched.panNumber && (errors.panNumber as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography sx={labelSx}><DateIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> Established Year <span className="astrick-sing">*</span></Typography>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      name="establishedYear"
                      format="DD/MM/YYYY"
                      open={openDatePicker}
                      onOpen={() => setOpenDatePicker(true)}
                      onClose={() => setOpenDatePicker(false)}
                      value={values.establishedYear}
                      onChange={(newValue) => {
                        setFieldValue("establishedYear", newValue);
                      }}
                      disableFuture
                      maxDate={moment().endOf("day")}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          placeholder: "Select Date",
                          variant: "outlined",
                          onClick: () => setOpenDatePicker(true),
                          onBlur: handleBlur,
                          sx: {
                            "& .MuiPickersOutlinedInput-root": {
                              height: "40px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ced4da",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ced4da !important",
                              },
                              "&.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline": {
                                border: "1px solid var(--primary-color) !important",
                              },
                              "&:hover .MuiPickersOutlinedInput-notchedOutline": {
                                border: "1px solid #ced4da !important",
                              },
                            },

                            "& .MuiPickersSectionList-root": {
                              padding: "12px 0px",
                              fontSize: "12px",
                            },

                            "& .MuiPickersInputBase-sectionContent": {
                              fontSize: "13px",
                              padding: "12px 0px",
                            },
                          }
                        },

                        field: {
                          readOnly: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <FormHelperText className="error-text">{(touched.establishedYear && errors.establishedYear) ? (errors.establishedYear as string) : ""}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={labelSx}><UploadIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> Banner Image</Typography>
                  <Box sx={{
                    position: 'relative',
                    height: { xs: 120, sm: 100 },
                    border: '1.5px dashed #D0D5DD',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F9FAFB'
                  }}>
                    {values.bannerUrl && (
                      <img src={values.bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Banner" />
                    )}
                    <Button
                      variant="text"
                      component="label"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#667085',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                      }}
                    >
                      {!values.bannerUrl && (
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#475467', letterSpacing: '0.02em' }}>
                          UPLOAD BANNER
                        </Typography>
                      )}
                      <input hidden accept="image/*" type="file" onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) {
                          setFieldValue("banner", file);
                          setFieldValue("bannerUrl", URL.createObjectURL(file));
                        }
                      }} />
                    </Button>
                  </Box>
                  <FormHelperText error>{touched.banner && (errors.banner as string)}</FormHelperText>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={labelSx}><RegIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} /> Affiliation Certificate</Typography>
                  <Box sx={{ border: '1px dashed #E4E7EC', p: 2, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#667085' }}>
                      {values.affiliationCertificate instanceof File ? values.affiliationCertificate.name : values.affiliationCertificateUrl ? "Certificate Uploaded" : "No file selected"}
                    </Typography>
                    <Button variant="outlined" component="label" size="small" sx={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)', '&:hover': { borderColor: 'var(--primary-color)', backgroundColor: 'transparent', opacity: 0.8 } }}>
                      Upload
                      <input hidden accept=".pdf,image/*" type="file" onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) {
                          setFieldValue("affiliationCertificate", file);
                        }
                      }} />
                    </Button>
                  </Box>
                  <FormHelperText error>{touched.affiliationCertificate && (errors.affiliationCertificate as string)}</FormHelperText>
                  {values.affiliationCertificateUrl && !values.affiliationCertificate && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      <a href={values.affiliationCertificateUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>View Current Certificate</a>
                    </Typography>
                  )}
                </Grid>

              </Grid>

              {/* Form Actions */}
              {hasPermission(schoolAdminPermission.school_profile.update) && (<Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                <Button
                  variant="outlined"
                  disabled={isSubmitting || buttonSpinner}
                  onClick={() => resetForm()}
                  sx={{
                    minWidth: { xs: '100%', sm: '130px' },
                    height: '40px',
                    borderRadius: '8px',
                    color: '#667085',
                    borderColor: '#D0D5DD',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                      borderColor: '#D0D5DD',
                    },
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || buttonSpinner}
                    className="admin-btn-theme"
                    sx={{
                      minWidth: { xs: '100%', sm: '150px' },
                      height: '40px',
                      borderRadius: 'var(--button-radius, 8px)',
                      background: 'var(--theme-gradient, var(--primary-color)) !important',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      color: 'var(--button-text, #fff)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        opacity: 0.9,
                        boxShadow: 'none',
                        transform: 'translateY(-1px)',
                      },
                    }}
                >
                  {isSubmitting || buttonSpinner ? (
                    <Spinner />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <SaveIcon sx={{ fontSize: 18 }} />
                      Save Changes
                    </Box>
                  )}
                </Button>
              </Box>)}
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
