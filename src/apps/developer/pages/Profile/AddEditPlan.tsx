import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Button,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    FormHelperText,
    Breadcrumbs,
    Link,
    InputAdornment,
    Autocomplete,
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
    Assignment as AssignmentIcon,
    SignalCellularAlt as LimitsIcon,
    Security as SecurityIcon,
    NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { planStaticData as roleStaticData } from "@/apps/common/StaticArrayData";
import { BpCheckbox } from "../../component/developerCommon/commonCssFunction/cssFunction";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import Spinner from "../../component/developerCommon/spinner/Spinner";
import { planValidationSchema } from "@/utils/validation/FormikValidation";
import { useDispatch, useSelector } from "react-redux";
import { addEditPlan, getPlanById, clearSelectedPlan } from "@/redux/slices/planSlice";
import type { RootState } from "@/redux/Store";

const billingCycleOptions = [
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
];


export default function AddEditPlan() {
    const dispatch = useDispatch();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const isView = location.pathname.includes("/view/");
    const isEdit = !!id && !isView;

    const { selectedPlan, loading, actionLoading } = useSelector((state: RootState) => state.PlanReducer);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [permissionsError, setPermissionsError] = useState("");

    // Filter categories for the table logic
    const adminModuleIds = ["role", "admin_user"];
    const masterModuleIds = ["teacher", "department", "subject", "class", "section"];

    useEffect(() => {
        if (id) {
            dispatch(getPlanById(id) as any);
        } else {
            dispatch(clearSelectedPlan());
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedPlan && id) {
            setPermissions(selectedPlan.permissions || []);
        }
    }, [selectedPlan, id]);

    const initialValues = useMemo(() => {
        if (selectedPlan && id) {
            return {
                id: id,
                planName: selectedPlan.planName || "",
                price: selectedPlan.price || "",
                billingCycle: selectedPlan.billingCycle || "monthly",
                maxStudents: selectedPlan.maxStudents || "",
                maxTeachers: selectedPlan.maxTeachers || "",
                maxClasses: selectedPlan.maxClasses || "",
                monPrice: selectedPlan.monPrice || "",
                monOfferPrice: selectedPlan.monOfferPrice || "",
                yerPrice: selectedPlan.yerPrice || "",
                yerOfferPrice: selectedPlan.yerOfferPrice || "",
            };
        }
        return {
            id: "",
            planName: "",
            monPrice: "",
            monOfferPrice: "",
            yerPrice: "",
            yerOfferPrice: "",
            billingCycle: "monthly",
            maxStudents: "",
            maxTeachers: "",
            maxClasses: "",
        };
    }, [selectedPlan, id]);

    const handleSubmit = async (values: any) => {
        if (isView) return;

        if (!permissions.length) {
            setPermissionsError("Please select at least one permission");
            return;
        }

        setPermissionsError("");

        const payload: any = {
            ...values,
            permissions: [...new Set(permissions)],
        };
        if (id) payload.id = id;

        // Ensure we only send fields relevant to the selected billing cycle
        if (values.billingCycle === "monthly") {
            delete payload.yerPrice;
            delete payload.yerOfferPrice;
        } else if (values.billingCycle === "yearly") {
            delete payload.monPrice;
            delete payload.monOfferPrice;
        }

        const res = await dispatch(addEditPlan(payload) as any);
        if (res.meta.requestStatus === "fulfilled") {
            navigate("/plan-list");
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
                backgroundColor: '#fff7ed',
                color: '#ff8c00'
            }}>
                <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#1f2937', fontFamily: "'Poppins', sans-serif" }}>
                {title}
            </Typography>
        </Box>
    );

    // Reusable permission logic
    const onChangeCheckBox = (key: string) => {
        if (isView) return;
        const lastUnderscoreIndex = key.lastIndexOf('_');
        const moduleId = key.substring(0, lastUnderscoreIndex);
        const typeId = key.substring(lastUnderscoreIndex + 1);
        const viewKey = `${moduleId}_view`;

        if (permissions.includes(key)) {
            let newPermissions = permissions.filter((p) => p !== key);
            if (typeId === 'view') {
                newPermissions = newPermissions.filter((p) => !p.startsWith(`${moduleId}_`));
            }
            setPermissions(newPermissions);
        } else {
            let newPermissions = [...permissions, key];
            if (typeId !== 'view') {
                if (!newPermissions.includes(viewKey)) newPermissions.push(viewKey);
            }
            setPermissions([...new Set(newPermissions)]);
        }
    };

    const checkUncheckAllType = (action: "add" | "remove", typeId: string) => {
        if (isView) return;
        const relatedKeys = roleStaticData.flatMap((module: any) =>
            module.subRole.some((sr: any) => sr.titleId === typeId) ? [`${module.mainTitleId}_${typeId}`] : []
        );

        if (action === "add") {
            let newPermissions = [...permissions, ...relatedKeys];
            if (typeId !== 'view') {
                const views = roleStaticData.flatMap((m: any) =>
                    m.subRole.some((sr: any) => sr.titleId === typeId) && m.subRole.some((sr: any) => sr.titleId === 'view') ? [`${m.mainTitleId}_view`] : []
                );
                newPermissions = [...newPermissions, ...views];
            }
            setPermissions([...new Set(newPermissions)]);
        } else {
            let newPermissions = permissions.filter((k) => !relatedKeys.includes(k));
            if (typeId === 'view') {
                const allActionKeys = roleStaticData.flatMap((m: any) => m.subRole.map((sr: any) => `${m.mainTitleId}_${sr.titleId}`));
                newPermissions = newPermissions.filter((k) => !allActionKeys.includes(k));
            }
            setPermissions(newPermissions);
        }
    };

    const isTypeAllChecked = (typeId: string) => {
        const allKeys = roleStaticData.flatMap((m: any) => m.subRole.some((sr: any) => sr.titleId === typeId) ? [`${m.mainTitleId}_${typeId}`] : []);
        return allKeys.length > 0 && allKeys.every((k) => permissions.includes(k));
    };

    const isGroupChecked = (groupIds: string[]) => {
        const groupModules = roleStaticData.filter(m => groupIds.includes(m.mainTitleId));
        return groupModules.length > 0 && groupModules.every(module =>
            module.subRole.filter((sr: any) => sr.is_show).every((sr: any) => permissions.includes(`${module.mainTitleId}_${sr.titleId}`))
        );
    };

    const checkUncheckGroup = (action: "add" | "remove", groupIds: string[]) => {
        if (isView) return;
        const groupModules = roleStaticData.filter(m => groupIds.includes(m.mainTitleId));
        const allKeys = groupModules.flatMap(m => m.subRole.filter((sr: any) => sr.is_show).map((sr: any) => `${m.mainTitleId}_${sr.titleId}`));

        if (action === "add") {
            setPermissions([...new Set([...permissions, ...allKeys])]);
        } else {
            setPermissions(permissions.filter(k => !allKeys.includes(k)));
        }
    };

    return (
        <Box className="admin-dashboard-content">
            <Box className="admin-page-title-main" sx={{ mb: 3 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="admin-breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate("/plan-list")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Plan List
                    </Link>
                    <Typography className="admin-breadcrumb-active">{isView ? "View" : isEdit ? "Edit" : "Add"} Plan</Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '12px', minHeight: '200px', backgroundColor: 'white' }}>
                {loading ? <CommonLoader /> : (
                    <Formik enableReinitialize initialValues={initialValues} validationSchema={planValidationSchema} onSubmit={handleSubmit}>
                        {(formikProps: FormikProps<any>) => {
                            const { values, errors, touched, handleChange, setFieldValue, handleBlur } = formikProps;
                            return (
                                <Form>
                                    <Box sx={{ maxWidth: 1100 }}>
                                        {/* 1. Plan Details */}
                                        <SectionTitle icon={AssignmentIcon} title="Plan Details" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 12' }}>
                                                <Typography sx={labelSx}>Plan Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField fullWidth name="planName" placeholder="Enter Plan Name" variant="outlined" sx={inputSx} value={values.planName} onChange={handleChange} onBlur={handleBlur} error={touched.planName && Boolean(errors.planName)} disabled={isView || isEdit} />
                                                <FormHelperText className="error-text">{(touched.planName && errors.planName) ? (errors.planName as string) : ""}</FormHelperText>
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Billing Cycle<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <Autocomplete
                                                    options={billingCycleOptions}
                                                    getOptionLabel={(o) => o.label}
                                                    value={billingCycleOptions.find(o => o.value === values.billingCycle) || null}
                                                    onChange={(_, v) => {
                                                        const newCycle = v ? v.value : "";
                                                        setFieldValue("billingCycle", newCycle);
                                                        // Clear non-relevant fields when cycle changes
                                                        if (newCycle === "monthly") {
                                                            setFieldValue("yerPrice", "");
                                                            setFieldValue("yerOfferPrice", "");
                                                        } else if (newCycle === "yearly") {
                                                            setFieldValue("monPrice", "");
                                                            setFieldValue("monOfferPrice", "");
                                                        }
                                                    }}
                                                    disabled={isView}
                                                    renderInput={(params) => <TextField {...params} placeholder="Select Cycle" variant="outlined" sx={inputSx} error={touched.billingCycle && Boolean(errors.billingCycle)} />}
                                                />
                                                <FormHelperText className="error-text">{(touched.billingCycle && errors.billingCycle) ? (errors.billingCycle as string) : ""}</FormHelperText>
                                            </Box>

                                            {values.billingCycle === "monthly" ? (
                                                <>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                        <Typography sx={labelSx}>Monthly Price<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                        <TextField fullWidth name="monPrice" placeholder="Enter Monthly Price" variant="outlined" sx={inputSx} value={values.monPrice} onChange={handleChange} onBlur={handleBlur} error={touched.monPrice && Boolean(errors.monPrice)} disabled={isView} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                                        <FormHelperText className="error-text">{(touched.monPrice && errors.monPrice) ? (errors.monPrice as string) : ""}</FormHelperText>
                                                    </Box>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                        <Typography sx={labelSx}>Monthly Offer Price</Typography>
                                                        <TextField fullWidth name="monOfferPrice" placeholder="Enter Monthly Offer Price" variant="outlined" sx={inputSx} value={values.monOfferPrice} onChange={handleChange} onBlur={handleBlur} error={touched.monOfferPrice && Boolean(errors.monOfferPrice)} disabled={isView} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                                        <FormHelperText className="error-text">{(touched.monOfferPrice && errors.monOfferPrice) ? (errors.monOfferPrice as string) : ""}</FormHelperText>
                                                    </Box>
                                                </>
                                            ) : (
                                                <>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                        <Typography sx={labelSx}>Yearly Price<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                        <TextField fullWidth name="yerPrice" placeholder="Enter Yearly Price" variant="outlined" sx={inputSx} value={values.yerPrice} onChange={handleChange} onBlur={handleBlur} error={touched.yerPrice && Boolean(errors.yerPrice)} disabled={isView} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                                        <FormHelperText className="error-text">{(touched.yerPrice && errors.yerPrice) ? (errors.yerPrice as string) : ""}</FormHelperText>
                                                    </Box>
                                                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                        <Typography sx={labelSx}>Yearly Offer Price</Typography>
                                                        <TextField fullWidth name="yerOfferPrice" placeholder="Enter Yearly Offer Price" variant="outlined" sx={inputSx} value={values.yerOfferPrice} onChange={handleChange} onBlur={handleBlur} error={touched.yerOfferPrice && Boolean(errors.yerOfferPrice)} disabled={isView} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                                        <FormHelperText className="error-text">{(touched.yerOfferPrice && errors.yerOfferPrice) ? (errors.yerOfferPrice as string) : ""}</FormHelperText>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>

                                        {/* 2. Usage Limits */}
                                        <SectionTitle icon={LimitsIcon} title="Usage Limits" />
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Max Students<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField fullWidth name="maxStudents" type="number" placeholder="e.g. 500" variant="outlined" sx={inputSx} value={values.maxStudents} onChange={handleChange} onBlur={handleBlur} error={touched.maxStudents && Boolean(errors.maxStudents)} disabled={isView} />
                                                <FormHelperText className="error-text">{(touched.maxStudents && errors.maxStudents) ? (errors.maxStudents as string) : ""}</FormHelperText>
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Max Teachers<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField fullWidth name="maxTeachers" type="number" placeholder="e.g. 50" variant="outlined" sx={inputSx} value={values.maxTeachers} onChange={handleChange} onBlur={handleBlur} error={touched.maxTeachers && Boolean(errors.maxTeachers)} disabled={isView} />
                                                <FormHelperText className="error-text">{(touched.maxTeachers && errors.maxTeachers) ? (errors.maxTeachers as string) : ""}</FormHelperText>
                                            </Box>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                                <Typography sx={labelSx}>Max Classes<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                <TextField fullWidth name="maxClasses" type="number" placeholder="e.g. 20" variant="outlined" sx={inputSx} value={values.maxClasses} onChange={handleChange} onBlur={handleBlur} error={touched.maxClasses && Boolean(errors.maxClasses)} disabled={isView} />
                                                <FormHelperText className="error-text">{(touched.maxClasses && errors.maxClasses) ? (errors.maxClasses as string) : ""}</FormHelperText>
                                            </Box>
                                        </Box>

                                        {/* 3. Permissions */}
                                        <SectionTitle icon={SecurityIcon} title="Permissions Configuration" />
                                        <TableContainer component={Paper} className="table-container permission-table-container" sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '12px', mb: 4 }}>
                                            <Table className="table">
                                                <TableHead className="table-head" sx={{ bgcolor: '#F9FAFB' }}>
                                                    <TableRow className="table-row">
                                                        <TableCell className="table-th" sx={{ fontWeight: 700, py: 2 }}>Module Name</TableCell>
                                                        <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>All</TableCell>
                                                        <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>View</TableCell>
                                                        <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Add / Mark</TableCell>
                                                        <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Edit</TableCell>
                                                        <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Delete / Collect</TableCell>
                                                        <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody className="table-body">
                                                    <TableRow className="table-row all-row" sx={{ bgcolor: '#fafafa' }}>
                                                        <TableCell className="table-td" sx={{ fontWeight: 600 }}>Apply to All Modules</TableCell>
                                                        <TableCell className="table-td" align="center">-</TableCell>
                                                        {['view', 'add', 'edit', 'delete', 'status'].map((typeId) => (
                                                            <TableCell key={typeId} className="table-td" align="center">
                                                                <BpCheckbox checked={isTypeAllChecked(typeId)} onChange={(e: any) => checkUncheckAllType(e.target.checked ? "add" : "remove", typeId)} disabled={isView} />
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>

                                                    {roleStaticData.map((module: any) => {
                                                        const isMaster = masterModuleIds.includes(module.mainTitleId);
                                                        const isAdmin = adminModuleIds.includes(module.mainTitleId);
                                                        const rows = [];

                                                        if (module.mainTitleId === "role") rows.push(
                                                            <TableRow key="admin_hr" sx={{ bgcolor: '#f0f4f8' }}>
                                                                <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color, #ff8c00)', py: 1.5 }}>Admin & Management</TableCell>
                                                                <TableCell className="table-td" align="center">
                                                                    <BpCheckbox checked={isGroupChecked(adminModuleIds)} onChange={(e: any) => checkUncheckGroup(e.target.checked ? "add" : "remove", adminModuleIds)} disabled={isView} />
                                                                </TableCell>
                                                                <TableCell colSpan={5} />
                                                            </TableRow>
                                                        );
                                                        if (module.mainTitleId === "student") rows.push(
                                                            <TableRow key="master_hr" sx={{ bgcolor: '#f0f4f8' }}>
                                                                <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color, #ff8c00)', py: 1.5 }}>Teacher Master</TableCell>
                                                                <TableCell className="table-td" align="center">
                                                                    <BpCheckbox checked={isGroupChecked(masterModuleIds)} onChange={(e: any) => checkUncheckGroup(e.target.checked ? "add" : "remove", masterModuleIds)} disabled={isView} />
                                                                </TableCell>
                                                                <TableCell colSpan={5} />
                                                            </TableRow>
                                                        );

                                                        rows.push(
                                                            <TableRow key={module.mainTitleId} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                                                                <TableCell className="table-td" sx={{ py: 2, pl: (isMaster || isAdmin) ? 4 : 2 }}>{module.mainTitle}</TableCell>
                                                                <TableCell className="table-td" align="center">
                                                                    <BpCheckbox checked={module.subRole.filter((sr: any) => sr.is_show).every((sr: any) => permissions.includes(`${module.mainTitleId}_${sr.titleId}`))} onChange={(e: any) => {
                                                                        const keys = module.subRole.filter((sr: any) => sr.is_show).map((sr: any) => `${module.mainTitleId}_${sr.titleId}`);
                                                                        setPermissions(e.target.checked ? [...new Set([...permissions, ...keys])] : permissions.filter(k => !keys.includes(k)));
                                                                    }} disabled={isView} />
                                                                </TableCell>
                                                                {['view', 'add', 'edit', 'delete', 'status'].map((typeId) => {
                                                                    // Handle legacy titleIds for specific modules
                                                                    let actualTypeId = typeId;
                                                                    if (module.mainTitleId === 'attendance' && typeId === 'add') actualTypeId = 'mark';
                                                                    if (module.mainTitleId === 'fees' && typeId === 'delete') actualTypeId = 'collect';

                                                                    const subRole = module.subRole.find((sr: any) => sr.titleId === actualTypeId || sr.titleId === typeId);
                                                                    const key = `${module.mainTitleId}_${subRole?.titleId}`;
                                                                    return (
                                                                        <TableCell key={typeId} className="table-td" align="center">
                                                                            {subRole?.is_show ? <BpCheckbox checked={permissions.includes(key)} onChange={() => onChangeCheckBox(key)} disabled={isView} /> : "-"}
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            </TableRow>
                                                        );
                                                        return rows;
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        {permissionsError && <FormHelperText className="error-text" sx={{ mt: -2, mb: 2, fontSize: '13px' }}>{permissionsError}</FormHelperText>}

                                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button className="admin-btn-secondary" onClick={() => navigate("/plan-list")} disabled={actionLoading} sx={{ minWidth: '130px' }}>Cancel</Button>
                                            {!isView && (
                                                <Button type="submit" className="admin-btn-theme" disabled={actionLoading} variant="contained" sx={{ minWidth: '150px' }}>
                                                    {actionLoading ? <Spinner /> : (isEdit ? "Update Plan" : "Create Plan")}
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
