import { useEffect, useState } from "react";
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
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { sectionValidationSchema } from "@/utils/validation/FormikValidation";
import { addEditSection, getSectionById } from "@/redux/slices/sectionSlice";
import { masterService } from "@/api/services/master.service";
import AsyncPaginatedSelect from "@/apps/common/filter/AsyncPaginatedSelect";
import { toasterError } from "@/utils/toaster/Toaster";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import {
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import type { RootState } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function AddEditSection() {
  const location = useLocation();
  const id = location.state?.id;
  const { pathname } = location;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isView = pathname.endsWith("/view");
  const isEdit = !!id && pathname.endsWith("/edit");

  const { actionLoading, loading, selectedSection } = useSelector(
    (state: RootState) => state.SectionReducer,
  );
  const { startYear, endYear } = useSelector(
    (state: RootState) => state.AcademicYearReducer,
  );

  const [initialValues, setInitialValues] = useState({
    id: "",
    code: "",
    classId: "",
  });

  const fetchClassPage = async (page: number, search: string) => {
    const res: any = await masterService.getClasses({ page, perPage: 25, search, type: "filter" });
    return { items: res?.data || [], hasMore: (res?.pagination?.totalPages ?? 0) > page };
  };

  useEffect(() => {
    if (id) {
      dispatch(getSectionById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && selectedSection && (isEdit || isView)) {
      setInitialValues({
        id: selectedSection._id || "",
        code: selectedSection.code || "",
        classId: selectedSection.classId?._id || selectedSection.classId || "",
      });
    }
  }, [id, selectedSection, isEdit, isView]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        startYear,
        endYear,
      };
      const resultAction = await dispatch(addEditSection(payload) as any);

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
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          className="admin-breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/master/section")}
            sx={{ cursor: "pointer", fontSize: "14px" }}
          >
            Sections
          </Link>
          <Typography className="admin-breadcrumb-active">
            {modeText} Section
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        className="card-border common-card"
        sx={{ p: 4, borderRadius: "12px", minHeight: "200px" }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={sectionValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps: FormikProps<any>) => {
            const {
              values,
              errors,
              touched,
              handleSubmit,
              setFieldValue,
              handleBlur,
            } = formikProps;
            return (
              <Form onSubmit={handleSubmit}>
                <Box sx={{ maxWidth: 800 }}>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={{ xs: 1.5, sm: 2 }}
                  >
                    <Box gridColumn="span 6" className="admin-input-box">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: "6px",
                          height: "32px",
                        }}
                      >
                        <Typography sx={{ ...labelSx, mb: 0 }}>
                          Class
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </Typography>
                      </Box>
                      <AsyncPaginatedSelect
                        fetchPage={fetchClassPage}
                        value={values.classId}
                        onChange={(val) => setFieldValue("classId", val ?? "")}
                        getOptionLabel={(option: any) => option.name || ""}
                        getOptionValue={(option: any) => option._id}
                        selectedOption={
                          typeof selectedSection?.classId === "object" ? selectedSection.classId : undefined
                        }
                        disabled={isView}
                        placeholder="Select Class"
                      />
                      <FormHelperText className="error-text">
                        {touched.classId && errors.classId
                          ? (errors.classId as string)
                          : ""}
                      </FormHelperText>
                    </Box>

                    <Box gridColumn="span 6" className="admin-input-box">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: "6px",
                          height: "32px",
                        }}
                      >
                        <Typography sx={{ ...labelSx, mb: 0 }}>
                          Section Code
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        name="code"
                        placeholder="Enter Section Code (e.g., A)"
                        variant="outlined"
                        sx={inputSx}
                        value={values.code}
                        onChange={(e) => {
                          const value = e.target.value
                            .toUpperCase()
                            .replace(/\s/g, "_");
                          setFieldValue("code", value);
                        }}
                        onBlur={handleBlur}
                        error={touched.code && Boolean(errors.code)}
                        disabled={isView}
                                              />
                      <FormHelperText className="error-text">
                        {touched.code && errors.code
                          ? (errors.code as string)
                          : ""}
                      </FormHelperText>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                      flexDirection: { xs: "column-reverse", sm: "row" },
                    }}
                  >
                    <Button
                      className="admin-btn-secondary"
                      onClick={() => navigate("/master/section")}
                      variant="outlined"
                      sx={{
                        minWidth: { xs: "100%", sm: "130px" },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {isView ? "Back" : "Discard"}
                    </Button>
                    {!isView && (
                      <Button
                        type="submit"
                        className="admin-btn-theme"
                        disabled={actionLoading}
                        variant="contained"
                        startIcon={
                          !actionLoading ? (
                            id ? (
                              <EditIcon />
                            ) : (
                              <AddIcon />
                            )
                          ) : null
                        }
                        sx={{
                          minWidth: { xs: "100%", sm: "120px" },
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          boxShadow: "none",
                          "&:hover": { boxShadow: "none" },
                        }}
                      >
                        {actionLoading ? (
                          <Spinner />
                        ) : isEdit ? (
                          "Update Section"
                        ) : (
                          "Add Section"
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
