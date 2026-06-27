import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
  Breadcrumbs,
  Link,
  InputAdornment,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  NavigateNext as NavigateNextIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  People as StudentIcon,
  AccountBalance as FeeIcon,
  Settings as SettingsIcon,
  Palette as ThemeIcon,
} from "@mui/icons-material";
import {
  planStaticData as roleStaticData,
  planModuleGroups,
  planExportPrice,
  planImportPrice,
} from "@/apps/common/StaticArrayData";
import type { PlanModuleGroup } from "@/apps/common/StaticArrayData";
import { BpCheckbox } from "../../component/developerCommon/commonCssFunction/cssFunction";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import Spinner from "../../component/developerCommon/spinner/Spinner";
import { planValidationSchema } from "@/utils/validation/FormikValidation";
import { useDispatch, useSelector } from "react-redux";
import {
  addEditPlan,
  getPlanById,
  clearSelectedPlan,
} from "@/redux/slices/planSlice";
import type { RootState } from "@/redux/Store";
import toast from "react-hot-toast";

const billingCycleOptions = [
  { label: "6 Months", value: "6month" },
  { label: "Yearly", value: "yearly" },
];

const groupIconMap: Record<string, any> = {
  dashboard: DashboardIcon,
  admin: AdminIcon,
  teacher: TeacherIcon,
  student: StudentIcon,
  fee: FeeIcon,
  settings: SettingsIcon,
  theme: ThemeIcon,
};

export default function AddEditPlan() {
  const dispatch = useDispatch();
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const isView = location.pathname.endsWith("/view");
  const isEdit = !!id && location.pathname.endsWith("/edit");

  const { selectedPlan, loading, actionLoading } = useSelector(
    (state: RootState) => state.PlanReducer,
  );
  const { adminDetails } = useSelector(
    (state: RootState) => state.AdminReducer,
  );
  const [permissionsError, setPermissionsError] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getPlanById(id) as any);
    } else {
      dispatch(clearSelectedPlan());
    }
  }, [id, dispatch]);

  const initialValues = useMemo(() => {
    if (selectedPlan && id) {
      return {
        id,
        planName: selectedPlan.planName || "",
        billingCycle: selectedPlan.billingCycle || "6month",
        monthlyPrice: selectedPlan.monthlyPrice || "",
        monOfferPrice: selectedPlan.monOfferPrice || "",
        yearlyPrice: selectedPlan.yearlyPrice || "",
        yerOfferPrice: selectedPlan.yerOfferPrice || "",
        permissions: selectedPlan.permissions || [],
        studentLimit:
          selectedPlan.studentLimit !== undefined
            ? selectedPlan.studentLimit
            : -1,
        storageLimit:
          selectedPlan.storageLimit !== undefined
            ? selectedPlan.storageLimit
            : -1,
      };
    }
    return {
      id: "",
      planName: "",
      monthlyPrice: "",
      monOfferPrice: "",
      yearlyPrice: "",
      yerOfferPrice: "",
      billingCycle: "6month",
      permissions: [],
      studentLimit: -1,
      storageLimit: -1,
    };
  }, [selectedPlan, id]);

  const handleSubmit = async (values: any) => {
    if (isView) return;
    if (!values.permissions || !values.permissions.length) {
      setPermissionsError("Please select at least one permission");
      return;
    }
    setPermissionsError("");
    const isFreePlan = values.planName?.trim().toLowerCase() === "free";
    const isSuperDeveloper =
      adminDetails?.type === "super_developer" ||
      adminDetails?.type === "super_developer_admin";
    if (isFreePlan && !isSuperDeveloper) {
      toast.error("Only Super Developer can create or edit a Free plan.");
      return;
    }
    const payload: any = {
      ...values,
      permissions: [...new Set(values.permissions)],
    };
    if (id) payload.id = id;
    if (isFreePlan) {
      payload.billingCycle = "6month";
      payload.monthlyPrice = 0;
      payload.monOfferPrice = 0;
      delete payload.yearlyPrice;
      delete payload.yerOfferPrice;
    } else {
      if (values.billingCycle === "6month") {
        delete payload.yearlyPrice;
        delete payload.yerOfferPrice;
      } else if (values.billingCycle === "yearly") {
        delete payload.monthlyPrice;
        delete payload.monOfferPrice;
      }
    }
    const res = await dispatch(addEditPlan(payload) as any);
    if (res.meta.requestStatus === "fulfilled") navigate("/plan-list");
  };

  const SectionTitle = ({
    icon: Icon,
    title,
  }: {
    icon: any;
    title: string;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 3,
        mt: 1,
        pb: 1,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "8px",
          backgroundColor: "rgba(0, 33, 71, 0.05)",
          color: "var(--primary-color)",
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography
        sx={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#1f2937",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

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
            onClick={() => navigate("/plan-list")}
            sx={{ cursor: "pointer", fontSize: "14px" }}
          >
            Plan List
          </Link>
          <Typography className="admin-breadcrumb-active">
            {isView ? "View" : isEdit ? "Edit" : "Add"} Plan
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        className="card-border common-card"
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: "12px",
          minHeight: "200px",
          backgroundColor: "white",
        }}
      >
        {loading ? (
          <CommonLoader />
        ) : (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={planValidationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps: FormikProps<any>) => {
              const {
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleBlur,
              } = formikProps;

              const permissions: string[] = values.permissions || [];
              const isFreePlan =
                values.planName?.trim().toLowerCase() === "free";

              // ─── Permission Helpers ────────────────────────────────────────
              const getGroupSubModules = (g: PlanModuleGroup) =>
                roleStaticData.filter((m) => g.subModuleIds.includes(m.mainTitleId));

              const getDefaultKeys = (g: PlanModuleGroup): string[] =>
                getGroupSubModules(g).flatMap((m) =>
                  m.subRole
                    .filter(
                      (sr) =>
                        sr.is_show &&
                        sr.titleId !== "export" &&
                        sr.titleId !== "import",
                    )
                    .map((sr) => `${m.mainTitleId}_${sr.titleId}`),
                );

              const getExportKeys = (g: PlanModuleGroup): string[] =>
                getGroupSubModules(g).flatMap((m) =>
                  m.subRole.some((sr) => sr.titleId === "export")
                    ? [`${m.mainTitleId}_export`]
                    : [],
                );

              const getImportKeys = (g: PlanModuleGroup): string[] =>
                getGroupSubModules(g).flatMap((m) =>
                  m.subRole.some((sr) => sr.titleId === "import")
                    ? [`${m.mainTitleId}_import`]
                    : [],
                );

              const isGroupDefaultChecked = (g: PlanModuleGroup) => {
                const k = getDefaultKeys(g);
                return k.length > 0 && k.every((x) => permissions.includes(x));
              };
              const isGroupDefaultIndeterminate = (g: PlanModuleGroup) => {
                const k = getDefaultKeys(g);
                const n = k.filter((x) => permissions.includes(x)).length;
                return n > 0 && n < k.length;
              };
              const isGroupExportChecked = (g: PlanModuleGroup) => {
                const k = getExportKeys(g);
                return k.length > 0 && k.every((x) => permissions.includes(x));
              };
              const isGroupImportChecked = (g: PlanModuleGroup) => {
                const k = getImportKeys(g);
                return k.length > 0 && k.every((x) => permissions.includes(x));
              };

              const toggleGroupDefault = (
                g: PlanModuleGroup,
                checked: boolean,
              ) => {
                if (isView) return;
                if (checked) {
                  setFieldValue("permissions", [
                    ...new Set([...permissions, ...getDefaultKeys(g)]),
                  ]);
                } else {
                  const rem = [
                    ...getDefaultKeys(g),
                    ...getExportKeys(g),
                    ...getImportKeys(g),
                  ];
                  setFieldValue(
                    "permissions",
                    permissions.filter((k) => !rem.includes(k)),
                  );
                }
              };

              const isAllExportChecked = planModuleGroups
                .filter((g) => g.hasExport)
                .every((g) => isGroupExportChecked(g));
              const toggleAllExport = (checked: boolean) => {
                if (isView) return;
                const allExp = planModuleGroups
                  .filter((g) => g.hasExport)
                  .flatMap((g) => getExportKeys(g));
                if (checked) {
                  setFieldValue("permissions", [
                    ...new Set([
                      ...permissions,
                      ...allExp,
                      ...planModuleGroups.flatMap((g) => getDefaultKeys(g)),
                    ]),
                  ]);
                } else {
                  setFieldValue(
                    "permissions",
                    permissions.filter((k) => !allExp.includes(k)),
                  );
                }
              };

              const isAllImportChecked = planModuleGroups
                .filter((g) => g.hasImport)
                .every((g) => isGroupImportChecked(g));
              const toggleAllImport = (checked: boolean) => {
                if (isView) return;
                const allImp = planModuleGroups
                  .filter((g) => g.hasImport)
                  .flatMap((g) => getImportKeys(g));
                if (checked) {
                  setFieldValue("permissions", [
                    ...new Set([
                      ...permissions,
                      ...allImp,
                      ...planModuleGroups.flatMap((g) => getDefaultKeys(g)),
                    ]),
                  ]);
                } else {
                  setFieldValue(
                    "permissions",
                    permissions.filter((k) => !allImp.includes(k)),
                  );
                }
              };

              return (
                <Form>
                  <Box sx={{ maxWidth: 1100 }}>
                    {/* ── 1. Plan Details ── */}
                    <SectionTitle icon={AssignmentIcon} title="Plan Details" />

                    {/* Plan Name */}
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                      sx={{ mb: 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12" }}>
                        <Typography sx={labelSx}>
                          Plan Name{" "}
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </Typography>
                        <TextField
                          fullWidth
                          name="planName"
                          placeholder="Enter Plan Name"
                          variant="outlined"
                          sx={inputSx}
                          value={values.planName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.planName && Boolean(errors.planName)}
                          disabled={isView || isEdit}
                          slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        <FormHelperText className="error-text">
                          {touched.planName && errors.planName
                            ? (errors.planName as string)
                            : ""}
                        </FormHelperText>
                      </Box>
                    </Box>

                    {/* Limits */}
                    <Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 3 }}
                      sx={{ mb: isFreePlan ? 6 : 3 }}
                    >
                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Student Limit{" "}
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={
                              values.studentLimit === -1
                                ? "unlimited"
                                : "limited"
                            }
                            onChange={(e) => {
                              if (e.target.value === "unlimited")
                                setFieldValue("studentLimit", -1);
                              else setFieldValue("studentLimit", "");
                            }}
                            disabled={isView}
                            sx={inputSx}
                            displayEmpty
                          >
                            <MenuItem value="unlimited">Unlimited</MenuItem>
                            <MenuItem value="limited">Limited</MenuItem>
                          </Select>
                        </FormControl>
                        {values.studentLimit !== -1 && (
                          <>
                            <TextField
                              fullWidth
                              name="studentLimit"
                              placeholder="Enter Student Limit"
                              variant="outlined"
                              sx={{ ...inputSx, mt: 1 }}
                              value={values.studentLimit}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^\d*$/.test(v))
                                  setFieldValue(
                                    "studentLimit",
                                    v === "" ? "" : Number(v),
                                  );
                              }}
                              disabled={isView}
                            />
                            <FormHelperText className="error-text">
                              {touched.studentLimit && errors.studentLimit
                                ? (errors.studentLimit as string)
                                : ""}
                            </FormHelperText>
                          </>
                        )}
                      </Box>

                      <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                        <Typography sx={labelSx}>
                          Storage Limit (GB){" "}
                          <span style={{ color: "#ef4444", marginLeft: "2px" }}>
                            *
                          </span>
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={
                              values.storageLimit === -1
                                ? "unlimited"
                                : "limited"
                            }
                            onChange={(e) => {
                              if (e.target.value === "unlimited")
                                setFieldValue("storageLimit", -1);
                              else setFieldValue("storageLimit", "");
                            }}
                            disabled={isView}
                            sx={inputSx}
                            displayEmpty
                          >
                            <MenuItem value="unlimited">Unlimited</MenuItem>
                            <MenuItem value="limited">Limited</MenuItem>
                          </Select>
                        </FormControl>
                        {values.storageLimit !== -1 && (
                          <>
                            <TextField
                              fullWidth
                              name="storageLimit"
                              placeholder="Enter Storage Limit (GB)"
                              variant="outlined"
                              sx={{ ...inputSx, mt: 1 }}
                              value={values.storageLimit}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (/^\d*$/.test(v))
                                  setFieldValue(
                                    "storageLimit",
                                    v === "" ? "" : Number(v),
                                  );
                              }}
                              disabled={isView}
                            />
                            <FormHelperText className="error-text">
                              {touched.storageLimit && errors.storageLimit
                                ? (errors.storageLimit as string)
                                : ""}
                            </FormHelperText>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Pricing — only for non-free plans */}
                    {!isFreePlan && (
                      <>
                        {/* Billing Cycle */}
                        <Box
                          display="grid"
                          gridTemplateColumns="repeat(12, 1fr)"
                          gap={{ xs: 2, sm: 3 }}
                          sx={{ mb: 3 }}
                        >
                          <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                            <Typography sx={labelSx}>
                              Billing Cycle{" "}
                              <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                            </Typography>
                            <Autocomplete
                              options={billingCycleOptions}
                              getOptionLabel={(o) => o.label}
                              value={
                                billingCycleOptions.find(
                                  (o) => o.value === values.billingCycle,
                                ) || null
                              }
                              onChange={(_, nv) =>
                                setFieldValue("billingCycle", nv?.value || "6month")
                              }
                              disabled={isView}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select Billing Cycle"
                                  sx={inputSx}
                                  error={
                                    touched.billingCycle &&
                                    Boolean(errors.billingCycle)
                                  }
                                />
                              )}
                            />
                            <FormHelperText className="error-text">
                              {touched.billingCycle && errors.billingCycle
                                ? (errors.billingCycle as string)
                                : ""}
                            </FormHelperText>
                          </Box>
                        </Box>

                        {/* 6-Month price fields */}
                        {values.billingCycle === "6month" && (
                          <Box
                            display="grid"
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap={{ xs: 2, sm: 3 }}
                            sx={{ mb: 3 }}
                          >
                            <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                              <Typography sx={labelSx}>
                                6-Month Price{" "}
                                <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                              </Typography>
                              <TextField
                                fullWidth
                                name="monthlyPrice"
                                placeholder="Price"
                                variant="outlined"
                                sx={inputSx}
                                value={values.monthlyPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.monthlyPrice && Boolean(errors.monthlyPrice)}
                                disabled={isView}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₹</InputAdornment>
                                  ),
                                }}
                                slotProps={{ htmlInput: { maxLength: 100 } }}
                              />
                              <FormHelperText className="error-text">
                                {touched.monthlyPrice && errors.monthlyPrice
                                  ? (errors.monthlyPrice as string)
                                  : ""}
                              </FormHelperText>
                            </Box>
                            <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                              <Typography sx={labelSx}>
                                6-Month Offer Price
                              </Typography>
                              <TextField
                                fullWidth
                                name="monOfferPrice"
                                placeholder="Offer Price"
                                variant="outlined"
                                sx={inputSx}
                                value={values.monOfferPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isView}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₹</InputAdornment>
                                  ),
                                }}
                                slotProps={{ htmlInput: { maxLength: 100 } }}
                              />
                            </Box>
                          </Box>
                        )}

                        {/* Yearly price fields */}
                        {values.billingCycle === "yearly" && (
                          <Box
                            display="grid"
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap={{ xs: 2, sm: 3 }}
                            sx={{ mb: 3 }}
                          >
                            <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                              <Typography sx={labelSx}>
                                Yearly Price{" "}
                                <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
                              </Typography>
                              <TextField
                                fullWidth
                                name="yearlyPrice"
                                placeholder="Price"
                                variant="outlined"
                                sx={inputSx}
                                value={values.yearlyPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.yearlyPrice && Boolean(errors.yearlyPrice)}
                                disabled={isView}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₹</InputAdornment>
                                  ),
                                }}
                                slotProps={{ htmlInput: { maxLength: 100 } }}
                              />
                              <FormHelperText className="error-text">
                                {touched.yearlyPrice && errors.yearlyPrice
                                  ? (errors.yearlyPrice as string)
                                  : ""}
                              </FormHelperText>
                            </Box>
                            <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                              <Typography sx={labelSx}>
                                Yearly Offer Price
                              </Typography>
                              <TextField
                                fullWidth
                                name="yerOfferPrice"
                                placeholder="Offer Price"
                                variant="outlined"
                                sx={inputSx}
                                value={values.yerOfferPrice}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isView}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₹</InputAdornment>
                                  ),
                                }}
                                slotProps={{ htmlInput: { maxLength: 100 } }}
                              />
                            </Box>
                          </Box>
                        )}
                      </>
                    )}

                    {/* ── 2. Permissions Configuration ── */}
                    <SectionTitle
                      icon={SecurityIcon}
                      title="Permissions Configuration"
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                          lg: "repeat(4, 1fr)",
                        },
                        gap: 1.2,
                        mb: 2.5,
                      }}
                    >
                      {planModuleGroups.map((group) => {
                        const GroupIcon = groupIconMap[group.icon || ""] || SettingsIcon;
                        const defChecked = isGroupDefaultChecked(group);
                        const defIndet = isGroupDefaultIndeterminate(group);
                        return (
                          <Box
                            key={group.groupId}
                            sx={{
                              p: 1.2,
                              borderRadius: "8px",
                              border: defChecked
                                ? "2px solid var(--primary-color)"
                                : "1px solid #e2e8f0",
                              bgcolor: defChecked ? "rgba(0, 33, 71, 0.01)" : "white",
                              boxShadow: defChecked
                                ? "0 4px 8px -4px rgba(0, 33, 71, 0.08)"
                                : "0 1px 4px rgba(0, 0, 0, 0.01)",
                              transition: "all 0.15s ease-in-out",
                              cursor: isView ? "default" : "pointer",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: "95px",
                              position: "relative",
                              "&:hover": {
                                transform: isView ? "none" : "translateY(-1px)",
                                borderColor: isView ? "none" : "var(--primary-color)",
                                boxShadow: isView ? "none" : "0 6px 12px -4px rgba(0, 33, 71, 0.1)",
                              },
                            }}
                            onClick={() => {
                              if (!isView) {
                                toggleGroupDefault(group, !defChecked);
                              }
                            }}
                          >
                            <Box>
                              {/* Header inside Card */}
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 26,
                                    height: 26,
                                    borderRadius: "6px",
                                    bgcolor: defChecked ? "rgba(0, 33, 71, 0.09)" : "#f1f5f9",
                                    color: defChecked ? "var(--primary-color)" : "#64748b",
                                    transition: "all 0.2s",
                                  }}
                                >
                                  <GroupIcon sx={{ fontSize: 14 }} />
                                </Box>
                                <BpCheckbox
                                  checked={defChecked}
                                  indeterminate={defIndet}
                                  onChange={(e: any) => {
                                    e.stopPropagation();
                                    toggleGroupDefault(group, e.target.checked);
                                  }}
                                  disabled={isView}
                                  sx={{ transform: "scale(0.75)", p: 0.1 }}
                                />
                              </Box>

                              {/* Title & Description */}
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "12px",
                                  color: "#0f172a",
                                  mb: 0.3,
                                  lineHeight: 1.1,
                                }}
                              >
                                {group.groupTitle}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "9px",
                                  color: "#64748b",
                                  lineHeight: 1.2,
                                  mb: 1,
                                }}
                              >
                                {group.subModuleIds
                                  .map((s) =>
                                    s
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (c) => c.toUpperCase())
                                  )
                                  .join(" · ")}
                              </Typography>
                            </Box>

                            {/* Pricing Tag in Footer */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                              <Chip
                                label={
                                  values.billingCycle === "yearly"
                                    ? `₹ ${(parseInt(group.price.replace(/[^\d]/g, ""), 10) || 0) * 2}/yr`
                                    : `${group.price}/6mo`
                                }
                                size="small"
                                sx={{
                                  fontSize: "8.5px",
                                  fontWeight: 700,
                                  bgcolor: "rgba(255, 140, 0, 0.09)",
                                  color: "#c05600",
                                  border: "1px solid rgba(255, 140, 0, 0.18)",
                                  height: "16px",
                                  px: 0.1,
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Add-on Features Section Title */}
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "12px",
                        color: "#0f172a",
                        mb: 1,
                        mt: 2.5,
                      }}
                    >
                      Add-on Features
                    </Typography>

                    {/* Import / Export Add-on Cards Grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                        },
                        gap: 1.2,
                        mb: 2.5,
                      }}
                    >
                      {/* Export Add-on Card */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: "8px",
                          border: isAllExportChecked
                            ? "2px solid #16a34a"
                            : "1px solid #e2e8f0",
                          bgcolor: isAllExportChecked ? "rgba(22, 163, 74, 0.01)" : "white",
                          boxShadow: isAllExportChecked
                            ? "0 4px 8px -4px rgba(22, 163, 74, 0.08)"
                            : "0 1px 4px rgba(0, 0, 0, 0.01)",
                          transition: "all 0.15s ease-in-out",
                          cursor: isView ? "default" : "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "85px",
                          "&:hover": {
                            transform: isView ? "none" : "translateY(-1px)",
                            borderColor: isView ? "none" : "#16a34a",
                            boxShadow: isView ? "none" : "0 6px 12px -4px rgba(22, 163, 74, 0.1)",
                          },
                        }}
                        onClick={() => {
                          if (!isView) {
                            toggleAllExport(!isAllExportChecked);
                          }
                        }}
                      >
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                            <Box
                              sx={{
                                width: 26, height: 26,
                                borderRadius: "6px",
                                bgcolor: isAllExportChecked ? "rgba(22, 163, 74, 0.12)" : "#f1f5f9",
                                color: isAllExportChecked ? "#16a34a" : "#64748b",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s",
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </Box>
                            <BpCheckbox
                              checked={isAllExportChecked}
                              onChange={(e: any) => {
                                e.stopPropagation();
                                toggleAllExport(e.target.checked);
                              }}
                              disabled={isView}
                              sx={{ transform: "scale(0.75)", p: 0.1 }}
                            />
                          </Box>

                          <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#0f172a", mb: 0.2 }}>
                            Export
                          </Typography>
                          <Typography sx={{ fontSize: "9px", color: "#64748b", mb: 1 }}>
                            Enables export/download actions across all eligible school modules.
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Chip
                            label={
                              values.billingCycle === "yearly"
                                ? `₹ ${(parseInt(planExportPrice.replace(/[^\d]/g, ""), 10) || 0) * 2}/yr`
                                : `${planExportPrice}/6mo`
                            }
                            size="small"
                            sx={{ fontSize: "8.5px", fontWeight: 700, bgcolor: "rgba(22, 163, 74, 0.08)", color: "#16a34a", border: "1px solid rgba(22, 163, 74, 0.2)", height: "16px", px: 0.1 }}
                          />
                        </Box>
                      </Box>

                      {/* Import Add-on Card */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: "8px",
                          border: isAllImportChecked
                            ? "2px solid #2563eb"
                            : "1px solid #e2e8f0",
                          bgcolor: isAllImportChecked ? "rgba(37, 99, 235, 0.01)" : "white",
                          boxShadow: isAllImportChecked
                            ? "0 4px 8px -4px rgba(37, 99, 235, 0.08)"
                            : "0 1px 4px rgba(0, 0, 0, 0.01)",
                          transition: "all 0.15s ease-in-out",
                          cursor: isView ? "default" : "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "85px",
                          "&:hover": {
                            transform: isView ? "none" : "translateY(-1px)",
                            borderColor: isView ? "none" : "#2563eb",
                            boxShadow: isView ? "none" : "0 6px 12px -4px rgba(37, 99, 235, 0.1)",
                          },
                        }}
                        onClick={() => {
                          if (!isView) {
                            toggleAllImport(!isAllImportChecked);
                          }
                        }}
                      >
                        <Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                            <Box
                              sx={{
                                width: 26, height: 26,
                                borderRadius: "6px",
                                bgcolor: isAllImportChecked ? "rgba(37, 99, 235, 0.12)" : "#f1f5f9",
                                color: isAllImportChecked ? "#2563eb" : "#64748b",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s",
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 16 12 21 17 16"/><line x1="12" y1="21" x2="12" y2="9"/></svg>
                            </Box>
                            <BpCheckbox
                              checked={isAllImportChecked}
                              onChange={(e: any) => {
                                e.stopPropagation();
                                toggleAllImport(e.target.checked);
                              }}
                              disabled={isView}
                              sx={{ transform: "scale(0.75)", p: 0.1 }}
                            />
                          </Box>

                          <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#0f172a", mb: 0.2 }}>
                            Import
                          </Typography>
                          <Typography sx={{ fontSize: "9px", color: "#64748b", mb: 1 }}>
                            Enables import/upload actions across all eligible school modules.
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Chip
                            label={
                              values.billingCycle === "yearly"
                                ? `₹ ${(parseInt(planImportPrice.replace(/[^\d]/g, ""), 10) || 0) * 2}/yr`
                                : `${planImportPrice}/6mo`
                            }
                            size="small"
                            sx={{ fontSize: "8.5px", fontWeight: 700, bgcolor: "rgba(37, 99, 235, 0.08)", color: "#2563eb", border: "1px solid rgba(37, 99, 235, 0.2)", height: "16px", px: 0.1 }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {permissionsError && (
                      <FormHelperText
                        className="error-text"
                        sx={{ mt: -2, mb: 2, fontSize: "13px" }}
                      >
                        {permissionsError}
                      </FormHelperText>
                    )}

                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        className="admin-btn-secondary"
                        onClick={() => navigate("/plan-list")}
                        disabled={actionLoading}
                        sx={{ minWidth: "130px" }}
                      >
                        Cancel
                      </Button>
                      {!isView && (
                        <Button
                          type="submit"
                          className="admin-btn-theme"
                          disabled={actionLoading}
                          variant="contained"
                          sx={{ minWidth: "150px" }}
                        >
                          {actionLoading ? (
                            <Spinner />
                          ) : isEdit ? (
                            "Update Plan"
                          ) : (
                            "Create Plan"
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
  );
}
