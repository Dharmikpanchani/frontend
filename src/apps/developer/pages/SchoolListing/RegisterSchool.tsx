import { useEffect, useState, useMemo } from "react";
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
    OutlinedInput,
    InputAdornment,
    IconButton,
    Autocomplete,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    School as SchoolIcon,
    LocationOn as LocationIcon,
    Description as LegalIcon,
    Image as BrandingIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { addEditSchool, getSchoolById } from "@/redux/slices/schoolSlice";
import Svg from "@/assets/Svg";
import { schoolValidationSchema } from "@/utils/validation/FormikValidation";
import Spinner from "../../component/developerCommon/spinner/Spinner";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { renderSingleImage } from "@/apps/common/uploadImageAndVideo";
import AutoCompleteLocation from "@/apps/common/AutoCompleteLocation";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { CommonLoader } from "../../component/developerCommon/loader/Loader";

import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { boardOptions, schoolTypeOptions, mediumOptions } from "@/apps/common/StaticArrayData";



export default function RegisterSchool() {
    const location = useLocation();
    const id = location.state?.id;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isView = location.pathname.endsWith("/view");
    const isEdit = !!id && location.pathname.endsWith("/edit");

    const { selectedSchool, actionLoading, loading } = useSelector((state: RootState) => state.SchoolReducer);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    useEffect(() => {
        // Fetch school by ID if needed (for edit/view)
        if (id) {
            dispatch(getSchoolById(id) as any);
        }
    }, [id, dispatch]);

    const initialValues = useMemo(() => ({
        id: id || "",
        schoolName: (isEdit || isView) ? (selectedSchool?.schoolName || "") : "",
        ownerName: (isEdit || isView) ? (selectedSchool?.ownerName || "") : "",
        email: (isEdit || isView) ? (selectedSchool?.email || "") : "",
        phoneNumber: (isEdit || isView) ? (selectedSchool?.phoneNumber || "") : "",
        password: "",
        confirmPassword: "",
        schoolCode: (isEdit || isView) ? (selectedSchool?.schoolCode || "") : "",
        // Basic Info
        schoolType: (isEdit || isView) ? (selectedSchool?.schoolType || "") : "",
        board: (isEdit || isView) ? (selectedSchool?.board || "") : "",
        medium: (isEdit || isView) ? (selectedSchool?.medium || "") : "",
        establishedYear:
            (isEdit || isView)
                ? (selectedSchool?.establishedYear
                    ? moment(selectedSchool.establishedYear, "YYYY-MM-DD")
                    : null)
                : null,// Address Details
        address: (isEdit || isView) ? (selectedSchool?.address || "") : "",
        city: (isEdit || isView) ? (selectedSchool?.city || "") : "",
        state: (isEdit || isView) ? (selectedSchool?.state || "") : "",
        zipCode: (isEdit || isView) ? (selectedSchool?.zipCode || "") : "",
        country: (isEdit || isView) ? (selectedSchool?.country || "") : "India",
        latitude: (isEdit || isView) ? (selectedSchool?.latitude || "") : "",
        longitude: (isEdit || isView) ? (selectedSchool?.longitude || "") : "",
        // Legal Details
        registrationNumber: (isEdit || isView) ? (selectedSchool?.registrationNumber || "") : "",
        gstNumber: (isEdit || isView) ? (selectedSchool?.gstNumber || "") : "",
        panNumber: (isEdit || isView) ? (selectedSchool?.panNumber || "") : "",
        affiliationCertificate: null,
        affiliationCertificateUrl: (isEdit || isView) ? (selectedSchool?.affiliationCertificate || "") : "",
        // Branding
        logo: null,
        logoUrl: (isEdit || isView) ? (selectedSchool?.logo || "") : "",
        banner: null,
        bannerUrl: (isEdit || isView) ? (selectedSchool?.banner || "") : "",
    }), [id, isEdit, isView, selectedSchool]);





    const handleSubmit = async (values: any) => {
        if (isView) return;

        const formData = new FormData();
        // Mandatory and Basic Info
        if (values.id) formData.append("id", values.id);
        formData.append("schoolName", values.schoolName);
        formData.append("ownerName", values.ownerName);
        formData.append("email", values.email);
        formData.append("phoneNumber", values.phoneNumber);
        if (values.password) formData.append("password", values.password);
        formData.append("schoolCode", values.schoolCode);
        formData.append("schoolType", values.schoolType);
        formData.append("board", values.board);
        formData.append("medium", values.medium);
        if (values.establishedYear) {
            formData.append("establishedYear", moment(values.establishedYear).format("YYYY-MM-DD"));
        }

        // Address Details
        formData.append("address", values.address);
        formData.append("city", values.city);
        formData.append("state", values.state);
        formData.append("zipCode", values.zipCode);
        formData.append("country", values.country);
        if (values.latitude) formData.append("latitude", values.latitude);
        if (values.longitude) formData.append("longitude", values.longitude);

        // Legal Details
        formData.append("registrationNumber", values.registrationNumber);
        formData.append("gstNumber", values.gstNumber);
        formData.append("panNumber", values.panNumber);
        if (values.affiliationCertificate) {
            formData.append("affiliationCertificate", values.affiliationCertificate);
        }

        // Branding
        if (values.logo) {
            formData.append("logo", values.logo);
        }
        if (values.banner) {
            formData.append("banner", values.banner);
        }

        try {
            const resultAction = await dispatch(addEditSchool(formData) as any);
            if (addEditSchool.fulfilled.match(resultAction)) {
                if (isEdit) {
                    navigate("/school-list");
                } else {
                    navigate("/school-register/otp", { state: { type: "schoolRegistration", email: values.email } });
                }
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error?.message || "Something went wrong";
            toasterError(errorMessage);
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
                backgroundColor: 'rgba(0, 33, 71, 0.05)',
                color: 'var(--primary-color)'
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
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    className="admin-breadcrumb"
                    sx={{ mb: 1 }}
                >
                    <Link underline="hover" color="inherit" onClick={() => navigate("/school-list")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Schools
                    </Link>
                    <Typography className="admin-breadcrumb-active">
                        {isView ? "View" : isEdit ? "Edit" : "Add"} School
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '12px', minHeight: '200px', position: 'relative', backgroundColor: 'white' }}>
                {loading ? (
                    <CommonLoader />
                ) : (
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={schoolValidationSchema}
                        onSubmit={handleSubmit}
                    >
                        {(formikProps: FormikProps<any>) => {
                            const { values, errors, touched, handleChange, handleSubmit, setFieldValue, handleBlur } = formikProps;
                            return (
                                <Form onSubmit={handleSubmit}>
                                    <Box sx={{ maxWidth: 1100 }}>
                                        {/* 1. Basic School Details */}
                                        <SectionTitle icon={SchoolIcon} title="Basic School Details" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                            {/* School Name */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>School Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="schoolName"
                                                    placeholder="Enter School Name"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.schoolName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.schoolName && Boolean(errors.schoolName)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.schoolName && errors.schoolName) ? (errors.schoolName as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* School Code */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>School Code<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="schoolCode"
                                                    placeholder="Enter School Code"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.schoolCode}
                                                    onChange={(e) => {
                                                        let value = e.target.value.trimStart().replace(/\s+/g, "-");
                                                        setFieldValue("schoolCode", value);
                                                    }}
                                                    onBlur={handleBlur}
                                                    error={touched.schoolCode && Boolean(errors.schoolCode)}
                                                    disabled={isView || isEdit}
                                                />
                                                <FormHelperText className="error-text">{(touched.schoolCode && errors.schoolCode) ? (errors.schoolCode as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Owner Name */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Owner Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="ownerName"
                                                    placeholder="Enter Owner Name"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.ownerName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.ownerName && Boolean(errors.ownerName)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.ownerName && errors.ownerName) ? (errors.ownerName as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Established Year */}
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
                                                                // error: touched.establishedYear && Boolean(errors.establishedYear),
                                                                onBlur: handleBlur,
                                                                sx: inputSx
                                                            },

                                                            field: {
                                                                readOnly: true,
                                                            },
                                                        }}
                                                        disabled={isView}
                                                    />
                                                </LocalizationProvider>
                                                <FormHelperText className="error-text">{(touched.establishedYear && errors.establishedYear) ? (errors.establishedYear as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* School Type */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>School Type<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={schoolTypeOptions}
                                                    getOptionLabel={(option: any) => option.label}
                                                    value={schoolTypeOptions.find((opt: any) => opt.value === values.schoolType) || null}
                                                    onChange={(_, newValue) => setFieldValue("schoolType", newValue ? newValue.value : "")}
                                                    disabled={isView}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select Type"
                                                            variant="outlined"
                                                            sx={inputSx}
                                                            error={touched.schoolType && Boolean(errors.schoolType)}
                                                        />
                                                    )}
                                                    sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 !important', height: '40px' } }}
                                                />
                                                <FormHelperText className="error-text">{(touched.schoolType && errors.schoolType) ? (errors.schoolType as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Board */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Board<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={boardOptions}
                                                    getOptionLabel={(option: any) => option.label}
                                                    value={boardOptions.find((opt: any) => opt.value === values.board) || null}
                                                    onChange={(_, newValue) => setFieldValue("board", newValue ? newValue.value : "")}
                                                    disabled={isView}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select Board"
                                                            variant="outlined"
                                                            sx={inputSx}
                                                            error={touched.board && Boolean(errors.board)}
                                                        />
                                                    )}
                                                    sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 !important', height: '40px' } }}
                                                />
                                                <FormHelperText className="error-text">{(touched.board && errors.board) ? (errors.board as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Medium */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Medium<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={mediumOptions}
                                                    getOptionLabel={(option: any) => option.label}
                                                    value={mediumOptions.find((opt: any) => opt.value === values.medium) || null}
                                                    onChange={(_, newValue) => setFieldValue("medium", newValue ? newValue.value : "")}
                                                    disabled={isView}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select Medium"
                                                            variant="outlined"
                                                            sx={inputSx}
                                                            error={touched.medium && Boolean(errors.medium)}
                                                        />
                                                    )}
                                                    sx={{ '& .MuiAutocomplete-inputRoot': { padding: '0 !important', height: '40px' } }}
                                                />
                                                <FormHelperText className="error-text">{(touched.medium && errors.medium) ? (errors.medium as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Email */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Email<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="email"
                                                    placeholder="Enter Email"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.email && Boolean(errors.email)}
                                                    disabled={isView || isEdit}
                                                />
                                                <FormHelperText className="error-text">{(touched.email && errors.email) ? (errors.email as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Phone Number */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>Phone Number<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="phoneNumber"
                                                    placeholder="Enter Phone Number"
                                                    variant="outlined"
                                                    type="number"
                                                    sx={inputSx}
                                                    value={values.phoneNumber}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.phoneNumber && errors.phoneNumber) ? (errors.phoneNumber as string) : ""}</FormHelperText>
                                            </Box>
                                        </Box>

                                        {/* 2. Address Details */}
                                        <SectionTitle icon={LocationIcon} title="Address Details" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                            <Box gridColumn="span 12">
                                                <Typography sx={labelSx}>Search Location (Auto-fill)<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <AutoCompleteLocation
                                                    name="address"
                                                    placeholder="Search for school location..."
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    touched={touched}
                                                    errors={errors}
                                                    disabled={isView}
                                                />
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>City<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="city"
                                                    placeholder="City"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.city}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.city && Boolean(errors.city)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.city && errors.city) ? (errors.city as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>State<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="state"
                                                    placeholder="State"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.state}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.state && Boolean(errors.state)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.state && errors.state) ? (errors.state as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>Zip Code<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="zipCode"
                                                    placeholder="Zip Code"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.zipCode}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.zipCode && Boolean(errors.zipCode)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.zipCode && errors.zipCode) ? (errors.zipCode as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 3' }}>
                                                <Typography sx={labelSx}>Country<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="country"
                                                    placeholder="Country"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.country}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.country && Boolean(errors.country)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.country && errors.country) ? (errors.country as string) : ""}</FormHelperText>
                                            </Box>
                                        </Box>

                                        {/* 3. Legal / Verification Details */}
                                        <SectionTitle icon={LegalIcon} title="Legal / Verification Details" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Registration Number<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="registrationNumber"
                                                    placeholder="Reg. No."
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.registrationNumber}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.registrationNumber && Boolean(errors.registrationNumber)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.registrationNumber && errors.registrationNumber) ? (errors.registrationNumber as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>GST Number</Typography>
                                                <TextField
                                                    fullWidth
                                                    name="gstNumber"
                                                    placeholder="GSTIN"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.gstNumber}
                                                    onChange={(e) => setFieldValue("gstNumber", e.target.value.toUpperCase())}
                                                    onBlur={handleBlur}
                                                    error={touched.gstNumber && Boolean(errors.gstNumber)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.gstNumber && errors.gstNumber) ? (errors.gstNumber as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>PAN Number</Typography>
                                                <TextField
                                                    fullWidth
                                                    name="panNumber"
                                                    placeholder="PAN"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.panNumber}
                                                    onChange={(e) => setFieldValue("panNumber", e.target.value.toUpperCase())}
                                                    onBlur={handleBlur}
                                                    error={touched.panNumber && Boolean(errors.panNumber)}
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.panNumber && errors.panNumber) ? (errors.panNumber as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn="span 12">
                                                <Typography sx={labelSx}>Affiliation Certificate</Typography>
                                                <Box sx={{
                                                    border: '1px dashed #ced4da',
                                                    borderRadius: '8px',
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    backgroundColor: '#f9fafb',
                                                    position: 'relative'
                                                }}>
                                                    <Button
                                                        variant="outlined"
                                                        component="label"
                                                        size="small"
                                                        disabled={isView}
                                                        sx={{ textTransform: 'none', borderRadius: '6px' }}
                                                    >
                                                        Choose File
                                                        <input
                                                            hidden
                                                            type="file"
                                                            disabled={isView}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                const files = e.target.files;
                                                                if (files && files.length > 0) {
                                                                    setFieldValue("affiliationCertificate", files[0]);
                                                                }
                                                            }}
                                                        />
                                                    </Button>
                                                    <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
                                                        {values.affiliationCertificate ? values.affiliationCertificate.name :
                                                            values.affiliationCertificateUrl ? (
                                                                <Link
                                                                    href={`${import.meta.env.VITE_BASE_URL_IMAGE}/${values.affiliationCertificateUrl}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        color: 'var(--primary-color)',
                                                                        textDecoration: 'underline',
                                                                        cursor: 'pointer',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    View Current Certificate
                                                                </Link>
                                                            ) : "No file chosen (PDF, JPG, PNG)"}
                                                    </Typography>
                                                    {(values.affiliationCertificate || values.affiliationCertificateUrl) && !isView && !isEdit && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setFieldValue("affiliationCertificate", null);
                                                                setFieldValue("affiliationCertificateUrl", "");
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
                                                <FormHelperText className="error-text">{(touched.affiliationCertificate && errors.affiliationCertificate) ? (errors.affiliationCertificate as string) : ""}</FormHelperText>
                                            </Box>
                                        </Box>

                                        {/* 4. Branding Details */}
                                        <SectionTitle icon={BrandingIcon} title="Branding" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                            {/* Logo Upload */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>School Logo{(!isEdit && !isView) && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Button
                                                            variant="outlined"
                                                            component="label"
                                                            disabled={isView}
                                                            sx={{
                                                                minWidth: '100px',
                                                                width: '100px',
                                                                height: '100px',
                                                                borderRadius: '12px',
                                                                border: '1px dashed #ced4da',
                                                                bgcolor: '#f8f9fa',
                                                                p: 0,
                                                                overflow: 'hidden',
                                                                flexShrink: 0,
                                                                '&:hover': { bgcolor: isView ? '#f8f9fa' : '#f1f3f5' },
                                                                cursor: isView ? 'default' : 'pointer'
                                                            }}
                                                        >
                                                            {renderSingleImage({ profile: values.logo, imageUrl: values.logoUrl })}
                                                            <input
                                                                hidden
                                                                accept="image/*"
                                                                type="file"
                                                                disabled={isView}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const files = e.target.files;
                                                                    if (files && files.length > 0) {
                                                                        setFieldValue("logo", files[0]);
                                                                    }
                                                                }}
                                                            />
                                                        </Button>
                                                        {(values.logo || values.logoUrl) && !isView && !isEdit && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setFieldValue("logo", null);
                                                                    setFieldValue("logoUrl", "");
                                                                }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -8,
                                                                    right: -8,
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
                                                    <Typography sx={{ fontSize: '11px', color: '#667085', pt: 1, maxWidth: '200px' }}>
                                                        <strong>Recommended:</strong> 200x200px (1:1 Ratio).<br />
                                                        Max 20MB. JPG, PNG, SVG.
                                                    </Typography>
                                                </Box>
                                                <FormHelperText className="error-text">{(touched.logo && errors.logo) ? (errors.logo as string) : ""}</FormHelperText>
                                            </Box>

                                            {/* Banner Upload */}
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Typography sx={labelSx}>School Banner</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Button
                                                            variant="outlined"
                                                            component="label"
                                                            disabled={isView}
                                                            sx={{
                                                                minWidth: '240px',
                                                                width: '100%',
                                                                maxWidth: '400px',
                                                                height: '100px',
                                                                borderRadius: '8px',
                                                                border: '1.5px dashed #D0D5DD',
                                                                bgcolor: '#F9FAFB',
                                                                p: 0,
                                                                overflow: 'hidden',
                                                                flexShrink: 0,
                                                                '&:hover': { bgcolor: isView ? '#F8F9FA' : '#F1F3F5' },
                                                                cursor: isView ? 'default' : 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            {values.bannerUrl ? (
                                                                <img src={values.bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Banner" />
                                                            ) : values.banner ? (
                                                                renderSingleImage({ profile: values.banner, imageUrl: "" })
                                                            ) : (
                                                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#475467', letterSpacing: '0.02em' }}>
                                                                    UPLOAD BANNER
                                                                </Typography>
                                                            )}
                                                            <input
                                                                hidden
                                                                accept="image/*"
                                                                type="file"
                                                                disabled={isView}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const files = e.target.files;
                                                                    if (files && files.length > 0) {
                                                                        setFieldValue("banner", files[0]);
                                                                    }
                                                                }}
                                                            />
                                                        </Button>
                                                        {(values.banner || values.bannerUrl) && !isView && !isEdit && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setFieldValue("banner", null);
                                                                    setFieldValue("bannerUrl", "");
                                                                }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: -8,
                                                                    right: -8,
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
                                                    <Typography sx={{ fontSize: '11px', color: '#667085', pt: 1, maxWidth: '200px' }}>
                                                        <strong>Recommended:</strong> 1200x400px (3:1 Ratio).<br />
                                                        Max 20MB. JPG, PNG, SVG.
                                                    </Typography>
                                                </Box>
                                                <FormHelperText className="error-text">{(touched.banner && errors.banner) ? (errors.banner as string) : ""}</FormHelperText>
                                            </Box>
                                        </Box>

                                        {/* Password Fields (Only for Add) */}
                                        {!isEdit && !isView && (
                                            <>
                                                <SectionTitle icon={Visibility} title="Login Credentials" />
                                                <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                        <Typography sx={labelSx}>Password<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                        <OutlinedInput
                                                            fullWidth
                                                            type={showPassword ? "text" : "password"}
                                                            name="password"
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
                                                        <FormHelperText className="error-text">{(touched.password && errors.password) ? (errors.password as string) : ""}</FormHelperText>
                                                    </Box>

                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                        <Typography sx={labelSx}>Confirm Password<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                        <OutlinedInput
                                                            fullWidth
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            name="confirmPassword"
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
                                                        <FormHelperText className="error-text">{(touched.confirmPassword && errors.confirmPassword) ? (errors.confirmPassword as string) : ""}</FormHelperText>
                                                    </Box>
                                                </Box>
                                            </>
                                        )}

                                        <Box sx={{ mt: 5, pb: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                                            <Button
                                                className="admin-btn-secondary"
                                                onClick={() => navigate("/school-list")}
                                                disabled={actionLoading}
                                                variant="outlined"
                                                sx={{ minWidth: { xs: '100%', sm: '130px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Discard
                                            </Button>
                                            {!isView && (
                                                <Button
                                                    type="submit"
                                                    className="admin-btn-theme"
                                                    disabled={actionLoading}
                                                    variant="contained"
                                                    sx={{ minWidth: { xs: '100%', sm: '140px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                                                >
                                                    {actionLoading ? <Spinner /> : (
                                                        <>
                                                            <img
                                                                src={Svg.plus}
                                                                className="admin-plus-icon"
                                                                alt="plus"
                                                                style={{ filter: 'brightness(0) invert(1)', width: '12px', marginRight: '8px' }}
                                                            />
                                                            {isEdit ? "Update" : "Add"} School
                                                        </>
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
