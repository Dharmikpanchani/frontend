import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { schoolAdminPermission, schoolRoleStaticData as roleStaticData } from "@/apps/common/StaticArrayData";
import { addEditRole, getRoleById, clearSelectedRole } from "@/redux/slices/roleSlice";
import { roleValidationSchema } from "@/utils/validation/FormikValidation";
import Spinner from "../../component/schoolCommon/spinner/Spinner";
import { BpCheckbox } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import { toasterError } from "@/utils/toaster/Toaster";
import { CommonLoader } from "@/apps/common/loader/Loader";
import type { RootState } from "@/redux/Store";
import { inputSx } from "@/utils/styles/commonSx";

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { AddCircleOutline as AddIcon, Edit as EditIcon } from "@mui/icons-material";

export default function AddEditRole() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const isView = location.pathname.includes("/view/");
    const isEdit = !!id && !isView;

    const { selectedRole, loading } = useSelector((state: RootState) => state.RoleReducer);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [permissionsError, setPermissionsError] = useState("");
    const [buttonSpinner, setButtonSpinner] = useState(false);
    const adminModuleIds = ["role", "admin_user"];
    const masterModuleIds = ["teacher", "department", "subject", "class", "section"];

    useEffect(() => {
        if (id) {
            dispatch(getRoleById(id) as any);
        }
        return () => {
            dispatch(clearSelectedRole());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedRole) {
            setPermissions(selectedRole.permissions || []);
        }
    }, [selectedRole]);

    const initialValues = {
        role: selectedRole?.role || "",
    };

    const handleSubmit = async (values: { role: string }) => {
        if (isView) return;

        let checkRole =
            !permissions.includes(schoolAdminPermission.role.create) ||
            !permissions.includes(schoolAdminPermission.role.update) ||
            !permissions.includes(schoolAdminPermission.role.read) ||
            !permissions.includes(schoolAdminPermission.role.delete) ||
            !permissions.includes(schoolAdminPermission.role.status);

        if (checkRole && selectedRole?.role?.includes("admin")) {
            setPermissionsError("You cannot remove admin permissions from the role");
            return;
        }

        if (!permissions.length) {
            setPermissionsError("Please select at least one permission");
            return;
        }

        setPermissionsError("");
        setButtonSpinner(true);

        const payload: any = {
            role: values.role,
            permissions: [...new Set(permissions)],
        };
        if (id) {
            payload.id = id;
        }

        try {
            const result = await dispatch(addEditRole(payload) as any);
            setButtonSpinner(false);
            if (addEditRole.fulfilled.match(result)) {
                navigate("/role-list");
            }
        } catch (error: any) {
            setButtonSpinner(false);
            toasterError(error?.message || "Something went wrong");
        }
    };

    const onChangeCheckBox = (key: string) => {
        if (isView) return;
        if (permissions.includes(key)) {
            setPermissions(permissions.filter((p) => p !== key));
        } else {
            setPermissions([...permissions, key]);
        }
    };

    const checkUncheckAllType = (action: "add" | "remove", typeId: string) => {
        if (isView) return;

        const relatedKeys = [
            ...new Set(
                roleStaticData.flatMap((module: any) =>
                    module.subRole.some((sr: any) => sr.titleId === typeId)
                        ? [`${module.mainTitleId}_${typeId}`]
                        : []
                )
            ),
        ];

        if (action === "add") {
            setPermissions((prev) => [...new Set([...prev, ...relatedKeys])]);
        } else {
            setPermissions((prev) => prev.filter((k) => !relatedKeys.includes(k)));
        }
    };

    const isTypeAllChecked = (typeId: string) => {
        const allKeysForType = [
            ...new Set(
                roleStaticData.flatMap((module: any) =>
                    module.subRole.some((sr: any) => sr.titleId === typeId)
                        ? [`${module.mainTitleId}_${typeId}`]
                        : []
                )
            ),
        ];
        return allKeysForType.length > 0 && allKeysForType.every((k) => permissions.includes(k));
    };

    const isModuleAllChecked = (module: any) => {
        const keys = module.subRole.filter((sr: any) => sr.is_show).map((sr: any) => `${module.mainTitleId}_${sr.titleId}`);
        return keys.length > 0 && keys.every((k: string) => permissions.includes(k));
    };

    const isMasterAllChecked = () => {
        const masterModules = roleStaticData.filter((m) => masterModuleIds.includes(m.mainTitleId));
        const allKeys = masterModules.flatMap((m) =>
            m.subRole.filter((sr) => sr.is_show).map((sr) => `${m.mainTitleId}_${sr.titleId}`)
        );
        return allKeys.length > 0 && allKeys.every((k) => permissions.includes(k));
    };

    const handleMasterAllChange = (checked: boolean) => {
        if (isView) return;
        const masterModules = roleStaticData.filter((m) => masterModuleIds.includes(m.mainTitleId));
        const allKeys = masterModules.flatMap((m) =>
            m.subRole.filter((sr) => sr.is_show).map((sr) => `${m.mainTitleId}_${sr.titleId}`)
        );

        if (checked) {
            setPermissions((prev) => [...new Set([...prev, ...allKeys])]);
        } else {
            setPermissions((prev) => prev.filter((k) => !allKeys.includes(k)));
        }
    };

    const isAdminAllChecked = () => {
        const adminModules = roleStaticData.filter((m) => adminModuleIds.includes(m.mainTitleId));
        const allKeys = adminModules.flatMap((m) =>
            m.subRole.filter((sr) => sr.is_show).map((sr) => `${m.mainTitleId}_${sr.titleId}`)
        );
        return allKeys.length > 0 && allKeys.every((k) => permissions.includes(k));
    };

    const handleAdminAllChange = (checked: boolean) => {
        if (isView) return;
        const adminModules = roleStaticData.filter((m) => adminModuleIds.includes(m.mainTitleId));
        const allKeys = adminModules.flatMap((m) =>
            m.subRole.filter((sr) => sr.is_show).map((sr) => `${m.mainTitleId}_${sr.titleId}`)
        );

        if (checked) {
            setPermissions((prev) => [...new Set([...prev, ...allKeys])]);
        } else {
            setPermissions((prev) => prev.filter((k) => !allKeys.includes(k)));
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
                    <Link underline="hover" color="inherit" onClick={() => navigate("/role-list")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Roles
                    </Link>
                    <Typography className="admin-breadcrumb-active">
                        {isView ? "View" : isEdit ? "Edit" : "Add"} Role & Permission
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
                        validationSchema={roleValidationSchema}
                        onSubmit={handleSubmit}
                    >
                        {(formikProps: FormikProps<any>) => (
                            <Form>
                                <Box className="admin-login-style-input-wrapper" sx={{ maxWidth: 500 }}>
                                    <label htmlFor="role">Role Name<span className="required-asterisk">*</span></label>
                                    <TextField
                                        fullWidth
                                        id="role"
                                        name="role"
                                        placeholder="Role Name"
                                        variant="outlined"
                                        className="admin-login-style-input"
                                        value={formikProps.values.role}
                                        onChange={formikProps.handleChange}
                                        error={formikProps.touched.role && Boolean(formikProps.errors.role)}
                                        disabled={isView}
                                        sx={inputSx}
                                    />
                                    {formikProps.touched.role && formikProps.errors.role && (
                                        <FormHelperText className="error-text">
                                            {formikProps.errors.role as string}
                                        </FormHelperText>
                                    )}
                                </Box>

                                <Typography className="admin-form-lable" sx={{ mb: 2, fontWeight: 400, fontSize: '14px' }}>
                                    Permissions <span className="astrick-sing">*</span>
                                </Typography>

                                <TableContainer component={Paper} className="table-container permission-table-container" sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '12px' }}>
                                    <Table className="table">
                                        <TableHead className="table-head" sx={{ bgcolor: 'var(--table-header-bg, #f8fbfc)' }}>
                                            <TableRow className="table-row">
                                                <TableCell className="table-th" sx={{ fontWeight: 700, py: 2 }}>Module Name</TableCell>
                                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>All</TableCell>
                                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>View</TableCell>
                                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Add</TableCell>
                                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Edit</TableCell>
                                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Delete</TableCell>
                                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody className="table-body">
                                            <TableRow className="table-row all-row" sx={{ bgcolor: '#fafafa' }}>
                                                <TableCell className="table-td" sx={{ fontWeight: 600 }}>Apply to All Modules</TableCell>
                                                <TableCell className="table-td" align="center">-</TableCell>
                                                {['view', 'add', 'edit', 'delete', 'status'].map((typeId) => (
                                                    <TableCell key={typeId} className="table-td" align="center">
                                                        <BpCheckbox
                                                            checked={isTypeAllChecked(typeId)}
                                                            onChange={(e: any) => checkUncheckAllType(e.target.checked ? "add" : "remove", typeId)}
                                                            disabled={isView}
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>

                                            {roleStaticData.map((module) => {
                                                const isMaster = masterModuleIds.includes(module.mainTitleId);
                                                const isAdmin = adminModuleIds.includes(module.mainTitleId);
                                                const rows = [];

                                                // Admin Module Header
                                                if (module.mainTitleId === "role") {
                                                    rows.push(
                                                        <TableRow key="admin_module_header" className="table-row all-row" sx={{ bgcolor: '#f0f4f8' }}>
                                                            <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color, #ff8c00)' }}>Admin Module</TableCell>
                                                            <TableCell className="table-td" align="center">
                                                                <BpCheckbox
                                                                    checked={isAdminAllChecked()}
                                                                    onChange={(e: any) => handleAdminAllChange(e.target.checked)}
                                                                    disabled={isView}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="table-td" align="center" colSpan={5}>
                                                                <Typography sx={{ fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                                                                    Select all admin related permissions
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                // Student Master Header
                                                if (module.mainTitleId === "teacher") {
                                                    rows.push(
                                                        <TableRow key="student_master_header" className="table-row all-row" sx={{ bgcolor: '#f0f4f8' }}>
                                                            <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color, #ff8c00)' }}>Student Master</TableCell>
                                                            <TableCell className="table-td" align="center">
                                                                <BpCheckbox
                                                                    checked={isMasterAllChecked()}
                                                                    onChange={(e: any) => handleMasterAllChange(e.target.checked)}
                                                                    disabled={isView}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="table-td" align="center" colSpan={5}>
                                                                <Typography sx={{ fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                                                                    Select all student master related permissions
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                rows.push(
                                                    <TableRow key={module.mainTitleId} className="table-row" sx={{ '&:hover': { bgcolor: '#f5f5f5' }, bgcolor: (isMaster || isAdmin) ? '#fcfcfc' : 'inherit' }}>
                                                        <TableCell className="table-td" sx={{ py: 2, pl: (isMaster || isAdmin) ? 5 : 2 }}>
                                                            {(isMaster || isAdmin) && <span style={{ color: '#999', marginRight: '8px' }}>↳</span>}
                                                            {module.mainTitle}
                                                        </TableCell>
                                                        <TableCell className="table-td" align="center">
                                                            <BpCheckbox
                                                                checked={isModuleAllChecked(module)}
                                                                onChange={(e: any) => {
                                                                    const keys = module.subRole.filter(sr => sr.is_show).map(sr => `${module.mainTitleId}_${sr.titleId}`);
                                                                    if (e.target.checked) {
                                                                        setPermissions(prev => [...new Set([...prev, ...keys])]);
                                                                    } else {
                                                                        setPermissions(prev => prev.filter(k => !keys.includes(k)));
                                                                    }
                                                                }}
                                                                disabled={isView}
                                                            />
                                                        </TableCell>
                                                        {['view', 'add', 'edit', 'delete', 'status'].map((typeId) => {
                                                            const subRole = module.subRole.find(sr => sr.titleId === typeId);
                                                            const key = `${module.mainTitleId}_${typeId}`;
                                                            return (
                                                                <TableCell key={typeId} className="table-td" align="center">
                                                                    {subRole?.is_show ? (
                                                                        <BpCheckbox
                                                                            checked={permissions.includes(key)}
                                                                            onChange={() => onChangeCheckBox(key)}
                                                                            disabled={isView}
                                                                        />
                                                                    ) : "-"}
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

                                {permissionsError && (
                                    <FormHelperText className="error-text" sx={{ mt: 2, fontSize: '13px' }}>
                                        {permissionsError}
                                    </FormHelperText>
                                )}

                                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        className="admin-btn-secondary"
                                        onClick={() => navigate("/role-list")}
                                        disabled={buttonSpinner}
                                        variant="outlined"
                                        sx={{ minWidth: '130px', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Discard
                                    </Button>
                                    {!isView && (
                                        <Button
                                            type="submit"
                                            className="admin-btn-theme"
                                            disabled={buttonSpinner}
                                            variant="contained"
                                            startIcon={!buttonSpinner ? (id ? <EditIcon /> : <AddIcon />) : null}
                                            sx={{ minWidth: '120px', borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                                        >
                                            {buttonSpinner ? <Spinner /> : (isEdit ? "Update Role" : "Add Role")}
                                        </Button>
                                    )}
                                </Box>
                            </Form>
                        )}
                    </Formik>
                )}
            </Box>
        </Box>
    );
}
