import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Button,
    FormHelperText,
    Breadcrumbs,
    Link,
    Autocomplete,
    IconButton,
} from "@mui/material";
import {
    Person as PersonIcon,
    Work as AcademicIcon,
    LocationOn as LocationIcon,
    AssignmentInd as IdentityIcon,
    Image as PhotoIcon,
    Close as CloseIcon,
    School as SchoolIcon
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { teacherValidationSchema } from "@/utils/validation/FormikValidation";
import { createTeacher } from "@/redux/slices/teacherSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import { getSubjects } from "@/redux/slices/subjectSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import { renderSingleImage } from "@/apps/common/uploadImageAndVideo";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import Svg from "@/assets/Svg";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";


const multiInputSx: SxProps<Theme> = {
    ...inputSx,
    height: 'auto',
    minHeight: '40px',
    '& .MuiOutlinedInput-root': {
        ...inputSx['& .MuiOutlinedInput-root'],
        height: 'auto',
        minHeight: '40px',
        padding: '4px 8px !important',
    },
    '& .MuiOutlinedInput-input': {
        padding: '0 8px !important',
        height: '32px !important',
        width: 'auto !important',
        flexGrow: 1,
    },
};

export default function AddEditTeacher() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { departments } = useSelector((state: RootState) => state.DepartmentReducer);
    const { subjects } = useSelector((state: RootState) => state.SubjectReducer);
    const { classes } = useSelector((state: RootState) => state.ClassReducer);
    const { sections } = useSelector((state: RootState) => state.SectionReducer);
    const { actionLoading } = useSelector((state: RootState) => state.TeacherReducer);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    useEffect(() => {
        const params = { page: 1, perPage: 100 };
        dispatch(getDepartments(params) as any);
        dispatch(getSubjects(params) as any);
        dispatch(getClasses(params) as any);
        dispatch(getSections(params) as any);
    }, [dispatch]);

    const initialValues = {
        name: "",
        email: "",
        phoneNumber: "",
        teacherCode: "",
        departmentId: "",
        subjectIds: [],
        classIds: [],
        sectionId: "",
        establishedYear: null,
        // Address Details
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        latitude: "",
        longitude: "",
        // Identity
        panNumber: "",
        aadhaarNumber: "",
        // Profile
        photo: null,
        photoUrl: "",
    };


    const handleSubmit = async (values: any) => {
        try {
            const resultAction = await dispatch(createTeacher(values) as any);

            if (createTeacher.fulfilled.match(resultAction)) {
                navigate("/teacher");
            }
        } catch (error: any) {
            toasterError(error?.message || "Something went wrong");
        }
    };

    const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 1, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: 'rgba(var(--primary-color-rgb, 255, 140, 0), 0.1)',
                color: 'var(--primary-color, #ff8c00)'
            }}>
                <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#1f2937', fontFamily: "'Poppins', sans-serif" }}>
                {title}
            </Typography>
        </Box>
    );

    return (
        <Box className="admin-dashboard-content">
            <Box className="admin-page-title-main" sx={{ mb: 3 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="admin-breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate("/teacher")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Teachers
                    </Link>
                    <Typography className="admin-breadcrumb-active">Add Teacher</Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '12px', backgroundColor: 'white' }}>
                <Formik initialValues={initialValues} validationSchema={teacherValidationSchema} onSubmit={handleSubmit}>
                    {(formikProps: FormikProps<any>) => {
                        const { values, errors, touched, handleChange, handleSubmit, setFieldValue, handleBlur } = formikProps;
                        return (
                            <Form onSubmit={handleSubmit}>
                                <Box sx={{ maxWidth: 1100 }}>
                                    {/* 1. Basic Information */}
                                    <SectionTitle icon={PersonIcon} title="Personal Information" />
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Full Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="name" placeholder="Enter Full Name" variant="outlined" sx={inputSx} value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && Boolean(errors.name)} />
                                            <FormHelperText className="error-text">{(touched.name && errors.name) ? (errors.name as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Teacher Code / Employee ID</Typography>
                                            <TextField
                                                fullWidth
                                                name="teacherCode"
                                                placeholder="Enter Teacher Code"
                                                variant="outlined"
                                                sx={inputSx}
                                                value={values.teacherCode}
                                                onChange={(e) => setFieldValue("teacherCode", e.target.value.toUpperCase())}
                                                onBlur={handleBlur}
                                            />
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Email Address<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="email" placeholder="Enter Email" variant="outlined" sx={inputSx} value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && Boolean(errors.email)} />
                                            <FormHelperText className="error-text">{(touched.email && errors.email) ? (errors.email as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Phone Number<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="phoneNumber" placeholder="Enter Phone Number" variant="outlined" sx={inputSx} value={values.phoneNumber} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber && Boolean(errors.phoneNumber)} />
                                            <FormHelperText className="error-text">{(touched.phoneNumber && errors.phoneNumber) ? (errors.phoneNumber as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Established Year<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
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
                                                                            borderColor: "var(--input-border, #ced4da)",
                                                                        },
                                                                        "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
                                                                            borderColor: "var(--primary-color, #ced4da) !important",
                                                                        },
                                                                        "&.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline": {
                                                                            border: "1px solid var(--primary-color, #ff8c00) !important",
                                                                        },
                                                                    },
                                                                "& .MuiPickersInputBase-sectionContent": {
                                                                    fontSize: "13px",
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
                                        </Box>
                                    </Box>

                                    {/* 2. Academic / Professional Details */}
                                    <SectionTitle icon={AcademicIcon} title="Academic / Professional Details" />
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Department<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                options={departments || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={departments?.find((d: any) => d._id === values.departmentId) || null}
                                                onChange={(_, newValue) => {
                                                    setFieldValue("departmentId", newValue ? newValue._id : "");
                                                    setFieldValue("subjectIds", []);
                                                }}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Department" variant="outlined" sx={inputSx} error={touched.departmentId && Boolean(errors.departmentId)} />}
                                                sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 !important', height: '40px' } }}
                                            />
                                            <FormHelperText className="error-text">{(touched.departmentId && errors.departmentId) ? (errors.departmentId as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Primary Section</Typography>
                                            <Autocomplete
                                                options={sections || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={sections?.find((s: any) => s._id === values.sectionId) || null}
                                                onChange={(_, newValue) => setFieldValue("sectionId", newValue ? newValue._id : "")}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Section" variant="outlined" sx={inputSx} />}
                                                sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 !important', height: '40px' } }}
                                            />
                                        </Box>

                                        <Box gridColumn="span 12">
                                            <Typography sx={labelSx}>Subjects Specialization<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                multiple
                                                options={subjects?.filter((s: any) =>
                                                    !values.departmentId ||
                                                    (s.departmentId?._id ? s.departmentId._id === values.departmentId : s.departmentId === values.departmentId)
                                                ) || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={subjects?.filter((s: any) => values.subjectIds.includes(s._id)) || []}
                                                onChange={(_, newValue) => setFieldValue("subjectIds", newValue.map((v: any) => v._id))}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Subjects" variant="outlined" sx={multiInputSx} error={touched.subjectIds && Boolean(errors.subjectIds)} />}
                                            />
                                            <FormHelperText className="error-text">{(touched.subjectIds && errors.subjectIds) ? (errors.subjectIds as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 12">
                                            <Typography sx={labelSx}>Assigned Classes<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                multiple
                                                options={classes || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={classes?.filter((c: any) => values.classIds.includes(c._id)) || []}
                                                onChange={(_, newValue) => setFieldValue("classIds", newValue.map((v: any) => v._id))}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Classes" variant="outlined" sx={multiInputSx} error={touched.classIds && Boolean(errors.classIds)} />}
                                            />
                                            <FormHelperText className="error-text">{(touched.classIds && errors.classIds) ? (errors.classIds as string) : ""}</FormHelperText>
                                        </Box>
                                    </Box>

                                    {/* 3. Address Details */}
                                    <SectionTitle icon={LocationIcon} title="Address Details" />
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                        <Box gridColumn="span 12">
                                            <Typography sx={labelSx}>Residential Address (Search Location)<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <AutoCompleteLocation
                                                name="address"
                                                placeholder="Search for residential location..."
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                touched={touched}
                                                errors={errors}
                                            />
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                            <Typography sx={labelSx}>City<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="city" placeholder="City" variant="outlined" sx={inputSx} value={values.city} onChange={handleChange} onBlur={handleBlur} error={touched.city && Boolean(errors.city)} />
                                            <FormHelperText className="error-text">{(touched.city && errors.city) ? (errors.city as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                            <Typography sx={labelSx}>State<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="state" placeholder="State" variant="outlined" sx={inputSx} value={values.state} onChange={handleChange} onBlur={handleBlur} error={touched.state && Boolean(errors.state)} />
                                            <FormHelperText className="error-text">{(touched.state && errors.state) ? (errors.state as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                            <Typography sx={labelSx}>Zip Code<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="zipCode" placeholder="Zip Code" variant="outlined" sx={inputSx} value={values.zipCode} onChange={handleChange} onBlur={handleBlur} error={touched.zipCode && Boolean(errors.zipCode)} />
                                            <FormHelperText className="error-text">{(touched.zipCode && errors.zipCode) ? (errors.zipCode as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                            <Typography sx={labelSx}>Country<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="country" placeholder="Country" variant="outlined" sx={inputSx} value={values.country} onChange={handleChange} onBlur={handleBlur} error={touched.country && Boolean(errors.country)} />
                                            <FormHelperText className="error-text">{(touched.country && errors.country) ? (errors.country as string) : ""}</FormHelperText>
                                        </Box>
                                    </Box>

                                    {/* 4. Identity & Documents */}
                                    <SectionTitle icon={IdentityIcon} title="Identity & Documents" />
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>PAN Number</Typography>
                                            <TextField
                                                fullWidth
                                                name="panNumber"
                                                placeholder="Enter PAN"
                                                variant="outlined"
                                                sx={inputSx}
                                                value={values.panNumber}
                                                onChange={(e) => setFieldValue("panNumber", e.target.value.toUpperCase())}
                                                onBlur={handleBlur}
                                            />
                                        </Box>
                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Aadhaar Number</Typography>
                                            <TextField
                                                fullWidth
                                                name="aadhaarNumber"
                                                placeholder="Enter Aadhaar Number"
                                                variant="outlined"
                                                sx={inputSx}
                                                value={values.aadhaarNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </Box>
                                    </Box>

                                    {/* 5. Teacher Photo */}
                                    <SectionTitle icon={PhotoIcon} title="Profile Photo" />
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4 }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Button
                                                variant="text"
                                                component="label"
                                                sx={{
                                                    minWidth: '120px',
                                                    width: '120px',
                                                    height: '120px',
                                                    borderRadius: '12px',
                                                    border: '1px dashed #ced4da',
                                                    bgcolor: '#f8f9fa',
                                                    color: 'inherit',
                                                    boxShadow: 'none',
                                                    p: 0,
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    '&:hover': { bgcolor: '#f1f3f5' }
                                                }}
                                            >
                                                {renderSingleImage({ profile: values.photo, imageUrl: values.photoUrl })}
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const files = e.target.files;
                                                        if (files && files.length > 0) {
                                                            setFieldValue("photo", files[0]);
                                                        }
                                                    }}
                                                />
                                            </Button>
                                            {(values.photo || values.photoUrl) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setFieldValue("photo", null);
                                                        setFieldValue("photoUrl", "");
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        right: -10,
                                                        p: '2px',
                                                        bgcolor: '#ef4444',
                                                        color: 'white',
                                                        boxShadow: 2,
                                                        zIndex: 10,
                                                        '&:hover': { bgcolor: '#dc2626' }
                                                    }}
                                                >
                                                    <CloseIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography sx={labelSx}>Teacher Photo<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Typography sx={{ fontSize: '11px', color: '#667085', pt: 1, maxWidth: '200px' }}>
                                                <strong>Recommended:</strong> 200x200px (1:1 Ratio).<br />
                                                Max 20MB. JPG, PNG, SVG.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 6, pt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                                        <Button className="admin-btn-secondary" onClick={() => navigate("/teacher")} variant="outlined" sx={{ minWidth: '130px', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>Discard</Button>
                                        <Button type="submit" className="admin-btn-theme" disabled={actionLoading} variant="contained" sx={{ minWidth: '150px', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                                            {actionLoading ? <Spinner /> : "Create Teacher Profile"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Form>
                        );
                    }}
                </Formik>
            </Box>
        </Box>
    );
}
