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
import { sectionValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditSection, getSectionById } from "@/redux/slices/sectionSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import Svg from "@/assets/Svg";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function AddEditSection() {
    const { id } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isView = pathname.includes("/view/");
    const isEdit = pathname.includes("/edit/");

    const { classes } = useSelector((state: RootState) => state.ClassReducer);
    const { actionLoading, loading, selectedSection } = useSelector((state: RootState) => state.SectionReducer);

    const [initialValues, setInitialValues] = useState({
        id: "",
        name: "",
        classId: "",
    });

    useEffect(() => {
        dispatch(getClasses({ type: "filter" }) as any);

        if (id) {
            dispatch(getSectionById(id) as any);
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (id && selectedSection && (isEdit || isView)) {
            setInitialValues({
                id: selectedSection._id || "",
                name: selectedSection.name || "",
                classId: selectedSection.classId?._id || selectedSection.classId || "",
            });
        }
    }, [id, selectedSection, isEdit, isView]);

    const handleSubmit = async (values: any) => {
        try {
            const resultAction = await dispatch(addEditSection(values) as any);
            
            if (addEditSection.fulfilled.match(resultAction)) {
                navigate("/master/section");
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
                    <Link underline="hover" color="inherit" onClick={() => navigate("/master/section")} sx={{ cursor: 'pointer', fontSize: '14px' }}>
                        Sections
                    </Link>
                    <Typography className="admin-breadcrumb-active">{modeText} Section</Typography>
                </Breadcrumbs>
            </Box>

            <Box className="card-border common-card" sx={{ p: 4, borderRadius: '12px', minHeight: '200px' }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={sectionValidationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {(formikProps: FormikProps<any>) => {
                        const { values, errors, touched, handleChange, handleSubmit, setFieldValue, handleBlur } = formikProps;
                        return (
                            <Form onSubmit={handleSubmit}>
                                <Box sx={{ maxWidth: 800 }}>
                                    <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 1.5, sm: 2 }}>
                                        <Box gridColumn="span 6" className="admin-input-box">
                                            <Typography sx={labelSx}>Class<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <Autocomplete
                                                options={classes || []}
                                                getOptionLabel={(option: any) => option.name || ""}
                                                value={classes?.find((c: any) => c._id === values.classId) || null}
                                                onChange={(_, newValue) => setFieldValue("classId", newValue ? newValue._id : "")}
                                                disabled={isView}
                                                popupIcon={<img src={Svg.down} style={{ width: '10px' }} alt="dropdown" />}
                                                clearIcon={null}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        placeholder="Select Class"
                                                        variant="outlined"
                                                        sx={inputSx}
                                                        error={touched.classId && Boolean(errors.classId)}
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
                                            <FormHelperText className="error-text">{(touched.classId && errors.classId) ? (errors.classId as string) : ""}</FormHelperText>
                                        </Box>

                                        <Box gridColumn="span 6" className="admin-input-box">
                                            <Typography sx={labelSx}>Section Name<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span></Typography>
                                            <TextField
                                                fullWidth
                                                name="name"
                                                placeholder="Enter Section Name (e.g., Section A)"
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
                                    </Box>

                                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                                        <Button
                                            className="admin-btn-secondary"
                                            onClick={() => navigate("/master/section")}
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
