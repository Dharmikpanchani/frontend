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
import { getClasses } from "@/redux/slices/classSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import Svg from "@/assets/Svg";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx, multiInputSx } from "@/utils/styles/commonSx";

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
        departmentIds: [] as string[],
    });

    useEffect(() => {
        const params = { type: "filter" };
        dispatch(getDepartments(params) as any);
        dispatch(getClasses(params) as any);

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
                departmentIds: selectedSubject.departmentIds?.map((d: any) => d._id || d) || [],
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
            <Box className="admin-page-title-main" sx={{ mb: 1.5 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="admin-breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate("/master/subject")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Subjects
                    </Link>
                    <Typography className="admin-breadcrumb-active">{modeText} Subject</Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', backgroundColor: 'white' }}>
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
                                <Box sx={{ maxWidth: 1000 }}>
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }}>
                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Subject Name<span style={{ color: '#ef4444' }}>*</span></Typography>
                                            <TextField
                                                fullWidth name="name" placeholder="Enter Subject Name"
                                                variant="outlined" sx={inputSx}
                                                value={values.name}
                                                onChange={(e) => {
                                                    const nameValue = e.target.value;
                                                    handleChange(e);
                                                    const generatedCode = nameValue.toUpperCase().replace(/\s/g, "_").replace(/[^A-Z0-9_]/g, "");
                                                    setFieldValue("code", generatedCode);
                                                }}
                                                onBlur={handleBlur}
                                                error={touched.name && Boolean(errors.name)}
                                                disabled={isView}
                                            />
                                            {touched.name && errors.name && <FormHelperText className="error-text">{errors.name as string}</FormHelperText>}
                                        </Box>

                                        <Box gridColumn={{ xs: 'span 12', sm: 'span 6' }}>
                                            <Typography sx={labelSx}>Subject Code<span style={{ color: '#ef4444' }}>*</span></Typography>
                                            <TextField
                                                fullWidth name="code" placeholder="Enter Subject Code"
                                                variant="outlined" sx={inputSx}
                                                value={values.code}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase().replace(/\s/g, "_");
                                                    setFieldValue("code", value);
                                                }}
                                                onBlur={handleBlur}
                                                error={touched.code && Boolean(errors.code)}
                                                disabled={isView}
                                            />
                                            {touched.code && errors.code && <FormHelperText className="error-text">{errors.code as string}</FormHelperText>}
                                        </Box>

                                        <Box gridColumn="span 12">
                                            <Typography sx={labelSx}>Departments<span style={{ color: '#ef4444' }}>*</span></Typography>
                                            <Autocomplete
                                                multiple
                                                options={departments || []}
                                                getOptionLabel={(o) => o.name || ""}
                                                value={departments?.filter((d: any) => values.departmentIds.includes(d._id)) || []}
                                                onChange={(_, v) => setFieldValue("departmentIds", v.map((item: any) => item._id))}
                                                disabled={isView}
                                                renderInput={(p) => <TextField {...p} placeholder={isView ? "" : "Select Departments"} variant="outlined" sx={multiInputSx} error={touched.departmentIds && Boolean(errors.departmentIds)} />}
                                            />
                                            {touched.departmentIds && errors.departmentIds && <FormHelperText className="error-text">{errors.departmentIds as string}</FormHelperText>}
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 6, pt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0' }}>
                                        <Button className="admin-btn-secondary" onClick={() => navigate("/master/subject")} variant="outlined" sx={{ minWidth: '130px' }}>
                                            {isView ? "Back" : "Discard"}
                                        </Button>
                                        {!isView && (
                                            <Button type="submit" className="admin-btn-theme" disabled={actionLoading} variant="contained" sx={{ minWidth: '180px' }}>
                                                {actionLoading ? <Spinner /> : (
                                                    <>
                                                        <img src={Svg.plus} className="admin-plus-icon" alt="plus" style={{ filter: 'brightness(0) invert(1)', width: '12px', marginRight: '8px' }} />
                                                        {isEdit ? "Update Subject" : "Add Subject"}
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

