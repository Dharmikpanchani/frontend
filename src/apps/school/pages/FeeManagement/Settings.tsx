import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Breadcrumbs,
  Tabs,
  Tab,
  CircularProgress,
  Checkbox,
  FormHelperText,
  IconButton,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  AccountBalance as BankIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  fetchSchoolSettings,
  updateSchoolSettingsAsync,
} from "@/redux/slices/feeSlice";
import {
  linkRazorpayRoute,
  generateFeeReport,
  generateDueReport,
  runArchiveProcess,
} from "@/api/services/fee.service";
import type { RootState, AppDispatch } from "@/redux/Store";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import { CommonLoader } from "@/apps/school/component/schoolCommon/loader/Loader";
import { settingsValidationSchema } from "@/utils/validation/FormikValidation";

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const { settings, loading } = useSelector((state: RootState) => state.FeeReducer);

  const canEdit = hasPermission(schoolAdminPermission.school_settings.update);
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [linkingBankId, setLinkingBankId] = useState<string | null>(null);
  const [reportEmail, setReportEmail] = useState("");
  const [feeReportLoading, setFeeReportLoading] = useState(false);
  const [dueReportLoading, setDueReportLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSchoolSettings());
  }, [dispatch]);

  const initialValues = useMemo(() => {
    let serverBankAccounts = settings?.paymentConfiguration?.bankAccounts || [];
    let bankAccounts = serverBankAccounts.map((acc: any) => ({ ...acc }));
    if (bankAccounts.length === 0) {
      bankAccounts = [{
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        ifsc: "",
        branch: "",
        isActive: true,
      }];
    } else {
      const activeIdx = bankAccounts.findIndex((acc: any) => acc.isActive);
      const targetActiveIdx = activeIdx !== -1 ? activeIdx : 0;
      bankAccounts = bankAccounts.map((acc: any, i: number) => ({
        ...acc,
        isActive: i === targetActiveIdx,
      }));
    }

    let serverUpiAccounts = settings?.paymentConfiguration?.upiAccounts || [];
    let upiAccounts = serverUpiAccounts.map((upi: any) => ({ ...upi }));
    if (upiAccounts.length === 0) {
      upiAccounts = [{
        upiId: "",
        accountHolder: "",
        qrCode: "",
        isActive: true,
      }];
    } else {
      const activeIdx = upiAccounts.findIndex((upi: any) => upi.isActive);
      const targetActiveIdx = activeIdx !== -1 ? activeIdx : 0;
      upiAccounts = upiAccounts.map((upi: any, i: number) => ({
        ...upi,
        isActive: i === targetActiveIdx,
      }));
    }

    return {
      admission: {
        enableOnlineAdmission: settings?.admission?.enableOnlineAdmission ?? true,
      },
      fee: {
        enableLateFine: settings?.fee?.enableLateFine || false,
        fineAmountPerDay: settings?.fee?.fineAmountPerDay || 0,
        gracePeriodDays: settings?.fee?.gracePeriodDays || 0,
      },
      export: {
        pdfFooterText: settings?.export?.pdfFooterText || "Thank you. This is a computer-generated receipt.",
        pdfWatermark: settings?.export?.pdfWatermark || "",
      },
      paymentGateway: {
        isActive: settings?.paymentGateway?.isActive || false,
      },
      paymentConfiguration: {
        bankAccounts,
        upiAccounts,
        paymentMethods: settings?.paymentConfiguration?.paymentMethods || {
          cash: true,
          cheque: true,
          upi: true,
          bankTransfer: true,
          onlineGateway: false,
        },
      },
    };
  }, [settings]);

  const handleLinkRazorpay = async (bankAccountId: string) => {
    if (!canEdit) return;
    setLinkingBankId(bankAccountId);
    try {
      const response = await linkRazorpayRoute(bankAccountId);
      if (response.data?.success) {
        toast.success(response.data?.message || "Razorpay Account linked successfully!");
        dispatch(fetchSchoolSettings());
      } else {
        toast.error(response.data?.message || "Failed to link Razorpay Account.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to link Razorpay Account.");
    } finally {
      setLinkingBankId(null);
    }
  };

  const handleQueueReport = async (type: "fee" | "due") => {
    if (type === "fee") {
      setFeeReportLoading(true);
      try {
        const response = await generateFeeReport(reportEmail ? { email: reportEmail } : {});
        toast.success(response.data?.message || "Fee report queued successfully!");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to queue fee report");
      } finally {
        setFeeReportLoading(false);
      }
    } else {
      setDueReportLoading(true);
      try {
        const response = await generateDueReport(reportEmail ? { email: reportEmail } : {});
        toast.success(response.data?.message || "Due report queued successfully!");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to queue due report");
      } finally {
        setDueReportLoading(false);
      }
    }
  };

  const handleRunArchive = async () => {
    if (!window.confirm("Are you sure you want to run the database archiving process? This will move fee records older than 3 years to the archive and drop the original tables. This action cannot be undone.")) {
      return;
    }
    setArchiveLoading(true);
    try {
      const response = await runArchiveProcess();
      toast.success(response.data?.message || "Archive process completed successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to trigger archive process");
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    if (!canEdit) return;

    // Validate active bank account limit
    const activeBankCount = values.paymentConfiguration.bankAccounts.filter((acc: any) => acc.isActive).length;
    if (activeBankCount > 1) {
      toast.error("Only one bank account can be active at a time.");
      return;
    }

    setSaving(true);
    // Normalize IFSC to uppercase
    const payload = {
      ...values,
      paymentConfiguration: {
        ...values.paymentConfiguration,
        bankAccounts: values.paymentConfiguration.bankAccounts.map((acc: any) => ({
          ...acc,
          ifsc: acc.ifsc.toUpperCase(),
        })),
      },
    };

    try {
      await dispatch(updateSchoolSettingsAsync(payload)).unwrap();
      toast.success("Settings updated successfully!");
    } catch (err: any) {
      toast.error(err || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, isFirst }: { icon: any; title: string; isFirst?: boolean }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 3,
        mt: isFirst ? 0 : 4,
        pb: 1.5,
        borderBottom: "1px solid #F0F0F0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: "8px",
          backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
          color: "var(--primary-color, #5c1a1a)",
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography
        sx={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#1f2937",
          fontFamily: "var(--font-family, 'Poppins', sans-serif)",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const SUB_TABS = ["Fee Rules", "Payment Methods", "Payment Gateway"];
  const tabSx = {
    indicator: { backgroundColor: "var(--primary-color)", height: "2.4px", borderRadius: "3px 3px 0 0" },
    tab: { textTransform: "none", fontSize: "13px", fontWeight: 600, minHeight: "44px", color: "#667085", mr: 4, px: 0, "&.Mui-selected": { color: "var(--primary-color)", fontWeight: 700 } },
  };

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-page-title-main" sx={{ mb: 1.5 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} className="admin-breadcrumb" sx={{ mb: 1 }}>
          <Typography className="admin-breadcrumb-active">School Settings</Typography>
        </Breadcrumbs>
      </Box>

      {/* ——— OUTER TABS: Payment | Student | Other ——— */}
      <Box sx={{ borderBottom: 1, borderColor: "#E9ECEF" }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} className="admin-tabs-main"
          sx={{ "& .MuiTabs-indicator": tabSx.indicator, "& .MuiTab-root": tabSx.tab }}>
          <Tab label="Payment" />
          <Tab label="Student" />
          <Tab label="Other" />
        </Tabs>
      </Box>

      {loading && !settings ? (
        <Box sx={{ p: 4 }}><CommonLoader /></Box>
      ) : (
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={settingsValidationSchema}
          onSubmit={handleSave}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              {/* ——— PAYMENT TAB ——— */}
              {tabValue === 0 && (
                <Box className="card-border common-card" sx={{ position: "relative", borderRadius: "12px", backgroundColor: "white", minHeight: "300px", overflow: "hidden" }}>
                  {/* Inner Sub-Tab Bar */}
                  <Box sx={{ borderBottom: "1px solid #F0F0F0", px: { xs: 2.5, sm: 4 }, backgroundColor: "#FAFAFA" }}>
                    <Tabs value={subTabValue} onChange={(_, v) => setSubTabValue(v)}
                      sx={{
                        "& .MuiTabs-indicator": { backgroundColor: "var(--primary-color)", height: "2px", borderRadius: "3px 3px 0 0" },
                        "& .MuiTab-root": { textTransform: "none", fontSize: "12.5px", fontWeight: 600, minHeight: "40px", color: "#667085", mr: 3, px: 0, "&.Mui-selected": { color: "var(--primary-color)", fontWeight: 700 } },
                        minHeight: "40px",
                      }}>
                      {SUB_TABS.map((label) => <Tab key={label} label={label} />)}
                    </Tabs>
                  </Box>

                  {/* Sub-Tab Content */}
                  <Box sx={{ p: { xs: 2.5, sm: 4 } }}>

                    {/* —— SUB-TAB 0: FEE RULES —— */}
                    {subTabValue === 0 && (
                      <>
                        <SectionHeader icon={SettingsIcon} title="Fee & Late Fine Rules" isFirst />
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 3, mb: 5 }}>
                          <Box>
                            <Typography sx={labelSx}>Enable Late Fine</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", mt: 1.5 }}>
                              <IOSSwitch checked={values.fee.enableLateFine} onChange={(e) => setFieldValue("fee.enableLateFine", e.target.checked)} disabled={!canEdit} />
                              <Typography sx={{ ml: 1.5, fontSize: "14px", color: values.fee.enableLateFine ? "success.main" : "text.secondary" }}>
                                {values.fee.enableLateFine ? "Active" : "Disabled"}
                              </Typography>
                            </Box>
                          </Box>
                          {values.fee.enableLateFine && (
                            <>
                              <Box>
                                <Typography sx={labelSx}>Fine Amount (Per Day)</Typography>
                                <TextField
                                  fullWidth
                                  type="number"
                                  name="fee.fineAmountPerDay"
                                  disabled={!canEdit}
                                  value={values.fee.fineAmountPerDay}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={touched.fee?.fineAmountPerDay && Boolean(errors.fee?.fineAmountPerDay)}
                                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: inputSx } }}
                                />
                                {touched.fee?.fineAmountPerDay && errors.fee?.fineAmountPerDay && (
                                  <FormHelperText className="error-text">
                                    {errors.fee.fineAmountPerDay as string}
                                  </FormHelperText>
                                )}
                              </Box>
                              <Box>
                                <Typography sx={labelSx}>Grace Period (Days)</Typography>
                                <TextField
                                  fullWidth
                                  type="number"
                                  name="fee.gracePeriodDays"
                                  disabled={!canEdit}
                                  value={values.fee.gracePeriodDays}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={touched.fee?.gracePeriodDays && Boolean(errors.fee?.gracePeriodDays)}
                                  slotProps={{ input: { sx: inputSx } }}
                                />
                                {touched.fee?.gracePeriodDays && errors.fee?.gracePeriodDays && (
                                  <FormHelperText className="error-text">
                                    {errors.fee.gracePeriodDays as string}
                                  </FormHelperText>
                                )}
                              </Box>
                            </>
                          )}
                        </Box>

                        <SectionHeader icon={ReceiptIcon} title="Receipt Export Template" />
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, mb: 5 }}>
                          <Box>
                            <Typography sx={labelSx}>PDF Footer Text</Typography>
                            <TextField
                              fullWidth
                              name="export.pdfFooterText"
                              disabled={!canEdit}
                              value={values.export.pdfFooterText}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.export?.pdfFooterText && Boolean(errors.export?.pdfFooterText)}
                              placeholder="Thank you for the payment."
                              slotProps={{ input: { sx: inputSx } }}
                            />
                            {touched.export?.pdfFooterText && errors.export?.pdfFooterText && (
                              <FormHelperText className="error-text">
                                {errors.export.pdfFooterText as string}
                              </FormHelperText>
                            )}
                          </Box>
                          <Box>
                            <Typography sx={labelSx}>PDF Watermark Text</Typography>
                            <TextField
                              fullWidth
                              name="export.pdfWatermark"
                              disabled={!canEdit}
                              value={values.export.pdfWatermark}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.export?.pdfWatermark && Boolean(errors.export?.pdfWatermark)}
                              placeholder="e.g. PAID or SCHOOL NAME"
                              slotProps={{ input: { sx: inputSx } }}
                            />
                            {touched.export?.pdfWatermark && errors.export?.pdfWatermark && (
                              <FormHelperText className="error-text">
                                {errors.export.pdfWatermark as string}
                              </FormHelperText>
                            )}
                          </Box>
                        </Box>

                        {canEdit && (
                          <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
                            <Button type="submit" variant="contained" className="admin-btn-theme" disabled={saving}
                              sx={{ minWidth: { xs: "100%", sm: "150px" }, height: "40px", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                              {saving ? <CircularProgress size={20} color="inherit" /> : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SaveIcon sx={{ fontSize: 18 }} />Save Changes</Box>}
                            </Button>
                          </Box>
                        )}
                      </>
                    )}

                    {/* —— SUB-TAB 1: PAYMENT METHODS —— */}
                    {subTabValue === 1 && (
                      <>
                        <SectionHeader icon={BankIcon} title="Payment Receiving Methods Configuration" isFirst />
                        <Typography sx={{ ...labelSx, mb: 1 }}>Enabled Payment Options</Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4, p: 2, border: "1px solid #eaecf0", borderRadius: "8px", backgroundColor: "#FAFAFA" }}>
                          {[{ label: "Cash", key: "cash" }, { label: "Cheque", key: "cheque" }, { label: "UPI", key: "upi" }, { label: "Bank Transfer", key: "bankTransfer" }, { label: "Online Gateway", key: "onlineGateway" }].map((item) => (
                            <Box key={item.key} sx={{ display: "flex", alignItems: "center" }}>
                              <IOSSwitch
                                checked={(values.paymentConfiguration.paymentMethods as any)[item.key]}
                                onChange={(e) => setFieldValue(`paymentConfiguration.paymentMethods.${item.key}`, e.target.checked)}
                                disabled={!canEdit}
                              />
                              <Typography sx={{ ml: 1.5, fontSize: "13px", fontWeight: 600, color: "#344054" }}>{item.label}</Typography>
                            </Box>
                          ))}
                        </Box>

                        {/* Bank Accounts Inline List */}
                        {values.paymentConfiguration.paymentMethods.bankTransfer && (
                          <Box sx={{ mb: 5 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#344054" }}>School Bank Accounts</Typography>
                            </Box>

                            <Box>
                              {values.paymentConfiguration.bankAccounts.length === 0 ? (
                                <Box sx={{ py: 4, px: 2, border: "1px dashed #eaecf0", borderRadius: "12px", textAlign: "center", backgroundColor: "#FAFAFA" }}>
                                  <Typography sx={{ fontSize: "13.5px", color: "text.secondary" }}>No bank accounts configured.</Typography>
                                </Box>
                              ) : (
                                values.paymentConfiguration.bankAccounts.map((account: any, idx: number) => {
                                  const bankAccountsTouched = (touched.paymentConfiguration?.bankAccounts) as any;
                                  const bankAccountsErrors = (errors.paymentConfiguration?.bankAccounts) as any;
                                  return (
                                    <Box
                                      key={idx}
                                      sx={{
                                        border: "1px solid #eaecf0",
                                        borderRadius: "12px",
                                        p: 3,
                                        mb: 3,
                                        backgroundColor: "#FAFAFA",
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.03)" },
                                        position: "relative",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "var(--primary-color)" }}>
                                          Bank Account #{idx + 1}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                                          <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography sx={{ mr: 1, fontSize: "12px", fontWeight: 600, color: "#667085" }}>Active</Typography>
                                            <IOSSwitch
                                              checked={account.isActive}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  const updated = values.paymentConfiguration.bankAccounts.map((acc: any, i: number) => ({
                                                    ...acc,
                                                    isActive: i === idx,
                                                  }));
                                                  setFieldValue("paymentConfiguration.bankAccounts", updated);
                                                }
                                              }}
                                              disabled={!canEdit}
                                            />
                                          </Box>
                                        </Box>
                                      </Box>

                                      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2.5}>
                                        <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                                          <Typography sx={labelSx}>Bank Name *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.bankAccounts[${idx}].bankName`}
                                            placeholder="e.g. State Bank of India"
                                            value={account.bankName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={bankAccountsTouched?.[idx]?.bankName && Boolean(bankAccountsErrors?.[idx]?.bankName)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {bankAccountsTouched?.[idx]?.bankName && bankAccountsErrors?.[idx]?.bankName && (
                                            <FormHelperText className="error-text">
                                              {bankAccountsErrors[idx].bankName as string}
                                            </FormHelperText>
                                          )}
                                        </Box>

                                        <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                                          <Typography sx={labelSx}>Account Holder Name *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.bankAccounts[${idx}].accountHolderName`}
                                            placeholder="e.g. School Public Trust"
                                            value={account.accountHolderName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={bankAccountsTouched?.[idx]?.accountHolderName && Boolean(bankAccountsErrors?.[idx]?.accountHolderName)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {bankAccountsTouched?.[idx]?.accountHolderName && bankAccountsErrors?.[idx]?.accountHolderName && (
                                            <FormHelperText className="error-text">
                                              {bankAccountsErrors[idx].accountHolderName as string}
                                            </FormHelperText>
                                          )}
                                        </Box>

                                        <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                                          <Typography sx={labelSx}>Account Number *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.bankAccounts[${idx}].accountNumber`}
                                            placeholder="Account number"
                                            value={account.accountNumber}
                                            onChange={(e) => setFieldValue(`paymentConfiguration.bankAccounts[${idx}].accountNumber`, e.target.value.replace(/\D/g, ""))}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={bankAccountsTouched?.[idx]?.accountNumber && Boolean(bankAccountsErrors?.[idx]?.accountNumber)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {bankAccountsTouched?.[idx]?.accountNumber && bankAccountsErrors?.[idx]?.accountNumber && (
                                            <FormHelperText className="error-text">
                                              {bankAccountsErrors[idx].accountNumber as string}
                                            </FormHelperText>
                                          )}
                                        </Box>

                                        <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                                          <Typography sx={labelSx}>IFSC Code *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.bankAccounts[${idx}].ifsc`}
                                            placeholder="IFSC Code"
                                            value={account.ifsc}
                                            onChange={(e) => setFieldValue(`paymentConfiguration.bankAccounts[${idx}].ifsc`, e.target.value.toUpperCase())}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={bankAccountsTouched?.[idx]?.ifsc && Boolean(bankAccountsErrors?.[idx]?.ifsc)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {bankAccountsTouched?.[idx]?.ifsc && bankAccountsErrors?.[idx]?.ifsc && (
                                            <FormHelperText className="error-text">
                                              {bankAccountsErrors[idx].ifsc as string}
                                            </FormHelperText>
                                          )}
                                        </Box>

                                        <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                                          <Typography sx={labelSx}>Branch *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.bankAccounts[${idx}].branch`}
                                            placeholder="Branch"
                                            value={account.branch}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={bankAccountsTouched?.[idx]?.branch && Boolean(bankAccountsErrors?.[idx]?.branch)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {bankAccountsTouched?.[idx]?.branch && bankAccountsErrors?.[idx]?.branch && (
                                            <FormHelperText className="error-text">
                                              {bankAccountsErrors[idx].branch as string}
                                            </FormHelperText>
                                          )}
                                        </Box>
                                      </Box>

                                      {canEdit && (idx > 0 || idx === values.paymentConfiguration.bankAccounts.length - 1) && (
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2.5 }}>
                                          {idx > 0 && (
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              size="small"
                                              onClick={() => {
                                                const updated = values.paymentConfiguration.bankAccounts.filter((_: any, i: number) => i !== idx);
                                                const wasActive = values.paymentConfiguration.bankAccounts[idx]?.isActive;
                                                if (wasActive && updated.length > 0) {
                                                  updated[0].isActive = true;
                                                }
                                                setFieldValue("paymentConfiguration.bankAccounts", updated);
                                              }}
                                              sx={{
                                                textTransform: "none",
                                                borderRadius: "8px",
                                                height: "36px",
                                                px: 2,
                                              }}
                                            >
                                              Delete
                                            </Button>
                                          )}
                                          {idx === values.paymentConfiguration.bankAccounts.length - 1 && (
                                            <Button
                                              variant="outlined"
                                              startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />}
                                              size="small"
                                              disabled={values.paymentConfiguration.bankAccounts.length >= 5}
                                              onClick={() => {
                                                setFieldValue("paymentConfiguration.bankAccounts", [
                                                  ...values.paymentConfiguration.bankAccounts,
                                                  {
                                                    bankName: "",
                                                    accountHolderName: "",
                                                    accountNumber: "",
                                                    ifsc: "",
                                                    branch: "",
                                                    isActive: false,
                                                  },
                                                ]);
                                              }}
                                              sx={{
                                                textTransform: "none",
                                                fontSize: "13px",
                                                borderRadius: "8px",
                                                borderColor: "#eaecf0",
                                                color: values.paymentConfiguration.bankAccounts.length >= 5 ? "text.disabled" : "#344054",
                                                height: "36px",
                                                px: 2,
                                                "&:hover": {
                                                  borderColor: values.paymentConfiguration.bankAccounts.length >= 5 ? "#eaecf0" : "var(--primary-color)",
                                                  color: values.paymentConfiguration.bankAccounts.length >= 5 ? "text.disabled" : "var(--primary-color)",
                                                },
                                              }}
                                            >
                                              Add Bank Account
                                            </Button>
                                          )}
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                })
                              )}
                            </Box>
                          </Box>
                        )}

                        {/* UPI Handles Inline List */}
                        {values.paymentConfiguration.paymentMethods.upi && (
                          <Box sx={{ mb: 5 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#344054" }}>School UPI Handles</Typography>
                            </Box>

                            <Box>
                              {values.paymentConfiguration.upiAccounts.length === 0 ? (
                                <Box sx={{ py: 4, px: 2, border: "1px dashed #eaecf0", borderRadius: "12px", textAlign: "center", backgroundColor: "#FAFAFA" }}>
                                  <Typography sx={{ fontSize: "13.5px", color: "text.secondary" }}>No UPI handles configured.</Typography>
                                </Box>
                              ) : (
                                values.paymentConfiguration.upiAccounts.map((upi: any, idx: number) => {
                                  const upiAccountsTouched = (touched.paymentConfiguration?.upiAccounts) as any;
                                  const upiAccountsErrors = (errors.paymentConfiguration?.upiAccounts) as any;
                                  return (
                                    <Box
                                      key={idx}
                                      sx={{
                                        border: "1px solid #eaecf0",
                                        borderRadius: "12px",
                                        p: 3,
                                        mb: 3,
                                        backgroundColor: "#FAFAFA",
                                        transition: "all 0.2s ease-in-out",
                                        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.03)" },
                                        position: "relative",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "var(--primary-color)" }}>
                                          UPI ID #{idx + 1}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                                          <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography sx={{ mr: 1, fontSize: "12px", fontWeight: 600, color: "#667085" }}>Active</Typography>
                                            <IOSSwitch
                                              checked={upi.isActive}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  const updated = values.paymentConfiguration.upiAccounts.map((item: any, i: number) => ({
                                                    ...item,
                                                    isActive: i === idx,
                                                  }));
                                                  setFieldValue("paymentConfiguration.upiAccounts", updated);
                                                }
                                              }}
                                              disabled={!canEdit}
                                            />
                                          </Box>
                                        </Box>
                                      </Box>

                                      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2.5}>
                                        <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                                          <Typography sx={labelSx}>UPI ID *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.upiAccounts[${idx}].upiId`}
                                            placeholder="e.g. trust@okhdfcbank"
                                            value={upi.upiId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={upiAccountsTouched?.[idx]?.upiId && Boolean(upiAccountsErrors?.[idx]?.upiId)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {upiAccountsTouched?.[idx]?.upiId && upiAccountsErrors?.[idx]?.upiId && (
                                            <FormHelperText className="error-text">
                                              {upiAccountsErrors[idx].upiId as string}
                                            </FormHelperText>
                                          )}
                                        </Box>

                                        <Box gridColumn={{ xs: "span 12", sm: "span 6" }}>
                                          <Typography sx={labelSx}>Account Holder Name *</Typography>
                                          <TextField
                                            fullWidth
                                            size="small"
                                            name={`paymentConfiguration.upiAccounts[${idx}].accountHolder`}
                                            placeholder="e.g. School Trust"
                                            value={upi.accountHolder}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!canEdit}
                                            error={upiAccountsTouched?.[idx]?.accountHolder && Boolean(upiAccountsErrors?.[idx]?.accountHolder)}
                                            slotProps={{ input: { sx: inputSx } }}
                                          />
                                          {upiAccountsTouched?.[idx]?.accountHolder && upiAccountsErrors?.[idx]?.accountHolder && (
                                            <FormHelperText className="error-text">
                                              {upiAccountsErrors[idx].accountHolder as string}
                                            </FormHelperText>
                                          )}
                                        </Box>

                                        <Box gridColumn="span 12">
                                          <Typography sx={labelSx}>UPI QR Code Image (Optional)</Typography>
                                          <Box sx={{ position: "relative", width: "120px", height: "120px", mt: 1 }}>
                                            <Button
                                              variant="outlined"
                                              component="label"
                                              disabled={!canEdit}
                                              sx={{
                                                width: "120px",
                                                height: "120px",
                                                borderRadius: "12px",
                                                border: "1.5px dashed var(--primary-color, #5c1a1a)",
                                                bgcolor: "transparent",
                                                p: 0,
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                "&:hover": { bgcolor: "transparent" },
                                                cursor: !canEdit ? "default" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                              }}
                                            >
                                              {upi.qrCode ? (
                                                <img
                                                  src={upi.qrCode}
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                  }}
                                                  alt="QR Code"
                                                />
                                              ) : (
                                                <Typography
                                                  sx={{
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    color: "var(--primary-color, #5c1a1a)",
                                                    textAlign: "center",
                                                    px: 1,
                                                  }}
                                                >
                                                  UPLOAD QR
                                                </Typography>
                                              )}
                                              <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                disabled={!canEdit}
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("QR Code image must be less than 2MB.");
                                                    return;
                                                  }
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    setFieldValue(`paymentConfiguration.upiAccounts[${idx}].qrCode`, reader.result as string);
                                                    toast.success("QR Code uploaded!");
                                                  };
                                                  reader.readAsDataURL(file);
                                                }}
                                              />
                                            </Button>
                                            {upi.qrCode && canEdit && (
                                              <IconButton
                                                size="small"
                                                onClick={() => {
                                                  setFieldValue(`paymentConfiguration.upiAccounts[${idx}].qrCode`, "");
                                                }}
                                                sx={{
                                                  position: "absolute",
                                                  top: -8,
                                                  right: -8,
                                                  p: "2px",
                                                  bgcolor: "#ef4444",
                                                  color: "white",
                                                  boxShadow: 2,
                                                  zIndex: 10,
                                                  "&:hover": { bgcolor: "#dc2626" },
                                                }}
                                              >
                                                <CloseIcon sx={{ fontSize: 14 }} />
                                              </IconButton>
                                            )}
                                          </Box>
                                        </Box>
                                      </Box>
                                      {canEdit && (idx > 0 || idx === values.paymentConfiguration.upiAccounts.length - 1) && (
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2.5 }}>
                                          {idx > 0 && (
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              size="small"
                                              onClick={() => {
                                                const updated = values.paymentConfiguration.upiAccounts.filter((_: any, i: number) => i !== idx);
                                                const wasActive = values.paymentConfiguration.upiAccounts[idx]?.isActive;
                                                if (wasActive && updated.length > 0) {
                                                  updated[0].isActive = true;
                                                }
                                                setFieldValue("paymentConfiguration.upiAccounts", updated);
                                              }}
                                              sx={{
                                                textTransform: "none",
                                                borderRadius: "8px",
                                                height: "36px",
                                                px: 2,
                                              }}
                                            >
                                              Delete
                                            </Button>
                                          )}
                                          {idx === values.paymentConfiguration.upiAccounts.length - 1 && (
                                            <Button
                                              variant="outlined"
                                              startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />}
                                              size="small"
                                              disabled={values.paymentConfiguration.upiAccounts.length >= 5}
                                              onClick={() => {
                                                setFieldValue("paymentConfiguration.upiAccounts", [
                                                  ...values.paymentConfiguration.upiAccounts,
                                                  {
                                                    upiId: "",
                                                    accountHolder: "",
                                                    qrCode: "",
                                                    isActive: false,
                                                  },
                                                ]);
                                              }}
                                              sx={{
                                                textTransform: "none",
                                                fontSize: "13px",
                                                borderRadius: "8px",
                                                borderColor: "#eaecf0",
                                                color: values.paymentConfiguration.upiAccounts.length >= 5 ? "text.disabled" : "#344054",
                                                height: "36px",
                                                px: 2,
                                                "&:hover": {
                                                  borderColor: values.paymentConfiguration.upiAccounts.length >= 5 ? "#eaecf0" : "var(--primary-color)",
                                                  color: values.paymentConfiguration.upiAccounts.length >= 5 ? "text.disabled" : "var(--primary-color)",
                                                },
                                              }}
                                            >
                                              Add UPI ID
                                            </Button>
                                          )}
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                })
                              )}
                            </Box>
                          </Box>
                        )}

                        {canEdit && (
                          <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
                            <Button type="submit" variant="contained" className="admin-btn-theme" disabled={saving}
                              sx={{ minWidth: { xs: "100%", sm: "150px" }, height: "40px", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                              {saving ? <CircularProgress size={20} color="inherit" /> : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SaveIcon sx={{ fontSize: 18 }} />Save Changes</Box>}
                            </Button>
                          </Box>
                        )}
                      </>
                    )}

                    {/* —— SUB-TAB 2: PAYMENT GATEWAY —— */}
                    {subTabValue === 2 && (
                      <>
                        <SectionHeader icon={BankIcon} title="Online Payment Gateway (Razorpay Route)" isFirst />
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4, p: 2, border: "1px solid #eaecf0", borderRadius: "8px", backgroundColor: "#FAFAFA" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <IOSSwitch
                              checked={values.paymentConfiguration.paymentMethods.onlineGateway}
                              onChange={(e) => setFieldValue("paymentConfiguration.paymentMethods.onlineGateway", e.target.checked)}
                              disabled={!canEdit}
                            />
                            <Typography sx={{ ml: 1.5, fontSize: "13px", fontWeight: 600, color: "#344054" }}>Enable Online Gateway (Razorpay)</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#344054" }}>Razorpay Linked Bank Accounts</Typography>
                          </Box>
                          <Box className="brand-table-main page-table-main">
                            <TableContainer component={Paper} className="table-container" sx={{ boxShadow: "none" }}>
                              <Table className="table">
                                <TableHead className="table-head">
                                  <TableRow className="table-row">
                                    <TableCell className="table-th">Bank Name</TableCell>
                                    <TableCell className="table-th">Account Holder</TableCell>
                                    <TableCell className="table-th">Account No.</TableCell>
                                    <TableCell className="table-th">IFSC</TableCell>
                                    <TableCell className="table-th">Razorpay Link</TableCell>
                                    <TableCell className="table-th">Active</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody className="table-body">
                                  {values.paymentConfiguration.bankAccounts.length === 0 ? (
                                    <TableRow className="table-row"><TableCell colSpan={6} align="center" className="table-td" sx={{ py: 3, color: "text.secondary" }}>No bank accounts yet. Add one from the Payment Methods sub-tab.</TableCell></TableRow>
                                  ) : (
                                    values.paymentConfiguration.bankAccounts.map((account: any, idx: number) => (
                                      <TableRow key={idx} className="table-row" sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                                        <TableCell className="table-td">{account.bankName || <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>Empty</Typography>}</TableCell>
                                        <TableCell className="table-td">{account.accountHolderName || <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>Empty</Typography>}</TableCell>
                                        <TableCell className="table-td" sx={{ fontWeight: 600, color: "#101828" }}>{account.accountNumber || <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>Empty</Typography>}</TableCell>
                                        <TableCell className="table-td">{account.ifsc || <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>Empty</Typography>}</TableCell>
                                        <TableCell className="table-td">
                                          {account.isRazorpayLinked ? (
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                              <Typography sx={{ fontSize: "12px", color: "success.main", fontWeight: 600 }}>Linked ✓</Typography>
                                              <Typography sx={{ fontSize: "11px", color: "text.secondary", fontFamily: "monospace" }}>{account.razorpayAccountId}</Typography>
                                            </Box>
                                          ) : account._id ? (
                                            <Button variant="contained" size="small" disabled={linkingBankId !== null} onClick={() => handleLinkRazorpay(account._id)}
                                              sx={{ textTransform: "none", fontSize: "11px", borderRadius: "6px", px: 1.5, py: 0.5, backgroundColor: "var(--primary-color, #5c1a1a)", color: "white", boxShadow: "none", "&:hover": { backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.9)", boxShadow: "none" } }}>
                                              {linkingBankId === account._id ? <CircularProgress size={14} color="inherit" /> : "Link Razorpay"}
                                            </Button>
                                          ) : (
                                            <Typography sx={{ fontSize: "12px", color: "text.secondary", fontStyle: "italic" }}>Save settings first</Typography>
                                          )}
                                        </TableCell>
                                        <TableCell className="table-td">
                                          <IOSSwitch
                                            checked={account.isActive}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const updated = values.paymentConfiguration.bankAccounts.map((acc: any, i: number) => ({
                                                  ...acc,
                                                  isActive: i === idx,
                                                }));
                                                setFieldValue("paymentConfiguration.bankAccounts", updated);
                                              } else {
                                                setFieldValue(`paymentConfiguration.bankAccounts[${idx}].isActive`, false);
                                              }
                                            }}
                                            disabled={!canEdit}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Box>

                        {canEdit && (
                          <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
                            <Button type="submit" variant="contained" className="admin-btn-theme" disabled={saving}
                              sx={{ minWidth: { xs: "100%", sm: "150px" }, height: "40px", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                              {saving ? <CircularProgress size={20} color="inherit" /> : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SaveIcon sx={{ fontSize: 18 }} />Save Changes</Box>}
                            </Button>
                          </Box>
                        )}
                      </>
                    )}

                  </Box>
                </Box>
              )}

              {/* ——— STUDENT TAB ——— */}
              {tabValue === 1 && (
                <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: "12px", backgroundColor: "white", minHeight: "300px" }}>
                  <SectionHeader icon={SettingsIcon} title="Admission Settings" isFirst />
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, mb: 5 }}>
                    <Box>
                      <Typography sx={labelSx}>Online Admission Settings</Typography>
                      <Typography sx={{ fontSize: "13px", color: "text.secondary", mb: 2 }}>
                        Configure user portal options. Note: The Admission Inquiry form is always available on the user portal.
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          checked={values.admission.enableOnlineAdmission}
                          onChange={(e) => setFieldValue("admission.enableOnlineAdmission", e.target.checked)}
                          disabled={!canEdit}
                          sx={{
                            color: "var(--primary-color)",
                            "&.Mui-checked": {
                              color: "var(--primary-color)",
                            },
                            p: 0,
                          }}
                        />
                        <Typography sx={{ ml: 1.5, fontSize: "14px", fontWeight: 500, color: "#344054" }}>
                          Show Admission Option (Allow direct admission forms)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {canEdit && (
                    <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
                      <Button type="submit" variant="contained" className="admin-btn-theme" disabled={saving}
                        sx={{ minWidth: { xs: "100%", sm: "150px" }, height: "40px", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                        {saving ? <CircularProgress size={20} color="inherit" /> : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SaveIcon sx={{ fontSize: 18 }} />Save Changes</Box>}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* ——— OTHER TAB ——— */}
              {tabValue === 2 && (
                <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: "12px", backgroundColor: "white", minHeight: "400px" }}>
                  <SectionHeader icon={ReceiptIcon} title="System & Background Reports" isFirst />
                  <Box sx={{ mb: 5 }}>
                    <Typography sx={{ fontSize: "13.5px", color: "text.secondary", mb: 2.5 }}>
                      Generate comprehensive background reports. The reports will be compiled as Excel files and sent to your email.
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start", mb: 3 }}>
                      <Box sx={{ minWidth: { xs: "100%", sm: "300px" } }}>
                        <Typography sx={labelSx}>Notification Email Address</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Leave blank for registered admin email"
                          value={reportEmail}
                          onChange={(e) => setReportEmail(e.target.value)}
                          sx={inputSx}
                        />
                        <FormHelperText sx={{ mt: 0.5 }}>
                          Optional. The report download link will be emailed to this address.
                        </FormHelperText>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleQueueReport("fee")}
                        disabled={feeReportLoading}
                        sx={{
                          height: "40px",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "var(--primary-color)",
                          color: "var(--primary-color)",
                          "&:hover": {
                            borderColor: "var(--primary-color)",
                            backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.04)"
                          }
                        }}
                      >
                        {feeReportLoading ? <CircularProgress size={20} color="inherit" /> : "Queue Fee Report"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleQueueReport("due")}
                        disabled={dueReportLoading}
                        sx={{
                          height: "40px",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "var(--primary-color)",
                          color: "var(--primary-color)",
                          "&:hover": {
                            borderColor: "var(--primary-color)",
                            backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.04)"
                          }
                        }}
                      >
                        {dueReportLoading ? <CircularProgress size={20} color="inherit" /> : "Queue Due Report"}
                      </Button>
                    </Box>
                  </Box>

                  <SectionHeader icon={SettingsIcon} title="Database Maintenance & Archiving" />
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: "13.5px", color: "text.secondary", mb: 2.5 }}>
                      Trigger a manual archiving run to move fee collections older than 3 years to the archive collections. This drops active collections and keeps the main database performant.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleRunArchive}
                      disabled={archiveLoading}
                      sx={{
                        height: "40px",
                        borderRadius: "8px",
                        background: "var(--theme-gradient, var(--primary-color)) !important",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "none"
                      }}
                    >
                      {archiveLoading ? <CircularProgress size={20} color="inherit" /> : "Run Archiving Process"}
                    </Button>
                  </Box>
                </Box>
              )}
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default Settings;
