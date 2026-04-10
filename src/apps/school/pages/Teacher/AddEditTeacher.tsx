import { useEffect } from "react";
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
} from "@mui/material";
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
import Svg from "@/assets/Svg";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";


export default function AddEditTeacher() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedSchool } = useSelector((state: RootState) => state.SchoolReducer);
    const { departments } = useSelector((state: RootState) => state.DepartmentReducer);
    const { subjects } = useSelector((state: RootState) => state.SubjectReducer);
    const { classes } = useSelector((state: RootState) => state.ClassReducer);
    const { sections } = useSelector((state: RootState) => state.SectionReducer);
    const { actionLoading } = useSelector((state: RootState) => state.TeacherReducer);

    useEffect(() => {
        if (selectedSchool?._id) {
            const params = { schoolId: selectedSchool._id, page: 1, perPage: 100 };
            dispatch(getDepartments(params) as any);
            dispatch(getSubjects(params) as any);
            dispatch(getClasses(params) as any);
            dispatch(getSections(params) as any);
        }
    }, [dispatch, selectedSchool?._id]);

    const initialValues = {
        name: "",
        email: "",
        phoneNumber: "",
        departmentId: "",
        subjectIds: [],
        classIds: [],
        sectionId: "",
    };


    const handleSubmit = async (values: any) => {
        if (!selectedSchool?._id) return;
        
        try {
            const resultAction = await dispatch(createTeacher({
                ...values,
                schoolId: selectedSchool._id
            }) as any);
            
            if (createTeacher.fulfilled.match(resultAction)) {
                navigate("/teacher");
            }
        } catch (error: any) {
            toasterError(error?.message || "Something went wrong");
        }
    };

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

            <Box className="card-border common-card" sx={{ p: 4, borderRadius: '12px' }}>
                <Formik initialValues={initialValues} validationSchema={teacherValidationSchema} onSubmit={handleSubmit}>
                    {(formikProps: FormikProps<any>) => {
                        const { values, errors, touched, handleChange, handleSubmit, setFieldValue, handleBlur } = formikProps;
                        return (
                            <Form onSubmit={handleSubmit}>
                                <Box sx={{ maxWidth: 800 }}>
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                        <Box gridColumn="span 6">
                                            <Typography sx={labelSx}>Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="name" placeholder="Enter Teacher Name" variant="outlined" sx={inputSx} value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && Boolean(errors.name)} />
                                            <FormHelperText className="error-text">{(touched.name && errors.name) ? (errors.name as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 6">
                                            <Typography sx={labelSx}>Email<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="email" placeholder="Enter Email" variant="outlined" sx={inputSx} value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && Boolean(errors.email)} />
                                            <FormHelperText className="error-text">{(touched.email && errors.email) ? (errors.email as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 6">
                                            <Typography sx={labelSx}>Phone Number<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField fullWidth name="phoneNumber" placeholder="Enter Phone Number" variant="outlined" sx={inputSx} value={values.phoneNumber} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber && Boolean(errors.phoneNumber)} />
                                            <FormHelperText className="error-text">{(touched.phoneNumber && errors.phoneNumber) ? (errors.phoneNumber as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 6">
                                            <Typography sx={labelSx}>Department<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                options={departments || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={departments?.find((d: any) => d._id === values.departmentId) || null}
                                                onChange={(_, newValue) => {
                                                    setFieldValue("departmentId", newValue ? newValue._id : "");
                                                    setFieldValue("subjectIds", []); // Clear selected subjects when department changes
                                                }}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Department" variant="outlined" sx={inputSx} error={touched.departmentId && Boolean(errors.departmentId)} />}
                                            />
                                            <FormHelperText className="error-text">{(touched.departmentId && errors.departmentId) ? (errors.departmentId as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 12">
                                            <Typography sx={labelSx}>Subjects<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
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
                                                renderInput={(params) => <TextField {...params} placeholder="Select Subjects" variant="outlined" sx={inputSx} error={touched.subjectIds && Boolean(errors.subjectIds)} />}
                                            />
                                            <FormHelperText className="error-text">{(touched.subjectIds && errors.subjectIds) ? (errors.subjectIds as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 6">
                                            <Typography sx={labelSx}>Classes<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                multiple
                                                options={classes || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={classes?.filter((c: any) => values.classIds.includes(c._id)) || []}
                                                onChange={(_, newValue) => setFieldValue("classIds", newValue.map((v: any) => v._id))}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Classes" variant="outlined" sx={inputSx} error={touched.classIds && Boolean(errors.classIds)} />}
                                            />
                                            <FormHelperText className="error-text">{(touched.classIds && errors.classIds) ? (errors.classIds as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 6">
                                            <Typography sx={labelSx}>Primary Section</Typography>
                                            <Autocomplete
                                                options={sections || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={sections?.find((s: any) => s._id === values.sectionId) || null}
                                                onChange={(_, newValue) => setFieldValue("sectionId", newValue ? newValue._id : "")}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                renderInput={(params) => <TextField {...params} placeholder="Select Section" variant="outlined" sx={inputSx} />}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button className="admin-btn-secondary" onClick={() => navigate("/teacher")} variant="outlined" sx={{ minWidth: '130px', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>Discard</Button>
                                        <Button type="submit" className="admin-btn-theme" disabled={actionLoading} variant="contained" sx={{ minWidth: '120px', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>{actionLoading ? <Spinner /> : "Add Teacher"}</Button>
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
