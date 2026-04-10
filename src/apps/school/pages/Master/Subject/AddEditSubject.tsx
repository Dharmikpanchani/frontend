import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Button,
    FormHelperText,
    Breadcrumbs,
    Link,
    Autocomplete,
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { subjectValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditSubjectAction, getSubjectById } from "@/redux/slices/subjectSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import Svg from "@/assets/Svg";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function AddEditSubject() {
    const { id } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isView = pathname.includes("/view/");
    const isEdit = pathname.includes("/edit/");

    const { departments } = useSelector((state: RootState) => state.DepartmentReducer);
    const { actionLoading, loading, selectedSubject } = useSelector((state: RootState) => state.SubjectReducer);

    const [initialValues, setInitialValues] = useState({
        id: "",
        name: "",
        code: "",
        departmentId: "",
    });

    useEffect(() => {
        // Fetch departments with type filter for dropdown
        dispatch(getDepartments({ type: "filter" }) as any);

        if (id) {
            dispatch(getSubjectById(id) as any);
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (id && selectedSubject && (isEdit || isView)) {
            setInitialValues({
                id: selectedSubject._id || "",
                name: selectedSubject.name || "",
                code: selectedSubject.code || "",
                departmentId: selectedSubject.departmentId?._id || selectedSubject.departmentId || "",
            });
        }
    }, [id, selectedSubject, isEdit, isView]);

    const handleSubmit = async (values: any) => {
        try {
            const resultAction = await dispatch(addEditSubjectAction(values) as any);
            if (addEditSubjectAction.fulfilled.match(resultAction)) {
                navigate("/master/subject");
            }
        } catch (error: any) {
            toasterError(error?.message || "Something went wrong");
        }
    };

    if (id && loading) {
        return <Spinner />;
    }

    const modeText = isView ? "View" : isEdit ? "Edit" : "Add";

    return (
        <Box className="admin-dashboard-content">
            <Box className="admin-page-title-main" sx={{ mb: 3 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="admin-breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate("/master/subject")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Subjects
                    </Link>
                    <Typography className="admin-breadcrumb-active">{modeText} Subject</Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: 4, borderRadius: '12px', minHeight: '200px' }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={subjectValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {(formikProps: FormikProps<any>) => {
                        const { values, errors, touched, handleChange, handleSubmit, setFieldValue, handleBlur } = formikProps;
                        return (
                            <Form onSubmit={handleSubmit}>
                                <Box sx={{ maxWidth: 800 }}>
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 1.5, sm: 2 }}>
                                        <Box gridColumn="span 12" className="admin-input-box">
                                            <Typography sx={labelSx}>Department<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                options={departments || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={departments?.find((d: any) => d._id === values.departmentId) || null}
                                                onChange={(_, newValue) => setFieldValue("departmentId", newValue ? newValue._id : "")}
                                                disabled={isView}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                clearIcon={null}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Department"
                                                        variant="outlined"
                                                        sx={inputSx}
                                                        error={touched.departmentId && Boolean(errors.departmentId)}
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
                                            <FormHelperText className="error-text">{(touched.departmentId && errors.departmentId) ? (errors.departmentId as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
                                            <Typography sx={labelSx}>Subject Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField
                                                fullWidth
                                                name="name"
                                                placeholder="Enter Subject Name"
                                                variant="outlined"
                                                sx={inputSx}
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.name && Boolean(errors.name)}
                                                disabled={isView}
                                            />
                                            <FormHelperText className="error-text">{(touched.name && errors.name) ? (errors.name as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }} className="admin-input-box">
                                            <Typography sx={labelSx}>Subject Code<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField
                                                fullWidth
                                                name="code"
                                                placeholder="Enter Subject Code"
                                                variant="outlined"
                                                sx={inputSx}
                                                value={values.code}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase().replace(/\s/g, "_");
                                                    setFieldValue("code", value);
                                                }}
                                                onBlur={handleBlur}
                                                error={touched.code && Boolean(errors.code)}
                                                disabled={isView}
                                            />
                                            <FormHelperText className="error-text">{(touched.code && errors.code) ? (errors.code as string) : ""}</FormHelperText>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                                        <Button
                                            className="admin-btn-secondary"
                                            onClick={() => navigate("/master/subject")}
                                            variant="outlined"
                                            sx={{ minWidth: { xs: '100%', sm: '130px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            {isView ? "Back" : "Discard"}
                                        </Button>
                                        {!isView && (
                                            <Button
                                                type="submit"
                                                className="admin-btn-theme"
                                                disabled={actionLoading}
                                                variant="contained"
                                                sx={{ minWidth: { xs: '100%', sm: '120px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                                            >
                                                {actionLoading ? <Spinner /> : (
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
            </Box>
        </Box>
    );
}
