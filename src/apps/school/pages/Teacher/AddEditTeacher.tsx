import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  OutlinedInput,
  Button,
  FormHelperText,
  Breadcrumbs,
  Link,
  Autocomplete,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Work as AcademicIcon,
  LocationOn as LocationIcon,
  Payment as SalaryIcon,
  History as HistoryIcon,
  Description as DocumentIcon,
  Visibility,
  VisibilityOff,
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { renderSingleImage } from "@/apps/common/uploadImageAndVideo";
import { InputAdornment, IconButton } from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { teacherValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditTeacher, getTeacherById } from "@/redux/slices/teacherSlice";
import { getProfileAdmin } from "@/redux/slices/authSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import { getSubjects } from "@/redux/slices/subjectSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import { getAllRolesSimple } from "@/redux/slices/roleSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { CommonLoader } from "@/apps/school/component/schoolCommon/loader/Loader";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import {
  bloodGroupOptions,
  genderOptions,
  employmentTypeOptions,
  salaryTypeOptions,
} from "@/apps/common/StaticArrayData";

const maritalStatusOptions = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Divorced", value: "Divorced" },
  { label: "Widowed", value: "Widowed" },
];

const socialCategoryOptions = [
  { label: "General", value: "General" },
  { label: "OBC", value: "OBC" },
  { label: "SC", value: "SC" },
  { label: "ST", value: "ST" },
  { label: "Other", value: "Other" },
];

const FormikSyncAddress = ({ values, setFieldValue, sameAsCurrentAddress, sameAsSchoolAddress, schoolData }: any) => {
  useEffect(() => {
    if (sameAsCurrentAddress) {
      setFieldValue("permanentAddress", values.address || "");
      setFieldValue("permanentCity", values.city || "");
      setFieldValue("permanentState", values.state || "");
      setFieldValue("permanentCountry", values.country || "");
      setFieldValue("permanentPincode", values.pincode || "");
    }
  }, [
    sameAsCurrentAddress,
    values.address,
    values.city,
    values.state,
    values.country,
    values.pincode,
    setFieldValue
  ]);

  useEffect(() => {
    if (sameAsSchoolAddress && schoolData) {
      setFieldValue("permanentAddress", schoolData.address || "");
      setFieldValue("permanentCity", schoolData.city || "");
      setFieldValue("permanentState", schoolData.state || "");
      setFieldValue("permanentCountry", schoolData.country || "");
      setFieldValue("permanentPincode", schoolData.zipCode || schoolData.pincode || "");
    }
  }, [
    sameAsSchoolAddress,
    schoolData,
    setFieldValue
  ]);

  return null;
};

export default function AddEditTeacher() {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = location;
  const isView = pathname.endsWith("/view");
  const { hasPermission } = usePermissions();

  const canAdd = hasPermission(schoolAdminPermission.teacher.create);
  const canEdit = hasPermission(schoolAdminPermission.teacher.update);
  const { allDepartments: departments } = useSelector(
    (state: RootState) => state.DepartmentReducer,
  );

  const { allRoles } = useSelector((state: RootState) => state.RoleReducer);
  const { actionLoading, loading: teacherLoading } = useSelector(
    (state: RootState) => state.TeacherReducer,
  );
  const { loading: deptLoading } = useSelector(
    (state: RootState) => state.DepartmentReducer,
  );
  const { loading: subjectLoading } = useSelector(
    (state: RootState) => state.SubjectReducer,
  );
  const { loading: classLoading } = useSelector(
    (state: RootState) => state.ClassReducer,
  );
  const { loading: sectionLoading } = useSelector(
    (state: RootState) => state.SectionReducer,
  );

  const isPageLoading =
    teacherLoading ||
    deptLoading ||
    subjectLoading ||
    classLoading ||
    sectionLoading;
  const [openDOB, setOpenDOB] = useState(false);
  const [openJoiningDate, setOpenJoiningDate] = useState(false);
  const [openShiftTimeFrom, setOpenShiftTimeFrom] = useState(false);
  const [openShiftTimeTo, setOpenShiftTimeTo] = useState(false);
  const [openConfirmationDate, setOpenConfirmationDate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { adminDetails } = useSelector(
    (state: RootState) => state.AdminReducer,
  );

  const [teacherData, setTeacherData] = useState<any>(null);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [sameAsSchoolAddress, setSameAsSchoolAddress] = useState(false);

  useEffect(() => {
    if (teacherData) {
      if (
        teacherData.address &&
        teacherData.address === teacherData.permanentAddress &&
        teacherData.city === teacherData.permanentCity &&
        teacherData.state === teacherData.permanentState &&
        teacherData.country === teacherData.permanentCountry &&
        teacherData.pincode === teacherData.permanentPincode
      ) {
        setSameAsCurrentAddress(true);
      }
    }
  }, [teacherData]);

  useEffect(() => {
    if (teacherData && adminDetails?.schoolData) {
      const schoolData = adminDetails.schoolData;
      if (
        teacherData.permanentAddress &&
        teacherData.permanentAddress === schoolData.address &&
        teacherData.permanentCity === schoolData.city &&
        teacherData.permanentState === schoolData.state &&
        teacherData.permanentCountry === schoolData.country &&
        teacherData.permanentPincode === (schoolData.zipCode || schoolData.pincode)
      ) {
        setSameAsSchoolAddress(true);
      }
    }
  }, [teacherData, adminDetails?.schoolData]);

  const fetchTeacherDetails = async () => {
    const result = await dispatch(getTeacherById(id as string) as any);
    if (getTeacherById.fulfilled.match(result)) {
      setTeacherData(result.payload);
    }
  };

  useEffect(() => {
    const params = { type: "filter" };
    dispatch(getDepartments(params) as any);
    dispatch(getSubjects(params) as any);
    dispatch(getClasses(params) as any);
    dispatch(getSections(params) as any);
    dispatch(getAllRolesSimple("filter") as any);

    if (!adminDetails || !adminDetails.schoolData) {
      dispatch(getProfileAdmin() as any);
    }

    if (id) {
      fetchTeacherDetails();
    }
  }, [id, dispatch, adminDetails]);

  const initialValues = useMemo(
    () => ({
      id: id || "",
      fullName: teacherData?.fullName || "",
      gender: teacherData?.gender || "",
      dateOfBirth: teacherData?.dateOfBirth
        ? moment(teacherData.dateOfBirth)
        : null,
      profileImage: teacherData?.profileImage || null,
      profileImageUrl: teacherData?.profileImage || "",
      bloodGroup: teacherData?.bloodGroup || "",
      // Contact
      email: teacherData?.email || "",
      phoneNumber: teacherData?.phoneNumber || "",
      alternatePhoneNumber: teacherData?.alternatePhoneNumber || "",
      address: teacherData?.address || "",
      city: teacherData?.city || "",
      state: teacherData?.state || "",
      country: teacherData?.country || "India",
      pincode: teacherData?.pincode || "",
      // New fields in Contact/Personal
      fatherSpouseName: teacherData?.fatherSpouseName || "",
      motherName: teacherData?.motherName || "",
      maritalStatus: teacherData?.maritalStatus || "",
      socialCategory: teacherData?.socialCategory || "",
      religion: teacherData?.religion || "",
      nationality: teacherData?.nationality || "Indian",
      permanentAddress: teacherData?.permanentAddress || "",
      permanentCity: teacherData?.permanentCity || "",
      permanentState: teacherData?.permanentState || "",
      permanentCountry: teacherData?.permanentCountry || "India",
      permanentPincode: teacherData?.permanentPincode || "",
      emergencyContactName: teacherData?.emergencyContactName || "",
      emergencyContactRelation: teacherData?.emergencyContactRelation || "",
      emergencyContactPhone: teacherData?.emergencyContactPhone || "",
      // Auth
      password: "",
      confirmPassword: "",
      // Professional
      joiningDate: teacherData?.joiningDate
        ? moment(teacherData.joiningDate)
        : null,
      experienceYears: teacherData?.experienceYears || "",
      qualification: teacherData?.qualification || "",
      specialization: teacherData?.specialization || "",
      designation: teacherData?.designation || "",
      departmentId:
        teacherData?.departmentId?._id || teacherData?.departmentId || "",
      subjects: teacherData?.subjects?.map((s: any) => s._id || s) || [],
      classesAssigned:
        teacherData?.classesAssigned?.map((c: any) => c._id || c) || [],
      sectionsAssigned:
        teacherData?.sectionsAssigned?.map((s: any) => s._id || s) || [],
      probationPeriod: teacherData?.probationPeriod !== undefined && teacherData?.probationPeriod !== null ? teacherData.probationPeriod : "",
      confirmationDate: teacherData?.confirmationDate
        ? moment(teacherData.confirmationDate)
        : null,
      previousSchoolName: teacherData?.previousSchoolName || "",
      previousDesignation: teacherData?.previousDesignation || "",
      previousDuration: teacherData?.previousDuration || "",
      previousLeavingReason: teacherData?.previousLeavingReason || "",
      trainingDetails: teacherData?.trainingDetails || "",
      trainingPeriod: teacherData?.trainingPeriod !== undefined && teacherData?.trainingPeriod !== null ? teacherData.trainingPeriod : "",
      udiseTeacherNumber: teacherData?.udiseTeacherNumber || "",
      ctsNumber: teacherData?.ctsNumber || "",
      // Salary
      employmentType: teacherData?.employmentType || "",
      salary: teacherData?.salary || "",
      salaryType: teacherData?.salaryType || "",
      bankName: teacherData?.bankName || "",
      accountNumber: teacherData?.accountNumber || "",
      confirmAccountNumber: teacherData?.accountNumber || "",
      ifscCode: teacherData?.ifscCode || "",
      panNumber: teacherData?.panNumber || "",
      aadharNumber: teacherData?.aadharNumber || "",
      accountHolderName: teacherData?.accountHolderName || "",
      branchName: teacherData?.branchName || "",
      pfNumber: teacherData?.pfNumber || "",
      uanNumber: teacherData?.uanNumber || "",
      esicNumber: teacherData?.esicNumber || "",
      // Documents
      idProof: teacherData?.idProof || null,
      idProofName: teacherData?.idProof || "",
      aadharCard: teacherData?.aadharCard || null,
      aadharCardName: teacherData?.aadharCard || "",
      appointmentLetter: teacherData?.appointmentLetter || null,
      appointmentLetterName: teacherData?.appointmentLetter || "",
      educationCertificates: teacherData?.educationCertificates || [],
      experienceCertificates: teacherData?.experienceCertificates || [],
      // Attendance
      attendanceId: teacherData?.attendanceId || "",
      leaveBalance: teacherData?.leaveBalance || 0,
      workingHours: teacherData?.workingHours || "",
      shiftTiming: teacherData?.shiftTiming || "",
      shiftTimeFrom: teacherData?.shiftTiming?.includes(" - ")
        ? moment(teacherData.shiftTiming.split(" - ")[0], "hh:mm A")
        : null,
      shiftTimeTo: teacherData?.shiftTiming?.includes(" - ")
        ? moment(teacherData.shiftTiming.split(" - ")[1], "hh:mm A")
        : null,
      roles: teacherData?.userId?.roles?.map((r: { _id?: string } | string) => typeof r === "object" ? r._id || "" : r) || (teacherData?.userId?.role ? [teacherData.userId.role._id || teacherData.userId.role] : []),
      isActive: teacherData?.isActive ?? true,
    }),
    [id, teacherData],
  );

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();

      // Basic Info
      formData.append("fullName", values.fullName);
      formData.append("email", values.email);
      formData.append("phoneNumber", values.phoneNumber);
      if (values.alternatePhoneNumber)
        formData.append("alternatePhoneNumber", values.alternatePhoneNumber);
      if (values.gender) formData.append("gender", values.gender);
      if (values.bloodGroup) formData.append("bloodGroup", values.bloodGroup);
      if (values.dateOfBirth) {
        formData.append(
          "dateOfBirth",
          moment(values.dateOfBirth).toISOString(),
        );
      }
      formData.append("fatherSpouseName", values.fatherSpouseName);
      formData.append("motherName", values.motherName);
      formData.append("maritalStatus", values.maritalStatus);
      formData.append("socialCategory", values.socialCategory);
      formData.append("religion", values.religion);
      formData.append("nationality", values.nationality);

      // Address
      formData.append("address", values.address);
      if (values.city) formData.append("city", values.city);
      if (values.state) formData.append("state", values.state);
      if (values.country) formData.append("country", values.country);
      if (values.pincode) formData.append("pincode", values.pincode);

      formData.append("permanentAddress", values.permanentAddress);
      formData.append("permanentCity", values.permanentCity);
      formData.append("permanentState", values.permanentState);
      formData.append("permanentCountry", values.permanentCountry);
      formData.append("permanentPincode", values.permanentPincode);

      formData.append("emergencyContactName", values.emergencyContactName);
      formData.append("emergencyContactRelation", values.emergencyContactRelation);
      formData.append("emergencyContactPhone", values.emergencyContactPhone);

      // Professional
      if (values.joiningDate) {
        formData.append(
          "joiningDate",
          moment(values.joiningDate).toISOString(),
        );
      }
      if (values.experienceYears)
        formData.append("experienceYears", values.experienceYears);
      formData.append("qualification", values.qualification);
      formData.append("specialization", values.specialization);
      formData.append("designation", values.designation);
      formData.append("departmentId", values.departmentId);

      if (values.probationPeriod !== undefined && values.probationPeriod !== null && values.probationPeriod !== "") {
        formData.append("probationPeriod", values.probationPeriod.toString());
      }
      if (values.confirmationDate) {
        formData.append("confirmationDate", moment(values.confirmationDate).toISOString());
      }
      formData.append("previousSchoolName", values.previousSchoolName);
      formData.append("previousDesignation", values.previousDesignation);
      formData.append("previousDuration", values.previousDuration);
      formData.append("previousLeavingReason", values.previousLeavingReason);
      formData.append("trainingDetails", values.trainingDetails);
      if (values.trainingPeriod !== undefined && values.trainingPeriod !== null && values.trainingPeriod !== "")
        formData.append("trainingPeriod", values.trainingPeriod.toString());
      if (values.udiseTeacherNumber)
        formData.append("udiseTeacherNumber", values.udiseTeacherNumber);
      if (values.ctsNumber)
        formData.append("ctsNumber", values.ctsNumber);

      // Arrays
      values.subjects.forEach((id: string) =>
        formData.append("subjects[]", id),
      );
      values.classesAssigned.forEach((id: string) =>
        formData.append("classesAssigned[]", id),
      );
      values.sectionsAssigned.forEach((id: string) =>
        formData.append("sectionsAssigned[]", id),
      );

      // Employment & Salary
      formData.append("employmentType", values.employmentType);
      if (values.salary) formData.append("salary", values.salary.toString());
      if (values.salaryType) formData.append("salaryType", values.salaryType);
      if (values.bankName) formData.append("bankName", values.bankName);
      if (values.accountNumber)
        formData.append("accountNumber", values.accountNumber);
      if (values.ifscCode) formData.append("ifscCode", values.ifscCode);
      if (values.panNumber) formData.append("panNumber", values.panNumber);
      if (values.aadharNumber)
        formData.append("aadharNumber", values.aadharNumber);

      if (values.accountHolderName) formData.append("accountHolderName", values.accountHolderName);
      if (values.branchName) formData.append("branchName", values.branchName);
      if (values.pfNumber) formData.append("pfNumber", values.pfNumber);
      if (values.uanNumber) formData.append("uanNumber", values.uanNumber);
      if (values.esicNumber) formData.append("esicNumber", values.esicNumber);

      // Auth (Only for Add)
      if (!id && values.password) formData.append("password", values.password);

      // Documents
      if (values.profileImage)
        formData.append("profileImage", values.profileImage);
      if (values.idProof) formData.append("idProof", values.idProof);
      if (values.aadharCard) formData.append("aadharCard", values.aadharCard);
      if (values.appointmentLetter)
        formData.append("appointmentLetter", values.appointmentLetter);

      // Certificates
      if (values.educationCertificates?.length > 0) {
        values.educationCertificates.forEach((file: any) => {
          formData.append("educationCertificates", file);
        });
      }
      if (values.experienceCertificates?.length > 0) {
        values.experienceCertificates.forEach((file: any) => {
          formData.append("experienceCertificates", file);
        });
      }

      // Tracking
      if (values.attendanceId)
        formData.append("attendanceId", values.attendanceId);
      if (values.leaveBalance)
        formData.append("leaveBalance", values.leaveBalance.toString());
      if (values.workingHours)
        formData.append("workingHours", values.workingHours);
      if (values.shiftTimeFrom && values.shiftTimeTo) {
        const shiftTimingStr = `${moment(values.shiftTimeFrom).format("hh:mm A")} - ${moment(values.shiftTimeTo).format("hh:mm A")}`;
        formData.append("shiftTiming", shiftTimingStr);
      } else if (values.shiftTiming) {
        formData.append("shiftTiming", values.shiftTiming);
      }
      if (values.roles && values.roles.length > 0) {
        values.roles.forEach((rId: string) => {
          formData.append("roles[]", rId);
        });
      }
      if (values.isActive !== undefined)
        formData.append("isActive", values.isActive.toString());

      const resultAction = await dispatch(
        addEditTeacher({ payload: formData, id }) as any,
      );

      if (addEditTeacher.fulfilled.match(resultAction)) {
        if (id) {
          navigate("/teacher");
        } else {
          navigate("/teacher/otp", {
            state: {
              type: "teacher",
              phone: values.phoneNumber,
              email: values.email,
            },
          });
        }
      }
    } catch (error: any) {
      toasterError(error?.message || "Something went wrong");
    }
  };

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
        mt: isFirst ? 0 : 7,
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
      <Box className="admin-page-title-main" sx={{ mb: 1.5 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          className="admin-breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/teacher")}
            sx={{ cursor: "pointer", fontSize: "14px" }}
          >
            Teachers
          </Link>
          <Typography className="admin-breadcrumb-active">
            {id
              ? isView
                ? "View Teacher"
                : teacherData?.fullName || "Edit Teacher"
              : "Add Teacher"}
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
        {isPageLoading ? (
          <CommonLoader />
        ) : (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={teacherValidationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps: FormikProps<any>) => {
              const {
                values,
                setFieldValue,
                handleChange,
                handleBlur,
                handleSubmit,
                touched,
                errors,
              } = formikProps;
              return (
                <Form
                  onSubmit={handleSubmit}
                  style={{ pointerEvents: isView ? "none" : "auto" }}
                >
                  <FormikSyncAddress
                    values={values}
                    setFieldValue={setFieldValue}
                    sameAsCurrentAddress={sameAsCurrentAddress}
                    sameAsSchoolAddress={sameAsSchoolAddress}
                    schoolData={adminDetails?.schoolData}
                  />
                  <Box sx={{ maxWidth: 1100 }}>
                    {/* 1. Basic Information */}
                    <SectionTitle
                      icon={PersonIcon}
                      title="Basic Information"
                      isFirst
                    >
                      {id && teacherData && (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1.2,
                              py: 0.4,
                              borderRadius: "20px",
                              backgroundColor: teacherData?.isVerified
                                ? "rgba(33, 150, 243, 0.1)"
                                : "rgba(255, 152, 0, 0.1)",
                              color: teacherData?.isVerified
                                ? "#2196f3"
                                : "#ff9800",
                              border: "1px solid currentColor",
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: "currentColor",
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              {teacherData?.isVerified
                                ? "Verified"
                                : "Unverified"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1.2,
                              py: 0.4,
                              borderRadius: "20px",
                              backgroundColor: teacherData?.isActive
                                ? "rgba(76, 175, 80, 0.1)"
                                : "rgba(244, 67, 54, 0.1)",
                              color: teacherData?.isActive
                                ? "#4caf50"
                                : "#f44336",
                              border: "1px solid currentColor",
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: "currentColor",
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              {teacherData?.isActive ? "Active" : "Inactive"}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </SectionTitle>
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box
                        gridColumn="span 12"
                        sx={{
                          display: "flex",
                          gap: 3,
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ position: "relative" }}>
                          <Button
                            variant="outlined"
                            component="label"
                            disabled={isView}
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
                              cursor: isView ? "default" : "pointer",
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
                              disabled={isView}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  setFieldValue("profileImage", files[0]);
                                }
                              }}
                            />
                          </Button>
                          {(values.profileImage || values.profileImageUrl) && !isView && (
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
                        </Box>
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Full Name<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="fullName"
                          placeholder="Enter Full Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.fullName}
                          onChange={handleChange}
                          error={touched.fullName && Boolean(errors.fullName)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.fullName && errors.fullName && (
                          <FormHelperText className="error-text">
                            {errors.fullName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Gender</Typography>
                        <Autocomplete
                          options={genderOptions}
                          getOptionLabel={(o) => o.label}
                          value={
                            genderOptions.find(
                              (o) => o.value === values.gender,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("gender", v?.value || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select"
                              variant="outlined"
                              sx={inputSx}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Blood Group</Typography>
                        <Autocomplete
                          options={bloodGroupOptions}
                          getOptionLabel={(o) => o.label}
                          value={
                            bloodGroupOptions.find(
                              (o) => o.value === values.bloodGroup,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("bloodGroup", v?.value || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select"
                              variant="outlined"
                              sx={inputSx}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Date of Birth
                          <span style={{ color: "#ef4444", marginRight: "4px" }}>*</span>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>
                            (Age 18 to 70 only)
                          </span>
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <DatePicker
                            format="DD/MM/YYYY"
                            value={values.dateOfBirth}
                            open={openDOB}
                            onOpen={() => setOpenDOB(true)}
                            onClose={() => setOpenDOB(false)}
                            onChange={(v) => setFieldValue("dateOfBirth", v)}
                            disableFuture
                            maxDate={moment().subtract(18, "years")}
                            minDate={moment().subtract(70, "years")}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: "Select Date",
                                variant: "outlined",
                                onClick: () => setOpenDOB(true),
                                error:
                                  touched.dateOfBirth &&
                                  Boolean(errors.dateOfBirth),
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
                                  "& .MuiOutlinedInput-input": {
                                    padding: "0 14px !important",
                                    fontSize: "14px !important",
                                    fontFamily:
                                      "var(--font-family, 'Poppins', sans-serif) !important",
                                    height: "40px",
                                    cursor: "pointer",
                                  },
                                },
                              },
                              popper: {
                                sx: {
                                  "& .MuiPickersDay-root.Mui-selected": {
                                    backgroundColor:
                                      "var(--primary-color, #5c1a1a) !important",
                                    color: "#ffffff !important",
                                  },
                                  "& .MuiPickersDay-root:hover": {
                                    backgroundColor:
                                      "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                  },
                                  "& .MuiPickersYear-yearButton.Mui-selected": {
                                    backgroundColor:
                                      "var(--primary-color, #5c1a1a) !important",
                                    color: "#ffffff !important",
                                  },
                                  "& .MuiPickersMonth-monthButton.Mui-selected":
                                    {
                                      backgroundColor:
                                        "var(--primary-color, #5c1a1a) !important",
                                      color: "#ffffff !important",
                                    },
                                },
                              },
                              field: { readOnly: true } as any,
                            }}
                          />
                        </LocalizationProvider>
                        {touched.dateOfBirth && errors.dateOfBirth && (
                          <FormHelperText className="error-text">
                            {errors.dateOfBirth as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Father / Spouse Name */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Father's / Spouse's Name<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="fatherSpouseName"
                          placeholder="Enter Father's or Spouse's Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.fatherSpouseName}
                          onChange={(e) =>
                            setFieldValue(
                              "fatherSpouseName",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={touched.fatherSpouseName && Boolean(errors.fatherSpouseName)}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.fatherSpouseName && errors.fatherSpouseName && (
                          <FormHelperText className="error-text">
                            {errors.fatherSpouseName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Mother's Name */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Mother's Name</Typography>
                        <TextField
                          fullWidth
                          name="motherName"
                          placeholder="Enter Mother's Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.motherName}
                          onChange={(e) =>
                            setFieldValue(
                              "motherName",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={touched.motherName && Boolean(errors.motherName)}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.motherName && errors.motherName && (
                          <FormHelperText className="error-text">
                            {errors.motherName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Marital Status */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Marital Status<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Autocomplete
                          options={maritalStatusOptions}
                          getOptionLabel={(o) => o.label}
                          value={
                            maritalStatusOptions.find(
                              (o) => o.value === values.maritalStatus,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("maritalStatus", v?.value || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select"
                              variant="outlined"
                              sx={inputSx}
                              error={touched.maritalStatus && Boolean(errors.maritalStatus)}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                        {touched.maritalStatus && errors.maritalStatus && (
                          <FormHelperText className="error-text">
                            {errors.maritalStatus as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Social Category */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Social Category<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Autocomplete
                          options={socialCategoryOptions}
                          getOptionLabel={(o) => o.label}
                          value={
                            socialCategoryOptions.find(
                              (o) => o.value === values.socialCategory,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("socialCategory", v?.value || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select"
                              variant="outlined"
                              sx={inputSx}
                              error={touched.socialCategory && Boolean(errors.socialCategory)}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                        {touched.socialCategory && errors.socialCategory && (
                          <FormHelperText className="error-text">
                            {errors.socialCategory as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Religion */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Religion</Typography>
                        <TextField
                          fullWidth
                          name="religion"
                          placeholder="e.g. Hindu, Christian, Muslim"
                          variant="outlined"
                          sx={inputSx}
                          value={values.religion}
                          onChange={(e) =>
                            setFieldValue(
                              "religion",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={touched.religion && Boolean(errors.religion)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.religion && errors.religion && (
                          <FormHelperText className="error-text">
                            {errors.religion as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Nationality */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Nationality<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="nationality"
                          placeholder="e.g. Indian"
                          variant="outlined"
                          sx={inputSx}
                          value={values.nationality}
                          onChange={(e) =>
                            setFieldValue(
                              "nationality",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={touched.nationality && Boolean(errors.nationality)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.nationality && errors.nationality && (
                          <FormHelperText className="error-text">
                            {errors.nationality as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>

                    {/* 2. Contact Details */}
                    <SectionTitle icon={LocationIcon} title="Contact Details" />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Email<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="email"
                          placeholder="email@example.com"
                          variant="outlined"
                          sx={inputSx}
                          value={values.email}
                          onChange={handleChange}
                          error={touched.email && Boolean(errors.email)}
                          disabled={!!id}
                                                  />
                        {touched.email && errors.email && (
                          <FormHelperText className="error-text">
                            {errors.email as string}
                          </FormHelperText>
                        )}
                        {id && teacherData?.teacherCode && (
                          <Box sx={{ mt: 0.8, display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: "11px", color: "#667085" }}>
                              Teacher Code:
                            </Typography>
                            <Chip
                              label={teacherData.teacherCode}
                              size="small"
                              sx={{
                                height: "20px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "rgba(var(--primary-color-rgb, 92,26,26), 0.1)",
                                color: "var(--primary-color)",
                                borderRadius: "4px",
                                "& .MuiChip-label": { px: "8px" },
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Phone Number
                          <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="phoneNumber"
                          placeholder="9876543210"
                          variant="outlined"
                          sx={inputSx}
                          value={values.phoneNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "phoneNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          error={
                            touched.phoneNumber && Boolean(errors.phoneNumber)
                          }
                          disabled={!!id}
                          slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        {touched.phoneNumber && errors.phoneNumber && (
                          <FormHelperText className="error-text">
                            {errors.phoneNumber as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Alternate Phone</Typography>
                        <TextField
                          fullWidth
                          name="alternatePhoneNumber"
                          placeholder="Alternate Number"
                          variant="outlined"
                          sx={inputSx}
                          value={values.alternatePhoneNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "alternatePhoneNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                      </Box>
                      <Box gridColumn="span 12" className="admin-input-box">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography sx={labelSx}>
                            Role
                            <span
                              style={{ color: "#ef4444", marginLeft: "2px" }}
                            >
                              *
                            </span>
                          </Typography>
                          <Tooltip title="Refresh Roles" arrow>
                            <IconButton
                              onClick={() =>
                                dispatch(getAllRolesSimple("filter") as any)
                              }
                              size="small"
                              sx={{
                                mb: 0.5,
                                color: "var(--primary-color)",
                                "&:hover": {
                                  backgroundColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
                                },
                              }}
                            >
                              <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Autocomplete
                          multiple
                          options={allRoles || []}
                          getOptionLabel={(option: { role?: string; _id?: string }) => option.role || ""}
                          value={
                            allRoles?.filter((role: { _id?: string; role?: string }) =>
                              values.roles?.includes(role._id),
                            ) || []
                          }
                          onChange={(_, newValue) => {
                            setFieldValue(
                              "roles",
                              newValue ? newValue.map((item: { _id?: string; role?: string }) => item._id) : [],
                            );
                          }}
                          disabled={isView}
                          clearIcon={null}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Roles"
                              variant="outlined"
                              sx={inputSx}
                              error={touched.roles && Boolean(errors.roles)}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                        <FormHelperText className="error-text">
                          {touched.roles && errors.roles
                            ? (errors.roles as string)
                            : ""}
                        </FormHelperText>
                      </Box>
                      <Box gridColumn="span 12">
                        <Typography sx={labelSx}>
                          Address (Search Location)
                        </Typography>
                        <AutoCompleteLocation
                          name="address"
                          placeholder="Search address..."
                          values={values}
                          setFieldValue={setFieldValue}
                          touched={touched}
                          errors={errors}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>City</Typography>
                        <TextField
                          fullWidth
                          name="city"
                          placeholder="City"
                          variant="outlined"
                          sx={inputSx}
                          value={values.city}
                          onChange={handleChange}
                                                  />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>State</Typography>
                        <TextField
                          fullWidth
                          name="state"
                          placeholder="State"
                          variant="outlined"
                          sx={inputSx}
                          value={values.state}
                          onChange={handleChange}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Pincode</Typography>
                        <TextField
                          fullWidth
                          name="pincode"
                          placeholder="Pincode"
                          variant="outlined"
                          sx={inputSx}
                          value={values.pincode}
                          onChange={handleChange}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Country</Typography>
                        <TextField
                          fullWidth
                          name="country"
                          placeholder="Country"
                          variant="outlined"
                          sx={inputSx}
                          value={values.country}
                          onChange={handleChange}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                      </Box>

                      {/* Checkbox for same address */}
                      <Box gridColumn="span 12" sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <input
                            type="checkbox"
                            id="sameAsCurrentAddressCheckbox"
                            checked={sameAsCurrentAddress}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSameAsCurrentAddress(checked);
                              if (checked) {
                                setSameAsSchoolAddress(false);
                                setFieldValue("permanentAddress", values.address);
                                setFieldValue("permanentCity", values.city);
                                setFieldValue("permanentState", values.state);
                                setFieldValue("permanentCountry", values.country);
                                setFieldValue("permanentPincode", values.pincode);
                              }
                            }}
                            disabled={isView}
                            style={{ width: "16px", height: "16px", cursor: isView ? "default" : "pointer" }}
                          />
                          <label
                            htmlFor="sameAsCurrentAddressCheckbox"
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#475467",
                              cursor: isView ? "default" : "pointer"
                            }}
                          >
                            Permanent address same as current address
                          </label>
                        </Box>

                        {adminDetails?.schoolData && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <input
                              type="checkbox"
                              id="sameAsSchoolAddressCheckbox"
                              checked={sameAsSchoolAddress}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSameAsSchoolAddress(checked);
                                if (checked) {
                                  setSameAsCurrentAddress(false);
                                  setFieldValue("permanentAddress", adminDetails.schoolData.address || "");
                                  setFieldValue("permanentCity", adminDetails.schoolData.city || "");
                                  setFieldValue("permanentState", adminDetails.schoolData.state || "");
                                  setFieldValue("permanentCountry", adminDetails.schoolData.country || "");
                                  setFieldValue("permanentPincode", adminDetails.schoolData.zipCode || adminDetails.schoolData.pincode || "");
                                }
                              }}
                              disabled={isView}
                              style={{ width: "16px", height: "16px", cursor: isView ? "default" : "pointer" }}
                            />
                            <label
                              htmlFor="sameAsSchoolAddressCheckbox"
                              style={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#475467",
                                cursor: isView ? "default" : "pointer"
                              }}
                            >
                              Permanent address same as school address
                            </label>
                          </Box>
                        )}
                      </Box>

                      {/* Permanent Address fields */}
                      <Box gridColumn="span 12" sx={{ mt: 2 }}>
                        <Typography sx={labelSx}>
                          Permanent Address (Search Location)<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <AutoCompleteLocation
                          name="permanentAddress"
                          placeholder="Search permanent address..."
                          values={values}
                          setFieldValue={setFieldValue}
                          touched={touched}
                          errors={errors}
                          disabled={isView || sameAsCurrentAddress || sameAsSchoolAddress}
                          fieldNames={{
                            city: "permanentCity",
                            state: "permanentState",
                            country: "permanentCountry",
                            pincode: "permanentPincode",
                          }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Permanent City<span style={{ color: "#ef4444" }}>*</span></Typography>
                        <TextField
                          fullWidth
                          name="permanentCity"
                          placeholder="City"
                          variant="outlined"
                          sx={inputSx}
                          value={sameAsCurrentAddress ? values.city : sameAsSchoolAddress ? (adminDetails?.schoolData?.city || "") : values.permanentCity}
                          onChange={handleChange}
                          error={touched.permanentCity && Boolean(errors.permanentCity)}
                          disabled={isView || sameAsCurrentAddress || sameAsSchoolAddress}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.permanentCity && errors.permanentCity && (
                          <FormHelperText className="error-text">
                            {errors.permanentCity as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Permanent State<span style={{ color: "#ef4444" }}>*</span></Typography>
                        <TextField
                          fullWidth
                          name="permanentState"
                          placeholder="State"
                          variant="outlined"
                          sx={inputSx}
                          value={sameAsCurrentAddress ? values.state : sameAsSchoolAddress ? (adminDetails?.schoolData?.state || "") : values.permanentState}
                          onChange={handleChange}
                          error={touched.permanentState && Boolean(errors.permanentState)}
                          disabled={isView || sameAsCurrentAddress || sameAsSchoolAddress}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.permanentState && errors.permanentState && (
                          <FormHelperText className="error-text">
                            {errors.permanentState as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Permanent Pincode<span style={{ color: "#ef4444" }}>*</span></Typography>
                        <TextField
                          fullWidth
                          name="permanentPincode"
                          placeholder="Pincode"
                          variant="outlined"
                          sx={inputSx}
                          value={sameAsCurrentAddress ? values.pincode : sameAsSchoolAddress ? (adminDetails?.schoolData?.zipCode || adminDetails?.schoolData?.pincode || "") : values.permanentPincode}
                          onChange={handleChange}
                          error={touched.permanentPincode && Boolean(errors.permanentPincode)}
                          disabled={isView || sameAsCurrentAddress || sameAsSchoolAddress}
                          slotProps={{ htmlInput: { maxLength: 6 } }}
                        />
                        {touched.permanentPincode && errors.permanentPincode && (
                          <FormHelperText className="error-text">
                            {errors.permanentPincode as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 3" }}>
                        <Typography sx={labelSx}>Permanent Country<span style={{ color: "#ef4444" }}>*</span></Typography>
                        <TextField
                          fullWidth
                          name="permanentCountry"
                          placeholder="Country"
                          variant="outlined"
                          sx={inputSx}
                          value={sameAsCurrentAddress ? values.country : sameAsSchoolAddress ? (adminDetails?.schoolData?.country || "") : values.permanentCountry}
                          onChange={handleChange}
                          error={touched.permanentCountry && Boolean(errors.permanentCountry)}
                          disabled={isView || sameAsCurrentAddress || sameAsSchoolAddress}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.permanentCountry && errors.permanentCountry && (
                          <FormHelperText className="error-text">
                            {errors.permanentCountry as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>

                    {/* Emergency Contact details */}
                    <SectionTitle icon={PersonIcon} title="Emergency Contact Details" />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Emergency Contact Name<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="emergencyContactName"
                          placeholder="Contact Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.emergencyContactName}
                          onChange={(e) =>
                            setFieldValue(
                              "emergencyContactName",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={touched.emergencyContactName && Boolean(errors.emergencyContactName)}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.emergencyContactName && errors.emergencyContactName && (
                          <FormHelperText className="error-text">
                            {errors.emergencyContactName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Relation<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="emergencyContactRelation"
                          placeholder="e.g. Father, Spouse, Friend"
                          variant="outlined"
                          sx={inputSx}
                          value={values.emergencyContactRelation}
                          onChange={(e) =>
                            setFieldValue(
                              "emergencyContactRelation",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={touched.emergencyContactRelation && Boolean(errors.emergencyContactRelation)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.emergencyContactRelation && errors.emergencyContactRelation && (
                          <FormHelperText className="error-text">
                            {errors.emergencyContactRelation as string}
                          </FormHelperText>
                        )}
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Phone Number<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="emergencyContactPhone"
                          placeholder="10-digit Phone"
                          variant="outlined"
                          sx={inputSx}
                          value={values.emergencyContactPhone}
                          onChange={(e) =>
                            setFieldValue(
                              "emergencyContactPhone",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          error={touched.emergencyContactPhone && Boolean(errors.emergencyContactPhone)}
                          slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        {touched.emergencyContactPhone && errors.emergencyContactPhone && (
                          <FormHelperText className="error-text">
                            {errors.emergencyContactPhone as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>

                    {/* 3. Professional Details */}
                    <SectionTitle
                      icon={AcademicIcon}
                      title="Professional Details"
                    />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Joining Date
                          <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <DatePicker
                            format="DD/MM/YYYY"
                            value={values.joiningDate}
                            open={openJoiningDate}
                            onOpen={() => setOpenJoiningDate(true)}
                            onClose={() => setOpenJoiningDate(false)}
                            onChange={(v) => setFieldValue("joiningDate", v)}
                            disablePast={!id}
                            maxDate={moment().add(12, "months")}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: "Select Date",
                                variant: "outlined",
                                onClick: () => setOpenJoiningDate(true),
                                error:
                                  touched.joiningDate &&
                                  Boolean(errors.joiningDate),
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
                                  "& .MuiOutlinedInput-input": {
                                    padding: "0 14px !important",
                                    fontSize: "14px !important",
                                    fontFamily:
                                      "var(--font-family, 'Poppins', sans-serif) !important",
                                    height: "40px",
                                    cursor: "pointer",
                                  },
                                },
                              },
                              popper: {
                                sx: {
                                  "& .MuiPickersDay-root.Mui-selected": {
                                    backgroundColor:
                                      "var(--primary-color, #5c1a1a) !important",
                                    color: "#ffffff !important",
                                  },
                                  "& .MuiPickersDay-root:hover": {
                                    backgroundColor:
                                      "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                  },
                                  "& .MuiPickersYear-yearButton.Mui-selected": {
                                    backgroundColor:
                                      "var(--primary-color, #5c1a1a) !important",
                                    color: "#ffffff !important",
                                  },
                                  "& .MuiPickersMonth-monthButton.Mui-selected":
                                    {
                                      backgroundColor:
                                        "var(--primary-color, #5c1a1a) !important",
                                      color: "#ffffff !important",
                                    },
                                },
                              },
                              field: { readOnly: true } as any,
                            }}
                          />
                        </LocalizationProvider>
                        {touched.joiningDate && errors.joiningDate && (
                          <FormHelperText className="error-text">
                            {errors.joiningDate as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Experience (Years)
                          <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="experienceYears"
                          placeholder="e.g. 5"
                          variant="outlined"
                          sx={inputSx}
                          value={values.experienceYears}
                          onChange={(e) =>
                            setFieldValue(
                              "experienceYears",
                              e.target.value.replace(/\D/g, "").slice(0, 2),
                            )
                          }
                          error={
                            touched.experienceYears &&
                            Boolean(errors.experienceYears)
                          }
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        {touched.experienceYears && errors.experienceYears && (
                          <FormHelperText className="error-text">
                            {errors.experienceYears as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Designation<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="designation"
                          placeholder="e.g. Math Teacher"
                          variant="outlined"
                          sx={inputSx}
                          value={values.designation}
                          onChange={(e) =>
                            setFieldValue(
                              "designation",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          error={
                            touched.designation && Boolean(errors.designation)
                          }
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        {touched.designation && errors.designation && (
                          <FormHelperText className="error-text">
                            {errors.designation as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Qualification</Typography>
                        <TextField
                          fullWidth
                          name="qualification"
                          placeholder="e.g. B.Ed, M.Sc"
                          variant="outlined"
                          sx={inputSx}
                          value={values.qualification}
                          onChange={handleChange}
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Specialization</Typography>
                        <TextField
                          fullWidth
                          name="specialization"
                          placeholder="e.g. Mathematics"
                          variant="outlined"
                          sx={inputSx}
                          value={values.specialization}
                          onChange={handleChange}
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography sx={labelSx}>
                            Department
                            <span style={{ color: "#ef4444" }}>*</span>
                          </Typography>
                          <Tooltip title="Refresh Departments" arrow>
                            <IconButton
                              onClick={() =>
                                dispatch(
                                  getDepartments({ type: "filter" }) as any,
                                )
                              }
                              size="small"
                              sx={{
                                mb: 0.5,
                                color: "var(--primary-color)",
                                "&:hover": {
                                  backgroundColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
                                },
                              }}
                            >
                              <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Autocomplete
                          options={departments || []}
                          getOptionLabel={(o) => o.name || ""}
                          value={
                            departments?.find(
                              (d: any) => d._id === values.departmentId,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("departmentId", v?._id || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select Department"
                              variant="outlined"
                              sx={inputSx}
                              error={
                                touched.departmentId &&
                                Boolean(errors.departmentId)
                              }
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                        {touched.departmentId && errors.departmentId && (
                          <FormHelperText className="error-text">
                            {errors.departmentId as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn="span 12" sx={{ my: 1 }}>
                        <Box
                          sx={{
                            border: "1px dashed var(--primary-color, #5c1a1a)",
                            backgroundColor: "rgba(92, 26, 26, 0.05)",
                            borderRadius: "8px",
                            padding: "16px",
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "var(--primary-color, #5c1a1a)", fontWeight: 500 }}>
                            ℹ️ Year-wise assignments (Classes, Sections, and Subjects) are managed under the <strong>'Teacher Assignments'</strong> section in the Sidebar.
                          </Typography>
                        </Box>
                      </Box>

                      {/* Probation Period */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Probation Period (Months)</Typography>
                        <TextField
                          fullWidth
                          name="probationPeriod"
                          placeholder="e.g. 6"
                          type="number"
                          variant="outlined"
                          sx={inputSx}
                          value={values.probationPeriod}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                            setFieldValue("probationPeriod", val === "" ? "" : Number(val));
                          }}
                          error={touched.probationPeriod && Boolean(errors.probationPeriod)}
                          slotProps={{ htmlInput: { min: 0, max: 99 } }}
                        />
                        {touched.probationPeriod && errors.probationPeriod && (
                          <FormHelperText className="error-text">
                            {errors.probationPeriod as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Confirmation Date */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Confirmation Date</Typography>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <DatePicker
                            format="DD/MM/YYYY"
                            value={values.confirmationDate}
                            open={openConfirmationDate}
                            onOpen={() => setOpenConfirmationDate(true)}
                            onClose={() => setOpenConfirmationDate(false)}
                            onChange={(v) => setFieldValue("confirmationDate", v)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: "Select Date",
                                variant: "outlined",
                                onClick: () => setOpenConfirmationDate(true),
                                error:
                                  touched.confirmationDate &&
                                  Boolean(errors.confirmationDate),
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
                                  "& .MuiOutlinedInput-input": {
                                    padding: "0 14px !important",
                                    fontSize: "14px !important",
                                    fontFamily:
                                      "var(--font-family, 'Poppins', sans-serif) !important",
                                    height: "40px",
                                    cursor: "pointer",
                                  },
                                },
                              },
                              popper: {
                                sx: {
                                  "& .MuiPickersDay-root.Mui-selected": {
                                    backgroundColor:
                                      "var(--primary-color, #5c1a1a) !important",
                                    color: "#ffffff !important",
                                  },
                                  "& .MuiPickersDay-root:hover": {
                                    backgroundColor:
                                      "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                  },
                                  "& .MuiPickersYear-yearButton.Mui-selected": {
                                    backgroundColor:
                                      "var(--primary-color, #5c1a1a) !important",
                                    color: "#ffffff !important",
                                  },
                                  "& .MuiPickersMonth-monthButton.Mui-selected":
                                    {
                                      backgroundColor:
                                        "var(--primary-color, #5c1a1a) !important",
                                      color: "#ffffff !important",
                                    },
                                },
                              },
                              field: { readOnly: true } as any,
                            }}
                          />
                        </LocalizationProvider>
                        {touched.confirmationDate && errors.confirmationDate && (
                          <FormHelperText className="error-text">
                            {errors.confirmationDate as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Previous School Name */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Previous School Name</Typography>
                        <TextField
                          fullWidth
                          name="previousSchoolName"
                          placeholder="e.g. ABC Public School"
                          variant="outlined"
                          sx={inputSx}
                          value={values.previousSchoolName}
                          onChange={handleChange}
                          error={touched.previousSchoolName && Boolean(errors.previousSchoolName)}
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        {touched.previousSchoolName && errors.previousSchoolName && (
                          <FormHelperText className="error-text">
                            {errors.previousSchoolName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Previous Designation */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Previous Designation</Typography>
                        <TextField
                          fullWidth
                          name="previousDesignation"
                          placeholder="e.g. Primary Teacher"
                          variant="outlined"
                          sx={inputSx}
                          value={values.previousDesignation}
                          onChange={handleChange}
                          error={touched.previousDesignation && Boolean(errors.previousDesignation)}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.previousDesignation && errors.previousDesignation && (
                          <FormHelperText className="error-text">
                            {errors.previousDesignation as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Previous Duration */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Previous Experience Duration</Typography>
                        <TextField
                          fullWidth
                          name="previousDuration"
                          placeholder="e.g. 2 Years"
                          variant="outlined"
                          sx={inputSx}
                          value={values.previousDuration}
                          onChange={handleChange}
                          error={touched.previousDuration && Boolean(errors.previousDuration)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.previousDuration && errors.previousDuration && (
                          <FormHelperText className="error-text">
                            {errors.previousDuration as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Previous Leaving Reason */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Leaving Reason</Typography>
                        <TextField
                          fullWidth
                          name="previousLeavingReason"
                          placeholder="Reason for leaving"
                          variant="outlined"
                          sx={inputSx}
                          value={values.previousLeavingReason}
                          onChange={handleChange}
                          error={touched.previousLeavingReason && Boolean(errors.previousLeavingReason)}
                          slotProps={{ htmlInput: { maxLength: 150 } }}
                        />
                        {touched.previousLeavingReason && errors.previousLeavingReason && (
                          <FormHelperText className="error-text">
                            {errors.previousLeavingReason as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Training Details */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Training Details</Typography>
                        <TextField
                          fullWidth
                          name="trainingDetails"
                          placeholder="e.g. TET/B.Ed training, workshops attended"
                          variant="outlined"
                          sx={inputSx}
                          value={values.trainingDetails}
                          onChange={handleChange}
                          error={touched.trainingDetails && Boolean(errors.trainingDetails)}
                          slotProps={{ htmlInput: { maxLength: 200 } }}
                        />
                        {touched.trainingDetails && errors.trainingDetails && (
                          <FormHelperText className="error-text">
                            {errors.trainingDetails as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Training Period */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Training Period (months)</Typography>
                        <TextField
                          fullWidth
                          name="trainingPeriod"
                          placeholder="e.g. 6"
                          variant="outlined"
                          sx={inputSx}
                          value={values.trainingPeriod}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setFieldValue("trainingPeriod", val === "" ? "" : Number(val));
                          }}
                          error={touched.trainingPeriod && Boolean(errors.trainingPeriod)}
                          slotProps={{ htmlInput: { maxLength: 3, inputMode: "numeric" } }}
                        />
                        {touched.trainingPeriod && errors.trainingPeriod && (
                          <FormHelperText className="error-text">
                            {errors.trainingPeriod as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* UDISE Teacher Number */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>UDISE Teacher Number (Optional)</Typography>
                        <TextField
                          fullWidth
                          name="udiseTeacherNumber"
                          placeholder="e.g. UDISE12345"
                          variant="outlined"
                          sx={inputSx}
                          value={values.udiseTeacherNumber}
                          onChange={handleChange}
                          error={touched.udiseTeacherNumber && Boolean(errors.udiseTeacherNumber)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.udiseTeacherNumber && errors.udiseTeacherNumber && (
                          <FormHelperText className="error-text">
                            {errors.udiseTeacherNumber as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* CTS Number */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>CTS Number (If Required)</Typography>
                        <TextField
                          fullWidth
                          name="ctsNumber"
                          placeholder="e.g. CTS12345"
                          variant="outlined"
                          sx={inputSx}
                          value={values.ctsNumber}
                          onChange={handleChange}
                          error={touched.ctsNumber && Boolean(errors.ctsNumber)}
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                        {touched.ctsNumber && errors.ctsNumber && (
                          <FormHelperText className="error-text">
                            {errors.ctsNumber as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>

                    {/* 4. Salary & Employment */}
                    <SectionTitle
                      icon={SalaryIcon}
                      title="Salary & Employment"
                    />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Employment Type
                          <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Autocomplete
                          options={employmentTypeOptions}
                          getOptionLabel={(o) => o.label}
                          value={
                            employmentTypeOptions.find(
                              (o) => o.value === values.employmentType,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("employmentType", v?.value || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select"
                              variant="outlined"
                              sx={inputSx}
                              error={
                                touched.employmentType &&
                                Boolean(errors.employmentType)
                              }
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                        {touched.employmentType && errors.employmentType && (
                          <FormHelperText className="error-text">
                            {errors.employmentType as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Salary Amount
                          <span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="salary"
                          placeholder="Amount"
                          type="number"
                          variant="outlined"
                          sx={inputSx}
                          value={values.salary}
                          onChange={handleChange}
                          error={touched.salary && Boolean(errors.salary)}
                                                  />
                        {touched.salary && errors.salary && (
                          <FormHelperText className="error-text">
                            {errors.salary as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>
                          Salary Type<span style={{ color: "#ef4444" }}>*</span>
                        </Typography>
                        <Autocomplete
                          options={salaryTypeOptions}
                          getOptionLabel={(o) => o.label}
                          value={
                            salaryTypeOptions.find(
                              (o) => o.value === values.salaryType,
                            ) || null
                          }
                          onChange={(_, v) =>
                            setFieldValue("salaryType", v?.value || "")
                          }
                          clearIcon={null}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              placeholder="Select"
                              variant="outlined"
                              sx={inputSx}
                              error={
                                touched.salaryType && Boolean(errors.salaryType)
                              }
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-inputRoot": {
                              paddingTop: "0 !important",
                              paddingBottom: "0 !important",
                              paddingLeft: "0 !important",
                              paddingRight: "30px !important",
                              height: "auto",
                              minHeight: "40px",
                              "& .MuiAutocomplete-input": {
                                padding: "0 10px !important",
                                height: "40px",
                                fontFamily: "'Poppins', sans-serif !important",
                                fontSize: "14px !important",
                              },
                            },
                          }}
                        />
                        {touched.salaryType && errors.salaryType && (
                          <FormHelperText className="error-text">
                            {errors.salaryType as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Bank Name</Typography>
                        <TextField
                          fullWidth
                          name="bankName"
                          placeholder="Bank Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.bankName}
                          onChange={(e) =>
                            setFieldValue(
                              "bankName",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.bankName && Boolean(errors.bankName)}
                        />
                        {touched.bankName && errors.bankName && (
                          <FormHelperText className="error-text">
                            {errors.bankName as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>IFSC Code</Typography>
                        <TextField
                          fullWidth
                          name="ifscCode"
                          placeholder="IFSC Code"
                          variant="outlined"
                          sx={inputSx}
                          value={values.ifscCode}
                          onChange={(e) =>
                            setFieldValue(
                              "ifscCode",
                              e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "")
                                .slice(0, 11),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.ifscCode && Boolean(errors.ifscCode)}
                          slotProps={{ htmlInput: { maxLength: 11 } }}
                        />
                        {touched.ifscCode && errors.ifscCode && (
                          <FormHelperText className="error-text">
                            {errors.ifscCode as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Account Number</Typography>
                        <TextField
                          fullWidth
                          name="accountNumber"
                          placeholder="Account Number"
                          variant="outlined"
                          sx={inputSx}
                          value={values.accountNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "accountNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 18),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.accountNumber && Boolean(errors.accountNumber)}
                          slotProps={{ htmlInput: { maxLength: 18 } }}
                        />
                        {touched.accountNumber && errors.accountNumber && (
                          <FormHelperText className="error-text">
                            {errors.accountNumber as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Confirm Account Number
                        </Typography>
                        <TextField
                          fullWidth
                          name="confirmAccountNumber"
                          placeholder="Confirm Account Number"
                          variant="outlined"
                          sx={inputSx}
                          value={values.confirmAccountNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "confirmAccountNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 18),
                            )
                          }
                          onBlur={handleBlur}
                          error={
                            touched.confirmAccountNumber &&
                            Boolean(errors.confirmAccountNumber)
                          }
                          onPaste={(e) => e.preventDefault()}
                          slotProps={{ htmlInput: { maxLength: 18 } }}
                        />
                        {touched.confirmAccountNumber &&
                          errors.confirmAccountNumber && (
                            <FormHelperText className="error-text">
                              {errors.confirmAccountNumber as string}
                            </FormHelperText>
                          )}
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>PAN Number</Typography>
                        <TextField
                          fullWidth
                          name="panNumber"
                          placeholder="PAN"
                          variant="outlined"
                          sx={inputSx}
                          value={values.panNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "panNumber",
                              e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "")
                                .slice(0, 10),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.panNumber && Boolean(errors.panNumber)}
                          slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        {touched.panNumber && errors.panNumber && (
                          <FormHelperText className="error-text">
                            {errors.panNumber as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Aadhar Number</Typography>
                        <TextField
                          fullWidth
                          name="aadharNumber"
                          placeholder="Aadhar"
                          variant="outlined"
                          sx={inputSx}
                          value={values.aadharNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "aadharNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 12),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.aadharNumber && Boolean(errors.aadharNumber)}
                          slotProps={{ htmlInput: { maxLength: 12 } }}
                        />
                        {touched.aadharNumber && errors.aadharNumber && (
                          <FormHelperText className="error-text">
                            {errors.aadharNumber as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Account Holder Name */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Account Holder Name</Typography>
                        <TextField
                          fullWidth
                          name="accountHolderName"
                          placeholder="Name as in bank record"
                          variant="outlined"
                          sx={inputSx}
                          value={values.accountHolderName}
                          onChange={(e) =>
                            setFieldValue(
                              "accountHolderName",
                              e.target.value.replace(/[^A-Za-z\s]/g, ""),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.accountHolderName && Boolean(errors.accountHolderName)}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.accountHolderName && errors.accountHolderName && (
                          <FormHelperText className="error-text">
                            {errors.accountHolderName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Bank Branch Name */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>Bank Branch Name</Typography>
                        <TextField
                          fullWidth
                          name="branchName"
                          placeholder="Branch Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.branchName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.branchName && Boolean(errors.branchName)}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        {touched.branchName && errors.branchName && (
                          <FormHelperText className="error-text">
                            {errors.branchName as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* PF Number */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>PF Number</Typography>
                        <TextField
                          fullWidth
                          name="pfNumber"
                          placeholder="PF Number"
                          variant="outlined"
                          sx={inputSx}
                          value={values.pfNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "pfNumber",
                              e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.pfNumber && Boolean(errors.pfNumber)}
                          slotProps={{ htmlInput: { maxLength: 22 } }}
                        />
                        {touched.pfNumber && errors.pfNumber && (
                          <FormHelperText className="error-text">
                            {errors.pfNumber as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* UAN Number */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>UAN Number</Typography>
                        <TextField
                          fullWidth
                          name="uanNumber"
                          placeholder="12-digit UAN"
                          variant="outlined"
                          sx={inputSx}
                          value={values.uanNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "uanNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 12),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.uanNumber && Boolean(errors.uanNumber)}
                          slotProps={{ htmlInput: { maxLength: 12 } }}
                        />
                        {touched.uanNumber && errors.uanNumber && (
                          <FormHelperText className="error-text">
                            {errors.uanNumber as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* ESIC Number */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>ESIC Number</Typography>
                        <TextField
                          fullWidth
                          name="esicNumber"
                          placeholder="17-digit ESIC"
                          variant="outlined"
                          sx={inputSx}
                          value={values.esicNumber}
                          onChange={(e) =>
                            setFieldValue(
                              "esicNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 17),
                            )
                          }
                          onBlur={handleBlur}
                          error={touched.esicNumber && Boolean(errors.esicNumber)}
                          slotProps={{ htmlInput: { maxLength: 17 } }}
                        />
                        {touched.esicNumber && errors.esicNumber && (
                          <FormHelperText className="error-text">
                            {errors.esicNumber as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>

                    {/* 5. Documents */}
                    <SectionTitle
                      icon={DocumentIcon}
                      title="Documents Upload"
                    />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                      sx={{ mb: 2 }}
                    >

                      {/* ID Proof */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          ID Proof (Aadhar/PAN)
                        </Typography>
                        <Box
                          sx={{
                            border: "1px dashed #E4E7EC",
                            p: 1,
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            minHeight: "44px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#667085",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pr: 1,
                            }}
                          >
                            {values.idProof instanceof File
                              ? values.idProof.name
                              : values.idProofName
                                ? "ID Proof Uploaded"
                                : "No file selected"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {(values.idProof || values.idProofName) && (
                              <Link
                                onClick={() => {
                                  const url =
                                    values.idProof instanceof File
                                      ? URL.createObjectURL(values.idProof)
                                      : `${import.meta.env.VITE_BASE_URL_IMAGE}/${values.idProofName}`;
                                  window.open(url, "_blank");
                                }}
                                sx={{
                                  color: "#f59e0b",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  "&:hover": { color: "#d97706" },
                                }}
                              >
                                View
                              </Link>
                            )}
                            {!isView && (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  height: "32px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--primary-color)",
                                  borderColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)",
                                  "&:hover": {
                                    borderColor: "var(--primary-color)",
                                    backgroundColor: "transparent",
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                Choose File
                                <input
                                  hidden
                                  type="file"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "idProof",
                                      e.target.files?.[0],
                                    )
                                  }
                                />
                              </Button>
                            )}
                          </Box>
                        </Box>
                        {touched.idProof && errors.idProof && (
                          <FormHelperText className="error-text">
                            {errors.idProof as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Aadhar Card */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Aadhar Card (PDF/Image)
                        </Typography>
                        <Box
                          sx={{
                            border: "1px dashed #E4E7EC",
                            p: 1,
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            minHeight: "44px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#667085",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pr: 1,
                            }}
                          >
                            {values.aadharCard instanceof File
                              ? values.aadharCard.name
                              : values.aadharCardName
                                ? "Aadhar Card Uploaded"
                                : "No file selected"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {(values.aadharCard || values.aadharCardName) && (
                              <Link
                                onClick={() => {
                                  const url =
                                    values.aadharCard instanceof File
                                      ? URL.createObjectURL(values.aadharCard)
                                      : `${import.meta.env.VITE_BASE_URL_IMAGE}/${values.aadharCardName}`;
                                  window.open(url, "_blank");
                                }}
                                sx={{
                                  color: "#f59e0b",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  "&:hover": { color: "#d97706" },
                                }}
                              >
                                View
                              </Link>
                            )}
                            {!isView && (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  height: "32px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--primary-color)",
                                  borderColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)",
                                  "&:hover": {
                                    borderColor: "var(--primary-color)",
                                    backgroundColor: "transparent",
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                Choose File
                                <input
                                  hidden
                                  type="file"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "aadharCard",
                                      e.target.files?.[0],
                                    )
                                  }
                                />
                              </Button>
                            )}
                          </Box>
                        </Box>
                        {touched.aadharCard && errors.aadharCard && (
                          <FormHelperText className="error-text">
                            {errors.aadharCard as string}
                          </FormHelperText>
                        )}
                      </Box>

                      {/* Appointment Letter */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Appointment Letter (PDF/Image)
                        </Typography>
                        <Box
                          sx={{
                            border: "1px dashed #E4E7EC",
                            p: 1,
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            minHeight: "44px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#667085",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pr: 1,
                            }}
                          >
                            {values.appointmentLetter instanceof File
                              ? values.appointmentLetter.name
                              : values.appointmentLetterName
                                ? "Appointment Letter Uploaded"
                                : "No file selected"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {(values.appointmentLetter || values.appointmentLetterName) && (
                              <Link
                                onClick={() => {
                                  const url =
                                    values.appointmentLetter instanceof File
                                      ? URL.createObjectURL(values.appointmentLetter)
                                      : `${import.meta.env.VITE_BASE_URL_IMAGE}/${values.appointmentLetterName}`;
                                  window.open(url, "_blank");
                                }}
                                sx={{
                                  color: "#f59e0b",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  "&:hover": { color: "#d97706" },
                                }}
                              >
                                View
                              </Link>
                            )}
                            {!isView && (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  height: "32px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--primary-color)",
                                  borderColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)",
                                  "&:hover": {
                                    borderColor: "var(--primary-color)",
                                    backgroundColor: "transparent",
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                Choose File
                                <input
                                  hidden
                                  type="file"
                                  onChange={(e) =>
                                    setFieldValue(
                                      "appointmentLetter",
                                      e.target.files?.[0],
                                    )
                                  }
                                />
                              </Button>
                            )}
                          </Box>
                        </Box>
                        {touched.appointmentLetter && errors.appointmentLetter && (
                          <FormHelperText className="error-text">
                            {errors.appointmentLetter as string}
                          </FormHelperText>
                        )}
                      </Box>


                      {/* Education Certificates */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Education Certificates
                        </Typography>
                        <Box
                          sx={{
                            border: "1px dashed #E4E7EC",
                            p: 1,
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            minHeight: "44px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#667085",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pr: 1,
                            }}
                          >
                            {values.educationCertificates?.length > 0
                              ? `${values.educationCertificates.length} Certificates Selected`
                              : "No file selected"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {!isView && (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  height: "32px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--primary-color)",
                                  borderColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)",
                                  "&:hover": {
                                    borderColor: "var(--primary-color)",
                                    backgroundColor: "transparent",
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                Choose Files
                                <input
                                  hidden
                                  multiple
                                  type="file"
                                  onChange={(e) => {
                                    const files = Array.from(
                                      e.target.files || [],
                                    );
                                    setFieldValue("educationCertificates", [
                                      ...(values.educationCertificates || []),
                                      ...files,
                                    ]);
                                  }}
                                />
                              </Button>
                            )}
                          </Box>
                        </Box>

                        {/* Files List */}
                        {values.educationCertificates?.length > 0 && (
                          <Box
                            sx={{
                              mt: 1.5,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {values.educationCertificates.map(
                              (file: any, index: number) => {
                                const fileName =
                                  file instanceof File
                                    ? file.name
                                    : typeof file === "string"
                                      ? file.split("/").pop()
                                      : `Certificate ${index + 1}`;
                                return (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 1,
                                      px: 1.5,
                                      py: 0.8,
                                      borderRadius: "6px",
                                      border: "1px solid #e5e7eb",
                                      backgroundColor: "#f9fafb",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "12px",
                                        color: "#374151",
                                        maxWidth: "150px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {fileName}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const url =
                                            file instanceof File
                                              ? URL.createObjectURL(file)
                                              : `${import.meta.env.VITE_BASE_URL_IMAGE}/${file}`;
                                          window.open(url, "_blank");
                                        }}
                                        sx={{ color: "#f59e0b", p: 0.5 }}
                                      >
                                        <Visibility sx={{ fontSize: 16 }} />
                                      </IconButton>
                                      {!isView && (
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            const newList = [
                                              ...values.educationCertificates,
                                            ];
                                            newList.splice(index, 1);
                                            setFieldValue(
                                              "educationCertificates",
                                              newList,
                                            );
                                          }}
                                          sx={{ color: "#ef4444", p: 0.5 }}
                                        >
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Box>
                                );
                              },
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Experience Certificates */}
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Experience Certificates
                        </Typography>
                        <Box
                          sx={{
                            border: "1px dashed #E4E7EC",
                            p: 1,
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            minHeight: "44px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#667085",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pr: 1,
                            }}
                          >
                            {values.experienceCertificates?.length > 0
                              ? `${values.experienceCertificates.length} Certificates Selected`
                              : "No file selected"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {!isView && (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  height: "32px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "var(--primary-color)",
                                  borderColor:
                                    "rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)",
                                  "&:hover": {
                                    borderColor: "var(--primary-color)",
                                    backgroundColor: "transparent",
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                Choose Files
                                <input
                                  hidden
                                  multiple
                                  type="file"
                                  onChange={(e) => {
                                    const files = Array.from(
                                      e.target.files || [],
                                    );
                                    setFieldValue("experienceCertificates", [
                                      ...(values.experienceCertificates || []),
                                      ...files,
                                    ]);
                                  }}
                                />
                              </Button>
                            )}
                          </Box>
                        </Box>

                        {/* Files List */}
                        {values.experienceCertificates?.length > 0 && (
                          <Box
                            sx={{
                              mt: 1.5,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              pointerEvents: "auto",
                            }}
                          >
                            {values.experienceCertificates.map(
                              (file: any, index: number) => {
                                const fileName =
                                  file instanceof File
                                    ? file.name
                                    : typeof file === "string"
                                      ? file.split("/").pop()
                                      : `Certificate ${index + 1}`;
                                return (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 1,
                                      px: 1.5,
                                      py: 0.8,
                                      borderRadius: "6px",
                                      border: "1px solid #e5e7eb",
                                      backgroundColor: "#f9fafb",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "12px",
                                        color: "#374151",
                                        maxWidth: "150px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {fileName}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          const url =
                                            file instanceof File
                                              ? URL.createObjectURL(file)
                                              : `${import.meta.env.VITE_BASE_URL_IMAGE}/${file}`;
                                          window.open(url, "_blank");
                                        }}
                                        sx={{ color: "#f59e0b", p: 0.5 }}
                                      >
                                        <Visibility sx={{ fontSize: 16 }} />
                                      </IconButton>
                                      {!isView && (
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            const newList = [
                                              ...values.experienceCertificates,
                                            ];
                                            newList.splice(index, 1);
                                            setFieldValue(
                                              "experienceCertificates",
                                              newList,
                                            );
                                          }}
                                          sx={{ color: "#ef4444", p: 0.5 }}
                                        >
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Box>
                                );
                              },
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* 6. Shift Timing & Tracking */}
                    <SectionTitle
                      icon={HistoryIcon}
                      title="Shift Timing & Tracking"
                    />
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Attendance ID</Typography>
                        <TextField
                          fullWidth
                          name="attendanceId"
                          placeholder="ID"
                          variant="outlined"
                          sx={inputSx}
                          value={values.attendanceId}
                          onChange={(e) =>
                            setFieldValue(
                              "attendanceId",
                              e.target.value
                                .toUpperCase()
                                .replace(/\s/g, "_")
                                .replace(/[^A-Z0-9_]/g, ""),
                            )
                          }
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Leave Balance</Typography>
                        <TextField
                          fullWidth
                          name="leaveBalance"
                          placeholder="00"
                          variant="outlined"
                          sx={inputSx}
                          value={values.leaveBalance}
                          onChange={(e) =>
                            setFieldValue(
                              "leaveBalance",
                              e.target.value.replace(/\D/g, "").slice(0, 2),
                            )
                          }
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Time From</Typography>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <TimePicker
                            value={values.shiftTimeFrom}
                            open={openShiftTimeFrom}
                            onOpen={() => setOpenShiftTimeFrom(true)}
                            onClose={() => setOpenShiftTimeFrom(false)}
                            onChange={(v) => {
                              setFieldValue("shiftTimeFrom", v);
                              if (
                                values.shiftTimeTo &&
                                v &&
                                moment(v).isAfter(moment(values.shiftTimeTo))
                              ) {
                                setFieldValue("shiftTimeTo", null);
                              }
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: "Select Time",
                                variant: "outlined",
                                onClick: () => setOpenShiftTimeFrom(true),
                                error:
                                  touched.shiftTimeFrom &&
                                  Boolean(errors.shiftTimeFrom),
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
                                  "& .MuiOutlinedInput-input": {
                                    padding: "0 14px !important",
                                    fontSize: "14px !important",
                                    fontFamily:
                                      "var(--font-family, 'Poppins', sans-serif) !important",
                                    height: "40px",
                                    cursor: "pointer",
                                  },
                                },
                              },
                              popper: {
                                sx: {
                                  "& .MuiMultiSectionDigitalClockSection-item.Mui-selected":
                                    {
                                      backgroundColor:
                                        "var(--primary-color, #5c1a1a) !important",
                                      color: "#ffffff !important",
                                    },
                                  "& .MuiMultiSectionDigitalClockSection-item:hover":
                                    {
                                      backgroundColor:
                                        "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                    },
                                },
                              },
                              field: { readOnly: true } as any,
                            }}
                          />
                        </LocalizationProvider>
                        {touched.shiftTimeFrom && errors.shiftTimeFrom && (
                          <FormHelperText className="error-text">
                            {errors.shiftTimeFrom as string}
                          </FormHelperText>
                        )}
                      </Box>
                      <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                        <Typography sx={labelSx}>Time To</Typography>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                          <TimePicker
                            value={values.shiftTimeTo}
                            open={openShiftTimeTo}
                            onOpen={() => setOpenShiftTimeTo(true)}
                            onClose={() => setOpenShiftTimeTo(false)}
                            onChange={(v) => setFieldValue("shiftTimeTo", v)}
                            disabled={!values.shiftTimeFrom}
                            minTime={
                              values.shiftTimeFrom
                                ? moment(values.shiftTimeFrom).add(1, "minutes")
                                : undefined
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                placeholder: "Select Time",
                                variant: "outlined",
                                onClick: () =>
                                  values.shiftTimeFrom &&
                                  setOpenShiftTimeTo(true),
                                error:
                                  touched.shiftTimeTo &&
                                  Boolean(errors.shiftTimeTo),
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
                                    "&.Mui-disabled": {
                                      backgroundColor: "#f8f9fa !important",
                                      cursor: "not-allowed",
                                      "& fieldset": {
                                        borderColor: "#e9ecef !important",
                                      },
                                    },
                                  },
                                  "& .MuiOutlinedInput-input": {
                                    padding: "0 14px !important",
                                    fontSize: "14px !important",
                                    fontFamily:
                                      "var(--font-family, 'Poppins', sans-serif) !important",
                                    height: "40px",
                                    cursor: values.shiftTimeFrom
                                      ? "pointer"
                                      : "not-allowed",
                                  },
                                },
                              },
                              popper: {
                                sx: {
                                  "& .MuiMultiSectionDigitalClockSection-item.Mui-selected":
                                    {
                                      backgroundColor:
                                        "var(--primary-color, #5c1a1a) !important",
                                      color: "#ffffff !important",
                                    },
                                  "& .MuiMultiSectionDigitalClockSection-item:hover":
                                    {
                                      backgroundColor:
                                        "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                    },
                                },
                              },
                              field: { readOnly: true } as any,
                            }}
                          />
                        </LocalizationProvider>
                        {touched.shiftTimeTo && errors.shiftTimeTo && (
                          <FormHelperText className="error-text">
                            {errors.shiftTimeTo as string}
                          </FormHelperText>
                        )}
                      </Box>
                    </Box>

                    {/* 7. Login Credentials */}
                    {!id && (
                      <>
                        <SectionTitle
                          icon={Visibility}
                          title="Login Credentials"
                        />
                        <Box
                          display="grid"
                          gridTemplateColumns="repeat(12, 1fr)"
                          gap={{ xs: 2, sm: 3 }}
                        >
                          <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                            <Typography sx={labelSx}>
                              Password
                              <span style={{ color: "#ef4444" }}>*</span>
                            </Typography>
                            <OutlinedInput
                              fullWidth
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter Password"
                              sx={inputSx}
                              value={values.password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.password && Boolean(errors.password)
                              }
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                    sx={{ mr: 1 }}
                                  >
                                    {showPassword ? (
                                      <Visibility sx={{ fontSize: 18 }} />
                                    ) : (
                                      <VisibilityOff sx={{ fontSize: 18 }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              }
                              inputProps={{ maxLength: 16 }}
                            />
                            {touched.password && errors.password && (
                              <FormHelperText className="error-text">
                                {touched.password && errors.password
                                  ? (errors.password as string)
                                  : ""}
                              </FormHelperText>
                            )}
                          </Box>
                          <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                            <Typography sx={labelSx}>
                              Confirm Password
                              <span style={{ color: "#ef4444" }}>*</span>
                            </Typography>
                            <OutlinedInput
                              fullWidth
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm Password"
                              sx={inputSx}
                              value={values.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.confirmPassword &&
                                Boolean(errors.confirmPassword)
                              }
                              onPaste={(e) => e.preventDefault()}
                              onCopy={(e) => e.preventDefault()}
                              onContextMenu={(e) => e.preventDefault()}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword,
                                      )
                                    }
                                    edge="end"
                                    sx={{ mr: 1 }}
                                  >
                                    {showConfirmPassword ? (
                                      <Visibility sx={{ fontSize: 18 }} />
                                    ) : (
                                      <VisibilityOff sx={{ fontSize: 18 }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              }
                              inputProps={{ maxLength: 16 }}
                            />
                            {touched.confirmPassword &&
                              errors.confirmPassword && (
                                <FormHelperText className="error-text">
                                  {touched.confirmPassword &&
                                  errors.confirmPassword
                                    ? (errors.confirmPassword as string)
                                    : ""}
                                </FormHelperText>
                              )}
                          </Box>
                        </Box>
                      </>
                    )}

                    <Box
                      sx={{
                        mt: 6,
                        pt: 4,
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                        borderTop: "1px solid #f0f0f0",
                        flexDirection: { xs: "column-reverse", sm: "row" },
                        pointerEvents: "auto",
                      }}
                    >
                      <Button
                        className="admin-btn-secondary"
                        onClick={() => navigate("/teacher")}
                        disabled={actionLoading}
                        variant="outlined"
                        sx={{
                          minWidth: { xs: "100%", sm: "130px" },
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Discard
                      </Button>
                      {!isView && (id ? canEdit : canAdd) && (
                        <Button
                          type="submit"
                          disabled={actionLoading}
                          className="admin-btn-theme"
                          variant="contained"
                          startIcon={
                            !actionLoading ? (
                              id ? (
                                <EditIcon />
                              ) : (
                                <AddIcon />
                              )
                            ) : null
                          }
                          sx={{
                            minWidth: { xs: "100%", sm: "180px" },
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": { boxShadow: "none" },
                          }}
                        >
                          {actionLoading ? (
                            <Spinner />
                          ) : id ? (
                            "Update Teacher"
                          ) : (
                            "Add Teacher"
                          )}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        )}
      </Box>
    </Box>
  );
}
