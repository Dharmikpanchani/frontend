import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Breadcrumbs,
  Link,
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import {
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { getFeeCategoryById } from "@/api/services/fee.service";
import { createFeeCategory, editFeeCategory } from "@/redux/slices/feeSlice";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { feeCategoryValidationSchema } from "@/utils/validation/FormikValidation";

export default function AddEditFeeCategory() {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isMandatory: true,
  });

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        setLoading(true);
        try {
          const res = await getFeeCategoryById(id);
          if (res?.data?.data) {
            const cat = res.data.data;
            setFormData({
              name: cat.name || "",
              description: cat.description || "",
              isMandatory: cat.isMandatory !== undefined ? cat.isMandatory : true,
            });
          }
        } catch (err: any) {
          toast.error("Failed to load category details");
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id]);

  const initialValues = useMemo(
    () => ({
      name: formData.name,
      description: formData.description,
      isMandatory: formData.isMandatory,
    }),
    [formData]
  );

  const handleSubmit = async (values: any) => {
    setActionLoading(true);
    try {
      if (id) {
        await dispatch(editFeeCategory({ id, data: values }) as any).unwrap();
        toast.success("Category updated successfully");
      } else {
        await dispatch(createFeeCategory(values) as any).unwrap();
        toast.success("Category created successfully");
      }
      navigate("/fee/categories");
    } catch (err: any) {
      toast.error(err || "Failed to save category");
    } finally {
      setActionLoading(false);
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
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/fee/categories")}
            sx={{ cursor: "pointer", fontSize: "14px" }}
          >
            Fee Categories
          </Link>
          <Typography className="admin-breadcrumb-active">
            {isEdit ? "Edit" : "Add"} Category
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        className="card-border common-card"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: "12px",
          backgroundColor: "white",
        }}
      >
        {loading ? (
          <CommonLoader />
        ) : (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={feeCategoryValidationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps: FormikProps<any>) => {
              const {
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                handleSubmit: formikSubmit,
              } = formikProps;
              return (
                <Form onSubmit={formikSubmit}>
                  <Box sx={{ maxWidth: 800 }}>
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                    >
                      <Box gridColumn="span 12">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: "6px",
                            height: "32px",
                          }}
                        >
                          <Typography sx={{ ...labelSx, mb: 0 }}>
                            Category Name
                            <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          name="name"
                          placeholder="e.g. Tuition Fee"
                          variant="outlined"
                          sx={inputSx}
                          value={values.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.name && Boolean(errors.name)}
                          slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        {touched.name && errors.name && (
                          <FormHelperText className="error-text">
                            {errors.name as string}
                          </FormHelperText>
                        )}
                      </Box>

                      <Box gridColumn="span 12">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: "6px",
                            height: "32px",
                          }}
                        >
                          <Typography sx={{ ...labelSx, mb: 0 }}>Description</Typography>
                        </Box>
                        <TextField
                          fullWidth
                          name="description"
                          placeholder="Optional description..."
                          variant="outlined"
                          multiline
                          rows={3}
                          sx={{
                            ...inputSx,
                            height: "auto",
                            "&.MuiOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiInputBase-root": {
                              height: "auto !important",
                              padding: "0px !important",
                            },
                            "& .MuiOutlinedInput-input": {
                              height: "auto !important",
                              minHeight: "80px !important",
                              padding: "10px 14px !important",
                              display: "block !important",
                              alignItems: "initial !important",
                              boxSizing: "border-box !important",
                            },
                          }}
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.description && Boolean(errors.description)}
                          slotProps={{ htmlInput: { maxLength: 500 } }}
                        />
                        {touched.description && errors.description && (
                          <FormHelperText className="error-text">
                            {errors.description as string}
                          </FormHelperText>
                        )}
                      </Box>

                      <Box gridColumn="span 12">
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="isMandatory"
                              checked={values.isMandatory}
                              onChange={(e) => setFieldValue("isMandatory", e.target.checked)}
                              sx={{
                                color: "var(--primary-color)",
                                "&.Mui-checked": { color: "var(--primary-color)" },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ color: "#344054", fontWeight: 500, fontSize: "14px" }}
                            >
                              This is a mandatory fee for all assigned students
                            </Typography>
                          }
                        />
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
                        onClick={() => navigate("/fee/categories")}
                        disabled={actionLoading}
                        variant="outlined"
                        sx={{
                          minWidth: { xs: "100%", sm: "130px" },
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Discard
                      </Button>
                      <Button
                        type="submit"
                        className="admin-btn-theme"
                        disabled={actionLoading}
                        variant="contained"
                        startIcon={
                          !actionLoading ? (isEdit ? <EditIcon /> : <AddIcon />) : null
                        }
                        sx={{
                          minWidth: { xs: "100%", sm: "140px" },
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
                          "Update Category"
                        ) : (
                          "Add Category"
                        )}
                      </Button>
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
