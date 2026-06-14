import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Paper,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  InputAdornment,
  debounce,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Payment as PaymentIcon,
  CheckCircleOutline as ClearIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  DataObject as LimitIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchFeeCollections, clearFeePayment } from "@/redux/slices/feeSlice";
import { getClasses } from "@/redux/slices/classSlice";
import type { RootState, AppDispatch } from "@/redux/Store";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { inputSx, labelSx } from "@/utils/styles/commonSx";
import Pagination from "@/apps/common/pagination/Pagination";
import Loader from "@/apps/common/loader/Loader";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Filter from "@/apps/common/filter/Filter";

// ─── Export limit quick-pick presets ─────────────────────────────
const LIMIT_PRESETS = [100, 500, 1000, 2000, 5000];

// ─── Formik + Yup validation schema for export limit ─────────────
const exportLimitSchema = Yup.object({
  limit: Yup.number()
    .typeError("Please enter a valid number")
    .integer("Must be a whole number")
    .min(1, "Minimum 1 record")
    .max(5000, "Maximum 5000 records allowed")
    .required("Record limit is required"),
});

const FeeCollection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const { collections, loading } = useSelector((state: RootState) => state.FeeReducer);
  const { allClasses } = useSelector((state: RootState) => state.ClassReducer);

  const canCollect = hasPermission(schoolAdminPermission.fee_collection.create);
  const canExport = hasPermission(schoolAdminPermission.fee_collection.export);
  // ✅ Fixed: was using || operator which always evaluates left side only
  const canUpdateClearance = hasPermission(schoolAdminPermission.fee_collection.update);

  // Pagination & standard filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);

  const [searchNameValue, setSearchNameValue] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    classId: "",
    paymentMethod: "",
    status: "",
    receiptNumber: "",
    paymentDateStart: "",
    paymentDateEnd: "",
  });

  // Clearance Modal State
  const [clearanceOpen, setClearanceOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [clearanceStatus, setClearanceStatus] = useState<"PAID" | "FAILED">("PAID");
  const [clearanceRemarks, setClearanceRemarks] = useState("");
  const [clearanceLoading, setClearanceLoading] = useState(false);

  // Export Menu State
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  // ✅ Export Limit Modal State
  const [exportLimitOpen, setExportLimitOpen] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<"excel" | "pdf" | "print" | null>(null);

  useEffect(() => {
    dispatch(getClasses({ type: "filter" }) as any);
  }, [dispatch]);

  const loadCollections = async (searchVal?: string, filters?: any) => {
    const activeFilters = filters || filterValues;
    const activeSearch = searchVal !== undefined ? searchVal : searchNameValue;
    try {
      const res: any = await dispatch(
        fetchFeeCollections({
          page: page + 1,
          limit: rowsPerPage,
          classId: activeFilters.classId || undefined,
          search: activeSearch || undefined,
          status: activeFilters.status || undefined,
          paymentMethod: activeFilters.paymentMethod || undefined,
          startDate: activeFilters.paymentDateStart || undefined,
          endDate: activeFilters.paymentDateEnd || undefined,
          receiptNumber: activeFilters.receiptNumber || undefined,
        })
      ).unwrap();
      if (res?.data) {
        setTotalDocs(res.data.totalDocs || res.data.length || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCollections();
  }, [page, rowsPerPage, filterValues]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(0);
      loadCollections(query);
    }, 1000),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchNameValue(val);
    debouncedSearch(val);
  };

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    setPage(0);
    loadCollections(searchNameValue, values);
    setOpenFilter(false);
  };

  const handleResetFilters = () => {
    const resetValues = {
      classId: "",
      paymentMethod: "",
      status: "",
      receiptNumber: "",
      paymentDateStart: "",
      paymentDateEnd: "",
    };
    setFilterValues(resetValues);
    setPage(0);
    loadCollections(searchNameValue, resetValues);
    setOpenFilter(false);
  };

  const filterFields: any[] = [
    {
      type: "searchbaseSelect",
      name: "classId",
      label: "Class",
      placeholder: "Select Class",
      options: allClasses || [],
      getOptionLabel: (option: any) => option.name || "",
      getOptionValue: (option: any) => option._id,
    },
    {
      type: "searchbaseSelect",
      name: "paymentMethod",
      label: "Payment Method",
      placeholder: "Select Method",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "Cheque", value: "Cheque" },
        { label: "DD", value: "DD" },
        { label: "UPI", value: "UPI" },
        { label: "Bank Transfer / NEFT", value: "NEFT" },
        { label: "Online Gateway", value: "Online" },
      ],
    },
    {
      type: "searchbaseSelect",
      name: "status",
      label: "Status",
      placeholder: "Select Status",
      options: [
        { label: "PAID", value: "PAID" },
        { label: "PENDING", value: "PENDING" },
        { label: "PARTIAL", value: "PARTIAL" },
        { label: "FAILED", value: "FAILED" },
        { label: "OVERDUE", value: "OVERDUE" },
        { label: "REFUNDED", value: "REFUNDED" },
      ],
    },
    {
      type: "inputSelect",
      name: "receiptNumber",
      label: "Receipt No",
      placeholder: "e.g. RCP-2026-0001",
    },
    {
      type: "dateRange",
      name: "paymentDate",
      label: "Payment Date Range",
    },
  ];

  // ─── Clearance ────────────────────────────────────────────────
  const handleClearanceSubmit = async () => {
    if (!selectedReceipt) return;
    setClearanceLoading(true);
    try {
      await dispatch(
        clearFeePayment({
          id: selectedReceipt._id,
          status: clearanceStatus,
          remarks: clearanceRemarks,
        })
      ).unwrap();
      toast.success(`Clearance status updated to ${clearanceStatus}!`);
      setClearanceOpen(false);
      setSelectedReceipt(null);
      setClearanceRemarks("");
      loadCollections();
    } catch (err: any) {
      toast.error(err || "Failed to clear cheque / transfer");
    } finally {
      setClearanceLoading(false);
    }
  };

  // ─── Receipt Export ────────────────────────────────────────────
  const handleExportReceipt = async (id: string) => {
    if (!canExport) return;
    try {
      const { exportFeeReceipt } = await import("@/api/services/fee.service");
      const response: any = await exportFeeReceipt(id, "pdf");
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to export receipt");
    }
  };

  // ─── Export Limit Modal — Formik ──────────────────────────────
  const exportFormik = useFormik({
    initialValues: { limit: 1000 },
    validationSchema: exportLimitSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!pendingExportFormat) return;
      await handleExportCollections(pendingExportFormat, values.limit);
      setExportLimitOpen(false);
      setSubmitting(false);
    },
  });

  // Open limit modal when user clicks export format
  const handleExportMenuClick = (format: "excel" | "pdf" | "print") => {
    setExportAnchorEl(null);
    setPendingExportFormat(format);
    exportFormik.resetForm({ values: { limit: 1000 } });
    setExportLimitOpen(true);
  };

  // ─── Actual Export ────────────────────────────────────────────
  const handleExportCollections = async (format: "excel" | "pdf" | "print", limit: number) => {
    if (!canExport) return;
    setExporting(true);
    try {
      const { exportFeeCollections } = await import("@/api/services/fee.service");
      const response: any = await exportFeeCollections({
        format,
        limit,
        classId: filterValues.classId || undefined,
        status: filterValues.status || undefined,
        paymentMethod: filterValues.paymentMethod || undefined,
        startDate: filterValues.paymentDateStart || undefined,
        endDate: filterValues.paymentDateEnd || undefined,
        receiptNumber: filterValues.receiptNumber || undefined,
      });

      if (format === "excel" || format === "pdf") {
        const fileType =
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf";
        const extension = format === "excel" ? "xlsx" : "html";
        const url = window.URL.createObjectURL(new Blob([response.data], { type: fileType }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `fee_collection_report.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const w = window.open();
        w?.document.write(response.data);
        w?.document.close();
      }
      toast.success(`Report exported successfully! (${limit} records)`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export report.");
    } finally {
      setExporting(false);
    }
  };

  // ─── Status badge color ────────────────────────────────────────
  const getStatusStyle = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      PAID:     { bg: "#ECFDF3", color: "#027A48" },
      FAILED:   { bg: "#FEF3F2", color: "#B42318" },
      PENDING:  { bg: "#FFFAEB", color: "#B54708" },
      PARTIAL:  { bg: "#FFF4ED", color: "#B93815" },
      OVERDUE:  { bg: "#FEF3F2", color: "#B42318" },
      WAIVED:   { bg: "#F0F9FF", color: "#026AA2" },
      REFUNDED: { bg: "#F0F4FF", color: "#3538CD" },
    };
    return map[status] || { bg: "#F2F4F7", color: "#344054" };
  };

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Fee Collections & Receipts
        </Typography>
        <Box className="admin-flex-end">
          <Box className="admin-search-main">
            <Box className="admin-search-box">
              <Box className="admin-form-group">
                <TextField
                  value={searchNameValue}
                  fullWidth
                  id="search"
                  className="admin-form-control"
                  placeholder="Search"
                  onChange={handleSearchChange}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <SearchIcon
                  sx={{ color: "var(--primary-color)", fontSize: "20px" }}
                  className="school-admin-search-grey-img admin-icon"
                />
              </Box>
            </Box>
          </Box>

          <Box className="admin-filter-btn-main">
            <Button
              className="admin-btn-theme"
              onClick={() => setOpenFilter(true)}
              sx={{ ml: 1, minWidth: "45px", p: "0 12px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FilterIcon sx={{ color: "var(--button-text, #fff)", fontSize: "18px" }} />
            </Button>
          </Box>

          {canExport && (
            <>
              <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                disabled={exporting}
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#eaecf0", color: "#344054", height: "40px", ml: 1 }}
              >
                Export Report
              </Button>
              <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                <MenuItem onClick={() => handleExportMenuClick("excel")} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <ExcelIcon sx={{ fontSize: "18px", color: "#12B76A" }} /> Export Excel
                </MenuItem>
                <MenuItem onClick={() => handleExportMenuClick("pdf")} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PdfIcon sx={{ fontSize: "18px", color: "#F04438" }} /> Export PDF
                </MenuItem>
                <MenuItem onClick={() => handleExportMenuClick("print")} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PrintIcon sx={{ fontSize: "18px", color: "#667085" }} /> Print View
                </MenuItem>
              </Menu>
            </>
          )}

          {canCollect && (
            <Box className="admin-add-user-btn-main" sx={{ ml: 1 }}>
              <Button
                variant="contained"
                startIcon={<PaymentIcon />}
                className="admin-btn-theme"
                onClick={() => toast("Select a student from Students list to collect fee.")}
              >
                Collect Fee
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Table grid */}
      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container">
            <Table aria-label="fee collections table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th">Receipt No</TableCell>
                  <TableCell className="table-th">Student</TableCell>
                  <TableCell className="table-th">Category</TableCell>
                  <TableCell className="table-th">Method</TableCell>
                  <TableCell className="table-th">Amount Paid</TableCell>
                  <TableCell className="table-th">Date</TableCell>
                  <TableCell className="table-th">Collected By</TableCell>
                  <TableCell className="table-th">Status</TableCell>
                  <TableCell align="right" className="table-th">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {loading && collections.length === 0 ? (
                  <Loader colSpan={9} />
                ) : collections.length === 0 ? (
                  <DataNotFound text="No fee collections found." colSpan={9} />
                ) : (
                  collections.map((row: any) => {
                    const isClearancePending =
                      ["Cheque", "DD", "NEFT", "RTGS", "Bank Transfer"].includes(row.paymentMethod) &&
                      row.status === "PENDING";
                    const statusStyle = getStatusStyle(row.status);
                    return (
                      <TableRow
                        key={row._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                        }}
                      >
                        <TableCell className="table-td" sx={{ color: "#101828", fontWeight: 600 }}>
                          {row.receiptNumber}
                        </TableCell>
                        <TableCell className="table-td">
                          <Tooltip title={`${row.studentId?.fullName || "N/A"} (Adm: ${row.studentId?.admissionNumber || "N/A"})`} arrow placement="top">
                            <Box sx={{ cursor: "pointer" }}>
                              <Typography className="admin-table-data-text" sx={{ fontSize: "14px", fontWeight: 500, color: "#101828" }}>
                                {row.studentId?.fullName}
                              </Typography>
                              <Typography sx={{ fontSize: "12px", color: "#667085" }}>
                                Adm: {row.studentId?.admissionNumber}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>
                          <Tooltip title={row.feeCategoryId?.name || "N/A"} arrow placement="top">
                            <Typography className="admin-table-data-text" sx={{ color: "#475467", cursor: "pointer" }}>
                              {row.feeCategoryId?.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>{row.paymentMethod}</TableCell>
                        <TableCell className="table-td" sx={{ color: "#027A48", fontWeight: 600 }}>
                          ₹{row.amountPaid?.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>
                          {new Date(row.paymentDate).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>
                          <Tooltip title={row.collectedBy?.name || "System"} arrow placement="top">
                            <Typography className="admin-table-data-text" sx={{ color: "#475467", cursor: "pointer" }}>
                              {row.collectedBy?.name || "System"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="table-td">
                          <Box
                            sx={{
                              display: "inline-flex",
                              px: 1.5,
                              py: 0.5,
                              borderRadius: "16px",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                            }}
                          >
                            {row.status}
                          </Box>
                        </TableCell>
                        <TableCell className="table-td" align="right">
                          <Box className="admin-table-data-btn-flex" sx={{ justifyContent: "flex-end", gap: 0.5 }}>
                            {isClearancePending && canUpdateClearance && (
                              <Tooltip title="Verify / Clear Payment">
                                <Button
                                  className="admin-table-data-btn admin-table-view-btn"
                                  onClick={() => {
                                    setSelectedReceipt(row);
                                    setClearanceOpen(true);
                                  }}
                                >
                                  <ClearIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                            )}
                            {canExport && (
                              <Tooltip title="Download Receipt" arrow placement="bottom">
                                <Button
                                  className="admin-table-data-btn admin-table-edit-btn"
                                  onClick={() => handleExportReceipt(row._id)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className="admin-pagination-main">
          {totalDocs ? (
            <Pagination
              count={totalDocs}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          ) : null}
        </Box>
      </Box>

      {/* ✅ Export Limit Modal (Formik) */}
      <Dialog
        open={exportLimitOpen}
        onClose={() => !exportFormik.isSubmitting && setExportLimitOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "16px", pb: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LimitIcon sx={{ color: "var(--primary-color)", fontSize: "22px" }} />
            Export Record Limit
          </Box>
        </DialogTitle>

        <form onSubmit={exportFormik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

              {/* Info banner */}
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "#F0F9FF",
                  borderRadius: "8px",
                  border: "1px solid #B9E6FE",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                <Typography sx={{ fontSize: "12px", color: "#026AA2", fontWeight: 600 }}>
                  Format: {pendingExportFormat?.toUpperCase()}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#475467" }}>
                  Large exports may take a moment. Maximum 5,000 records allowed per export.
                </Typography>
              </Box>

              {/* Quick preset chips */}
              <Box>
                <Typography sx={{ ...labelSx, mb: 1 }}>Quick Select</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {LIMIT_PRESETS.map((preset) => (
                    <Chip
                      key={preset}
                      label={preset.toLocaleString()}
                      size="small"
                      clickable
                      onClick={() => exportFormik.setFieldValue("limit", preset)}
                      sx={{
                        fontWeight: 600,
                        fontSize: "12px",
                        borderRadius: "6px",
                        backgroundColor:
                          exportFormik.values.limit === preset
                            ? "var(--primary-color)"
                            : "#F2F4F7",
                        color:
                          exportFormik.values.limit === preset ? "#fff" : "#344054",
                        border: exportFormik.values.limit === preset
                          ? "1px solid var(--primary-color)"
                          : "1px solid #D0D5DD",
                        "&:hover": {
                          backgroundColor:
                            exportFormik.values.limit === preset
                              ? "var(--primary-color)"
                              : "#E4E7EC",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Custom limit input */}
              <Box>
                <Typography sx={{ ...labelSx, mb: 0.75 }}>
                  Or enter custom limit <span style={{ color: "#F04438" }}>*</span>
                </Typography>
                <TextField
                  id="export-limit-input"
                  name="limit"
                  type="number"
                  fullWidth
                  size="small"
                  placeholder="e.g. 1000"
                  value={exportFormik.values.limit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    // Real-time clamp on change: don't allow > 5000
                    if (!isNaN(val) && val > 5000) {
                      exportFormik.setFieldValue("limit", 5000);
                    } else {
                      exportFormik.handleChange(e);
                    }
                  }}
                  onBlur={exportFormik.handleBlur}
                  error={exportFormik.touched.limit && Boolean(exportFormik.errors.limit)}
                  helperText={
                    exportFormik.touched.limit && exportFormik.errors.limit
                      ? String(exportFormik.errors.limit)
                      : "Min: 1 — Max: 5,000"
                  }
                  inputProps={{ min: 1, max: 5000 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontSize: "12px", color: "#667085" }}>records</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ...inputSx }}
                />
              </Box>

            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => setExportLimitOpen(false)}
              variant="outlined"
              size="small"
              disabled={exportFormik.isSubmitting}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              className="admin-btn-theme"
              disabled={exportFormik.isSubmitting || exporting}
              startIcon={
                exportFormik.isSubmitting || exporting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <DownloadIcon fontSize="small" />
                )
              }
              sx={{ textTransform: "none", borderRadius: "8px", background: "var(--primary-color) !important" }}
            >
              {exportFormik.isSubmitting || exporting ? "Exporting..." : `Export ${pendingExportFormat?.toUpperCase()}`}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Manual Clearance Dialog */}
      <Dialog open={clearanceOpen} onClose={() => setClearanceOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "16px" }}>Clearance Verification</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ p: 2, backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid #eaecf0" }}>
                <Typography sx={{ fontSize: "13px", color: "#667085" }}>
                  <strong>Receipt No:</strong> {selectedReceipt.receiptNumber}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#667085" }}>
                  <strong>Student:</strong> {selectedReceipt.studentId?.fullName}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#667085" }}>
                  <strong>Amount Paid:</strong> ₹{selectedReceipt.amountPaid?.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#667085" }}>
                  <strong>Method:</strong> {selectedReceipt.paymentMethod}
                </Typography>
                {selectedReceipt.chequeNumber && (
                  <Typography sx={{ fontSize: "13px", color: "#667085" }}>
                    <strong>Cheque/DD Number:</strong> {selectedReceipt.chequeNumber}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography sx={{ ...labelSx, mb: 1 }}>Clearance Verdict *</Typography>
                <RadioGroup row value={clearanceStatus} onChange={(e) => setClearanceStatus(e.target.value as any)}>
                  <FormControlLabel value="PAID" control={<Radio size="small" />} label="Cleared (Success)" />
                  <FormControlLabel value="FAILED" control={<Radio size="small" />} label="Rejected (Bounced/Failed)" />
                </RadioGroup>
              </Box>

              <Box>
                <Typography sx={labelSx}>Clearance Remarks</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="e.g. Cleared via clearing house / cheque bounced due to insufficient funds"
                  value={clearanceRemarks}
                  onChange={(e) => setClearanceRemarks(e.target.value)}
                  sx={{
                    ...inputSx,
                    height: "auto",
                    "&.MuiOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiInputBase-root": {
                      height: "auto !important",
                      padding: "0px !important",
                    },
                    "& .MuiOutlinedInput-input": {
                      height: "auto !important",
                      minHeight: "60px !important",
                      padding: "8px 12px !important",
                      display: "block !important",
                      alignItems: "initial !important",
                      boxSizing: "border-box !important",
                    },
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setClearanceOpen(false)} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: "8px" }}>
            Cancel
          </Button>
          <Button
            onClick={handleClearanceSubmit}
            variant="contained"
            size="small"
            className="admin-btn-theme"
            disabled={clearanceLoading}
            sx={{ textTransform: "none", borderRadius: "8px", background: "var(--primary-color) !important" }}
          >
            {clearanceLoading ? <CircularProgress size={16} color="inherit" /> : "Confirm Clearance"}
          </Button>
        </DialogActions>
      </Dialog>

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Collection Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilters}
        initialValues={filterValues}
      />
    </Box>
  );
};

export default FeeCollection;
