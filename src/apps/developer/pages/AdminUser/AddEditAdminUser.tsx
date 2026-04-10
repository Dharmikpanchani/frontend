import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
    Tooltip,
    debounce,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    LocalPhone as PhoneIcon,
    ContentCopy as CopyIcon
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { getAllRolesSimple } from "@/redux/slices/roleSlice";
import { addEditAdminUser, getAdminUserById } from "@/redux/slices/adminUserSlice";
import Svg from "@/assets/Svg";
import { BpCheckbox } from "../../component/developerCommon/commonCssFunction/cssFunction";
import { adminUserValidationSchema } from "@/utils/validation/FormikValidation";
import Spinner from "../../component/developerCommon/spinner/Spinner";
import { toasterError } from "@/utils/toaster/Toaster";
import { CommonLoader } from "@/apps/common/loader/Loader";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DataNotFound from "../../component/developerCommon/dataNotFound/DataNotFound";
import Pagination from "@/apps/common/pagination/Pagination";
import Filter from "../../component/developerCommon/filter/Filter";
import moment from "moment";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { boardOptions, schoolTypeOptions } from "@/apps/common/StaticArrayData";


export default function AddEditAdminUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const isView = location.pathname.includes("/view/");
    const isEdit = !!id && !isView;

    const { allRoles } = useSelector((state: RootState) => state.RoleReducer);
    const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);
    const isSuperDeveloper = adminDetails?.type === "super_developer";

    const [buttonSpinner, setButtonSpinner] = useState(false);
    // --- Associated Schools Server-side State ---
    const { selectedAdminUser, loading, schoolPagination } = useSelector((state: RootState) => state.AdminUserReducer);
    const [openFilter, setOpenFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchNameValue, setSearchNameValue] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [filterValues, setFilterValues] = useState({
        board: "",
        schoolType: "",
        isActive: "",
        isVerified: "",
        schoolCode: "",
        panNumber: "",
        gstNumber: "",
        registrationNumber: "",
        establishedYear: "",
    });

    const handleCopyCode = (id: string, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleGetAdminWithSchools = (searchQuery?: string, filters?: any) => {
        if (!id) return;
        dispatch(getAdminUserById({
            id,
            params: {
                page: currentPage + 1,
                perPage: rowsPerPage,
                search: searchQuery?.trim() ?? searchNameValue.trim(),
                board: filters?.board ?? filterValues.board,
                schoolType: filters?.schoolType ?? filterValues.schoolType,
                isActive: filters?.isActive ?? filterValues.isActive,
                isVerified: filters?.isVerified ?? filterValues.isVerified,
                schoolCode: filters?.schoolCode ?? filterValues.schoolCode,
                panNumber: filters?.panNumber ?? filterValues.panNumber,
                gstNumber: filters?.gstNumber ?? filterValues.gstNumber,
                registrationNumber: filters?.registrationNumber ?? filterValues.registrationNumber,
                establishedYear: filters?.establishedYear ?? filterValues.establishedYear,
            }
        }) as any);
    };

    const debouncedCallApi = useCallback(
        debounce((query?: string) => {
            handleGetAdminWithSchools(query);
            setCurrentPage(0);
        }, 1000),
        [id, currentPage, rowsPerPage, filterValues]
    );

    useEffect(() => {
        if (isView && isSuperDeveloper) {
            handleGetAdminWithSchools(searchNameValue);
        } else if (id) {
            dispatch(getAdminUserById({ id }) as any);
        }
    }, [id, isView, isSuperDeveloper, currentPage, rowsPerPage]);

    const handleApplyFilter = (values: any) => {
        setFilterValues(values);
        handleGetAdminWithSchools(searchNameValue, values);
        setCurrentPage(0);
        setOpenFilter(false);
    };

    const handleResetFilter = () => {
        const resetValues = {
            board: "",
            schoolType: "",
            isActive: "",
            isVerified: "",
            schoolCode: "",
            panNumber: "",
            gstNumber: "",
            registrationNumber: "",
            establishedYear: "",
        };
        setFilterValues(resetValues);
        setSearchNameValue("");
        handleGetAdminWithSchools("", resetValues);
        setCurrentPage(0);
        setOpenFilter(false);
    };

    const filterFields: any[] = [
        {
            type: "searchbaseSelect",
            name: "board",
            label: "Board",
            placeholder: "Select Board",
            options: boardOptions,
        },
        {
            type: "searchbaseSelect",
            name: "schoolType",
            label: "School Type",
            placeholder: "Select School Type",
            options: schoolTypeOptions,
        },
        {
            type: "searchbaseSelect",
            name: "isActive",
            label: "Status",
            placeholder: "Select Status",
            options: [
                { label: "Active", value: true },
                { label: "Deactive", value: false },
            ],
        },
        {
            type: "searchbaseSelect",
            name: "isVerified",
            label: "Verification Status",
            placeholder: "Select Status",
            options: [
                { label: "Verified", value: true },
                { label: "Not Verified", value: false },
            ],
        },
        { type: "inputSelect", name: "schoolCode", label: "School Code", placeholder: "Enter School Code" },
        { type: "inputSelect", name: "panNumber", label: "PAN Number", placeholder: "Enter PAN Number" },
        { type: "inputSelect", name: "gstNumber", label: "GST Number", placeholder: "Enter GST Number" },
        { type: "inputSelect", name: "registrationNumber", label: "Registration Number", placeholder: "Enter Registration Number" },
        { type: "date", name: "establishedYear", label: "Established Year", placeholder: "Select year" },
    ];
    // ----------------------------------------

    useEffect(() => {
        dispatch(getAllRolesSimple("filter") as any);
    }, [dispatch]);

    const initialValues = useMemo(() => ({
        name: (isEdit || isView) ? (selectedAdminUser?.name || "") : "",
        email: (isEdit || isView) ? (selectedAdminUser?.email || "") : "",
        phoneNumber: (isEdit || isView) ? (selectedAdminUser?.phoneNumber || "") : "",
        isReferralAdmin: (isEdit || isView) ? (selectedAdminUser?.isReferralAdmin || false) : false,
        password: "",
        confirmPassword: "",
        role: (isEdit || isView) ? (selectedAdminUser?.role?._id || "") : "",
        id: id || "",
    }), [isEdit, isView, selectedAdminUser, id]);


    const handleSubmit = async (values: any) => {
        if (isView) return;

        setButtonSpinner(true);
        const urlencoded = new URLSearchParams();
        urlencoded.append("name", values.name);
        urlencoded.append("email", values.email);
        urlencoded.append("phoneNumber", values.phoneNumber);
        urlencoded.append("isReferralAdmin", values.isReferralAdmin);
        urlencoded.append("role", values.role);

        if (id) {
            urlencoded.append("id", id);
        } else {
            urlencoded.append("password", values.password);
        }

        try {
            const resultAction = await dispatch(addEditAdminUser(urlencoded) as any);
            setButtonSpinner(false);
            if (addEditAdminUser.fulfilled.match(resultAction)) {
                if (!id) {
                    navigate("/otp", { state: { type: "registration", email: values.email } });
                } else {
                    navigate("/admin-list");
                }
            }
        } catch (error: any) {
            setButtonSpinner(false);
            const errorMessage = error.response?.data?.message || error?.message || "Something went wrong";
            toasterError(errorMessage);
        }
    };



    return (
        <Box className="admin-dashboard-content">
            <Box className="admin-page-title-main" sx={{ mb: 3 }}>
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    className="admin-breadcrumb"
                    sx={{ mb: 1 }}
                >
                    <Link underline="hover" color="inherit" onClick={() => navigate("/admin-list")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Admin Users
                    </Link>
                    <Typography className="admin-breadcrumb-active">
                        {isView ? "View" : isEdit ? "Edit" : "Add"} Admin User
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: 4, borderRadius: '12px', minHeight: '200px', position: 'relative' }}>
                {loading ? (
                    <CommonLoader />
                ) : (
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={adminUserValidationSchema}
                        onSubmit={handleSubmit}
                    >
                        {(formikProps: FormikProps<any>) => {
                            const { values, errors, touched, handleChange, handleSubmit, setFieldValue, handleBlur } = formikProps;
                            return (
                                <Form onSubmit={handleSubmit}>
                                    <Box sx={{ maxWidth: 800 }}>
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 1.5, sm: 2 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
                                                <Typography sx={labelSx}>Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField
                                                    fullWidth
                                                    name="name"
                                                    placeholder="Enter Name"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.name && Boolean(errors.name)}
                                                    disabled={isView || isEdit}
                                                />
                                                <FormHelperText className="error-text">{(touched.name && errors.name) ? (errors.name as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
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

                                            <Box gridColumn="span 12" className="admin-input-box">
                                                <Typography sx={labelSx}>Role<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={allRoles || []}
                                                    getOptionLabel={(option: any) => option.role || ""}
                                                    value={allRoles?.find((role: any) => role._id === values.role) || null}
                                                    onChange={(_, newValue) => {
                                                        setFieldValue("role", newValue ? newValue._id : "");
                                                    }}
                                                    disabled={isView}
                                                    popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                    clearIcon={null}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            placeholder="Select Role"
                                                            variant="outlined"
                                                            sx={inputSx}
                                                            error={touched.role && Boolean(errors.role)}
                                                        />
                                                    )}
                                                    sx={{
                                                        '& .MuiAutocomplete-inputRoot': {
                                                            paddingTop: '0 !important',
                                                            paddingBottom: '0 !important',
                                                            paddingLeft: '0 !important',
                                                            paddingRight: '30px !important',
                                                            height: '40px',
                                                            '& .MuiAutocomplete-input': {
                                                                padding: '0 10px !important',
                                                                height: '40px',
                                                                fontFamily: "'Poppins', sans-serif !important",
                                                                fontSize: '14px !important',
                                                            }
                                                        }
                                                    }}
                                                />
                                                <FormHelperText className="error-text">{(touched.role && errors.role) ? (errors.role as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
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
                                                    disabled={isView}
                                                />
                                                <FormHelperText className="error-text">{(touched.phoneNumber && errors.phoneNumber) ? (errors.phoneNumber as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box" sx={{ display: 'flex', alignItems: 'center', mt: { xs: 0, sm: 2.5 } }}>
                                                <BpCheckbox
                                                    checked={values.isReferralAdmin}
                                                    onChange={(e) => setFieldValue("isReferralAdmin", e.target.checked)}
                                                    disabled={isView || isEdit}
                                                />
                                                <Typography sx={{ ...labelSx, mb: 0, ml: 1, cursor: 'pointer' }} onClick={() => !(isView || isEdit) && setFieldValue("isReferralAdmin", !values.isReferralAdmin)}>
                                                    Have you referral admin
                                                </Typography>
                                            </Box>

                                            {!isEdit && !isView && (
                                                <>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
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

                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
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
                                                </>
                                            )}
                                        </Box>

                                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                                            <Button
                                                className="admin-btn-secondary"
                                                onClick={() => navigate("/admin-list")}
                                                disabled={buttonSpinner}
                                                variant="outlined"
                                                sx={{ minWidth: { xs: '100%', sm: '130px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Discard
                                            </Button>
                                            {!isView && (
                                                <Button
                                                    type="submit"
                                                    className="admin-btn-theme"
                                                    disabled={buttonSpinner}
                                                    variant="contained"
                                                    sx={{ minWidth: { xs: '100%', sm: '120px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                                                >
                                                    {buttonSpinner ? <Spinner /> : (
                                                        <>
                                                            <img
                                                                src={Svg.plus}
                                                                className="admin-plus-icon"
                                                                alt="plus"
                                                                style={{ filter: 'brightness(0) invert(1)', width: '12px', marginRight: '8px' }}
                                                            />
                                                            {isEdit ? "Update" : "Add"}
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

            {/* --- Associated Schools Section for Super Developer View --- */}
            {isView && isSuperDeveloper && selectedAdminUser?.schools?.length > 0 && (
                <Box sx={{ mt: 5 }}>
                    <Box className="admin-user-list-flex admin-page-title-main" sx={{ mb: 2 }}>
                        <Typography className="admin-page-title" component="h2" variant="h2" sx={{ fontSize: '20px !important' }}>
                            Associated Schools
                        </Typography>
                        <Box className="admin-flex-end">
                            <Box className="admin-search-main">
                                <Box className="admin-search-box">
                                    <Box className="admin-form-group">
                                        <TextField
                                            value={searchNameValue}
                                            fullWidth
                                            id="search"
                                            className="admin-form-control"
                                            placeholder="Search School"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setSearchNameValue(e.target.value);
                                                debouncedCallApi(e.target.value);
                                            }}
                                            inputProps={{ maxLength: 80 }}
                                        />
                                        <img
                                            src={Svg.search}
                                            className="admin-search-grey-img admin-icon admin-icon-theme"
                                            alt="search"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box className="admin-filter-btn-main">
                                <Button
                                    className="admin-btn-theme"
                                    onClick={() => setOpenFilter(true)}
                                    sx={{ ml: 1, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <img src={Svg.filter} alt="filter" style={{ width: '16px', filter: 'brightness(0) invert(1)' }} />
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    <Box className="card-border common-card">
                        <Box className="brand-table-main page-table-main">
                            <TableContainer component={Paper} className="table-container">
                                <Table aria-label="simple table" className="table">
                                    <TableHead className="table-head">
                                        <TableRow className="table-row">
                                            <TableCell className="table-th" width="22%">SCHOOL DETAILS</TableCell>
                                            <TableCell className="table-th" width="20%">LOCATION</TableCell>
                                            <TableCell className="table-th" width="15%">STATUS</TableCell>
                                            <TableCell className="table-th" width="18%">ACADEMIC INFO</TableCell>
                                            <TableCell className="table-th" width="13%">TAX INFO</TableCell>
                                            <TableCell className="table-th" width="12%">JOINED</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody className="table-body">
                                        {selectedAdminUser?.schools?.length ? (
                                            selectedAdminUser?.schools?.map((data: any) => (
                                                <TableRow key={data._id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                                                    <TableCell className="table-td">
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                            <Avatar
                                                                src={`${import.meta.env.VITE_BASE_URL_IMAGE}/${data?.logo}`}
                                                                variant="circular"
                                                                sx={{ width: 40, height: 40, border: '1px solid #ddd' }}
                                                            >
                                                                {data?.schoolName?.[0]}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 0.2 }}>
                                                                    {data?.schoolName}
                                                                </Typography>
                                                                <Tooltip title={copiedId === data?._id ? "Copied!" : "Click to copy code"} arrow placement="top">
                                                                    <Box
                                                                        onClick={() => handleCopyCode(data?._id, data?.schoolCode)}
                                                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', mb: 0.8, width: 'fit-content' }}
                                                                    >
                                                                        <Typography sx={{ fontSize: '10px', color: '#6b7280' }}>
                                                                            #{data?.schoolCode || '---'}
                                                                        </Typography>
                                                                        <CopyIcon sx={{ fontSize: 10, color: copiedId === data?._id ? '#4caf50' : '#9ca3af' }} />
                                                                    </Box>
                                                                </Tooltip>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.2 }}>
                                                                    <EmailIcon sx={{ fontSize: 12, color: '#942F15' }} />
                                                                    <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{data?.email}</Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <PhoneIcon sx={{ fontSize: 12, color: '#942F15' }} />
                                                                    <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{data?.phoneNumber}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell className="table-td">
                                                        <Typography sx={{ fontSize: '12px', color: '#111827', fontWeight: 500 }}>{data?.city}, {data?.state}</Typography>
                                                        <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{data?.country} - {data?.zipCode}</Typography>
                                                    </TableCell>
                                                    <TableCell className="table-td">
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <Box sx={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.2, borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                                                backgroundColor: data?.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: data?.isActive ? '#4caf50' : '#f44336', width: 'fit-content'
                                                            }}>
                                                                {data?.isActive ? "Active" : "Inactive"}
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.2, borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                                                                backgroundColor: data?.isVerified ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)', color: data?.isVerified ? '#2196f3' : '#ff9800', width: 'fit-content'
                                                            }}>
                                                                {data?.isVerified ? "Verified" : "Not Verified"}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell className="table-td">
                                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{data?.board}</Typography>
                                                        <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{data?.schoolType}</Typography>
                                                    </TableCell>
                                                    <TableCell className="table-td">
                                                        {data?.panNumber && (<Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>PAN: {data?.panNumber || 'NA'}</Typography>)}
                                                        {data?.gstNumber && (<Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>GST: {data?.gstNumber || 'NA'}</Typography>)}
                                                        {data?.registrationNumber && (<Typography sx={{ fontSize: '11px', color: '#9ca3af' }}>Reg: {data?.registrationNumber || 'NA'}</Typography>)}
                                                    </TableCell>
                                                    <TableCell className="table-td">
                                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{data?.updatedAt ? moment(data?.updatedAt).format('DD MMM YY') : '---'}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <DataNotFound text="No Schools Associated" />
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        <Box className="admin-pagination-main" sx={{ p: 2 }}>
                            {schoolPagination?.totalArrayLength ? (
                                <Pagination
                                    page={currentPage}
                                    rowsPerPage={rowsPerPage}
                                    setPage={setCurrentPage}
                                    setRowsPerPage={setRowsPerPage}
                                    count={schoolPagination.totalArrayLength}
                                />
                            ) : null}
                        </Box>
                    </Box>

                    <Filter
                        open={openFilter}
                        onClose={() => setOpenFilter(false)}
                        title="Associated School Filter"
                        fields={filterFields}
                        handleApply={handleApplyFilter}
                        handleReset={handleResetFilter}
                        initialValues={filterValues}
                    />
                </Box>
            )}
        </Box>
    );
}
