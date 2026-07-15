import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
  OutlinedInput,
  Autocomplete,
  Link,
} from "@mui/material";
import {
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Description as LegalIcon,
  Image as BrandingIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CameraAlt as CameraAltIcon,
} from "@mui/icons-material";
import { authService } from "@/api/services/auth.service";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { toasterError, toasterSuccess } from "@/utils/toaster/Toaster";
import Png from "@/assets/Png";
import moment from "moment";
import {
  boardOptions,
  schoolTypeOptions,
  mediumOptions,
  schoolAdminPermission,
} from "@/apps/common/StaticArrayData";
import { renderSingleImage } from "@/apps/common/uploadImageAndVideo";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Spinner from "../../component/schoolCommon/spinner/Spinner";
import { schoolProfileUpdateValidationSchema } from "@/utils/validation/FormikValidation";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { usePermissions } from "@/hooks/usePermissions";

const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;

const schoolGenderTypeOptions = [
  { label: "Co-educational", value: "Co-ed" },
  { label: "Boys Only", value: "Boys Only" },
  { label: "Girls Only", value: "Girls Only" },
];

const getLabel = (options: any[], value: string) =>
  options.find((o) => o.value === value)?.label || value;

// ── Section Header ─────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      mb: 3,
      mt: 1,
      pb: 1,
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "8px",
        backgroundColor: "rgba(0, 33, 71, 0.05)",
        color: "var(--primary-color)",
      }}
    >
      <Icon sx={{ fontSize: 20 }} />
    </Box>
    <Typography
      sx={{
        fontSize: "17px",
        fontWeight: 600,
        color: "#1f2937",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {title}
    </Typography>
  </Box>
);

// ── View-only field — renders nothing when empty ────────────────────────────
const ViewField = ({
  label,
  value,
  col = "span 6",
}: {
  label: string;
  value?: string | null;
  col?: string;
}) => {
  if (!value) return null;
  return (
    <Box gridColumn={{ xs: "span 12", sm: col }}>
      <Typography sx={labelSx}>{label}</Typography>
      <OutlinedInput
        fullWidth
        disabled
        value={value}
        sx={{ ...inputSx, backgroundColor: "#F9FAFB", color: "#344054" }}
      />
    </Box>
  );
};

export default function SchoolDetails() {
  const [loading, setLoading] = useState(true);
  const [rawProfile, setRawProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [copyCodeLabel, setCopyCodeLabel] = useState("Copy");
  const [copyUrlLabel, setCopyUrlLabel] = useState("Copy");

  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);
  const { isSuperSchoolAdmin, isSuperDeveloper, hasPermission } = usePermissions();

  const canEdit =
    isSuperDeveloper ||
    isSuperSchoolAdmin ||
    hasPermission(schoolAdminPermission.school_profile.update);

  const handleCopy = (text: string, type: "code" | "url") => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-999999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
    }
    if (type === "code") {
      setCopyCodeLabel("Copied!");
      setTimeout(() => setCopyCodeLabel("Copy"), 2000);
    } else {
      setCopyUrlLabel("Copied!");
      setTimeout(() => setCopyUrlLabel("Copy"), 2000);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res: any = await authService.getSchoolProfile();
      if (res.status === 200) {
        setRawProfile(res.data);
      } else {
        toasterError(res.message || "Failed to fetch school profile");
      }
    } catch (error: any) {
      toasterError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const schoolCode = useMemo(
    () =>
      rawProfile?.schoolCode ||
      adminDetails?.schoolCode ||
      (typeof window !== "undefined" ? window.location.hostname.split(".")[0] : ""),
    [rawProfile, adminDetails],
  );

  // ── View-only derived data ─────────────────────────────────────────────────
  const viewData = useMemo(() => {
    if (!rawProfile) return null;
    const d = rawProfile;
    return {
      schoolCode,
      adminEmail: d.adminEmail || "",
      schoolName: d.schoolName || "",
      ownerName: d.ownerName || "",
      email: d.email || "",
      phoneNumber: d.phoneNumber || "",
      trustName: d.trustName || "",
      schoolGenderType: d.schoolGenderType
        ? getLabel(schoolGenderTypeOptions, d.schoolGenderType)
        : "",
      landlineNumber: d.landlineNumber || "",
      alternateEmail: d.alternateEmail || "",
      websiteUrl: d.websiteUrl || "",
      address: d.address || "",
      city: d.city || "",
      state: d.state || "",
      zipCode: d.zipCode || "",
      country: d.country || "",
      board: d.board ? getLabel(boardOptions, d.board) : "",
      schoolType: d.schoolType ? getLabel(schoolTypeOptions, d.schoolType) : "",
      medium: d.medium ? getLabel(mediumOptions, d.medium) : "",
      establishedYear: d.establishedYear
        ? moment(d.establishedYear).format("DD/MM/YYYY")
        : null,
      registrationNumber: d.registrationNumber || "",
      panNumber: d.panNumber || "",
      tanNumber: d.tanNumber || "",
      gstNumber: d.gstNumber || "",
      logoUrl: d.logo ? `${imageBaseUrl}/${d.logo}` : "",
      bannerUrl: d.banner ? `${imageBaseUrl}/${d.banner}` : "",
      affiliationCertificateUrl: d.affiliationCertificate
        ? `${imageBaseUrl}/${d.affiliationCertificate}`
        : "",
      authorizedSignatureUrl: d.authorizedSignature
        ? `${imageBaseUrl}/${d.authorizedSignature}`
        : "",
    };
  }, [rawProfile, schoolCode]);

  // ── Formik initial values (raw paths, not full URLs) ──────────────────────
  const initialValues = useMemo(() => {
    const d = rawProfile || {};
    return {
      schoolName: d.schoolName || "",
      ownerName: d.ownerName || "",
      email: d.email || "",
      adminEmail: d.adminEmail || "",
      phoneNumber: d.phoneNumber || "",
      trustName: d.trustName || "",
      schoolGenderType: d.schoolGenderType || "Co-ed",
      landlineNumber: d.landlineNumber || "",
      alternateEmail: d.alternateEmail || "",
      websiteUrl: d.websiteUrl || "",
      board: d.board || "",
      schoolType: d.schoolType || "",
      medium: d.medium || "",
      establishedYear: d.establishedYear
        ? moment(d.establishedYear, "YYYY-MM-DD")
        : null,
      address: d.address || "",
      city: d.city || "",
      state: d.state || "",
      zipCode: d.zipCode || "",
      country: d.country || "India",
      latitude: d.latitude || "",
      longitude: d.longitude || "",
      registrationNumber: d.registrationNumber || "",
      panNumber: d.panNumber || "",
      tanNumber: d.tanNumber || "",
      gstNumber: d.gstNumber || "",
      logo: null as File | null,
      logoUrl: d.logo || "",
      banner: null as File | null,
      bannerUrl: d.banner || "",
      affiliationCertificate: null as File | null,
      affiliationCertificateUrl: d.affiliationCertificate || "",
      authorizedSignature: null as File | null,
      authorizedSignatureUrl: d.authorizedSignature || "",
    };
  }, [rawProfile]);

  const handleSubmit = async (values: any) => {
    try {
      setButtonSpinner(true);
      const formData = new FormData();
      formData.append("schoolName", values.schoolName);
      formData.append("ownerName", values.ownerName);
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("schoolType", values.schoolType);
      formData.append("board", values.board);
      formData.append("medium", values.medium);
      if (values.establishedYear) {
        formData.append(
          "establishedYear",
          moment(values.establishedYear).format("YYYY-MM-DD"),
        );
      }
      formData.append("trustName", values.trustName || "");
      formData.append("schoolGenderType", values.schoolGenderType || "");
      formData.append("landlineNumber", values.landlineNumber || "");
      formData.append("alternateEmail", values.alternateEmail || "");
      formData.append("websiteUrl", values.websiteUrl || "");
      formData.append("address", values.address);
      formData.append("city", values.city);
      formData.append("state", values.state);
      formData.append("zipCode", values.zipCode);
      formData.append("country", values.country);
      if (values.latitude) formData.append("latitude", values.latitude);
      if (values.longitude) formData.append("longitude", values.longitude);
      formData.append("registrationNumber", values.registrationNumber);
      formData.append("panNumber", values.panNumber || "");
      formData.append("tanNumber", values.tanNumber || "");
      formData.append("gstNumber", values.gstNumber || "");
      if (values.logo) formData.append("logo", values.logo);
      if (values.banner) formData.append("banner", values.banner);
      if (values.affiliationCertificate)
        formData.append("affiliationCertificate", values.affiliationCertificate);
      if (values.authorizedSignature)
        formData.append("authorizedSignature", values.authorizedSignature);

      const res: any = await authService.updateSchoolProfile(formData);
      if (res.status === 200) {
        toasterSuccess(res.message || "School profile updated successfully");
        setIsEditing(false);
        await loadProfile();
      } else {
        toasterError(res.message || "Failed to update school profile");
      }
    } catch (error: any) {
      toasterError(error.message || "Something went wrong");
    } finally {
      setButtonSpinner(false);
    }
  };

  if (loading) return <CommonLoader />;
  if (!viewData) return null;

  const schoolUrl = `${schoolCode}.lvh.me:5173`;
  const hasAddress =
    viewData.address || viewData.city || viewData.state || viewData.zipCode || viewData.country;
  const hasLegal =
    viewData.registrationNumber || viewData.panNumber || viewData.tanNumber ||
    viewData.gstNumber || viewData.affiliationCertificateUrl;
  const hasBranding = viewData.bannerUrl || viewData.authorizedSignatureUrl;

  // ═══════════════════════════════════════════════════════════════════════════
  // EDIT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isEditing) {
    return (
      <Box
        className="common-card profile-main"
        sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: "12px", backgroundColor: "white" }}
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={schoolProfileUpdateValidationSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps: FormikProps<any>) => {
            const {
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
            } = formikProps;

            const logoPreviewSrc = values.logo
              ? URL.createObjectURL(values.logo)
              : values.logoUrl
                ? `${imageBaseUrl}/${values.logoUrl}`
                : Png.dummyUser;

            return (
              <Form>
                <Box sx={{ maxWidth: 1100 }}>

                  {/* ── LOGO AT TOP ─────────────────────────────────────── */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 2, sm: 4 },
                      mb: 4,
                      pb: 4,
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: 110,
                          height: 110,
                          borderRadius: "12px",
                          overflow: "hidden",
                          backgroundColor: "#F0F2F5",
                          border: "1px solid #E4E7EC",
                        }}
                      >
                        <img
                          src={logoPreviewSrc}
                          alt="Logo"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{
                          position: "absolute",
                          bottom: -6,
                          right: -6,
                          minWidth: 32,
                          width: 32,
                          height: 32,
                          backgroundColor: "var(--primary-color)",
                          borderRadius: "50%",
                          p: 0,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          "&:hover": { backgroundColor: "var(--primary-color)", opacity: 0.85 },
                        }}
                      >
                        <CameraAltIcon sx={{ color: "#fff", fontSize: 16 }} />
                        <input
                          hidden
                          accept=".jpg,.jpeg,.png,.svg"
                          type="file"
                          onChange={(e) => {
                            const f = e.target.files;
                            if (f && f.length > 0) setFieldValue("logo", f[0]);
                          }}
                        />
                      </Button>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1f2937",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {values.schoolName || "School Name"}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", color: "#667085", mt: 0.5 }}>
                        Click the camera icon to change the school logo
                      </Typography>
                      {(touched.logo && errors.logo) && (
                        <Typography sx={{ fontSize: "12px", color: "#ef4444", mt: 0.5 }}>
                          {errors.logo as string}
                        </Typography>
                      )}
                    </Box>
                    {/* Cancel button at top right */}
                    <Box sx={{ ml: "auto" }}>
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={() => setIsEditing(false)}
                        sx={{ textTransform: "none", borderRadius: "8px" }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>

                  {/* ── SECTION 1: Basic School Details ─────────────────── */}
                  <SectionTitle icon={SchoolIcon} title="Basic School Details" />
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={{ xs: 2, sm: 3 }}
                    sx={{ mb: 6 }}
                  >
                    {/* School Name */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>
                        School Name
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="schoolName" placeholder="Enter School Name"
                        variant="outlined" sx={inputSx} value={values.schoolName}
                        onChange={handleChange} onBlur={handleBlur}
                        error={touched.schoolName && Boolean(errors.schoolName)}
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.schoolName && errors.schoolName ? (errors.schoolName as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Owner Name */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>
                        Owner Name
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="ownerName" placeholder="Enter Owner Name"
                        variant="outlined" sx={inputSx} value={values.ownerName}
                        onChange={handleChange} onBlur={handleBlur}
                        error={touched.ownerName && Boolean(errors.ownerName)}
                        slotProps={{ htmlInput: { maxLength: 30 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.ownerName && errors.ownerName ? (errors.ownerName as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Trust Name */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>Trust / Society Name</Typography>
                      <TextField
                        fullWidth name="trustName" placeholder="Enter Trust / Society Name"
                        variant="outlined" sx={inputSx} value={values.trustName}
                        onChange={handleChange} onBlur={handleBlur}
                        error={touched.trustName && Boolean(errors.trustName)}
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.trustName && errors.trustName ? (errors.trustName as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* School Gender Type */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>School Gender Type</Typography>
                      <Autocomplete
                        options={schoolGenderTypeOptions}
                        getOptionLabel={(o: any) => o.label}
                        value={schoolGenderTypeOptions.find((o: any) => o.value === values.schoolGenderType) || null}
                        onChange={(_, v) => setFieldValue("schoolGenderType", v ? v.value : "Co-ed")}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select Gender Type" variant="outlined" sx={inputSx} />
                        )}
                        sx={{ "& .MuiAutocomplete-inputRoot": { padding: "0 !important", height: "40px" } }}
                      />
                    </Box>

                    {/* Established Year */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>
                        Established Year
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                          format="DD/MM/YYYY"
                          open={openDatePicker}
                          onOpen={() => setOpenDatePicker(true)}
                          onClose={() => setOpenDatePicker(false)}
                          value={values.establishedYear}
                          onChange={(v) => setFieldValue("establishedYear", v)}
                          disableFuture
                          maxDate={moment().endOf("day")}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: "Select Date",
                              variant: "outlined",
                              onClick: () => setOpenDatePicker(true),
                              onBlur: handleBlur,
                              sx: inputSx,
                            },
                            field: { readOnly: true },
                          }}
                        />
                      </LocalizationProvider>
                      <FormHelperText className="error-text">
                        {touched.establishedYear && errors.establishedYear
                          ? (errors.establishedYear as string)
                          : ""}
                      </FormHelperText>
                    </Box>

                    {/* School Type */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>
                        School Type
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <Autocomplete
                        options={schoolTypeOptions}
                        getOptionLabel={(o: any) => o.label}
                        value={schoolTypeOptions.find((o: any) => o.value === values.schoolType) || null}
                        onChange={(_, v) => setFieldValue("schoolType", v ? v.value : "")}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select Type" variant="outlined" sx={inputSx}
                            error={touched.schoolType && Boolean(errors.schoolType)} />
                        )}
                        sx={{ "& .MuiAutocomplete-inputRoot": { padding: "0 !important", height: "40px" } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.schoolType && errors.schoolType ? (errors.schoolType as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Board */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>
                        Board
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <Autocomplete
                        options={boardOptions}
                        getOptionLabel={(o: any) => o.label}
                        value={boardOptions.find((o: any) => o.value === values.board) || null}
                        onChange={(_, v) => setFieldValue("board", v ? v.value : "")}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select Board" variant="outlined" sx={inputSx}
                            error={touched.board && Boolean(errors.board)} />
                        )}
                        sx={{ "& .MuiAutocomplete-inputRoot": { padding: "0 !important", height: "40px" } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.board && errors.board ? (errors.board as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Medium */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>
                        Medium
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <Autocomplete
                        options={mediumOptions}
                        getOptionLabel={(o: any) => o.label}
                        value={mediumOptions.find((o: any) => o.value === values.medium) || null}
                        onChange={(_, v) => setFieldValue("medium", v ? v.value : "")}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select Medium" variant="outlined" sx={inputSx}
                            error={touched.medium && Boolean(errors.medium)} />
                        )}
                        sx={{ "& .MuiAutocomplete-inputRoot": { padding: "0 !important", height: "40px" } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.medium && errors.medium ? (errors.medium as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* School Email (read-only) */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>School Email</Typography>
                      <TextField fullWidth name="email" variant="outlined" sx={inputSx} value={values.email} disabled />
                    </Box>

                    {/* Admin Login Email (read-only) */}
                    {values.adminEmail && (
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Admin Login Email</Typography>
                        <TextField fullWidth name="adminEmail" variant="outlined" sx={inputSx} value={values.adminEmail} disabled />
                      </Box>
                    )}

                    {/* Phone Number */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>
                        Phone Number
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="phoneNumber" type="number" placeholder="Enter Phone Number"
                        variant="outlined" sx={inputSx} value={values.phoneNumber}
                        onChange={handleChange} onBlur={handleBlur}
                        error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                        slotProps={{ htmlInput: { maxLength: 10 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.phoneNumber && errors.phoneNumber ? (errors.phoneNumber as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Landline Number */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>Landline Number</Typography>
                      <TextField
                        fullWidth name="landlineNumber" placeholder="Enter Landline Number"
                        variant="outlined" sx={inputSx} value={values.landlineNumber}
                        onChange={(e) => setFieldValue("landlineNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
                        onBlur={handleBlur}
                        error={touched.landlineNumber && Boolean(errors.landlineNumber)}
                      />
                      <FormHelperText className="error-text">
                        {touched.landlineNumber && errors.landlineNumber ? (errors.landlineNumber as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Alternate Email */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>Alternate / Backup Email</Typography>
                      <TextField
                        fullWidth name="alternateEmail" placeholder="Enter Backup Email"
                        variant="outlined" sx={inputSx} value={values.alternateEmail}
                        onChange={handleChange} onBlur={handleBlur}
                        error={touched.alternateEmail && Boolean(errors.alternateEmail)}
                      />
                      <FormHelperText className="error-text">
                        {touched.alternateEmail && errors.alternateEmail ? (errors.alternateEmail as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Website URL */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                      <Typography sx={labelSx}>Official Website URL</Typography>
                      <TextField
                        fullWidth name="websiteUrl" placeholder="e.g. www.school.com"
                        variant="outlined" sx={inputSx} value={values.websiteUrl}
                        onChange={handleChange} onBlur={handleBlur}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                      />
                    </Box>
                  </Box>

                  {/* ── SECTION 2: Address Details ───────────────────────── */}
                  <SectionTitle icon={LocationIcon} title="Address Details" />
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={{ xs: 2, sm: 3 }}
                    sx={{ mb: 6 }}
                  >
                    <Box gridColumn="span 12">
                      <Typography sx={labelSx}>
                        Search Location (Auto-fill)
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <AutoCompleteLocation
                        name="address"
                        placeholder="Search for school location..."
                        values={values}
                        setFieldValue={setFieldValue}
                        touched={touched}
                        errors={errors}
                        fieldNames={{ pincode: "zipCode" }}
                      />
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                      <Typography sx={labelSx}>
                        City <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="city" placeholder="City" variant="outlined" sx={inputSx}
                        value={values.city} onChange={handleChange} onBlur={handleBlur}
                        error={touched.city && Boolean(errors.city)}
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.city && errors.city ? (errors.city as string) : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                      <Typography sx={labelSx}>
                        State <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="state" placeholder="State" variant="outlined" sx={inputSx}
                        value={values.state} onChange={handleChange} onBlur={handleBlur}
                        error={touched.state && Boolean(errors.state)}
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.state && errors.state ? (errors.state as string) : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                      <Typography sx={labelSx}>
                        Zip Code <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="zipCode" placeholder="Zip Code" variant="outlined" sx={inputSx}
                        value={values.zipCode} onChange={handleChange} onBlur={handleBlur}
                        error={touched.zipCode && Boolean(errors.zipCode)}
                        slotProps={{ htmlInput: { maxLength: 6 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.zipCode && errors.zipCode ? (errors.zipCode as string) : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                      <Typography sx={labelSx}>
                        Country <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="country" placeholder="Country" variant="outlined" sx={inputSx}
                        value={values.country} onChange={handleChange} onBlur={handleBlur}
                        error={touched.country && Boolean(errors.country)}
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.country && errors.country ? (errors.country as string) : ""}
                      </FormHelperText>
                    </Box>
                  </Box>

                  {/* ── SECTION 3: Legal / Verification Details ──────────── */}
                  <SectionTitle icon={LegalIcon} title="Legal / Verification Details" />
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={{ xs: 2, sm: 3 }}
                    sx={{ mb: 6 }}
                  >
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>
                        Registration Number
                        <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth name="registrationNumber" placeholder="Reg. No."
                        variant="outlined" sx={inputSx} value={values.registrationNumber}
                        onChange={handleChange} onBlur={handleBlur}
                        error={touched.registrationNumber && Boolean(errors.registrationNumber)}
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.registrationNumber && errors.registrationNumber
                          ? (errors.registrationNumber as string)
                          : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>PAN Number</Typography>
                      <TextField
                        fullWidth name="panNumber" placeholder="PAN"
                        variant="outlined" sx={inputSx} value={values.panNumber}
                        onChange={(e) => setFieldValue("panNumber", e.target.value.toUpperCase())}
                        onBlur={handleBlur}
                        error={touched.panNumber && Boolean(errors.panNumber)}
                        slotProps={{ htmlInput: { maxLength: 10 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.panNumber && errors.panNumber ? (errors.panNumber as string) : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>TAN Number</Typography>
                      <TextField
                        fullWidth name="tanNumber" placeholder="TAN"
                        variant="outlined" sx={inputSx} value={values.tanNumber}
                        onChange={(e) =>
                          setFieldValue("tanNumber", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                        }
                        onBlur={handleBlur}
                        error={touched.tanNumber && Boolean(errors.tanNumber)}
                        slotProps={{ htmlInput: { maxLength: 10 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.tanNumber && errors.tanNumber ? (errors.tanNumber as string) : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>GST Number</Typography>
                      <TextField
                        fullWidth name="gstNumber" placeholder="GST"
                        variant="outlined" sx={inputSx} value={values.gstNumber}
                        onChange={(e) =>
                          setFieldValue("gstNumber", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                        }
                        onBlur={handleBlur}
                        error={touched.gstNumber && Boolean(errors.gstNumber)}
                        slotProps={{ htmlInput: { maxLength: 15 } }}
                      />
                      <FormHelperText className="error-text">
                        {touched.gstNumber && errors.gstNumber ? (errors.gstNumber as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Affiliation Certificate */}
                    <Box gridColumn="span 12">
                      <Typography sx={labelSx}>Affiliation Certificate</Typography>
                      <Box
                        sx={{
                          border: "1px dashed #ced4da",
                          borderRadius: "8px",
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          backgroundColor: "#f9fafb",
                          position: "relative",
                        }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                          sx={{ textTransform: "none", borderRadius: "6px" }}
                        >
                          Choose File
                          <input
                            hidden type="file" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const f = e.target.files;
                              if (f && f.length > 0) setFieldValue("affiliationCertificate", f[0]);
                            }}
                          />
                        </Button>
                        <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                          {values.affiliationCertificate ? (
                            values.affiliationCertificate.name
                          ) : values.affiliationCertificateUrl ? (
                            <Link
                              href={`${imageBaseUrl}/${values.affiliationCertificateUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: "var(--primary-color)", textDecoration: "underline", fontWeight: 500 }}
                            >
                              View Current Certificate
                            </Link>
                          ) : (
                            "No file chosen (PDF, JPG, PNG)"
                          )}
                        </Typography>
                      </Box>
                      <FormHelperText className="error-text">
                        {touched.affiliationCertificate && errors.affiliationCertificate
                          ? (errors.affiliationCertificate as string)
                          : ""}
                      </FormHelperText>
                    </Box>
                  </Box>

                  {/* ── SECTION 4: Branding (Banner + Signature) ─────────── */}
                  <SectionTitle icon={BrandingIcon} title="Branding" />
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={{ xs: 2, sm: 3 }}
                    sx={{ mb: 6 }}
                  >
                    {/* Banner Upload */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>School Banner</Typography>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <Box sx={{ position: "relative" }}>
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{
                              minWidth: "240px",
                              width: "100%",
                              maxWidth: "400px",
                              height: "100px",
                              borderRadius: "8px",
                              border: "1.5px dashed #D0D5DD",
                              bgcolor: "transparent",
                              p: 0,
                              overflow: "hidden",
                              flexShrink: 0,
                              "&:hover": { bgcolor: "transparent" },
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {values.bannerUrl ? (
                              <img
                                src={`${imageBaseUrl}/${values.bannerUrl}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                alt="Banner"
                              />
                            ) : values.banner ? (
                              renderSingleImage({ profile: values.banner, imageUrl: "" })
                            ) : (
                              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#475467", letterSpacing: "0.02em" }}>
                                UPLOAD BANNER
                              </Typography>
                            )}
                            <input
                              hidden accept=".jpg,.jpeg,.png,.svg" type="file"
                              onChange={(e) => {
                                const f = e.target.files;
                                if (f && f.length > 0) setFieldValue("banner", f[0]);
                              }}
                            />
                          </Button>
                          {(values.banner || values.bannerUrl) && (
                            <IconButton
                              size="small"
                              onClick={() => { setFieldValue("banner", null); setFieldValue("bannerUrl", ""); }}
                              sx={{ position: "absolute", top: -8, right: -8, p: "2px", bgcolor: "#ef4444", color: "white", boxShadow: 2, zIndex: 10, "&:hover": { bgcolor: "#dc2626" } }}
                            >
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: "11px", color: "#667085", pt: 1, maxWidth: "200px" }}>
                          <strong>Recommended:</strong> 1200x400px (3:1 Ratio).<br />Max 20MB. JPG, PNG, SVG.
                        </Typography>
                      </Box>
                      <FormHelperText className="error-text">
                        {touched.banner && errors.banner ? (errors.banner as string) : ""}
                      </FormHelperText>
                    </Box>

                    {/* Authorized Signature Upload */}
                    <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                      <Typography sx={labelSx}>Authorized Signature</Typography>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <Box sx={{ position: "relative" }}>
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{
                              minWidth: "100px",
                              width: "100px",
                              height: "100px",
                              borderRadius: "12px",
                              border: "1px dashed #ced4da",
                              bgcolor: "transparent",
                              p: 0,
                              overflow: "hidden",
                              "&:hover": { bgcolor: "transparent" },
                            }}
                          >
                            {renderSingleImage({
                              profile: values.authorizedSignature,
                              imageUrl: values.authorizedSignatureUrl,
                            })}
                            <input
                              hidden accept=".jpg,.jpeg,.png,.svg" type="file"
                              onChange={(e) => {
                                const f = e.target.files;
                                if (f && f.length > 0) setFieldValue("authorizedSignature", f[0]);
                              }}
                            />
                          </Button>
                          {(values.authorizedSignature || values.authorizedSignatureUrl) && (
                            <IconButton
                              size="small"
                              onClick={() => { setFieldValue("authorizedSignature", null); setFieldValue("authorizedSignatureUrl", ""); }}
                              sx={{ position: "absolute", top: -8, right: -8, p: "2px", bgcolor: "#ef4444", color: "white", boxShadow: 2, zIndex: 10, "&:hover": { bgcolor: "#dc2626" } }}
                            >
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Box>
                        <Typography sx={{ fontSize: "11px", color: "#667085", pt: 1, maxWidth: "200px" }}>
                          <strong>Recommended:</strong> 200x200px (1:1 Ratio).<br />Max 20MB. JPG, PNG, SVG.
                        </Typography>
                      </Box>
                      <FormHelperText className="error-text">
                        {touched.authorizedSignature && errors.authorizedSignature
                          ? (errors.authorizedSignature as string)
                          : ""}
                      </FormHelperText>
                    </Box>
                  </Box>

                  {/* ── Save Button ──────────────────────────────────────── */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      pt: 2,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                      sx={{ textTransform: "none", borderRadius: "8px" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={buttonSpinner ? null : <SaveIcon />}
                      disabled={buttonSpinner}
                      sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                        backgroundColor: "var(--primary-color)",
                        "&:hover": { backgroundColor: "var(--primary-color)", opacity: 0.9 },
                        minWidth: buttonSpinner ? "135px" : "auto",
                      }}
                    >
                      {buttonSpinner ? <Spinner /> : "Save Changes"}
                    </Button>
                  </Box>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW MODE
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Box className="common-card profile-main" sx={{ p: { xs: 2.5, sm: 4 } }}>
      {/* Logo + School name header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          gap: { xs: 2, sm: 4 },
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          textAlign: { xs: "center", sm: "left" },
          pb: 4,
          borderBottom: "1px solid #F0F0F0",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, sm: 4 },
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Box
            sx={{
              width: { xs: 120, sm: 100 },
              height: { xs: 120, sm: 100 },
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#F0F2F5",
              border: "1px solid #E4E7EC",
              flexShrink: 0,
            }}
          >
            <img
              src={viewData.logoUrl || Png.dummyUser}
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary, #344054)",
                fontFamily: "var(--font-family)",
              }}
            >
              {viewData.schoolName || "School Name"}
            </Typography>
            {viewData.email && (
              <Typography
                sx={{ fontSize: "14px", color: "var(--text-secondary, #667085)", fontFamily: "var(--font-family)" }}
              >
                {viewData.email}
              </Typography>
            )}
          </Box>
        </Box>
        {canEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            sx={{ textTransform: "none", borderRadius: "8px", flexShrink: 0 }}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Box sx={{ maxWidth: 1100 }}>
        {/* 1. Basic School Details */}
        <SectionTitle icon={SchoolIcon} title="Basic School Details" />
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gap={{ xs: 2, sm: 3 }}
          sx={{ mb: 6 }}
        >
          <ViewField label="School Name" value={viewData.schoolName} />
          <ViewField label="Owner Name" value={viewData.ownerName} />
          <ViewField label="Trust / Society Name" value={viewData.trustName} />
          <ViewField label="School Gender Type" value={viewData.schoolGenderType} />
          <ViewField label="Established Year" value={viewData.establishedYear} />
          <ViewField label="School Type" value={viewData.schoolType} />
          <ViewField label="Board" value={viewData.board} />
          <ViewField label="Medium" value={viewData.medium} />
          <ViewField label="School Email" value={viewData.email} />
          {viewData.adminEmail && (
            <ViewField label="Admin Login Email" value={viewData.adminEmail} />
          )}
          <ViewField label="Phone Number" value={viewData.phoneNumber} />
          <ViewField label="Landline Number" value={viewData.landlineNumber} />
          <ViewField label="Alternate / Backup Email" value={viewData.alternateEmail} />
          <ViewField label="Official Website URL" value={viewData.websiteUrl} />

          {/* School URL name — always shown with copy */}
          <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
            <Typography sx={labelSx}>School Url name</Typography>
            <OutlinedInput
              fullWidth disabled value={viewData.schoolCode}
              sx={{ ...inputSx, backgroundColor: "#F9FAFB" }}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={copyCodeLabel === "Copied!" ? "Copied!" : "Copy School Url name"}
                    placement="top" arrow
                  >
                    <IconButton
                      onClick={() => handleCopy(viewData.schoolCode, "code")}
                      edge="end" size="small"
                      sx={{ color: copyCodeLabel === "Copied!" ? "var(--primary-color)" : "inherit" }}
                    >
                      <CopyIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            />
          </Box>

          {/* School Access URL — always shown with copy */}
          <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
            <Typography sx={labelSx}>School Access URL</Typography>
            <OutlinedInput
              fullWidth disabled value={schoolUrl}
              sx={{ ...inputSx, backgroundColor: "#F9FAFB" }}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={copyUrlLabel === "Copied!" ? "Copied!" : "Copy School URL"}
                    placement="top" arrow
                  >
                    <IconButton
                      onClick={() => handleCopy(schoolUrl, "url")}
                      edge="end" size="small"
                      sx={{ color: copyUrlLabel === "Copied!" ? "var(--primary-color)" : "inherit" }}
                    >
                      <CopyIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            />
          </Box>
        </Box>

        {/* 2. Address Details */}
        {hasAddress && (
          <>
            <SectionTitle icon={LocationIcon} title="Address Details" />
            <Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gap={{ xs: 2, sm: 3 }}
              sx={{ mb: 6 }}
            >
              <ViewField label="Address" value={viewData.address} col="span 12" />
              <ViewField label="City" value={viewData.city} col="span 3" />
              <ViewField label="State" value={viewData.state} col="span 3" />
              <ViewField label="Zip Code" value={viewData.zipCode} col="span 3" />
              <ViewField label="Country" value={viewData.country} col="span 3" />
            </Box>
          </>
        )}

        {/* 3. Legal / Verification Details */}
        {hasLegal && (
          <>
            <SectionTitle icon={LegalIcon} title="Legal / Verification Details" />
            <Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gap={{ xs: 2, sm: 3 }}
              sx={{ mb: 6 }}
            >
              <ViewField label="Registration Number" value={viewData.registrationNumber} />
              <ViewField label="PAN Number" value={viewData.panNumber} />
              <ViewField label="TAN Number" value={viewData.tanNumber} />
              <ViewField label="GST Number" value={viewData.gstNumber} />
              {viewData.affiliationCertificateUrl && (
                <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                  <Typography sx={labelSx}>Affiliation Certificate</Typography>
                  <Box
                    sx={{
                      border: "1px solid #E4E7EC",
                      borderRadius: "8px",
                      p: "10px 14px",
                      backgroundColor: "#F9FAFB",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      height: "40px",
                    }}
                  >
                    <Link
                      href={viewData.affiliationCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "var(--primary-color)",
                        fontWeight: 500,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      View Certificate <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </Link>
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* 4. Branding */}
        {hasBranding && (
          <>
            <SectionTitle icon={BrandingIcon} title="Branding" />
            <Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gap={{ xs: 2, sm: 3 }}
              sx={{ mb: 6 }}
            >
              {viewData.bannerUrl && (
                <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                  <Typography sx={labelSx}>School Banner</Typography>
                  <Box
                    sx={{ height: 100, borderRadius: "8px", overflow: "hidden", border: "1px solid #E4E7EC" }}
                  >
                    <img
                      src={viewData.bannerUrl}
                      alt="Banner"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                </Box>
              )}
              {viewData.authorizedSignatureUrl && (
                <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                  <Typography sx={labelSx}>Authorized Signature</Typography>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #E4E7EC",
                      backgroundColor: "#F9FAFB",
                    }}
                  >
                    <img
                      src={viewData.authorizedSignatureUrl}
                      alt="Authorized Signature"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
