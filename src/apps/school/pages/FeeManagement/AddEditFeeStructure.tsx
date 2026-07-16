import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Breadcrumbs,
  Link,
  IconButton,
  FormHelperText,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import Svg from "@/assets/Svg";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import {
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  RemoveCircleOutline as RemoveIcon,
  Add as AddInstallmentIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import type { RootState, AppDispatch } from "@/redux/Store";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { getFeeStructureById } from "@/api/services/fee.service";
import {
  fetchFeeCategories,
  createFeeStructure,
  editFeeStructure,
} from "@/redux/slices/feeSlice";
import { getClasses } from "@/redux/slices/classSlice";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import { feeStructureValidationSchema } from "@/utils/validation/FormikValidation";

export default function AddEditFeeStructure() {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isView = location.pathname.endsWith("/view");
  const isEdit = !isView && !!id;

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openDates, setOpenDates] = useState<{ [key: number]: boolean }>({});

  const { categories } = useSelector((state: RootState) => state.FeeReducer);
  const { allClasses } = useSelector((state: RootState) => state.ClassReducer);

  const initialForm = {
    classId: "",
    feeCategoryId: "",
    installments: [{ label: "Installment 1", amount: 0, dueDate: "" }],
  };
  const [formData, setFormData] = useState<any>(initialForm);

  useEffect(() => {
    dispatch(fetchFeeCategories({ page: 1, limit: 100 }) as any);
    dispatch(getClasses({ type: "filter" }) as any);
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const fetchStructure = async () => {
        setLoading(true);
        try {
          const res = await getFeeStructureById(id);
          if (res?.data?.data) {
            const struct = res.data.data;
            setFormData({
              classId: struct.classId?._id || struct.classId || "",
              feeCategoryId: struct.feeCategoryId?._id || struct.feeCategoryId || "",
              installments: struct.installments.map((inst: any) => ({
                label: inst.label,
                amount: inst.amount,
                dueDate: inst.dueDate ? new Date(inst.dueDate).toISOString().split("T")[0] : "",
              })),
            });
          }
        } catch (err: any) {
          toast.error("Failed to load fee structure");
        } finally {
          setLoading(false);
        }
      };
      fetchStructure();
    }
  }, [id]);

  const initialValues = useMemo(() => ({
    id: id || "",
    classId: formData.classId,
    feeCategoryId: formData.feeCategoryId,
    installments: formData.installments,
  }), [formData, id]);

  const handleSubmit = async (values: any) => {
    setActionLoading(true);
    const totalAmount = values.installments.reduce(
      (sum: number, inst: any) => sum + Number(inst.amount || 0),
      0
    );
    const { id: _, ...restValues } = values;
    const payload = {
      ...restValues,
      totalAmount,
    };
    try {
      if (id) {
        await dispatch(editFeeStructure({ id, data: payload })).unwrap();
        toast.success("Structure updated successfully");
      } else {
        await dispatch(createFeeStructure(payload)).unwrap();
        toast.success("Structure created successfully");
      }
      navigate("/fee/structures");
    } catch (err: any) {
      toast.error(err || "Failed to save structure");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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
              onClick={() => navigate("/fee/structures")}
              sx={{ cursor: "pointer", fontSize: "14px" }}
            >
              Fee Structures
            </Link>
            <Typography className="admin-breadcrumb-active">
              {isView ? "View" : isEdit ? "Edit" : "Create"} Structure
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
              validationSchema={feeStructureValidationSchema}
              onSubmit={handleSubmit}
            >
              {(formikProps: FormikProps<any>) => {
                const {
                  values,
                  errors,
                  touched,
                  handleBlur,
                  setFieldValue,
                  handleSubmit: formikSubmit,
                } = formikProps;

                const handleAddInstallment = () => {
                  setFieldValue("installments", [
                    ...values.installments,
                    { label: `Installment ${values.installments.length + 1}`, amount: 0, dueDate: "" },
                  ]);
                };

                const handleRemoveInstallment = (index: number) => {
                  setFieldValue(
                    "installments",
                    values.installments.filter((_: any, i: number) => i !== index)
                  );
                };

                const handleInstallmentChange = (index: number, field: string, value: any) => {
                  const newInst = [...values.installments];
                  newInst[index] = { ...newInst[index], [field]: value };
                  setFieldValue("installments", newInst);
                };

                const instErrors = errors.installments as any;
                const instTouched = touched.installments as any;

                return (
                  <Form onSubmit={formikSubmit}>
                    <Box sx={{ maxWidth: 800 }}>
                      <Box
                        display="grid"
                        gridTemplateColumns="repeat(12, 1fr)"
                        gap={{ xs: 2, sm: 3 }}
                        mb={4}
                      >
                        <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
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
                              Select Class
                              <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                            </Typography>
                            {!isView && (
                              <Tooltip title="Refresh Classes" arrow>
                                <IconButton
                                  onClick={() => dispatch(getClasses({ type: "filter" }) as any)}
                                  size="small"
                                  sx={{
                                    color: "var(--primary-color)",
                                    "&:hover": {
                                      backgroundColor: "rgba(0, 33, 71, 0.1)",
                                    },
                                  }}
                                >
                                  <RefreshIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          <Autocomplete
                            options={allClasses || []}
                            getOptionLabel={(option: any) => option.name || ""}
                            value={
                              allClasses?.find((cls: any) => cls._id === values.classId) || null
                            }
                            onChange={(_, newValue: any) => {
                              setFieldValue("classId", newValue ? newValue._id : "");
                            }}
                            disabled={isView}
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
                              "& .MuiAutocomplete-inputRoot": {
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important",
                                paddingLeft: "0 !important",
                                paddingRight: "30px !important",
                                height: "auto",
                                minHeight: "40px",
                                "& .MuiAutocomplete-input": {
                                  padding: "0 10px !important",
                                  height: "40px",
                                  fontFamily: "'Poppins', sans-serif !important",
                                  fontSize: "14px !important",
                                },
                              },
                            }}
                          />
                          <FormHelperText className="error-text">
                            {touched.classId && errors.classId
                              ? (errors.classId as string)
                              : ""}
                          </FormHelperText>
                        </Box>

                        <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
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
                              Select Fee Category
                              <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                            </Typography>
                            {!isView && (
                              <Tooltip title="Refresh Categories" arrow>
                                <IconButton
                                  onClick={() => dispatch(fetchFeeCategories({ pageNumber: 1, perPageData: 100 }) as any)}
                                  size="small"
                                  sx={{
                                    color: "var(--primary-color)",
                                    "&:hover": {
                                      backgroundColor: "rgba(0, 33, 71, 0.1)",
                                    },
                                  }}
                                >
                                  <RefreshIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          <Autocomplete
                            options={categories?.filter((c: any) => c.isActive) || []}
                            getOptionLabel={(option: any) => option.name || ""}
                            value={
                              categories?.find((cat: any) => cat._id === values.feeCategoryId) || null
                            }
                            onChange={(_, newValue: any) => {
                              setFieldValue("feeCategoryId", newValue ? newValue._id : "");
                            }}
                            disabled={isView}
                            clearIcon={null}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select Category"
                                variant="outlined"
                                sx={inputSx}
                                error={touched.feeCategoryId && Boolean(errors.feeCategoryId)}
                              />
                            )}
                            sx={{
                              "& .MuiAutocomplete-inputRoot": {
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important",
                                paddingLeft: "0 !important",
                                paddingRight: "30px !important",
                                height: "auto",
                                minHeight: "40px",
                                "& .MuiAutocomplete-input": {
                                  padding: "0 10px !important",
                                  height: "40px",
                                  fontFamily: "'Poppins', sans-serif !important",
                                  fontSize: "14px !important",
                                },
                              },
                            }}
                          />
                          <FormHelperText className="error-text">
                            {touched.feeCategoryId && errors.feeCategoryId
                              ? (errors.feeCategoryId as string)
                              : ""}
                          </FormHelperText>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "var(--primary-color)",
                          }}
                        >
                          Installments
                        </Typography>
                        {!isView && (
                          <Button
                            size="small"
                            startIcon={<AddInstallmentIcon />}
                            onClick={handleAddInstallment}
                            sx={{
                              color: "var(--primary-color)",
                              fontWeight: 600,
                              textTransform: "none",
                            }}
                          >
                            Add Installment
                          </Button>
                        )}
                      </Box>

                      {values.installments.map((inst: any, index: number) => {
                        const prevDate = index > 0 ? values.installments[index - 1].dueDate : null;
                        const minDate = prevDate
                          ? moment(prevDate).add(1, "days")
                          : (!id ? moment() : undefined);

                        return (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "flex-start",
                              mb: 2,
                              p: 2,
                              backgroundColor: "#F9FAFB",
                              borderRadius: "8px",
                              border: "1px solid #eaecf0",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: "6px",
                                  height: "32px",
                                }}
                              >
                                <Typography sx={{ ...labelSx, fontSize: "12px", mb: 0 }}>
                                  Label
                                </Typography>
                              </Box>
                              <TextField
                                fullWidth
                                size="small"
                                name={`installments[${index}].label`}
                                value={inst.label}
                                onChange={(e) => handleInstallmentChange(index, "label", e.target.value)}
                                onBlur={handleBlur}
                                disabled={isView}
                                error={instTouched?.[index]?.label && Boolean(instErrors?.[index]?.label)}
                                placeholder="e.g. Q1"
                                sx={inputSx}
                              />
                              <FormHelperText className="error-text">
                                {instTouched?.[index]?.label && instErrors?.[index]?.label
                                  ? instErrors[index].label
                                  : ""}
                              </FormHelperText>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: "6px",
                                  height: "32px",
                                }}
                              >
                                <Typography sx={{ ...labelSx, fontSize: "12px", mb: 0 }}>
                                  Amount (₹)
                                </Typography>
                              </Box>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                name={`installments[${index}].amount`}
                                value={inst.amount === 0 ? "" : inst.amount}
                                onChange={(e) =>
                                  handleInstallmentChange(
                                    index,
                                    "amount",
                                    e.target.value === "" ? "" : Number(e.target.value)
                                  )
                                }
                                onBlur={handleBlur}
                                disabled={isView}
                                error={instTouched?.[index]?.amount && Boolean(instErrors?.[index]?.amount)}
                                sx={inputSx}
                              />
                              <FormHelperText className="error-text">
                                {instTouched?.[index]?.amount && instErrors?.[index]?.amount
                                  ? instErrors[index].amount
                                  : ""}
                              </FormHelperText>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: "6px",
                                  height: "32px",
                                }}
                              >
                                <Typography sx={{ ...labelSx, fontSize: "12px", mb: 0 }}>
                                  Due Date
                                </Typography>
                              </Box>
                              <DatePicker
                                minDate={minDate}
                                format="DD/MM/YYYY"
                                value={inst.dueDate ? moment(inst.dueDate) : null}
                                open={!isView && !!openDates[index]}
                                onOpen={() => !isView && setOpenDates((prev) => ({ ...prev, [index]: true }))}
                                onClose={() => !isView && setOpenDates((prev) => ({ ...prev, [index]: false }))}
                                onChange={(v) => {
                                  const dateStr = v ? moment(v).format("YYYY-MM-DD") : "";
                                  handleInstallmentChange(index, "dueDate", dateStr);
                                }}
                                disabled={isView}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: "small",
                                    name: `installments[${index}].dueDate`,
                                    error: instTouched?.[index]?.dueDate && Boolean(instErrors?.[index]?.dueDate),
                                    placeholder: "Select Date",
                                    variant: "outlined",
                                    onClick: () => !isView && setOpenDates((prev) => ({ ...prev, [index]: true })),
                                    onBlur: handleBlur,
                                    disabled: isView,
                                    sx: {
                                      "& .MuiPickersOutlinedInput-root": {
                                        height: "40px",
                                        backgroundColor: isView ? "#f4f5f7 !important" : "#fff !important",
                                        borderRadius: "var(--button-radius, 6px) !important",
                                        "& fieldset": {
                                          borderColor: "var(--input-border, #ced4da) !important",
                                        },
                                        "&:hover:not(.Mui-focused) fieldset": {
                                          borderColor: "var(--input-border, #ced4da) !important",
                                        },
                                        "&.Mui-focused:not(.Mui-error) fieldset": {
                                          borderColor: "var(--primary-color) !important",
                                          borderWidth: "1px !important",
                                        },
                                      },
                                      "& .MuiPickersSectionList-root": {
                                        padding: "12px 0px",
                                        fontSize: "12px",
                                      },
                                      "& .MuiPickersInputBase-sectionContent": {
                                        fontSize: "13px",
                                        padding: "12px 0px",
                                      },
                                      "& .MuiOutlinedInput-input": {
                                        padding: "0 14px !important",
                                        fontSize: "14px !important",
                                        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
                                        height: "40px",
                                        cursor: isView ? "default" : "pointer",
                                      },
                                    },
                                  },
                                  popper: {
                                    sx: {
                                      "& .MuiPickersDay-root.Mui-selected": {
                                        backgroundColor: "var(--primary-color, #002147) !important",
                                        color: "#ffffff !important",
                                      },
                                      "& .MuiPickersDay-root:hover": {
                                        backgroundColor: "rgba(var(--primary-color-rgb, 0, 33, 71), 0.1) !important",
                                      },
                                      "& .MuiPickersYear-yearButton.Mui-selected": {
                                        backgroundColor: "var(--primary-color, #002147) !important",
                                        color: "#ffffff !important",
                                      },
                                    },
                                  },
                                }}
                              />
                              <FormHelperText className="error-text">
                                {instTouched?.[index]?.dueDate && instErrors?.[index]?.dueDate
                                  ? instErrors[index].dueDate
                                  : ""}
                              </FormHelperText>
                            </Box>
                            {values.installments.length > 1 && !isView && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Box sx={{ height: "32px", mb: "6px" }} />
                                <IconButton
                                  onClick={() => handleRemoveInstallment(index)}
                                  sx={{
                                    color: "#D92D20",
                                    p: "8px",
                                  }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <Box sx={{ height: "19px" }} />
                              </Box>
                            )}
                          </Box>
                        );
                      })}

                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          backgroundColor: "#ECFDF3",
                          borderRadius: "8px",
                          border: "1px solid #A6F4C5",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography sx={{ color: "#027A48", fontWeight: 600 }}>
                          Total Fee Amount:
                        </Typography>
                        <Typography sx={{ color: "#027A48", fontWeight: 700 }}>
                          ₹
                          {values.installments
                            .reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0)
                            .toLocaleString()}
                        </Typography>
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
                          onClick={() => navigate("/fee/structures")}
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
                              !actionLoading ? (isEdit ? <EditIcon /> : <AddIcon />) : null
                            }
                            sx={{
                              minWidth: { xs: "100%", sm: "150px" },
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
                              "Update Structure"
                            ) : (
                              "Create Structure"
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
      </Box>
    </LocalizationProvider>
  );
}
