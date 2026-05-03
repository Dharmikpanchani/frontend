import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    FormHelperText,
    Breadcrumbs,
    Link,
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { departmentValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditDepartmentAction, getDepartmentById } from "@/redux/slices/departmentSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import { AddCircleOutline as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { CommonLoader } from "@/apps/common/loader/Loader";


export default function AddEditDepartment() {
    const location = useLocation();
    const id = location.state?.id;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isView = location.pathname.endsWith("/view");
    const isEdit = !!id && location.pathname.endsWith("/edit");

    const { selectedDepartment, loading, actionLoading } = useSelector((state: RootState) => state.DepartmentReducer);

    useEffect(() => {
        if (id) {
            dispatch(getDepartmentById(id) as any);
        }
    }, [id, dispatch]);

    const initialValues = useMemo(() => ({
        name: (isEdit || isView) ? (selectedDepartment?.name || "") : "",
        code: (isEdit || isView) ? (selectedDepartment?.code || "") : "",
        id: id || "",
    }), [isEdit, isView, selectedDepartment, id]);


    const handleSubmit = async (values: any) => {
        if (isView) return;

        const urlencoded = new URLSearchParams();
        urlencoded.append("name", values.name);
        urlencoded.append("code", values.code);

        if (id) {
            urlencoded.append("id", id);
        }

        try {
            const resultAction = await dispatch(addEditDepartmentAction(urlencoded) as any);

            if (addEditDepartmentAction.fulfilled.match(resultAction)) {
                navigate("/master/department");
            }
        } catch (error: any) {
            console.error("Submit Error:", error);
            toasterError(error?.message || "Something went wrong");
        }
    };

    return (
        <Box className="admin-dashboard-content">
            <Box className="admin-page-title-main" sx={{ mb: 1.5 }}>
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    className="admin-breadcrumb"
                    sx={{ mb: 1 }}
                >
                    <Link underline="hover" color="inherit" onClick={() => navigate("/master/department")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Departments
                    </Link>
                    <Typography className="admin-breadcrumb-active">
                        {isView ? "View" : isEdit ? "Edit" : "Add"} Department
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', backgroundColor: 'white' }}>
                {loading ? (
                    <CommonLoader />
                ) : (
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={departmentValidationSchema}
                        onSubmit={handleSubmit}
                    >
                        {(formikProps: FormikProps<any>) => {
                            const { values, errors, touched, handleChange, handleSubmit, handleBlur } = formikProps;
                            return (
                                <Form onSubmit={handleSubmit}>
                                    <Box sx={{ maxWidth: 800 }}>
                                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: '6px', height: '32px' }}>
                                                    <Typography sx={{ ...labelSx, mb: 0 }}>Department Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth
                                                    name="name"
                                                    placeholder="Enter Department Name"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.name}
                                                    onChange={(e) => {
                                                        const nameValue = e.target.value;
                                                        handleChange(e);
                                                        const generatedCode = nameValue.toUpperCase().replace(/\s/g, "_").replace(/[^A-Z0-9_]/g, "");
                                                        formikProps.setFieldValue("code", generatedCode);
                                                    }}
                                                    onBlur={handleBlur}
                                                    error={touched.name && Boolean(errors.name)}
                                                    disabled={isView}
                                                />
                                                {touched.name && errors.name && <FormHelperText className="error-text">{errors.name as string}</FormHelperText>}
                                            </Box>

                                            <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: '6px', height: '32px' }}>
                                                    <Typography sx={{ ...labelSx, mb: 0 }}>Department Code<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                                </Box>
                                                <TextField
                                                    fullWidth
                                                    name="code"
                                                    placeholder="Enter Department Code (e.g., MATH)"
                                                    variant="outlined"
                                                    sx={inputSx}
                                                    value={values.code}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toUpperCase().replace(/\s/g, "_").replace(/[^A-Z0-9_]/g, "");
                                                        formikProps.setFieldValue("code", value);
                                                    }}
                                                    onBlur={handleBlur}
                                                    error={touched.code && Boolean(errors.code)}
                                                    disabled={isView}
                                                />
                                                {touched.code && errors.code && <FormHelperText className="error-text">{errors.code as string}</FormHelperText>}
                                            </Box>
                                        </Box>

                                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                                            <Button
                                                className="admin-btn-secondary"
                                                onClick={() => navigate("/master/department")}
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
                                                    startIcon={!actionLoading ? (id ? <EditIcon /> : <AddIcon />) : null}
                                                    sx={{ minWidth: { xs: '100%', sm: '120px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                                                >
                                                    {actionLoading ? <Spinner /> : (isEdit ? "Update Department" : "Add Department")}
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
};