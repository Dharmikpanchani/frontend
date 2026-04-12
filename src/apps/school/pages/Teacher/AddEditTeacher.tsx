import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
} from "@mui/material";
import ProfileAvatar from "@/apps/common/ProfileAvatar";
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
    CameraAlt as CameraAltIcon,
} from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { teacherValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditTeacher, getTeacherById } from "@/redux/slices/teacherSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import { getSubjects } from "@/redux/slices/subjectSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { CommonLoader } from "@/apps/school/component/schoolCommon/loader/Loader";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx, multiInputSx } from "@/utils/styles/commonSx";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import {
    bloodGroupOptions,
    genderOptions,
    employmentTypeOptions,
    salaryTypeOptions
} from "@/apps/common/StaticArrayData";

export default function AddEditTeacher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const isView = pathname.includes("/view/");
    const { hasPermission } = usePermissions();

    const canAdd = hasPermission(schoolAdminPermission.teacher.create);
    const canEdit = hasPermission(schoolAdminPermission.teacher.update);
    const { allDepartments: departments } = useSelector((state: RootState) => state.DepartmentReducer);
    const { allSubjects: subjects } = useSelector((state: RootState) => state.SubjectReducer);
    const { allClasses: classes } = useSelector((state: RootState) => state.ClassReducer);
    const { allSections: sections } = useSelector((state: RootState) => state.SectionReducer);
    const { actionLoading, loading: teacherLoading } = useSelector((state: RootState) => state.TeacherReducer);
    const { loading: deptLoading } = useSelector((state: RootState) => state.DepartmentReducer);
    const { loading: subjectLoading } = useSelector((state: RootState) => state.SubjectReducer);
    const { loading: classLoading } = useSelector((state: RootState) => state.ClassReducer);
    const { loading: sectionLoading } = useSelector((state: RootState) => state.SectionReducer);

    const isPageLoading = teacherLoading || deptLoading || subjectLoading || classLoading || sectionLoading;
    const [openDOB, setOpenDOB] = useState(false);
    const [openJoiningDate, setOpenJoiningDate] = useState(false);
    const [openShiftTimeFrom, setOpenShiftTimeFrom] = useState(false);
    const [openShiftTimeTo, setOpenShiftTimeTo] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [teacherData, setTeacherData] = useState<any>(null);

    useEffect(() => {
        const params = { type: "filter" };
        dispatch(getDepartments(params) as any);
        dispatch(getSubjects(params) as any);
        dispatch(getClasses(params) as any);
        dispatch(getSections(params) as any);

        if (id) {
            fetchTeacherDetails();
        }
    }, [id]);

    const fetchTeacherDetails = async () => {
        const result = await dispatch(getTeacherById(id as string) as any);
        if (getTeacherById.fulfilled.match(result)) {
            setTeacherData(result.payload);
        }
    };

    const initialValues = useMemo(() => ({
        id: id || "",
        fullName: teacherData?.fullName || "",
        gender: teacherData?.gender || "",
        dateOfBirth: teacherData?.dateOfBirth ? moment(teacherData.dateOfBirth) : null,
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
        // Auth
        password: "",
        confirmPassword: "",
        // Professional
        joiningDate: teacherData?.joiningDate ? moment(teacherData.joiningDate) : null,
        experienceYears: teacherData?.experienceYears || "",
        qualification: teacherData?.qualification || "",
        specialization: teacherData?.specialization || "",
        designation: teacherData?.designation || "",
        departmentId: teacherData?.departmentId?._id || teacherData?.departmentId || "",
        subjects: teacherData?.subjects?.map((s: any) => s._id || s) || [],
        classesAssigned: teacherData?.classesAssigned?.map((c: any) => c._id || c) || [],
        sectionsAssigned: teacherData?.sectionsAssigned?.map((s: any) => s._id || s) || [],
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
        // Documents
        resume: teacherData?.resume || null,
        resumeName: teacherData?.resume || "",
        idProof: teacherData?.idProof || null,
        idProofName: teacherData?.idProof || "",
        educationCertificates: teacherData?.educationCertificates || [],
        experienceCertificates: teacherData?.experienceCertificates || [],
        // Attendance
        attendanceId: teacherData?.attendanceId || "",
        leaveBalance: teacherData?.leaveBalance || 0,
        workingHours: teacherData?.workingHours || "",
        shiftTiming: teacherData?.shiftTiming || "",
        shiftTimeFrom: teacherData?.shiftTiming?.includes(" - ") ? moment(teacherData.shiftTiming.split(" - ")[0], "hh:mm A") : null,
        shiftTimeTo: teacherData?.shiftTiming?.includes(" - ") ? moment(teacherData.shiftTiming.split(" - ")[1], "hh:mm A") : null,
        isActive: teacherData?.isActive ?? true,
    }), [id, teacherData]);

    const handleSubmit = async (values: any) => {
        try {
            const formData = new FormData();

            // Basic Info
            formData.append("fullName", values.fullName);
            formData.append("email", values.email);
            formData.append("phoneNumber", values.phoneNumber);
            if (values.alternatePhoneNumber) formData.append("alternatePhoneNumber", values.alternatePhoneNumber);
            if (values.gender) formData.append("gender", values.gender);
            if (values.bloodGroup) formData.append("bloodGroup", values.bloodGroup);
            if (values.dateOfBirth) {
                formData.append("dateOfBirth", moment(values.dateOfBirth).toISOString());
            }

            // Address
            formData.append("address", values.address);
            if (values.city) formData.append("city", values.city);
            if (values.state) formData.append("state", values.state);
            if (values.country) formData.append("country", values.country);
            if (values.pincode) formData.append("pincode", values.pincode);

            // Professional
            if (values.joiningDate) {
                formData.append("joiningDate", moment(values.joiningDate).toISOString());
            }
            if (values.experienceYears) formData.append("experienceYears", values.experienceYears);
            formData.append("qualification", values.qualification);
            formData.append("specialization", values.specialization);
            formData.append("designation", values.designation);
            formData.append("departmentId", values.departmentId);

            // Arrays
            values.subjects.forEach((id: string) => formData.append("subjects[]", id));
            values.classesAssigned.forEach((id: string) => formData.append("classesAssigned[]", id));
            values.sectionsAssigned.forEach((id: string) => formData.append("sectionsAssigned[]", id));

            // Employment & Salary
            formData.append("employmentType", values.employmentType);
            if (values.salary) formData.append("salary", values.salary.toString());
            if (values.salaryType) formData.append("salaryType", values.salaryType);
            if (values.bankName) formData.append("bankName", values.bankName);
            if (values.accountNumber) formData.append("accountNumber", values.accountNumber);
            if (values.ifscCode) formData.append("ifscCode", values.ifscCode);
            if (values.panNumber) formData.append("panNumber", values.panNumber);
            if (values.aadharNumber) formData.append("aadharNumber", values.aadharNumber);

            // Auth (Only for Add)
            if (!id && values.password) formData.append("password", values.password);

            // Documents
            if (values.profileImage) formData.append("profileImage", values.profileImage);
            if (values.resume) formData.append("resume", values.resume);
            if (values.idProof) formData.append("idProof", values.idProof);

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
            if (values.attendanceId) formData.append("attendanceId", values.attendanceId);
            if (values.leaveBalance) formData.append("leaveBalance", values.leaveBalance.toString());
            if (values.workingHours) formData.append("workingHours", values.workingHours);
            if (values.shiftTimeFrom && values.shiftTimeTo) {
                const shiftTimingStr = `${moment(values.shiftTimeFrom).format("hh:mm A")} - ${moment(values.shiftTimeTo).format("hh:mm A")}`;
                formData.append("shiftTiming", shiftTimingStr);
            } else if (values.shiftTiming) {
                formData.append("shiftTiming", values.shiftTiming);
            }
            if (values.isActive !== undefined) formData.append("isActive", values.isActive.toString());

            const resultAction = await dispatch(addEditTeacher({ payload: formData, id }) as any);

            if (addEditTeacher.fulfilled.match(resultAction)) {
                if (id) {
                    navigate("/teacher");
                } else {
                    navigate("/teacher/otp", { state: { type: "teacher", phone: values.phoneNumber, email: values.email } });
                }
            }
        } catch (error: any) {
            toasterError(error?.message || "Something went wrong");
        }
    };

    const SectionTitle = ({ icon: Icon, title, isFirst, children }: { icon: any, title: string, isFirst?: boolean, children?: React.ReactNode }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, mt: isFirst ? 0 : 7, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)',
                    color: 'var(--primary-color, #5c1a1a)'
                }}>
                    <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#1f2937', fontFamily: "'Poppins', sans-serif" }}>
                    {title}
                </Typography>
            </Box>
            {children}
        </Box>
    );

    return (
        <Box className="admin-dashboard-content">
            <Box className="admin-page-title-main" sx={{ mb: 1.5 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="admin-breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate("/teacher")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Teachers
                    </Link>
                    <Typography className="admin-breadcrumb-active">{id ? (isView ? "View Teacher" : (teacherData?.fullName || "Edit Teacher")) : "Add Teacher"}</Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '12px', minHeight: '200px', position: 'relative', backgroundColor: 'white' }}>
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
                            const { values, setFieldValue, handleChange, handleBlur, handleSubmit, touched, errors } = formikProps;
                            return (
                                <Form onSubmit={handleSubmit} style={{ pointerEvents: isView ? 'none' : 'auto' }}>
                                    <Box sx={{ maxWidth: 1100 }}>
                                        {/* 1. Basic Information */}
                                        <SectionTitle icon={PersonIcon} title="Basic Information" isFirst>
                                            {id && teacherData && (
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: '20px',
                                                        backgroundColor: teacherData?.isVerified ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                        color: teacherData?.isVerified ? '#2196f3' : '#ff9800', border: '1px solid currentColor',
                                                    }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                                                            {teacherData?.isVerified ? "Verified" : "Unverified"}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, borderRadius: '20px',
                                                        backgroundColor: teacherData?.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                                        color: teacherData?.isActive ? '#4caf50' : '#f44336', border: '1px solid currentColor',
                                                    }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                                                            {teacherData?.isActive ? "Active" : "Inactive"}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </SectionTitle>
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                            <Box gridColumn="span 12" sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <Button
                                                        variant="text"
                                                        component="label"
                                                        sx={{
                                                            minWidth: '100px', width: '100px', height: '100px',
                                                            borderRadius: '50%', border: '1px dashed #ced4da',
                                                            bgcolor: '#f8f9fa', overflow: 'hidden', p: 0,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                borderColor: 'var(--primary-color)',
                                                                '& .avatar-overlay': { opacity: 1 }
                                                            }
                                                        }}
                                                    >
                                                        <ProfileAvatar
                                                            name={values.fullName || "T"}
                                                            imageUrl={values.profileImage instanceof File ? URL.createObjectURL(values.profileImage) : (values.profileImageUrl || values.profileImage)}
                                                            size={100}
                                                            sx={{ borderRadius: '50%' }}
                                                        />
                                                        {!isView && (
                                                            <Box
                                                                className="avatar-overlay"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0, left: 0, width: '100%', height: '100%',
                                                                    bgcolor: 'rgba(0,0,0,0.3)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    opacity: 0, transition: 'all 0.3s ease',
                                                                }}
                                                            >
                                                                <CameraAltIcon sx={{ color: 'white', fontSize: 24 }} />
                                                            </Box>
                                                        )}
                                                        <input hidden accept="image/*" type="file" onChange={(e) => setFieldValue("profileImage", e.target.files?.[0])} />
                                                    </Button>
                                                    {!isView && (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            bottom: 5,
                                                            right: 5,
                                                            backgroundColor: 'var(--primary-color, #ad1e1e)',
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            border: '2px solid white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                            pointerEvents: 'none',
                                                            zIndex: 2
                                                        }}>
                                                            <CameraAltIcon sx={{ fontSize: 14 }} />
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Typography sx={labelSx}>Profile Image</Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#667085' }}>Max 2MB. JPG or PNG.</Typography>
                                                </Box>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Full Name<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth name="fullName" placeholder="Enter Full Name"
                                                    variant="outlined" sx={inputSx}
                                                    value={values.fullName} onChange={handleChange}
                                                    error={touched.fullName && Boolean(errors.fullName)}
                                                />
                                                {touched.fullName && errors.fullName && <FormHelperText className="error-text">{errors.fullName as string}</FormHelperText>}
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>Gender</Typography>
                                                <Autocomplete
                                                    options={genderOptions}
                                                    getOptionLabel={(o) => o.label}
                                                    value={genderOptions.find(o => o.value === values.gender) || null}
                                                    onChange={(_, v) => setFieldValue("gender", v?.value || "")}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select" variant="outlined" sx={inputSx} />}
                                                />
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>Blood Group</Typography>
                                                <Autocomplete
                                                    options={bloodGroupOptions}
                                                    getOptionLabel={(o) => o.label}
                                                    value={bloodGroupOptions.find(o => o.value === values.bloodGroup) || null}
                                                    onChange={(_, v) => setFieldValue("bloodGroup", v?.value || "")}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select" variant="outlined" sx={inputSx} />}
                                                />
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Date of Birth</Typography>
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <DatePicker
                                                        format="DD/MM/YYYY"
                                                        value={values.dateOfBirth}
                                                        open={openDOB}
                                                        onOpen={() => setOpenDOB(true)}
                                                        onClose={() => setOpenDOB(false)}
                                                        onChange={(v) => setFieldValue("dateOfBirth", v)}
                                                        disableFuture
                                                        maxDate={moment().subtract(18, 'years')}
                                                        minDate={moment().subtract(70, 'years')}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                placeholder: "Select Date",
                                                                variant: "outlined",
                                                                onClick: () => setOpenDOB(true),
                                                                error: touched.dateOfBirth && Boolean(errors.dateOfBirth),
                                                                sx: {
                                                                    "& .MuiPickersOutlinedInput-root": {
                                                                        height: "40px",
                                                                        backgroundColor: "#fff !important",
                                                                        borderRadius: "var(--button-radius, 6px) !important",
                                                                        "& fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&:hover:not(.Mui-focused) fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&.Mui-focused:not(.Mui-error) fieldset": {
                                                                            borderColor: "var(--primary-color, #942F15) !important",
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
                                                                        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
                                                                        height: "40px",
                                                                        cursor: "pointer",
                                                                    }
                                                                }
                                                            },
                                                            popper: {
                                                                sx: {
                                                                    "& .MuiPickersDay-root.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    },
                                                                    "& .MuiPickersDay-root:hover": {
                                                                        backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                                                    },
                                                                    "& .MuiPickersYear-yearButton.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    },
                                                                    "& .MuiPickersMonth-monthButton.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    }
                                                                }
                                                            },
                                                            field: { readOnly: true } as any,
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                {touched.dateOfBirth && errors.dateOfBirth && <FormHelperText className="error-text">{errors.dateOfBirth as string}</FormHelperText>}
                                            </Box>
                                        </Box>

                                        {/* 2. Contact Details */}
                                        <SectionTitle icon={LocationIcon} title="Contact Details" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Email<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth name="email" placeholder="email@example.com" variant="outlined" sx={inputSx}
                                                    value={values.email} onChange={handleChange}
                                                    error={touched.email && Boolean(errors.email)}
                                                    disabled={!!id}
                                                />
                                                {touched.email && errors.email && <FormHelperText className="error-text">{errors.email as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Phone Number<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth name="phoneNumber" placeholder="9876543210" variant="outlined" sx={inputSx}
                                                    value={values.phoneNumber}
                                                    onChange={(e) => setFieldValue("phoneNumber", e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                                                    disabled={!!id}
                                                />
                                                {touched.phoneNumber && errors.phoneNumber && <FormHelperText className="error-text">{errors.phoneNumber as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Alternate Phone</Typography>
                                                <TextField
                                                    fullWidth name="alternatePhoneNumber" placeholder="Alternate Number" variant="outlined" sx={inputSx}
                                                    value={values.alternatePhoneNumber}
                                                    onChange={(e) => setFieldValue("alternatePhoneNumber", e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                />
                                            </Box>
                                            <Box gridColumn="span 12">
                                                <Typography sx={labelSx}>Address (Search Location)</Typography>
                                                <AutoCompleteLocation
                                                    name="address"
                                                    placeholder="Search address..."
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    touched={touched}
                                                    errors={errors}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>City</Typography>
                                                <TextField fullWidth name="city" placeholder="City" variant="outlined" sx={inputSx} value={values.city} onChange={handleChange} />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>State</Typography>
                                                <TextField fullWidth name="state" placeholder="State" variant="outlined" sx={inputSx} value={values.state} onChange={handleChange} />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>Pincode</Typography>
                                                <TextField fullWidth name="pincode" placeholder="Pincode" variant="outlined" sx={inputSx} value={values.pincode} onChange={handleChange} />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>Country</Typography>
                                                <TextField fullWidth name="country" placeholder="Country" variant="outlined" sx={inputSx} value={values.country} onChange={handleChange} />
                                            </Box>
                                        </Box>

                                        {/* 3. Professional Details */}
                                        <SectionTitle icon={AcademicIcon} title="Professional Details" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Joining Date<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <DatePicker
                                                        format="DD/MM/YYYY"
                                                        value={values.joiningDate}
                                                        open={openJoiningDate}
                                                        onOpen={() => setOpenJoiningDate(true)}
                                                        onClose={() => setOpenJoiningDate(false)}
                                                        onChange={(v) => setFieldValue("joiningDate", v)}
                                                        disablePast
                                                        maxDate={moment().add(12, 'months')}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                placeholder: "Select Date",
                                                                variant: "outlined",
                                                                onClick: () => setOpenJoiningDate(true),
                                                                error: touched.joiningDate && Boolean(errors.joiningDate),
                                                                sx: {
                                                                    "& .MuiPickersOutlinedInput-root": {
                                                                        height: "40px",
                                                                        backgroundColor: "#fff !important",
                                                                        borderRadius: "var(--button-radius, 6px) !important",
                                                                        "& fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&:hover:not(.Mui-focused) fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&.Mui-focused:not(.Mui-error) fieldset": {
                                                                            borderColor: "var(--primary-color, #942F15) !important",
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
                                                                        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
                                                                        height: "40px",
                                                                        cursor: "pointer",
                                                                    }
                                                                }
                                                            },
                                                            popper: {
                                                                sx: {
                                                                    "& .MuiPickersDay-root.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    },
                                                                    "& .MuiPickersDay-root:hover": {
                                                                        backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                                                    },
                                                                    "& .MuiPickersYear-yearButton.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    },
                                                                    "& .MuiPickersMonth-monthButton.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    }
                                                                }
                                                            },
                                                            field: { readOnly: true } as any,
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                {touched.joiningDate && errors.joiningDate && <FormHelperText className="error-text">{errors.joiningDate as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Experience (Years)<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth name="experienceYears" placeholder="e.g. 5" variant="outlined" sx={inputSx}
                                                    value={values.experienceYears}
                                                    onChange={(e) => setFieldValue("experienceYears", e.target.value.replace(/\D/g, '').slice(0, 2))}
                                                    error={touched.experienceYears && Boolean(errors.experienceYears)}
                                                />
                                                {touched.experienceYears && errors.experienceYears && <FormHelperText className="error-text">{errors.experienceYears as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Designation<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth name="designation" placeholder="e.g. Math Teacher" variant="outlined" sx={inputSx}
                                                    value={values.designation}
                                                    onChange={(e) => setFieldValue("designation", e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                                                    error={touched.designation && Boolean(errors.designation)}
                                                />
                                                {touched.designation && errors.designation && <FormHelperText className="error-text">{errors.designation as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Qualification</Typography>
                                                <TextField
                                                    fullWidth name="qualification" placeholder="e.g. B.Ed, M.Sc" variant="outlined" sx={inputSx}
                                                    value={values.qualification} onChange={handleChange}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Specialization</Typography>
                                                <TextField
                                                    fullWidth name="specialization" placeholder="e.g. Mathematics" variant="outlined" sx={inputSx}
                                                    value={values.specialization} onChange={handleChange}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Department<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={departments || []}
                                                    getOptionLabel={(o) => o.name || ""}
                                                    value={departments?.find((d: any) => d._id === values.departmentId) || null}
                                                    onChange={(_, v) => setFieldValue("departmentId", v?._id || "")}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select Department" variant="outlined" sx={inputSx} error={touched.departmentId && Boolean(errors.departmentId)} />}
                                                />
                                                {touched.departmentId && errors.departmentId && <FormHelperText className="error-text">{errors.departmentId as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn="span 12">
                                                <Typography sx={labelSx}>Assigned Classes<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <Autocomplete
                                                    multiple
                                                    options={classes || []}
                                                    getOptionLabel={(o) => o.name || ""}
                                                    value={classes?.filter((c: any) => values.classesAssigned.includes(c._id)) || []}
                                                    onChange={(_, v) => setFieldValue("classesAssigned", v.map((item: any) => item._id))}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select Classes" variant="outlined" sx={multiInputSx} error={touched.classesAssigned && Boolean(errors.classesAssigned)} />}
                                                />
                                                {touched.classesAssigned && errors.classesAssigned && <FormHelperText className="error-text">{errors.classesAssigned as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn="span 12">
                                                <Typography sx={labelSx}>Assigned Sections<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <Autocomplete
                                                    multiple
                                                    options={sections || []}
                                                    getOptionLabel={(o: any) => o.code || ""}
                                                    value={sections?.filter((s: any) => values.sectionsAssigned.includes(s._id)) || []}
                                                    onChange={(_, v) => setFieldValue("sectionsAssigned", v.map((item: any) => item._id))}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select Sections" variant="outlined" sx={multiInputSx} error={touched.sectionsAssigned && Boolean(errors.sectionsAssigned)} />}
                                                />
                                                {touched.sectionsAssigned && errors.sectionsAssigned && <FormHelperText className="error-text">{errors.sectionsAssigned as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn="span 12">
                                                <Typography sx={labelSx}>Subjects Specialty<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <Autocomplete
                                                    multiple
                                                    options={subjects || []}
                                                    getOptionLabel={(o) => o.name || ""}
                                                    value={subjects?.filter((s: any) => values.subjects.includes(s._id)) || []}
                                                    onChange={(_, v) => setFieldValue("subjects", v.map((item: any) => item._id))}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select Subjects" variant="outlined" sx={multiInputSx} error={touched.subjects && Boolean(errors.subjects)} />}
                                                />
                                                {touched.subjects && errors.subjects && <FormHelperText className="error-text">{errors.subjects as string}</FormHelperText>}
                                            </Box>
                                        </Box>

                                        {/* 4. Salary & Employment */}
                                        <SectionTitle icon={SalaryIcon} title="Salary & Employment" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Employment Type<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={employmentTypeOptions}
                                                    getOptionLabel={(o) => o.label}
                                                    value={employmentTypeOptions.find(o => o.value === values.employmentType) || null}
                                                    onChange={(_, v) => setFieldValue("employmentType", v?.value || "")}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select" variant="outlined" sx={inputSx} error={touched.employmentType && Boolean(errors.employmentType)} />}
                                                />
                                                {touched.employmentType && errors.employmentType && <FormHelperText className="error-text">{errors.employmentType as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Salary Amount</Typography>
                                                <TextField fullWidth name="salary" placeholder="Amount" type="number" variant="outlined" sx={inputSx} value={values.salary} onChange={handleChange} />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Salary Type</Typography>
                                                <Autocomplete
                                                    options={salaryTypeOptions}
                                                    getOptionLabel={(o) => o.label}
                                                    value={salaryTypeOptions.find(o => o.value === values.salaryType) || null}
                                                    onChange={(_, v) => setFieldValue("salaryType", v?.value || "")}
                                                    renderInput={(p) => <TextField {...p} placeholder="Select" variant="outlined" sx={inputSx} />}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Bank Name</Typography>
                                                <TextField
                                                    fullWidth name="bankName" placeholder="Bank Name" variant="outlined" sx={inputSx}
                                                    value={values.bankName}
                                                    onChange={(e) => setFieldValue("bankName", e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>IFSC Code</Typography>
                                                <TextField
                                                    fullWidth name="ifscCode" placeholder="IFSC Code" variant="outlined" sx={inputSx}
                                                    value={values.ifscCode}
                                                    onChange={(e) => setFieldValue("ifscCode", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
                                                    error={touched.ifscCode && Boolean(errors.ifscCode)}
                                                />
                                                {touched.ifscCode && errors.ifscCode && <FormHelperText className="error-text">{errors.ifscCode as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Account Number</Typography>
                                                <TextField
                                                    fullWidth name="accountNumber" placeholder="Account Number" variant="outlined" sx={inputSx}
                                                    value={values.accountNumber}
                                                    onChange={(e) => setFieldValue("accountNumber", e.target.value.replace(/\D/g, '').slice(0, 18))}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Confirm Account Number</Typography>
                                                <TextField
                                                    fullWidth name="confirmAccountNumber" placeholder="Confirm Account Number" variant="outlined" sx={inputSx}
                                                    value={values.confirmAccountNumber}
                                                    onChange={(e) => setFieldValue("confirmAccountNumber", e.target.value.replace(/\D/g, '').slice(0, 18))}
                                                    error={touched.confirmAccountNumber && Boolean(errors.confirmAccountNumber)}
                                                    onPaste={(e) => e.preventDefault()}
                                                />
                                                {touched.confirmAccountNumber && errors.confirmAccountNumber && <FormHelperText className="error-text">{errors.confirmAccountNumber as string}</FormHelperText>}
                                            </Box>


                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>PAN Number</Typography>
                                                <TextField
                                                    fullWidth name="panNumber" placeholder="PAN" variant="outlined" sx={inputSx}
                                                    value={values.panNumber}
                                                    onChange={(e) => setFieldValue("panNumber", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Aadhar Number</Typography>
                                                <TextField
                                                    fullWidth name="aadharNumber" placeholder="Aadhar" variant="outlined" sx={inputSx}
                                                    value={values.aadharNumber}
                                                    onChange={(e) => setFieldValue("aadharNumber", e.target.value.replace(/\D/g, '').slice(0, 12))}
                                                />
                                            </Box>
                                        </Box>

                                        {/* 5. Documents */}
                                        <SectionTitle icon={DocumentIcon} title="Documents Upload" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 2 }}>
                                            {/* Resume */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Resume (PDF/DOC)</Typography>
                                                <Box sx={{ border: '1px dashed #E4E7EC', p: 1, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '44px', backgroundColor: '#fff' }}>
                                                    <Typography variant="body2" sx={{ color: '#667085', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
                                                        {values.resume instanceof File ? values.resume.name : (values.resumeName ? "Resume Uploaded" : "No file selected")}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pointerEvents: 'auto' }}>
                                                        {(values.resume || values.resumeName) && (
                                                            <Link
                                                                onClick={() => {
                                                                    const url = values.resume instanceof File
                                                                        ? URL.createObjectURL(values.resume)
                                                                        : `${import.meta.env.VITE_BASE_URL_IMAGE}/${values.resumeName}`;
                                                                    window.open(url, '_blank');
                                                                }}
                                                                sx={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: '#d97706' } }}
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
                                                                    textTransform: 'none',
                                                                    height: '32px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--primary-color)',
                                                                    borderColor: 'rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)',
                                                                    '&:hover': { borderColor: 'var(--primary-color)', backgroundColor: 'transparent', opacity: 0.8 }
                                                                }}
                                                            >
                                                                Choose File
                                                                <input hidden type="file" onChange={(e) => setFieldValue("resume", e.target.files?.[0])} />
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {touched.resume && errors.resume && <FormHelperText className="error-text">{errors.resume as string}</FormHelperText>}
                                            </Box>

                                            {/* ID Proof */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>ID Proof (Aadhar/PAN)</Typography>
                                                <Box sx={{ border: '1px dashed #E4E7EC', p: 1, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '44px', backgroundColor: '#fff' }}>
                                                    <Typography variant="body2" sx={{ color: '#667085', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
                                                        {values.idProof instanceof File ? values.idProof.name : (values.idProofName ? "ID Proof Uploaded" : "No file selected")}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pointerEvents: 'auto' }}>
                                                        {(values.idProof || values.idProofName) && (
                                                            <Link
                                                                onClick={() => {
                                                                    const url = values.idProof instanceof File
                                                                        ? URL.createObjectURL(values.idProof)
                                                                        : `${import.meta.env.VITE_BASE_URL_IMAGE}/${values.idProofName}`;
                                                                    window.open(url, '_blank');
                                                                }}
                                                                sx={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: '#d97706' } }}
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
                                                                    textTransform: 'none',
                                                                    height: '32px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--primary-color)',
                                                                    borderColor: 'rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)',
                                                                    '&:hover': { borderColor: 'var(--primary-color)', backgroundColor: 'transparent', opacity: 0.8 }
                                                                }}
                                                            >
                                                                Choose File
                                                                <input hidden type="file" onChange={(e) => setFieldValue("idProof", e.target.files?.[0])} />
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                {touched.idProof && errors.idProof && <FormHelperText className="error-text">{errors.idProof as string}</FormHelperText>}
                                            </Box>

                                            {/* Education Certificates */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Education Certificates</Typography>
                                                <Box sx={{ border: '1px dashed #E4E7EC', p: 1, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '44px', backgroundColor: '#fff' }}>
                                                    <Typography variant="body2" sx={{ color: '#667085', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
                                                        {values.educationCertificates?.length > 0 ? `${values.educationCertificates.length} Certificates Selected` : "No file selected"}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pointerEvents: 'auto' }}>
                                                        {!isView && (
                                                            <Button
                                                                variant="outlined"
                                                                component="label"
                                                                size="small"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    height: '32px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--primary-color)',
                                                                    borderColor: 'rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)',
                                                                    '&:hover': { borderColor: 'var(--primary-color)', backgroundColor: 'transparent', opacity: 0.8 }
                                                                }}
                                                            >
                                                                Choose Files
                                                                <input hidden multiple type="file" onChange={(e) => {
                                                                    const files = Array.from(e.target.files || []);
                                                                    setFieldValue("educationCertificates", [...(values.educationCertificates || []), ...files]);
                                                                }} />
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Files List */}
                                                {(values.educationCertificates?.length > 0) && (
                                                    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, pointerEvents: 'auto' }}>
                                                        {values.educationCertificates.map((file: any, index: number) => {
                                                            const fileName = file instanceof File ? file.name : (typeof file === 'string' ? file.split('/').pop() : `Certificate ${index + 1}`);
                                                            return (
                                                                <Box key={index} sx={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8,
                                                                    borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb'
                                                                }}>
                                                                    <Typography sx={{ fontSize: '12px', color: '#374151', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {fileName}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                const url = file instanceof File ? URL.createObjectURL(file) : `${import.meta.env.VITE_BASE_URL_IMAGE}/${file}`;
                                                                                window.open(url, '_blank');
                                                                            }}
                                                                            sx={{ color: '#f59e0b', p: 0.5 }}
                                                                        >
                                                                            <Visibility sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                        {!isView && (
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    const newList = [...values.educationCertificates];
                                                                                    newList.splice(index, 1);
                                                                                    setFieldValue("educationCertificates", newList);
                                                                                }}
                                                                                sx={{ color: '#ef4444', p: 0.5 }}
                                                                            >
                                                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Experience Certificates */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Experience Certificates</Typography>
                                                <Box sx={{ border: '1px dashed #E4E7EC', p: 1, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '44px', backgroundColor: '#fff' }}>
                                                    <Typography variant="body2" sx={{ color: '#667085', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
                                                        {values.experienceCertificates?.length > 0 ? `${values.experienceCertificates.length} Certificates Selected` : "No file selected"}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pointerEvents: 'auto' }}>
                                                        {!isView && (
                                                            <Button
                                                                variant="outlined"
                                                                component="label"
                                                                size="small"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    height: '32px',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    color: 'var(--primary-color)',
                                                                    borderColor: 'rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)',
                                                                    '&:hover': { borderColor: 'var(--primary-color)', backgroundColor: 'transparent', opacity: 0.8 }
                                                                }}
                                                            >
                                                                Choose Files
                                                                <input hidden multiple type="file" onChange={(e) => {
                                                                    const files = Array.from(e.target.files || []);
                                                                    setFieldValue("experienceCertificates", [...(values.experienceCertificates || []), ...files]);
                                                                }} />
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Files List */}
                                                {(values.experienceCertificates?.length > 0) && (
                                                    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, pointerEvents: 'auto' }}>
                                                        {values.experienceCertificates.map((file: any, index: number) => {
                                                            const fileName = file instanceof File ? file.name : (typeof file === 'string' ? file.split('/').pop() : `Certificate ${index + 1}`);
                                                            return (
                                                                <Box key={index} sx={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8,
                                                                    borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb'
                                                                }}>
                                                                    <Typography sx={{ fontSize: '12px', color: '#374151', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {fileName}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                const url = file instanceof File ? URL.createObjectURL(file) : `${import.meta.env.VITE_BASE_URL_IMAGE}/${file}`;
                                                                                window.open(url, '_blank');
                                                                            }}
                                                                            sx={{ color: '#f59e0b', p: 0.5 }}
                                                                        >
                                                                            <Visibility sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                        {!isView && (
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    const newList = [...values.experienceCertificates];
                                                                                    newList.splice(index, 1);
                                                                                    setFieldValue("experienceCertificates", newList);
                                                                                }}
                                                                                sx={{ color: '#ef4444', p: 0.5 }}
                                                                            >
                                                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* 6. Shift Timing & Tracking */}
                                        <SectionTitle icon={HistoryIcon} title="Shift Timing & Tracking" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Attendance ID</Typography>
                                                <TextField
                                                    fullWidth name="attendanceId" placeholder="ID" variant="outlined" sx={inputSx}
                                                    value={values.attendanceId}
                                                    onChange={(e) => setFieldValue("attendanceId", e.target.value.toUpperCase().replace(/\s/g, '_').replace(/[^A-Z0-9_]/g, ''))}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Leave Balance</Typography>
                                                <TextField
                                                    fullWidth name="leaveBalance" placeholder="00" variant="outlined" sx={inputSx}
                                                    value={values.leaveBalance}
                                                    onChange={(e) => setFieldValue("leaveBalance", e.target.value.replace(/\D/g, '').slice(0, 2))}
                                                />
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Time From</Typography>
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <TimePicker
                                                        value={values.shiftTimeFrom}
                                                        open={openShiftTimeFrom}
                                                        onOpen={() => setOpenShiftTimeFrom(true)}
                                                        onClose={() => setOpenShiftTimeFrom(false)}
                                                        onChange={(v) => {
                                                            setFieldValue("shiftTimeFrom", v);
                                                            if (values.shiftTimeTo && v && moment(v).isAfter(moment(values.shiftTimeTo))) {
                                                                setFieldValue("shiftTimeTo", null);
                                                            }
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                placeholder: "Select Time",
                                                                variant: "outlined",
                                                                onClick: () => setOpenShiftTimeFrom(true),
                                                                error: touched.shiftTimeFrom && Boolean(errors.shiftTimeFrom),
                                                                sx: {
                                                                    "& .MuiPickersOutlinedInput-root": {
                                                                        height: "40px",
                                                                        backgroundColor: "#fff !important",
                                                                        borderRadius: "var(--button-radius, 6px) !important",
                                                                        "& fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&:hover:not(.Mui-focused) fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&.Mui-focused:not(.Mui-error) fieldset": {
                                                                            borderColor: "var(--primary-color, #942F15) !important",
                                                                            borderWidth: "1px !important",
                                                                        },
                                                                    },
                                                                    "& .MuiOutlinedInput-input": {
                                                                        padding: "0 14px !important",
                                                                        fontSize: "14px !important",
                                                                        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
                                                                        height: "40px",
                                                                        cursor: "pointer",
                                                                    }
                                                                }
                                                            },
                                                            popper: {
                                                                sx: {
                                                                    "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    },
                                                                    "& .MuiMultiSectionDigitalClockSection-item:hover": {
                                                                        backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                                                    }
                                                                }
                                                            },
                                                            field: { readOnly: true } as any,
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                {touched.shiftTimeFrom && errors.shiftTimeFrom && <FormHelperText className="error-text">{errors.shiftTimeFrom as string}</FormHelperText>}
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Time To</Typography>
                                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                                    <TimePicker
                                                        value={values.shiftTimeTo}
                                                        open={openShiftTimeTo}
                                                        onOpen={() => setOpenShiftTimeTo(true)}
                                                        onClose={() => setOpenShiftTimeTo(false)}
                                                        onChange={(v) => setFieldValue("shiftTimeTo", v)}
                                                        disabled={!values.shiftTimeFrom}
                                                        minTime={values.shiftTimeFrom ? moment(values.shiftTimeFrom).add(1, 'minutes') : undefined}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                placeholder: "Select Time",
                                                                variant: "outlined",
                                                                onClick: () => values.shiftTimeFrom && setOpenShiftTimeTo(true),
                                                                error: touched.shiftTimeTo && Boolean(errors.shiftTimeTo),
                                                                sx: {
                                                                    "& .MuiPickersOutlinedInput-root": {
                                                                        height: "40px",
                                                                        backgroundColor: "#fff !important",
                                                                        borderRadius: "var(--button-radius, 6px) !important",
                                                                        "& fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&:hover:not(.Mui-focused) fieldset": {
                                                                            borderColor: "var(--input-border, #ced4da) !important",
                                                                        },
                                                                        "&.Mui-focused:not(.Mui-error) fieldset": {
                                                                            borderColor: "var(--primary-color, #942F15) !important",
                                                                            borderWidth: "1px !important",
                                                                        },
                                                                        "&.Mui-disabled": {
                                                                            backgroundColor: "#f8f9fa !important",
                                                                            cursor: "not-allowed",
                                                                            "& fieldset": {
                                                                                borderColor: "#e9ecef !important",
                                                                            }
                                                                        }
                                                                    },
                                                                    "& .MuiOutlinedInput-input": {
                                                                        padding: "0 14px !important",
                                                                        fontSize: "14px !important",
                                                                        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
                                                                        height: "40px",
                                                                        cursor: values.shiftTimeFrom ? "pointer" : "not-allowed",
                                                                    }
                                                                }
                                                            },
                                                            popper: {
                                                                sx: {
                                                                    "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
                                                                        backgroundColor: "var(--primary-color, #5c1a1a) !important",
                                                                        color: "#ffffff !important"
                                                                    },
                                                                    "& .MuiMultiSectionDigitalClockSection-item:hover": {
                                                                        backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1) !important",
                                                                    }
                                                                }
                                                            },
                                                            field: { readOnly: true } as any,
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                {touched.shiftTimeTo && errors.shiftTimeTo && <FormHelperText className="error-text">{errors.shiftTimeTo as string}</FormHelperText>}
                                            </Box>
                                        </Box>

                                        {/* 7. Login Credentials */}
                                        {!id && (
                                            <>
                                                <SectionTitle icon={Visibility} title="Login Credentials" />
                                                <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                        <Typography sx={labelSx}>Password<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                        <OutlinedInput
                                                            fullWidth
                                                            name="password"
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter Password"
                                                            sx={inputSx}
                                                            value={values.password}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.password && Boolean(errors.password)}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ mr: 1 }}>
                                                                        {showPassword ? <Visibility sx={{ fontSize: 18 }} /> : <VisibilityOff sx={{ fontSize: 18 }} />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                        />
                                                        {touched.password && errors.password && <FormHelperText className="error-text">{(touched.password && errors.password) ? (errors.password as string) : ""}</FormHelperText>}
                                                    </Box>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                        <Typography sx={labelSx}>Confirm Password<span style={{ color: '#ef4444' }}>*</span></Typography>
                                                        <OutlinedInput
                                                            fullWidth
                                                            name="confirmPassword"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirm Password"
                                                            sx={inputSx}
                                                            value={values.confirmPassword}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                                            onPaste={(e) => e.preventDefault()}
                                                            onCopy={(e) => e.preventDefault()}
                                                            onContextMenu={(e) => e.preventDefault()}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ mr: 1 }}>
                                                                        {showConfirmPassword ? <Visibility sx={{ fontSize: 18 }} /> : <VisibilityOff sx={{ fontSize: 18 }} />}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                        />
                                                        {touched.confirmPassword && errors.confirmPassword && <FormHelperText className="error-text">{(touched.confirmPassword && errors.confirmPassword) ? (errors.confirmPassword as string) : ""}</FormHelperText>}
                                                    </Box>
                                                </Box>
                                            </>
                                        )}

                                        {!isView && (id ? canEdit : canAdd) && (
                                            <Box sx={{ mt: 6, pt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                                                <Button
                                                    onClick={() => navigate("/teacher")}
                                                    variant="outlined"
                                                    sx={{
                                                        minWidth: '130px',
                                                        height: '42px',
                                                        borderRadius: '8px',
                                                        borderColor: '#ad1e1e',
                                                        color: '#ad1e1e',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        '&:hover': { borderColor: '#8e1818', bgcolor: 'rgba(173, 30, 30, 0.04)' }
                                                    }}
                                                >
                                                    Discard
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={actionLoading}
                                                    variant="contained"
                                                    startIcon={id ? <EditIcon /> : <AddIcon />}
                                                    sx={{
                                                        minWidth: '180px',
                                                        height: '42px',
                                                        borderRadius: '8px',
                                                        bgcolor: '#ad1e1e',
                                                        color: 'white',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        '&:hover': { bgcolor: '#8e1818' },
                                                        '&.Mui-disabled': { bgcolor: '#e5e7eb' }
                                                    }}
                                                >
                                                    {actionLoading ? <Spinner /> : (id ? "Update Teacher" : "Add Teacher")}
                                                </Button>
                                            </Box>
                                        )}
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
