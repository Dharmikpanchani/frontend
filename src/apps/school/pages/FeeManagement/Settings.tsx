import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Breadcrumbs,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  AccountBalance as BankIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  fetchSchoolSettings,
  updateSchoolSettingsAsync,
} from "@/redux/slices/feeSlice";
import { linkRazorpayRoute } from "@/api/services/fee.service";
import type { RootState, AppDispatch } from "@/redux/Store";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import Svg from "@/assets/Svg";
import { CommonLoader } from "@/apps/school/component/schoolCommon/loader/Loader";

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const { settings, loading } = useSelector((state: RootState) => state.FeeReducer);

  const canEdit = hasPermission(schoolAdminPermission.school_settings.update);
  const [tabValue, setTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);

  const [formData, setFormData] = useState({
    admission: { enableOnlineAdmission: true },
    fee: { enableLateFine: false, fineAmountPerDay: 0, gracePeriodDays: 0 },
    export: { pdfFooterText: "Thank you. This is a computer-generated receipt.", pdfWatermark: "" },
    paymentGateway: { isActive: false },
    paymentConfiguration: {
      bankAccounts: [] as any[],
      upiAccounts: [] as any[],
      paymentMethods: {
        cash: true,
        cheque: true,
        upi: true,
        bankTransfer: true,
        onlineGateway: false,
      },
    },
  });

  const [saving, setSaving] = useState(false);

  // Dialog States
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    isActive: true,
  });

  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [upiForm, setUpiForm] = useState({
    upiId: "",
    accountHolder: "",
    qrCode: "", // Store base64 QR Code string
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchSchoolSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        admission: {
          enableOnlineAdmission: settings.admission?.enableOnlineAdmission ?? true,
        },
        fee: {
          enableLateFine: settings.fee?.enableLateFine || false,
          fineAmountPerDay: settings.fee?.fineAmountPerDay || 0,
          gracePeriodDays: settings.fee?.gracePeriodDays || 0,
        },
        export: {
          pdfFooterText: settings.export?.pdfFooterText || "Thank you. This is a computer-generated receipt.",
          pdfWatermark: settings.export?.pdfWatermark || "",
        },
        paymentGateway: { isActive: settings.paymentGateway?.isActive || false },
        paymentConfiguration: {
          bankAccounts: settings.paymentConfiguration?.bankAccounts || [],
          upiAccounts: settings.paymentConfiguration?.upiAccounts || [],
          paymentMethods: settings.paymentConfiguration?.paymentMethods || {
            cash: true,
            cheque: true,
            upi: true,
            bankTransfer: true,
            onlineGateway: false,
          },
        },
      });
    }
  }, [settings]);

  const handleChange = (section: string, field: string, value: any) => {
    if (!canEdit) return;
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleNestedMethodChange = (methodField: string, value: boolean) => {
    if (!canEdit) return;
    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: {
        ...prev.paymentConfiguration,
        paymentMethods: {
          ...prev.paymentConfiguration.paymentMethods,
          [methodField]: value,
        },
      },
    }));
  };

  const [linkingBankId, setLinkingBankId] = useState<string | null>(null);

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

  // Add Bank Account
  const handleAddBankAccount = () => {
    if (!bankForm.accountHolderName.trim() || !bankForm.bankName.trim() || !bankForm.accountNumber.trim() || !bankForm.ifsc.trim() || !bankForm.branch.trim()) {
      toast.error("Please fill in all bank account details.");
      return;
    }

    const accountNumberRegex = /^\d{9,18}$/;
    const ifscRegex = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;

    if (!accountNumberRegex.test(bankForm.accountNumber)) {
      toast.error("Account number must be between 9 and 18 digits.");
      return;
    }

    if (!ifscRegex.test(bankForm.ifsc)) {
      toast.error("IFSC code must be a valid 11-digit alphanumeric code matching standard format (e.g. SBIN0001234).");
      return;
    }

    if (bankForm.isActive) {
      const alreadyActive = formData.paymentConfiguration.bankAccounts.some((acc: any) => acc.isActive);
      if (alreadyActive) {
        toast.error("Only one bank account can be active at a time. Please deactivate the active account first.");
        return;
      }
    }

    const normalizedBankForm = {
      ...bankForm,
      ifsc: bankForm.ifsc.toUpperCase(),
    };

    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: {
        ...prev.paymentConfiguration,
        bankAccounts: [...prev.paymentConfiguration.bankAccounts, normalizedBankForm],
      },
    }));
    setBankForm({
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
      isActive: true,
    });
    setBankDialogOpen(false);
    toast.success("Bank account added!");
  };

  const handleToggleBankActive = (index: number) => {
    if (!canEdit) return;
    const updated = [...formData.paymentConfiguration.bankAccounts];
    const isActivating = !updated[index].isActive;

    if (isActivating) {
      const alreadyActive = updated.some((acc: any, idx: number) => idx !== index && acc.isActive);
      if (alreadyActive) {
        toast.error("Only one bank account can be active at a time. Please deactivate the active account first.");
        return;
      }
    }

    updated[index] = { ...updated[index], isActive: isActivating };
    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: { ...prev.paymentConfiguration, bankAccounts: updated },
    }));
  };

  const handleDeleteBank = (index: number) => {
    if (!canEdit) return;
    const updated = formData.paymentConfiguration.bankAccounts.filter((_, i) => i !== index);
    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: { ...prev.paymentConfiguration, bankAccounts: updated },
    }));
  };

  // Add UPI Account
  const handleAddUpiAccount = () => {
    if (!upiForm.upiId || !upiForm.accountHolder) {
      toast.error("Please fill in UPI ID and Account Holder.");
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: {
        ...prev.paymentConfiguration,
        upiAccounts: [...prev.paymentConfiguration.upiAccounts, upiForm],
      },
    }));
    setUpiForm({
      upiId: "",
      accountHolder: "",
      qrCode: "",
      isActive: true,
    });
    setUpiDialogOpen(false);
    toast.success("UPI ID added!");
  };

  const handleToggleUpiActive = (index: number) => {
    if (!canEdit) return;
    const updated = [...formData.paymentConfiguration.upiAccounts];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: { ...prev.paymentConfiguration, upiAccounts: updated },
    }));
  };

  const handleDeleteUpi = (index: number) => {
    if (!canEdit) return;
    const updated = formData.paymentConfiguration.upiAccounts.filter((_, i) => i !== index);
    setFormData((prev: any) => ({
      ...prev,
      paymentConfiguration: { ...prev.paymentConfiguration, upiAccounts: updated },
    }));
  };

  // Handle QR code image file upload and convert to base64
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("QR Code image must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUpiForm((prev) => ({ ...prev, qrCode: reader.result as string }));
      toast.success("QR Code uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await dispatch(updateSchoolSettingsAsync(formData)).unwrap();
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

      {/* ——— PAYMENT TAB ——— */}
      {tabValue === 0 && (
        <Box className="card-border common-card" sx={{ position: "relative", borderRadius: "12px", backgroundColor: "white", minHeight: "300px", overflow: "hidden" }}>
          {loading && !settings ? (
            <Box sx={{ p: { xs: 2.5, sm: 4 } }}><CommonLoader /></Box>
          ) : (
            <>
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
                          <IOSSwitch checked={formData.fee.enableLateFine} onChange={(e) => handleChange("fee", "enableLateFine", e.target.checked)} disabled={!canEdit} />
                          <Typography sx={{ ml: 1.5, fontSize: "14px", color: formData.fee.enableLateFine ? "success.main" : "text.secondary" }}>
                            {formData.fee.enableLateFine ? "Active" : "Disabled"}
                          </Typography>
                        </Box>
                      </Box>
                      {formData.fee.enableLateFine && (
                        <>
                          <Box>
                            <Typography sx={labelSx}>Fine Amount (Per Day)</Typography>
                            <TextField fullWidth type="number" disabled={!canEdit} value={formData.fee.fineAmountPerDay}
                              onChange={(e) => handleChange("fee", "fineAmountPerDay", Number(e.target.value))}
                              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: inputSx } }} />
                          </Box>
                          <Box>
                            <Typography sx={labelSx}>Grace Period (Days)</Typography>
                            <TextField fullWidth type="number" disabled={!canEdit} value={formData.fee.gracePeriodDays}
                              onChange={(e) => handleChange("fee", "gracePeriodDays", Number(e.target.value))}
                              slotProps={{ input: { sx: inputSx } }} />
                          </Box>
                        </>
                      )}
                    </Box>

                    <SectionHeader icon={ReceiptIcon} title="Receipt Export Template" />
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, mb: 5 }}>
                      <Box>
                        <Typography sx={labelSx}>PDF Footer Text</Typography>
                        <TextField fullWidth disabled={!canEdit} value={formData.export.pdfFooterText}
                          onChange={(e) => handleChange("export", "pdfFooterText", e.target.value)}
                          placeholder="Thank you for the payment." slotProps={{ input: { sx: inputSx } }} />
                      </Box>
                      <Box>
                        <Typography sx={labelSx}>PDF Watermark Text</Typography>
                        <TextField fullWidth disabled={!canEdit} value={formData.export.pdfWatermark}
                          onChange={(e) => handleChange("export", "pdfWatermark", e.target.value)}
                          placeholder="e.g. PAID or SCHOOL NAME" slotProps={{ input: { sx: inputSx } }} />
                      </Box>
                    </Box>

                    {canEdit && (
                      <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" className="admin-btn-theme" onClick={handleSave} disabled={saving}
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
                          <IOSSwitch checked={(formData.paymentConfiguration.paymentMethods as any)[item.key]} onChange={(e) => handleNestedMethodChange(item.key, e.target.checked)} disabled={!canEdit} />
                          <Typography sx={{ ml: 1.5, fontSize: "13px", fontWeight: 600, color: "#344054" }}>{item.label}</Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Bank Accounts */}
                    {formData.paymentConfiguration.paymentMethods.bankTransfer && (
                      <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#344054" }}>School Bank Accounts</Typography>
                          {canEdit && (
                            <Button variant="outlined" startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />} size="small" onClick={() => setBankDialogOpen(true)}
                              sx={{ textTransform: "none", fontSize: "13px", borderRadius: "8px", borderColor: "#eaecf0", color: "#344054", height: "36px", px: 2, "&:hover": { borderColor: "var(--primary-color)", color: "var(--primary-color)" } }}>
                              Add Bank Account
                            </Button>
                          )}
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
                                  <TableCell className="table-th">Branch</TableCell>
                                  <TableCell className="table-th">Status</TableCell>
                                  {canEdit && <TableCell align="right" className="table-th">Actions</TableCell>}
                                </TableRow>
                              </TableHead>
                              <TableBody className="table-body">
                                {formData.paymentConfiguration.bankAccounts.length === 0 ? (
                                  <TableRow className="table-row"><TableCell colSpan={7} align="center" className="table-td" sx={{ py: 3, color: "text.secondary" }}>No bank accounts configured.</TableCell></TableRow>
                                ) : (
                                  formData.paymentConfiguration.bankAccounts.map((account, idx) => (
                                    <TableRow key={idx} className="table-row" sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                                      <TableCell className="table-td">{account.bankName}</TableCell>
                                      <TableCell className="table-td">{account.accountHolderName}</TableCell>
                                      <TableCell className="table-td" sx={{ fontWeight: 600, color: "#101828" }}>{account.accountNumber}</TableCell>
                                      <TableCell className="table-td">{account.ifsc}</TableCell>
                                      <TableCell className="table-td">{account.branch}</TableCell>
                                      <TableCell className="table-td"><IOSSwitch checked={account.isActive} onChange={() => handleToggleBankActive(idx)} disabled={!canEdit} /></TableCell>
                                      {canEdit && <TableCell align="right" className="table-td"><Tooltip title="Delete" arrow placement="bottom"><Button className="admin-table-data-btn admin-table-delete-btn" onClick={() => handleDeleteBank(idx)}><img src={Svg.trash} className="admin-icon" alt="Trash" /></Button></Tooltip></TableCell>}
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Box>
                    )}

                    {/* UPI Accounts */}
                    {formData.paymentConfiguration.paymentMethods.upi && (
                      <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#344054" }}>School UPI Handles</Typography>
                          {canEdit && (
                            <Button variant="outlined" startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />} size="small" onClick={() => setUpiDialogOpen(true)}
                              sx={{ textTransform: "none", fontSize: "13px", borderRadius: "8px", borderColor: "#eaecf0", color: "#344054", height: "36px", px: 2, "&:hover": { borderColor: "var(--primary-color)", color: "var(--primary-color)" } }}>
                              Add UPI ID
                            </Button>
                          )}
                        </Box>
                        <Box className="brand-table-main page-table-main">
                          <TableContainer component={Paper} className="table-container" sx={{ boxShadow: "none" }}>
                            <Table className="table">
                              <TableHead className="table-head">
                                <TableRow className="table-row">
                                  <TableCell className="table-th">UPI ID</TableCell>
                                  <TableCell className="table-th">Account Holder</TableCell>
                                  <TableCell className="table-th">QR Code</TableCell>
                                  <TableCell className="table-th">Status</TableCell>
                                  {canEdit && <TableCell align="right" className="table-th">Actions</TableCell>}
                                </TableRow>
                              </TableHead>
                              <TableBody className="table-body">
                                {formData.paymentConfiguration.upiAccounts.length === 0 ? (
                                  <TableRow className="table-row"><TableCell colSpan={5} align="center" className="table-td" sx={{ py: 3, color: "text.secondary" }}>No UPI accounts configured.</TableCell></TableRow>
                                ) : (
                                  formData.paymentConfiguration.upiAccounts.map((upi, idx) => (
                                    <TableRow key={idx} className="table-row" sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                                      <TableCell className="table-td" sx={{ fontWeight: 600, color: "#101828" }}>{upi.upiId}</TableCell>
                                      <TableCell className="table-td">{upi.accountHolder}</TableCell>
                                      <TableCell className="table-td">
                                        {upi.qrCode ? (
                                          <Tooltip title="View QR Code">
                                            <Box component="img" src={upi.qrCode} alt="UPI QR" sx={{ width: 40, height: 40, objectFit: "contain", border: "1px solid #eaecf0", borderRadius: "4px", cursor: "pointer", "&:hover": { transform: "scale(1.05)", borderColor: "var(--primary-color)" } }}
                                              onClick={() => { const w = window.open(); w?.document.write(`<img src="${upi.qrCode}" style="max-width:100%;height:auto;" />`); }} />
                                          </Tooltip>
                                        ) : <Typography variant="caption" color="text.secondary">No QR</Typography>}
                                      </TableCell>
                                      <TableCell className="table-td"><IOSSwitch checked={upi.isActive} onChange={() => handleToggleUpiActive(idx)} disabled={!canEdit} /></TableCell>
                                      {canEdit && <TableCell align="right" className="table-td"><Tooltip title="Delete" arrow placement="bottom"><Button className="admin-table-data-btn admin-table-delete-btn" onClick={() => handleDeleteUpi(idx)}><img src={Svg.trash} className="admin-icon" alt="Trash" /></Button></Tooltip></TableCell>}
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Box>
                    )}

                    {canEdit && (
                      <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" className="admin-btn-theme" onClick={handleSave} disabled={saving}
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
                        <IOSSwitch checked={(formData.paymentConfiguration.paymentMethods as any).onlineGateway} onChange={(e) => handleNestedMethodChange("onlineGateway", e.target.checked)} disabled={!canEdit} />
                        <Typography sx={{ ml: 1.5, fontSize: "13px", fontWeight: 600, color: "#344054" }}>Enable Online Gateway (Razorpay)</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#344054" }}>Razorpay Linked Bank Accounts</Typography>
                        {canEdit && (
                          <Button variant="outlined" startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />} size="small" onClick={() => setBankDialogOpen(true)}
                            sx={{ textTransform: "none", fontSize: "13px", borderRadius: "8px", borderColor: "#eaecf0", color: "#344054", height: "36px", px: 2, "&:hover": { borderColor: "var(--primary-color)", color: "var(--primary-color)" } }}>
                            Add Bank Account
                          </Button>
                        )}
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
                                {canEdit && <TableCell align="right" className="table-th">Actions</TableCell>}
                              </TableRow>
                            </TableHead>
                            <TableBody className="table-body">
                              {formData.paymentConfiguration.bankAccounts.length === 0 ? (
                                <TableRow className="table-row"><TableCell colSpan={7} align="center" className="table-td" sx={{ py: 3, color: "text.secondary" }}>No bank accounts yet. Add one from the Payment Methods sub-tab.</TableCell></TableRow>
                              ) : (
                                formData.paymentConfiguration.bankAccounts.map((account, idx) => (
                                  <TableRow key={idx} className="table-row" sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                                    <TableCell className="table-td">{account.bankName}</TableCell>
                                    <TableCell className="table-td">{account.accountHolderName}</TableCell>
                                    <TableCell className="table-td" sx={{ fontWeight: 600, color: "#101828" }}>{account.accountNumber}</TableCell>
                                    <TableCell className="table-td">{account.ifsc}</TableCell>
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
                                    <TableCell className="table-td"><IOSSwitch checked={account.isActive} onChange={() => handleToggleBankActive(idx)} disabled={!canEdit} /></TableCell>
                                    {canEdit && <TableCell align="right" className="table-td"><Tooltip title="Delete" arrow placement="bottom"><Button className="admin-table-data-btn admin-table-delete-btn" onClick={() => handleDeleteBank(idx)}><img src={Svg.trash} className="admin-icon" alt="Trash" /></Button></Tooltip></TableCell>}
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
                        <Button variant="contained" className="admin-btn-theme" onClick={handleSave} disabled={saving}
                          sx={{ minWidth: { xs: "100%", sm: "150px" }, height: "40px", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                          {saving ? <CircularProgress size={20} color="inherit" /> : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SaveIcon sx={{ fontSize: 18 }} />Save Changes</Box>}
                        </Button>
                      </Box>
                    )}
                  </>
                )}

              </Box>
            </>
          )}

          {/* Dialogs — always mounted inside Payment card */}
          <Dialog open={bankDialogOpen} onClose={() => setBankDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: "16px" }}>Add School Bank Account</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <Box><Typography sx={labelSx}>Bank Name *</Typography><TextField fullWidth size="small" placeholder="e.g. State Bank of India" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} slotProps={{ input: { sx: inputSx } }} /></Box>
                <Box><Typography sx={labelSx}>Account Holder Name *</Typography><TextField fullWidth size="small" placeholder="e.g. School Public Trust" value={bankForm.accountHolderName} onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })} slotProps={{ input: { sx: inputSx } }} /></Box>
                <Box><Typography sx={labelSx}>Account Number *</Typography><TextField fullWidth size="small" placeholder="Account number" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} slotProps={{ input: { sx: inputSx } }} /></Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box><Typography sx={labelSx}>IFSC Code *</Typography><TextField fullWidth size="small" placeholder="IFSC" value={bankForm.ifsc} onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })} slotProps={{ input: { sx: inputSx } }} /></Box>
                  <Box><Typography sx={labelSx}>Branch *</Typography><TextField fullWidth size="small" placeholder="Branch" value={bankForm.branch} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} slotProps={{ input: { sx: inputSx } }} /></Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
              <Button onClick={() => setBankDialogOpen(false)} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#D0D5DD", color: "#344054", fontWeight: 600, px: 2.5, py: 1, height: "38px", "&:hover": { backgroundColor: "#F9FAFB" } }}>Cancel</Button>
              <Button onClick={handleAddBankAccount} variant="contained" size="small" className="admin-btn-theme" sx={{ textTransform: "none", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", fontWeight: 600, px: 2.5, py: 1, height: "38px", boxShadow: "none" }}>Add Account</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={upiDialogOpen} onClose={() => setUpiDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: "16px" }}>Add School UPI ID</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <Box><Typography sx={labelSx}>UPI ID *</Typography><TextField fullWidth size="small" placeholder="e.g. trust@okhdfcbank" value={upiForm.upiId} onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })} slotProps={{ input: { sx: inputSx } }} /></Box>
                <Box><Typography sx={labelSx}>Account Holder Name *</Typography><TextField fullWidth size="small" placeholder="e.g. School Trust" value={upiForm.accountHolder} onChange={(e) => setUpiForm({ ...upiForm, accountHolder: e.target.value })} slotProps={{ input: { sx: inputSx } }} /></Box>
                <Box>
                  <Typography sx={labelSx}>UPI QR Code Image (Optional)</Typography>
                  <Button variant="outlined" component="label" startIcon={<UploadIcon />} fullWidth sx={{ textTransform: "none", borderStyle: "dashed", borderWidth: "1.5px", borderRadius: "8px", py: 1.5 }}>
                    Upload QR Image<input type="file" hidden accept="image/*" onChange={handleQrUpload} />
                  </Button>
                  {upiForm.qrCode && <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}><Box component="img" src={upiForm.qrCode} alt="QR Preview" sx={{ width: 120, height: 120, objectFit: "contain", border: "1px solid #eaecf0", borderRadius: "8px" }} /></Box>}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
              <Button onClick={() => setUpiDialogOpen(false)} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#D0D5DD", color: "#344054", fontWeight: 600, px: 2.5, py: 1, height: "38px", "&:hover": { backgroundColor: "#F9FAFB" } }}>Cancel</Button>
              <Button onClick={handleAddUpiAccount} variant="contained" size="small" className="admin-btn-theme" sx={{ textTransform: "none", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", fontWeight: 600, px: 2.5, py: 1, height: "38px", boxShadow: "none" }}>Add UPI ID</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* ——— STUDENT TAB ——— */}
      {tabValue === 1 && (
        <Box className="card-border common-card" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: "12px", backgroundColor: "white", minHeight: "300px" }}>
          <SectionHeader icon={SettingsIcon} title="Admission Settings" isFirst />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3, mb: 5 }}>
            <Box>
              <Typography sx={labelSx}>Enable Online Admission (Full Form)</Typography>
              <Typography sx={{ fontSize: "13px", color: "text.secondary", mb: 2 }}>
                If enabled, parents will fill the complete admission form. If disabled, they will only see a short inquiry form.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IOSSwitch checked={formData.admission.enableOnlineAdmission} onChange={(e) => handleChange("admission", "enableOnlineAdmission", e.target.checked)} disabled={!canEdit} />
                <Typography sx={{ ml: 1.5, fontSize: "14px", color: formData.admission.enableOnlineAdmission ? "success.main" : "text.secondary" }}>
                  {formData.admission.enableOnlineAdmission ? "Active (Direct Admission)" : "Disabled (Inquiry Only)"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {canEdit && (
            <Box sx={{ pt: 4, borderTop: "1px solid #F0F0F0", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" className="admin-btn-theme" onClick={handleSave} disabled={saving}
                sx={{ minWidth: { xs: "100%", sm: "150px" }, height: "40px", borderRadius: "8px", background: "var(--theme-gradient, var(--primary-color)) !important", textTransform: "none", fontWeight: 600, boxShadow: "none" }}>
                {saving ? <CircularProgress size={20} color="inherit" /> : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SaveIcon sx={{ fontSize: 18 }} />Save Changes</Box>}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* ——— OTHER TAB ——— */}
      {tabValue === 2 && (
        <Box className="card-border common-card" sx={{ borderRadius: "12px", backgroundColor: "white", minHeight: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2.5 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "16px", backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SettingsIcon sx={{ fontSize: 36, color: "var(--primary-color, #5c1a1a)", opacity: 0.5 }} />
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#1f2937", fontFamily: "var(--font-family, 'Poppins', sans-serif)" }}>Coming Soon</Typography>
          <Typography sx={{ fontSize: "13.5px", color: "#667085", textAlign: "center", maxWidth: 340, lineHeight: 1.7 }}>
            More configuration options will be available here in a future update. Stay tuned!
          </Typography>
          <Box sx={{ mt: 1, px: 2.5, py: 1, borderRadius: "20px", backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.06)", border: "1px dashed rgba(var(--primary-color-rgb, 92, 26, 26), 0.2)" }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--primary-color, #5c1a1a)", letterSpacing: "0.5px" }}>UNDER DEVELOPMENT</Typography>
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default Settings;

