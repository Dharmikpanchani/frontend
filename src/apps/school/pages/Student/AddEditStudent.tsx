import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
  Breadcrumbs,
  Link,
  Autocomplete,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Person as PersonIcon,
  School as AcademicIcon,
  HistoryEdu as OldSchoolIcon,
  LocationOn as LocationIcon,
  FamilyRestroom as GuardianIcon,
  Lock as LockIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import { studentValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditStudent, getStudentById } from "@/redux/slices/studentSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import { CommonLoader } from "@/apps/common/loader/Loader";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import { renderSingleImage } from "@/apps/common/uploadImageAndVideo";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { bloodGroupOptions, genderOptions } from "@/apps/common/StaticArrayData";

export default function AddEditStudent() {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = location;
  const isView = pathname.endsWith("/view");
  const { hasPermission } = usePermissions();

  const canAdd = hasPermission(schoolAdminPermission.student.create);
  const canEdit = hasPermission(schoolAdminPermission.student.update);

  const { allClasses: classes } = useSelector(
    (state: RootState) => state.ClassReducer,
  );
  const { allSections: sections } = useSelector(
    (state: RootState) => state.SectionReducer,
  );
  const { actionLoading, loading: studentLoading } = useSelector(
    (state: RootState) => state.StudentReducer,
  );

  const [openDOB, setOpenDOB] = useState(false);
  const [openAdmissionDate, setOpenAdmissionDate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE || "";

  const fetchStudentDetails = async () => {
    const result = await dispatch(getStudentById(id as string) as any);
    if (getStudentById.fulfilled.match(result)) {
      setStudentData(result.payload?.data || result.payload);
    }
  };

  useEffect(() => {
    const params = { type: "filter" };
    dispatch(getClasses(params) as any);
    dispatch(getSections(params) as any);
    if (id) {
      fetchStudentDetails();
    }
  }, [id]);

  const initialValues = useMemo(
    () => ({
      id: id || "",
      // Basic
      fullName: studentData?.fullName || "",
      gender: studentData?.gender || "",
      dateOfBirth: studentData?.dateOfBirth
        ? moment(studentData.dateOfBirth)
        : null,
      bloodGroup: studentData?.bloodGroup || "",
      profileImage: null as File | null,
      profileImageUrl: studentData?.profileImage || "",
      // Academic
      admissionNumber: studentData?.admissionNumber || "",
      admissionDate: studentData?.admissionDate
        ? moment(studentData.admissionDate)
        : null,
      classId: studentData?.classId?._id || studentData?.classId || "",
      sectionId: studentData?.sectionId?._id || studentData?.sectionId || "",
      // Old School Details
      previousSchool: studentData?.previousSchool || "",
      previousClass: studentData?.previousClass || "",
      percentage: studentData?.percentage ?? "",
      resultDocument: null as File | null,
      resultDocumentUrl: studentData?.resultDocument || "",
      // Contact
      email: studentData?.email || "",
      phoneNumber: studentData?.phoneNumber || "",
      address: studentData?.address || "",
      city: studentData?.city || "",
      state: studentData?.state || "",
      country: studentData?.country || "India",
      pincode: studentData?.pincode || "",
      // Guardian
      fatherName: studentData?.fatherName || "",
      fatherPhone: studentData?.fatherPhone || "",
      motherName: studentData?.motherName || "",
      motherPhone: studentData?.motherPhone || "",
      guardianName: studentData?.guardianName || "",
      guardianPhone: studentData?.guardianPhone || "",
      // Auth
      password: "",
      confirmPassword: "",
    }),
    [id, studentData],
  );

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    if (id) formData.append("id", id);
    formData.append("fullName", values.fullName);
    formData.append("email", values.email);
    formData.append("phoneNumber", values.phoneNumber);
    if (values.gender) formData.append("gender", values.gender);
    if (values.bloodGroup) formData.append("bloodGroup", values.bloodGroup);
    if (values.dateOfBirth)
      formData.append("dateOfBirth", moment(values.dateOfBirth).toISOString());
    formData.append("admissionNumber", values.admissionNumber);
    if (values.admissionDate)
      formData.append(
        "admissionDate",
        moment(values.admissionDate).toISOString(),
      );
    formData.append("classId", values.classId);
    formData.append("sectionId", values.sectionId);
    if (values.previousSchool)
      formData.append("previousSchool", values.previousSchool);
    if (values.previousClass)
      formData.append("previousClass", values.previousClass);
    if (values.percentage !== "" && values.percentage !== null)
      formData.append("percentage", values.percentage);
    if (values.address) formData.append("address", values.address);
    if (values.city) formData.append("city", values.city);
    if (values.state) formData.append("state", values.state);
    if (values.country) formData.append("country", values.country);
    if (values.pincode) formData.append("pincode", values.pincode);
    if (values.fatherName) formData.append("fatherName", values.fatherName);
    if (values.fatherPhone)
      formData.append("fatherPhone", values.fatherPhone);
    if (values.motherName) formData.append("motherName", values.motherName);
    if (values.motherPhone)
      formData.append("motherPhone", values.motherPhone);
    if (values.guardianName)
      formData.append("guardianName", values.guardianName);
    if (values.guardianPhone)
      formData.append("guardianPhone", values.guardianPhone);
    if (!id && values.password) formData.append("password", values.password);

    if (values.profileImage) {
      formData.append("profileImage", values.profileImage);
    } else if (values.profileImageUrl) {
      formData.append("profileImage", values.profileImageUrl);
    }

    if (values.resultDocument) {
      formData.append("resultDocument", values.resultDocument);
    } else if (values.resultDocumentUrl) {
      formData.append("resultDocument", values.resultDocumentUrl);
    }

    const payload = formData;

    const result = await dispatch(addEditStudent(payload) as any);
    if (addEditStudent.fulfilled.match(result)) {
      navigate("/student");
    }
  };

  if (id && studentLoading && !studentData) {
    return <CommonLoader />;
  }

  const isReadOnly = isView || (id ? !canEdit : !canAdd);

  const SectionTitle = ({
    icon: Icon,
    title,
    isFirst,
    children,
  }: {
    icon: any;
    title: string;
    isFirst?: boolean;
    children?: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
        mt: isFirst ? 0 : 5,
        pb: 1,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "8px",
            backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
            color: "var(--primary-color, #5c1a1a)",
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
      {children}
    </Box>
  );

  return (
    <Box className="admin-dashboard-content">
      {/* Breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            sx={{
              cursor: "pointer",
              color: "var(--primary-color)",
              fontSize: "13px",
              fontWeight: 600,
            }}
            onClick={() => navigate("/student")}
          >
            Students
          </Link>
          <Typography
            sx={{ fontSize: "13px", fontWeight: 600, color: "#344054" }}
          >
            {isView ? "View Student" : id ? "Edit Student" : "Add Student"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        className="card-border common-card"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: "12px",
          minHeight: "200px",
          position: "relative",
          backgroundColor: "white",
        }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={studentValidationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
              <Box sx={{ maxWidth: 1100 }}>
                {/* ── Section 1: Basic Information ── */}
                <SectionTitle icon={PersonIcon} title="Basic Information" isFirst />

                {/* Profile Image */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    alignItems: "flex-start",
                    mb: 3.5,
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={isReadOnly}
                      sx={{
                        minWidth: "100px",
                        width: "100px",
                        height: "100px",
                        borderRadius: "12px",
                        border: "1px dashed #ced4da",
                        bgcolor: "transparent",
                        p: 0,
                        overflow: "hidden",
                        flexShrink: 0,
                        "&:hover": { bgcolor: "transparent" },
                        cursor: isReadOnly ? "default" : "pointer",
                      }}
                    >
                      {renderSingleImage({
                        profile: values.profileImage,
                        imageUrl: values.profileImageUrl,
                      })}
                      <input
                        hidden
                        accept=".jpg,.jpeg,.png,.svg"
                        type="file"
                        disabled={isReadOnly}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setFieldValue("profileImage", files[0]);
                          }
                        }}
                      />
                    </Button>
                    {(values.profileImage || values.profileImageUrl) && !isReadOnly && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setFieldValue("profileImage", null);
                          setFieldValue("profileImageUrl", "");
                        }}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          p: "2px",
                          bgcolor: "#ef4444",
                          color: "white",
                          boxShadow: 2,
                          zIndex: 10,
                          "&:hover": { bgcolor: "#dc2626" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ pt: 1 }}>
                    <Typography sx={labelSx}>Profile Image</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#667085", mt: 0.5 }}>
                      <strong>Recommended:</strong> 200x200px (1:1 Ratio).
                      <br />
                      Max 2MB. JPG, PNG, SVG.
                    </Typography>
                    {touched.profileImage && errors.profileImage && (
                      <FormHelperText error sx={{ mt: 0.5, mx: 0 }}>
                        {errors.profileImage as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  {/* Full Name */}
                  <Box>
                    <Typography sx={labelSx}>
                      Full Name <span style={{ color: "#f04438" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="fullName"
                      name="fullName"
                      placeholder="Enter full name"
                      value={values.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.fullName && Boolean(errors.fullName)}
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 60 },
                      }}
                    />
                    {touched.fullName && errors.fullName && (
                      <FormHelperText className="error-text">
                        {errors.fullName as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Gender */}
                  <Box>
                    <Typography sx={labelSx}>Gender</Typography>
                    <Autocomplete
                      options={genderOptions}
                      getOptionLabel={(opt: any) => opt.label || opt}
                      value={
                        genderOptions.find(
                          (g: any) => g.value === values.gender,
                        ) || null
                      }
                      onChange={(_, newVal) =>
                        setFieldValue(
                          "gender",
                          (newVal as any)?.value || "",
                        )
                      }
                      disabled={isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select gender"
                          error={touched.gender && Boolean(errors.gender)}
                          slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                        />
                      )}
                    />
                    {touched.gender && errors.gender && (
                      <FormHelperText className="error-text">
                        {errors.gender as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Date of Birth */}
                  <Box>
                    <Typography sx={labelSx}>Date of Birth</Typography>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        open={openDOB}
                        onOpen={() => setOpenDOB(true)}
                        onClose={() => setOpenDOB(false)}
                        value={values.dateOfBirth}
                        onChange={(val) => setFieldValue("dateOfBirth", val)}
                        disabled={isReadOnly}
                        disableFuture
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: "DD/MM/YYYY",
                            onClick: () => !isReadOnly && setOpenDOB(true),
                            error:
                              touched.dateOfBirth && Boolean(errors.dateOfBirth),
                            inputProps: {
                              readOnly: true,
                            },
                            sx: {
                              "& .MuiPickersOutlinedInput-root": {
                                height: "40px",
                                backgroundColor: "#fff !important",
                                borderRadius:
                                  "var(--button-radius, 6px) !important",
                                "& fieldset": {
                                  borderColor:
                                    "var(--input-border, #ced4da) !important",
                                },
                                "&:hover:not(.Mui-focused) fieldset": {
                                  borderColor:
                                    "var(--input-border, #ced4da) !important",
                                },
                                "&.Mui-focused:not(.Mui-error) fieldset": {
                                  borderColor:
                                    "var(--primary-color) !important",
                                  borderWidth: "1px !important",
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
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    {touched.dateOfBirth && errors.dateOfBirth && (
                      <FormHelperText className="error-text">
                        {errors.dateOfBirth as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Blood Group */}
                  <Box>
                    <Typography sx={labelSx}>Blood Group</Typography>
                    <Autocomplete
                      options={bloodGroupOptions}
                      getOptionLabel={(opt: any) => opt.label || opt}
                      value={
                        bloodGroupOptions.find(
                          (b: any) => b.value === values.bloodGroup,
                        ) || null
                      }
                      onChange={(_, newVal) =>
                        setFieldValue(
                          "bloodGroup",
                          (newVal as any)?.value || "",
                        )
                      }
                      disabled={isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select blood group"
                          error={
                            touched.bloodGroup && Boolean(errors.bloodGroup)
                          }
                          slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                        />
                      )}
                    />
                    {touched.bloodGroup && errors.bloodGroup && (
                      <FormHelperText className="error-text">
                        {errors.bloodGroup as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                {/* ── Section 2: Academic Details ── */}
                <SectionTitle icon={AcademicIcon} title="Academic Details" />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  {/* Admission Number */}
                  <Box>
                    <Typography sx={labelSx}>
                      Admission Number (GR Number){" "}
                      <span style={{ color: "#f04438" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="admissionNumber"
                      name="admissionNumber"
                      placeholder="Enter admission number (GR number)"
                      value={values.admissionNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.admissionNumber &&
                        Boolean(errors.admissionNumber)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 30 },
                      }}
                    />
                    {touched.admissionNumber && errors.admissionNumber && (
                      <FormHelperText className="error-text">
                        {errors.admissionNumber as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Admission Date */}
                  <Box>
                    <Typography sx={labelSx}>
                      Admission Date{" "}
                      <span style={{ color: "#f04438" }}>*</span>
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <DatePicker
                        format="DD/MM/YYYY"
                        open={openAdmissionDate}
                        onOpen={() => setOpenAdmissionDate(true)}
                        onClose={() => setOpenAdmissionDate(false)}
                        value={values.admissionDate}
                        onChange={(val) =>
                          setFieldValue("admissionDate", val)
                        }
                        disabled={isReadOnly}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: "DD/MM/YYYY",
                            onClick: () =>
                              !isReadOnly && setOpenAdmissionDate(true),
                            error:
                              touched.admissionDate &&
                              Boolean(errors.admissionDate),
                            sx: {
                              "& .MuiPickersOutlinedInput-root": {
                                height: "40px",
                                backgroundColor: "#fff !important",
                                borderRadius:
                                  "var(--button-radius, 6px) !important",
                                "& fieldset": {
                                  borderColor:
                                    "var(--input-border, #ced4da) !important",
                                },
                                "&:hover:not(.Mui-focused) fieldset": {
                                  borderColor:
                                    "var(--input-border, #ced4da) !important",
                                },
                                "&.Mui-focused:not(.Mui-error) fieldset": {
                                  borderColor:
                                    "var(--primary-color) !important",
                                  borderWidth: "1px !important",
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
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    {touched.admissionDate && errors.admissionDate && (
                      <FormHelperText className="error-text">
                        {errors.admissionDate as string}
                      </FormHelperText>
                    )}
                  </Box>

                   {/* Class */}
                  <Box>
                    <Typography sx={labelSx}>
                      Class <span style={{ color: "#f04438" }}>*</span>
                      {!isReadOnly && (
                        <Tooltip title="Refresh Classes" arrow>
                          <IconButton
                            onClick={() =>
                              dispatch(getClasses({ type: "filter" }) as any)
                            }
                            size="small"
                            sx={{
                              color: "var(--primary-color)",
                              p: 0,
                              ml: 1,
                              "&:hover": {
                                backgroundColor:
                                  "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
                              },
                            }}
                          >
                            <RefreshIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Typography>
                    <Autocomplete
                      options={classes || []}
                      getOptionLabel={(opt: any) => opt.name || ""}
                      value={
                        (classes || []).find(
                          (c: any) => c._id === values.classId,
                        ) || null
                      }
                      onChange={(_, newVal) =>
                        setFieldValue("classId", (newVal as any)?._id || "")
                      }
                      disabled={isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select class"
                          error={touched.classId && Boolean(errors.classId)}
                          slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                        />
                      )}
                    />
                    {touched.classId && errors.classId && (
                      <FormHelperText className="error-text">
                        {errors.classId as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Section */}
                  <Box>
                    <Typography sx={labelSx}>
                      Section <span style={{ color: "#f04438" }}>*</span>
                      {!isReadOnly && (
                        <Tooltip title="Refresh Sections" arrow>
                          <IconButton
                            onClick={() =>
                              dispatch(getSections({ type: "filter" }) as any)
                            }
                            size="small"
                            sx={{
                              color: "var(--primary-color)",
                              p: 0,
                              ml: 1,
                              "&:hover": {
                                backgroundColor:
                                  "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
                              },
                            }}
                          >
                            <RefreshIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Typography>
                    <Autocomplete
                      options={sections || []}
                      getOptionLabel={(opt: any) => opt.code || ""}
                      value={
                        (sections || []).find(
                          (s: any) => s._id === values.sectionId,
                        ) || null
                      }
                      onChange={(_, newVal) =>
                        setFieldValue(
                          "sectionId",
                          (newVal as any)?._id || "",
                        )
                      }
                      disabled={isReadOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select section"
                          error={
                            touched.sectionId && Boolean(errors.sectionId)
                          }
                          slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                        />
                      )}
                    />
                    {touched.sectionId && errors.sectionId && (
                      <FormHelperText className="error-text">
                        {errors.sectionId as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                {/* ── Section: Old School Details ── */}
                <SectionTitle icon={OldSchoolIcon} title="Old School Details" />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  {/* Previous School */}
                  <Box>
                    <Typography sx={labelSx}>Previous School</Typography>
                    <TextField
                      fullWidth
                      id="previousSchool"
                      name="previousSchool"
                      placeholder="Previous school name"
                      value={values.previousSchool}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.previousSchool && Boolean(errors.previousSchool)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 100 },
                      }}
                    />
                    {touched.previousSchool && errors.previousSchool && (
                      <FormHelperText className="error-text">
                        {errors.previousSchool as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Previous Class */}
                  <Box>
                    <Typography sx={labelSx}>Previous Class</Typography>
                    <TextField
                      fullWidth
                      id="previousClass"
                      name="previousClass"
                      placeholder="e.g. Class 9"
                      value={values.previousClass}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.previousClass && Boolean(errors.previousClass)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 50 },
                      }}
                    />
                    {touched.previousClass && errors.previousClass && (
                      <FormHelperText className="error-text">
                        {errors.previousClass as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Percentage */}
                  <Box>
                    <Typography sx={labelSx}>Percentage (%)</Typography>
                    <TextField
                      fullWidth
                      id="percentage"
                      name="percentage"
                      type="number"
                      placeholder="e.g. 85"
                      value={values.percentage}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val !== "") {
                          const num = Math.min(100, Math.max(0, Number(val)));
                          val = String(num);
                        }
                        setFieldValue("percentage", val);
                      }}
                      onBlur={handleBlur}
                      error={touched.percentage && Boolean(errors.percentage)}
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { min: 0, max: 100 },
                      }}
                    />
                    {touched.percentage && errors.percentage && (
                      <FormHelperText className="error-text">
                        {errors.percentage as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Result Document */}
                  <Box gridColumn={{ xs: "span 1", sm: "span 2", md: "span 3" }}>
                    <Typography sx={labelSx}>
                      Result Document (Optional)
                    </Typography>
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
                        disabled={isReadOnly}
                        sx={{ textTransform: "none", borderRadius: "6px" }}
                      >
                        Choose File
                        <input
                          hidden
                          type="file"
                          disabled={isReadOnly}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              setFieldValue("resultDocument", files[0]);
                            }
                          }}
                        />
                      </Button>
                      <Typography sx={{ fontSize: "13px", color: "#6b7280" }}>
                        {values.resultDocument ? (
                          values.resultDocument.name
                        ) : values.resultDocumentUrl ? (
                          <Link
                            href={`${imageBaseUrl}/${values.resultDocumentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: "var(--primary-color)",
                              textDecoration: "underline",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            View Current Document
                          </Link>
                        ) : (
                          "No file chosen (PDF, JPG, PNG)"
                        )}
                      </Typography>
                      {(values.resultDocument || values.resultDocumentUrl) &&
                        !isReadOnly && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setFieldValue("resultDocument", null);
                              setFieldValue("resultDocumentUrl", "");
                            }}
                            sx={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              p: "2px",
                              bgcolor: "#ef4444",
                              color: "white",
                              boxShadow: 2,
                              zIndex: 10,
                              "&:hover": { bgcolor: "#dc2626" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                    </Box>
                    {touched.resultDocument && errors.resultDocument && (
                      <FormHelperText className="error-text">
                        {errors.resultDocument as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                {/* ── Section 3: Contact Details ── */}
                <SectionTitle icon={LocationIcon} title="Contact Details" />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  {/* Email */}
                  <Box>
                    <Typography sx={labelSx}>
                      Email <span style={{ color: "#f04438" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 70 },
                      }}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText className="error-text">
                        {errors.email as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Phone Number — Student Login Phone */}
                  <Box>
                    <Typography sx={labelSx}>
                      Student Login Phone <span style={{ color: "#f04438" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter student's own phone number"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.phoneNumber && Boolean(errors.phoneNumber)
                      }
                      disabled={isReadOnly || !!id}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 10 },
                      }}
                    />
                    {touched.phoneNumber && errors.phoneNumber ? (
                      <FormHelperText className="error-text">
                        {errors.phoneNumber as string}
                      </FormHelperText>
                    ) : (
                      <FormHelperText sx={{ color: "#667085", fontSize: "11px", mt: 0.5, mx: 0 }}>
                        {id ? "Phone number cannot be changed after registration" : "Student uses this number to login to the portal"}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Address */}
                  <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1", md: "1 / -1" } }}>
                    <Typography sx={labelSx}>Address</Typography>
                    <AutoCompleteLocation
                      setFieldValue={setFieldValue}
                      errors={errors}
                      touched={touched}
                      values={values}
                      disabled={isReadOnly}
                      placeholder="Enter address"
                      name="address"
                    />
                  </Box>

                   {/* Address Details Grid Container */}
                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        md: "1fr 1fr 1fr 1fr",
                      },
                      gap: 2,
                    }}
                  >
                    {/* City */}
                    <Box>
                      <Typography sx={labelSx}>City</Typography>
                      <TextField
                        fullWidth
                        id="city"
                        name="city"
                        placeholder="Enter city"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.city && Boolean(errors.city)}
                        disabled={isReadOnly}
                        slotProps={{
                          input: { sx: inputSx },
                          htmlInput: { maxLength: 50 },
                        }}
                      />
                      {touched.city && errors.city && (
                        <FormHelperText className="error-text">
                          {errors.city as string}
                        </FormHelperText>
                      )}
                    </Box>

                    {/* State */}
                    <Box>
                      <Typography sx={labelSx}>State</Typography>
                      <TextField
                        fullWidth
                        id="state"
                        name="state"
                        placeholder="Enter state"
                        value={values.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.state && Boolean(errors.state)}
                        disabled={isReadOnly}
                        slotProps={{
                          input: { sx: inputSx },
                          htmlInput: { maxLength: 50 },
                        }}
                      />
                      {touched.state && errors.state && (
                        <FormHelperText className="error-text">
                          {errors.state as string}
                        </FormHelperText>
                      )}
                    </Box>

                    {/* Country */}
                    <Box>
                      <Typography sx={labelSx}>Country</Typography>
                      <TextField
                        fullWidth
                        id="country"
                        name="country"
                        placeholder="Enter country"
                        value={values.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.country && Boolean(errors.country)}
                        disabled={isReadOnly}
                        slotProps={{
                          input: { sx: inputSx },
                          htmlInput: { maxLength: 50 },
                        }}
                      />
                      {touched.country && errors.country && (
                        <FormHelperText className="error-text">
                          {errors.country as string}
                        </FormHelperText>
                      )}
                    </Box>

                    {/* Pincode */}
                    <Box>
                      <Typography sx={labelSx}>Pincode</Typography>
                      <TextField
                        fullWidth
                        id="pincode"
                        name="pincode"
                        placeholder="Enter pincode"
                        value={values.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.pincode && Boolean(errors.pincode)}
                        disabled={isReadOnly}
                        slotProps={{
                          input: { sx: inputSx },
                          htmlInput: { maxLength: 6 },
                        }}
                      />
                      {touched.pincode && errors.pincode && (
                        <FormHelperText className="error-text">
                          {errors.pincode as string}
                        </FormHelperText>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* ── Section 4: Guardian Details ── */}
                <SectionTitle icon={GuardianIcon} title="Guardian Details" />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  {/* Father Name */}
                  <Box>
                    <Typography sx={labelSx}>Father&apos;s Name</Typography>
                    <TextField
                      fullWidth
                      id="fatherName"
                      name="fatherName"
                      placeholder="Enter father's name"
                      value={values.fatherName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.fatherName && Boolean(errors.fatherName)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 60 },
                      }}
                    />
                    {touched.fatherName && errors.fatherName && (
                      <FormHelperText className="error-text">
                        {errors.fatherName as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Father Phone — Parent Login */}
                  <Box>
                    <Typography sx={labelSx}>
                      Father&apos;s Contact Phone{" "}
                      <span style={{ color: "#667085", fontSize: "11px", fontWeight: 400 }}>
                        (Parent Login)
                      </span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="fatherPhone"
                      name="fatherPhone"
                      placeholder="Enter father's phone number"
                      value={values.fatherPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.fatherPhone && Boolean(errors.fatherPhone)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 10 },
                      }}
                    />
                    {touched.fatherPhone && errors.fatherPhone ? (
                      <FormHelperText className="error-text">
                        {errors.fatherPhone as string}
                      </FormHelperText>
                    ) : (
                      <FormHelperText sx={{ color: "#667085", fontSize: "11px", mt: 0.5, mx: 0 }}>
                        Father can use this number to login as parent
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Mother Name */}
                  <Box>
                    <Typography sx={labelSx}>Mother&apos;s Name</Typography>
                    <TextField
                      fullWidth
                      id="motherName"
                      name="motherName"
                      placeholder="Enter mother's name"
                      value={values.motherName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.motherName && Boolean(errors.motherName)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 60 },
                      }}
                    />
                    {touched.motherName && errors.motherName && (
                      <FormHelperText className="error-text">
                        {errors.motherName as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Mother Phone */}
                  <Box>
                    <Typography sx={labelSx}>Mother&apos;s Phone</Typography>
                    <TextField
                      fullWidth
                      id="motherPhone"
                      name="motherPhone"
                      placeholder="Enter mother's phone"
                      value={values.motherPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.motherPhone && Boolean(errors.motherPhone)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 10 },
                      }}
                    />
                    {touched.motherPhone && errors.motherPhone && (
                      <FormHelperText className="error-text">
                        {errors.motherPhone as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Guardian Name */}
                  <Box>
                    <Typography sx={labelSx}>Guardian&apos;s Name</Typography>
                    <TextField
                      fullWidth
                      id="guardianName"
                      name="guardianName"
                      placeholder="Enter guardian's name"
                      value={values.guardianName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.guardianName && Boolean(errors.guardianName)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 60 },
                      }}
                    />
                    {touched.guardianName && errors.guardianName && (
                      <FormHelperText className="error-text">
                        {errors.guardianName as string}
                      </FormHelperText>
                    )}
                  </Box>

                  {/* Guardian Phone */}
                  <Box>
                    <Typography sx={labelSx}>Guardian&apos;s Phone</Typography>
                    <TextField
                      fullWidth
                      id="guardianPhone"
                      name="guardianPhone"
                      placeholder="Enter guardian's phone"
                      value={values.guardianPhone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.guardianPhone && Boolean(errors.guardianPhone)
                      }
                      disabled={isReadOnly}
                      slotProps={{
                        input: { sx: inputSx },
                        htmlInput: { maxLength: 10 },
                      }}
                    />
                    {touched.guardianPhone && errors.guardianPhone && (
                      <FormHelperText className="error-text">
                        {errors.guardianPhone as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                {/* ── Section 5: Login Credentials (Add mode only) ── */}
                {!id && (
                  <Box sx={{ mb: 4 }}>
                    <SectionTitle icon={LockIcon} title="Login Credentials" />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      {/* Password */}
                      <Box>
                        <Typography sx={labelSx}>
                          Password <span style={{ color: "#f04438" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.password && Boolean(errors.password)}
                          slotProps={{
                            input: {
                              sx: inputSx,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                    size="small"
                                  >
                                    {showPassword ? (
                                      <VisibilityOff sx={{ fontSize: 18 }} />
                                    ) : (
                                      <Visibility sx={{ fontSize: 18 }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                            htmlInput: { maxLength: 16 },
                          }}
                        />
                        {touched.password && errors.password && (
                          <FormHelperText className="error-text">
                            {errors.password as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Confirm Password */}
                      <Box>
                        <Typography sx={labelSx}>
                          Confirm Password{" "}
                          <span style={{ color: "#f04438" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.confirmPassword &&
                            Boolean(errors.confirmPassword)
                          }
                          slotProps={{
                            input: {
                              sx: inputSx,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    edge="end"
                                    size="small"
                                  >
                                    {showConfirmPassword ? (
                                      <VisibilityOff sx={{ fontSize: 18 }} />
                                    ) : (
                                      <Visibility sx={{ fontSize: 18 }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                            htmlInput: { maxLength: 16 },
                          }}
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                          <FormHelperText className="error-text">
                            {errors.confirmPassword as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Submit / Discard */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                    flexDirection: { xs: "column-reverse", sm: "row" },
                  }}
                >
                  <Button
                    className="admin-btn-secondary"
                    variant="outlined"
                    onClick={() => navigate("/student")}
                    disabled={actionLoading || isSubmitting}
                    sx={{
                      minWidth: { xs: "100%", sm: "130px" },
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Discard
                  </Button>
                  {!isView && (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={actionLoading || isSubmitting}
                      className="admin-btn-theme"
                      sx={{
                        minWidth: { xs: "100%", sm: "120px" },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      {actionLoading || isSubmitting ? (
                        <Spinner />
                      ) : id ? (
                        "Update Student"
                      ) : (
                        "Add Student"
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
}
