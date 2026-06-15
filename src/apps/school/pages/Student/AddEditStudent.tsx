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
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Person as PersonIcon,
  School as AcademicIcon,
  LocationOn as LocationIcon,
  FamilyRestroom as GuardianIcon,
  Lock as LockIcon,
  CameraAlt as CameraAltIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import { studentValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditStudent, getStudentById } from "@/redux/slices/studentSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import { CommonLoader } from "@/apps/common/loader/Loader";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { bloodGroupOptions, genderOptions } from "@/apps/common/StaticArrayData";
import ProfileAvatar from "@/apps/common/ProfileAvatar";

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
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      rollNumber: studentData?.rollNumber || "",
      classId: studentData?.classId?._id || studentData?.classId || "",
      sectionId: studentData?.sectionId?._id || studentData?.sectionId || "",
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
    const hasFile = values.profileImage instanceof File;

    let payload: any;

    if (hasFile) {
      const formData = new FormData();
      if (values.id) formData.append("id", values.id);
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
      if (values.rollNumber) formData.append("rollNumber", values.rollNumber);
      formData.append("classId", values.classId);
      formData.append("sectionId", values.sectionId);
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
      formData.append("profileImage", values.profileImage);
      payload = formData;
    } else {
      payload = {
        ...(values.id ? { id: values.id } : {}),
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        ...(values.gender ? { gender: values.gender } : {}),
        ...(values.bloodGroup ? { bloodGroup: values.bloodGroup } : {}),
        ...(values.dateOfBirth
          ? { dateOfBirth: moment(values.dateOfBirth).toISOString() }
          : {}),
        admissionNumber: values.admissionNumber,
        ...(values.admissionDate
          ? { admissionDate: moment(values.admissionDate).toISOString() }
          : {}),
        ...(values.rollNumber ? { rollNumber: values.rollNumber } : {}),
        classId: values.classId,
        sectionId: values.sectionId,
        ...(values.address ? { address: values.address } : {}),
        ...(values.city ? { city: values.city } : {}),
        ...(values.state ? { state: values.state } : {}),
        ...(values.country ? { country: values.country } : {}),
        ...(values.pincode ? { pincode: values.pincode } : {}),
        ...(values.fatherName ? { fatherName: values.fatherName } : {}),
        ...(values.fatherPhone ? { fatherPhone: values.fatherPhone } : {}),
        ...(values.motherName ? { motherName: values.motherName } : {}),
        ...(values.motherPhone ? { motherPhone: values.motherPhone } : {}),
        ...(values.guardianName ? { guardianName: values.guardianName } : {}),
        ...(values.guardianPhone
          ? { guardianPhone: values.guardianPhone }
          : {}),
        ...(!id && values.password ? { password: values.password } : {}),
      };
    }

    const result = await dispatch(addEditStudent(payload) as any);
    if (addEditStudent.fulfilled.match(result)) {
      navigate("/student");
    }
  };

  if (id && studentLoading && !studentData) {
    return <CommonLoader />;
  }

  const isReadOnly = isView || (id ? !canEdit : !canAdd);

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
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#101828",
            mt: 0.5,
            fontFamily: "'PlusJakartaSans-Bold', sans-serif",
          }}
        >
          {isView ? "View Student" : id ? "Edit Student" : "Add Student"}
        </Typography>
      </Box>

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
            {/* ── Section 1: Basic Information ── */}
            <Box
              className="card-border common-card"
              sx={{ mb: 3, p: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: "1px solid #EAECF0",
                }}
              >
                <PersonIcon
                  sx={{ color: "var(--primary-color)", fontSize: 20 }}
                />
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#101828",
                    fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                  }}
                >
                  Basic Information
                </Typography>
              </Box>

              {/* Profile Image */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <ProfileAvatar
                    name={values.fullName || "Student"}
                    imageUrl={
                      profilePreview ||
                      (values.profileImageUrl
                        ? values.profileImageUrl.startsWith("http")
                          ? values.profileImageUrl
                          : `${imageBaseUrl}/${values.profileImageUrl}`
                        : "")
                    }
                    size={90}
                  />
                  {!isReadOnly && (
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "var(--primary-color)",
                        color: "#fff",
                        width: 28,
                        height: 28,
                        "&:hover": {
                          backgroundColor: "var(--primary-color)",
                          opacity: 0.9,
                        },
                      }}
                      size="small"
                    >
                      <CameraAltIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/svg+xml"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFieldValue("profileImage", file);
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setProfilePreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Box>
              </Box>
              {touched.profileImage && (errors.profileImage as string) && (
                <FormHelperText
                  error
                  sx={{ textAlign: "center", mt: -1, mb: 1 }}
                >
                  {errors.profileImage as string}
                </FormHelperText>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                  },
                  gap: 2,
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
                    helperText={touched.fullName && (errors.fullName as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 60 },
                    }}
                  />
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
                        helperText={touched.gender && (errors.gender as string)}
                        slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                      />
                    )}
                  />
                </Box>

                {/* Date of Birth */}
                <Box>
                  <Typography sx={labelSx}>Date of Birth</Typography>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
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
                          helperText:
                            touched.dateOfBirth &&
                            (errors.dateOfBirth as string),
                          slotProps: { input: { sx: inputSx } },
                        },
                      }}
                    />
                  </LocalizationProvider>
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
                        helperText={touched.bloodGroup && (errors.bloodGroup as string)}
                        slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Section 2: Academic Details ── */}
            <Box className="card-border common-card" sx={{ mb: 3, p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: "1px solid #EAECF0",
                }}
              >
                <AcademicIcon
                  sx={{ color: "var(--primary-color)", fontSize: 20 }}
                />
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#101828",
                    fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                  }}
                >
                  Academic Details
                </Typography>
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
                }}
              >
                {/* Admission Number */}
                <Box>
                  <Typography sx={labelSx}>
                    Admission Number{" "}
                    <span style={{ color: "#f04438" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="admissionNumber"
                    name="admissionNumber"
                    placeholder="Enter admission number"
                    value={values.admissionNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.admissionNumber &&
                      Boolean(errors.admissionNumber)
                    }
                    helperText={
                      touched.admissionNumber && (errors.admissionNumber as string)
                    }
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 30 },
                    }}
                  />
                </Box>

                {/* Admission Date */}
                <Box>
                  <Typography sx={labelSx}>
                    Admission Date{" "}
                    <span style={{ color: "#f04438" }}>*</span>
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
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
                          helperText:
                            touched.admissionDate &&
                            (errors.admissionDate as string),
                          slotProps: { input: { sx: inputSx } },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                {/* Roll Number */}
                <Box>
                  <Typography sx={labelSx}>Roll Number</Typography>
                  <TextField
                    fullWidth
                    id="rollNumber"
                    name="rollNumber"
                    placeholder="Enter roll number"
                    value={values.rollNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.rollNumber && Boolean(errors.rollNumber)
                    }
                    helperText={touched.rollNumber && (errors.rollNumber as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 20 },
                    }}
                  />
                </Box>

                {/* Class */}
                <Box>
                  <Typography sx={labelSx}>
                    Class <span style={{ color: "#f04438" }}>*</span>
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
                        helperText={touched.classId && (errors.classId as string)}
                        slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                      />
                    )}
                  />
                </Box>

                {/* Section */}
                <Box>
                  <Typography sx={labelSx}>
                    Section <span style={{ color: "#f04438" }}>*</span>
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
                        helperText={touched.sectionId && (errors.sectionId as string)}
                        slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Section 3: Contact Details ── */}
            <Box className="card-border common-card" sx={{ mb: 3, p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: "1px solid #EAECF0",
                }}
              >
                <LocationIcon
                  sx={{ color: "var(--primary-color)", fontSize: 20 }}
                />
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#101828",
                    fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                  }}
                >
                  Contact Details
                </Typography>
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
                    helperText={touched.email && (errors.email as string)}
                    disabled={isReadOnly || Boolean(id)}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 70 },
                    }}
                  />
                </Box>

                {/* Phone Number */}
                <Box>
                  <Typography sx={labelSx}>
                    Phone Number <span style={{ color: "#f04438" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.phoneNumber && Boolean(errors.phoneNumber)
                    }
                    helperText={touched.phoneNumber && (errors.phoneNumber as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 10 },
                    }}
                  />
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
                    helperText={touched.city && (errors.city as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 50 },
                    }}
                  />
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
                    helperText={touched.state && (errors.state as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 50 },
                    }}
                  />
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
                    helperText={touched.country && (errors.country as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 50 },
                    }}
                  />
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
                    helperText={touched.pincode && (errors.pincode as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 6 },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Section 4: Guardian Details ── */}
            <Box className="card-border common-card" sx={{ mb: 3, p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: "1px solid #EAECF0",
                }}
              >
                <GuardianIcon
                  sx={{ color: "var(--primary-color)", fontSize: 20 }}
                />
                <Typography
                  sx={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#101828",
                    fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                  }}
                >
                  Guardian Details
                </Typography>
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
                    helperText={touched.fatherName && (errors.fatherName as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 60 },
                    }}
                  />
                </Box>

                {/* Father Phone */}
                <Box>
                  <Typography sx={labelSx}>Father&apos;s Phone</Typography>
                  <TextField
                    fullWidth
                    id="fatherPhone"
                    name="fatherPhone"
                    placeholder="Enter father's phone"
                    value={values.fatherPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.fatherPhone && Boolean(errors.fatherPhone)
                    }
                    helperText={touched.fatherPhone && (errors.fatherPhone as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 10 },
                    }}
                  />
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
                    helperText={touched.motherName && (errors.motherName as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 60 },
                    }}
                  />
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
                    helperText={touched.motherPhone && (errors.motherPhone as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 10 },
                    }}
                  />
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
                    helperText={touched.guardianName && (errors.guardianName as string)}
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 60 },
                    }}
                  />
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
                    helperText={
                      touched.guardianPhone && (errors.guardianPhone as string)
                    }
                    disabled={isReadOnly}
                    slotProps={{
                      input: { sx: inputSx },
                      htmlInput: { maxLength: 10 },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ── Section 5: Login Credentials (Add mode only) ── */}
            {!id && (
              <Box className="card-border common-card" sx={{ mb: 3, p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2.5,
                    pb: 1.5,
                    borderBottom: "1px solid #EAECF0",
                  }}
                >
                  <LockIcon
                    sx={{ color: "var(--primary-color)", fontSize: 20 }}
                  />
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#101828",
                      fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                    }}
                  >
                    Login Credentials
                  </Typography>
                </Box>

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
                      helperText={touched.password && (errors.password as string)}
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
                      helperText={
                        touched.confirmPassword && (errors.confirmPassword as string)
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
                  </Box>
                </Box>
              </Box>
            )}

            {/* Submit / Cancel */}
            {!isView && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                  mb: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/student")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "var(--button-radius, 6px)",
                    px: 3,
                    borderColor: "#D0D5DD",
                    color: "#344054",
                    "&:hover": { borderColor: "#98A2B3", backgroundColor: "#F9FAFB" },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={actionLoading || isSubmitting}
                  className="admin-btn-theme"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "var(--button-radius, 6px)",
                    px: 3,
                    minWidth: 120,
                  }}
                >
                  {actionLoading || isSubmitting
                    ? id
                      ? "Updating..."
                      : "Saving..."
                    : id
                      ? "Update Student"
                      : "Add Student"}
                </Button>
              </Box>
            )}
          </Form>
        )}
      </Formik>
    </Box>
  );
}
