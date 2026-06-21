import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  debounce,
  IconButton,
  Divider,
  Menu,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  FileDownload as ExcelIcon,
} from "@mui/icons-material";
import { fetchDeveloperTransactions } from "@/redux/slices/developerTransactionSlice";
import { getAllPlans } from "@/redux/slices/planSlice";
import { getAllSchools } from "@/redux/slices/schoolSlice";
import { exportDeveloperTransactions } from "@/api/services/fee.service";
import DataNotFound from "../../component/developerCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import Filter from "@/apps/common/filter/Filter";
import moment from "moment";
import type { RootState } from "@/redux/Store";
import toast from "react-hot-toast";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function TransactionsList() {
  const dispatch = useDispatch();
  const { transactions, total, loading } = useSelector(
    (state: RootState) => state.DeveloperTransactionReducer
  );
  const { schools } = useSelector((state: RootState) => state.SchoolReducer);
  const { plans } = useSelector((state: RootState) => state.PlanReducer);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [exportingFormat, setExportingFormat] = useState<
    "excel" | "print" | null
  >(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const exporting = exportingFormat !== null;

  const [copiedSchoolId, setCopiedSchoolId] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState<boolean>(false);

  const handleOpenDetailsModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedTransaction(null);
    setOpenDetailsModal(false);
  };

  const handleCopySchoolCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSchoolId(id);
    setTimeout(() => setCopiedSchoolId(null), 2000);
  };

  const handleCopyTxId = (id: string, txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const getPlanBadgeStyle = (planName: string) => {
    const name = planName?.toLowerCase() || "";
    if (name.includes("free") || name.includes("trial")) {
      return { bg: "#f3f4f6", text: "#4b5563", border: "#e5e7eb" };
    }
    if (
      name.includes("premium") ||
      name.includes("advanced") ||
      name.includes("higher")
    ) {
      return {
        bg: "rgba(139, 92, 246, 0.1)",
        text: "#7c3aed",
        border: "rgba(139, 92, 246, 0.2)",
      };
    }
    if (name.includes("enterprise") || name.includes("secondary")) {
      return {
        bg: "rgba(59, 130, 246, 0.1)",
        text: "#2563eb",
        border: "rgba(59, 130, 246, 0.2)",
      };
    }
    return {
      bg: "rgba(16, 185, 129, 0.1)",
      text: "#059669",
      border: "rgba(16, 185, 129, 0.2)",
    };
  };

  const [openRangeModal, setOpenRangeModal] = useState<boolean>(false);
  const [pendingFormat, setPendingFormat] = useState<
    "excel" | "print" | null
  >(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const generateSlots = (totalCount: number) => {
    if (!totalCount) return [];
    const slots = [];
    const slotSize = 1000;
    const numSlots = Math.ceil(totalCount / slotSize);
    for (let i = 0; i < numSlots; i++) {
      const start = i * slotSize + 1;
      const end = Math.min((i + 1) * slotSize, totalCount);
      slots.push({
        label: `${start} to ${end}`,
        offset: i * slotSize,
        limit: end - start + 1,
        start,
        end,
      });
    }
    return slots;
  };

  const getModalHeaderDetails = () => {
    switch (pendingFormat) {
      case "excel":
        return {
          title: "Export Report to Excel",
          icon: <ExcelIcon sx={{ color: "#12B76A", fontSize: "24px" }} />,
          description: "Generate and download the transactions report in Microsoft Excel (.xlsx) format.",
        };
      case "print":
        return {
          title: "Print Report View",
          icon: <PrintIcon sx={{ color: "#667085", fontSize: "24px" }} />,
          description: "Open the printer-friendly transactions report view.",
        };
      default:
        return {
          title: "Export Report",
          icon: <DownloadIcon sx={{ color: "var(--primary-color)", fontSize: "24px" }} />,
          description: "Select record range slot to export.",
        };
    }
  };

  const handleExportClick = (format: "excel" | "print") => {
    setPendingFormat(format);
    const slots = generateSlots(total);
    if (slots.length > 0) {
      setSelectedSlot(slots[0]);
    } else {
      setSelectedSlot(null);
    }
    setOpenRangeModal(true);
  };

  const handleConfirmRangeExport = () => {
    setOpenRangeModal(false);
    if (pendingFormat && selectedSlot) {
      handleExport(pendingFormat, selectedSlot.limit, selectedSlot.offset);
    }
  };

  const [filterValues, setFilterValues] = useState({
    status: "",
    schoolId: "",
    planId: "",
    dateStart: "",
    dateEnd: "",
  });

  const fetchTransactionsData = (searchVal?: string, filters?: any) => {
    const activeFilters = filters || filterValues;
    dispatch(
      fetchDeveloperTransactions({
        page: currentPage + 1,
        perPage: rowsPerPage,
        search: searchVal !== undefined ? searchVal : searchQuery,
        status: activeFilters.status,
        schoolId: activeFilters.schoolId,
        planId: activeFilters.planId,
        startDate: activeFilters.dateStart
          ? moment(activeFilters.dateStart).toISOString()
          : "",
        endDate: activeFilters.dateEnd
          ? moment(activeFilters.dateEnd).toISOString()
          : "",
      }) as any
    );
  };

  useEffect(() => {
    fetchTransactionsData();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    // Load schools & plans for filter dropdown options
    dispatch(getAllSchools({ page: 1, perPage: 100 }) as any);
    dispatch(getAllPlans({ page: 1, perPage: 100, search: "" }) as any);
  }, [dispatch]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    setCurrentPage(0);
    fetchTransactionsData(searchQuery, values);
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    const resetValues = {
      status: "",
      schoolId: "",
      planId: "",
      dateStart: "",
      dateEnd: "",
    };
    setFilterValues(resetValues);
    setCurrentPage(0);
    fetchTransactionsData(searchQuery, resetValues);
    setOpenFilter(false);
  };

  const debouncedSearch = useCallback(
    debounce((query?: string) => {
      setCurrentPage(0);
      fetchTransactionsData(query);
    }, 1000),
    [filterValues, currentPage, rowsPerPage]
  );

  const handleExport = async (
    format: "excel" | "print",
    limit?: number,
    offset?: number
  ) => {
    try {
      setExportingFormat(format);
      const params = {
        search: searchQuery,
        status: filterValues.status,
        schoolId: filterValues.schoolId,
        planId: filterValues.planId,
        startDate: filterValues.dateStart
          ? moment(filterValues.dateStart).format("YYYY-MM-DD")
          : "",
        endDate: filterValues.dateEnd
          ? moment(filterValues.dateEnd).format("YYYY-MM-DD")
          : "",
        format,
        limit,
        offset,
      };

      const response: any = await exportDeveloperTransactions(params);
      const data = response?.data || response;

      if (format === "print") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(data as any);
          printWindow.document.close();
          // Wait for styling/scripts to render if necessary
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          toast.error("Popup blocked! Please allow popups for printing.");
        }
      } else {
        const blob = new Blob([data as any], {
          type:
            format === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : format === "pdf"
              ? "application/pdf"
              : "text/html; charset=utf-8",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `SaaS Transactions Report_${moment().format("DD-MM-YY")}.${
            format === "excel" ? "xlsx" : "html"
          }`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        toast.success(`Report exported successfully in ${format.toUpperCase()} format.`);
      }
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export transactions");
    } finally {
      setExportingFormat(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "rgba(76, 175, 80, 0.1)", text: "#4caf50" };
      case "pending":
        return { bg: "rgba(255, 152, 0, 0.1)", text: "#ff9800" };
      case "failed":
        return { bg: "rgba(244, 67, 54, 0.1)", text: "#f44336" };
      case "refunded":
        return { bg: "rgba(33, 150, 243, 0.1)", text: "#2196f3" };
      case "expired":
        return { bg: "rgba(158, 158, 158, 0.1)", text: "#9e9e9e" };
      default:
        return { bg: "rgba(0, 0, 0, 0.05)", text: "#666" };
    }
  };

  const filterFields: any[] = [
    {
      type: "searchbaseSelect",
      name: "schoolId",
      label: "School",
      placeholder: "Select School",
      options: schools || [],
      getOptionLabel: (option: any) => option.schoolName || "",
      getOptionValue: (option: any) => option._id,
    },
    {
      type: "searchbaseSelect",
      name: "planId",
      label: "Plan",
      placeholder: "Select Plan",
      options: plans || [],
      getOptionLabel: (option: any) => option.planName || "",
      getOptionValue: (option: any) => option._id,
    },
    {
      type: "searchbaseSelect",
      name: "status",
      label: "Status",
      placeholder: "Select Status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Pending", value: "Pending" },
        { label: "Failed", value: "Failed" },
        { label: "Expired", value: "Expired" },
        { label: "Refunded", value: "Refunded" },
      ],
    },
    {
      type: "dateRange",
      name: "date",
      label: "Date Range",
      disableFuture: true,
    },
  ];

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          SaaS Billing Transactions
        </Typography>
        <Box className="admin-flex-end">
          <Box className="admin-search-main">
            <Box className="admin-search-box">
              <Box className="admin-form-group">
                <TextField
                  value={searchQuery}
                  fullWidth
                  id="search"
                  className="admin-form-control"
                  placeholder="Search by School or Tx ID"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
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
            <Tooltip title="Filter List">
              <Button
                className="admin-btn-theme"
                onClick={() => setOpenFilter(true)}
                sx={{
                  ml: 1,
                  minWidth: "45px",
                  p: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FilterIcon
                  sx={{ color: "var(--button-text, #fff)", fontSize: "18px" }}
                />
              </Button>
            </Tooltip>
          </Box>

          {transactions?.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={14} /> : <DownloadIcon sx={{ fontSize: "16px !important" }} />}
                disabled={exporting}
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                sx={{
                  textTransform: "none",
                  borderRadius: "6px !important",
                  borderColor: "#eaecf0",
                  color: "#344054",
                  height: "36px !important",
                  fontSize: "12px !important",
                  ml: 1,
                  backgroundColor: "#fff",
                  "&:hover": {
                    borderColor: "#d0d5dd",
                    backgroundColor: "#f9fafb",
                  }
                }}
              >
                Export Report
              </Button>
              <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExportClick("excel"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <ExcelIcon sx={{ fontSize: "18px", color: "#12B76A" }} /> Export Excel
                </MenuItem>
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExportClick("print"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PrintIcon sx={{ fontSize: "18px", color: "#667085" }} /> Print View
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer
            component={Paper}
            className="table-container"
            sx={{ boxShadow: "none" }}
          >
            <Table aria-label="transactions table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th" sx={{ fontWeight: 700 }}>
                    School Details
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Plan Purchased
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="right">
                    Amount Paid
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Billing Cycle
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Transaction ID
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Method
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Date
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Status
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  transactions.length ? (
                    transactions.map((data: any) => {
                      const color = getStatusColor(data.status);
                      const badgeStyle = getPlanBadgeStyle(data.planId?.planName);
                      return (
                        <TableRow
                          key={data._id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": { bgcolor: "#f9fafb" },
                          }}
                        >
                          <TableCell className="table-td">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                src={`${import.meta.env.VITE_BASE_URL_IMAGE}/${data.schoolId?.logo}`}
                                variant="circular"
                                sx={{
                                  width: 40,
                                  height: 40,
                                  border: "1px solid #e5e7eb",
                                  bgcolor: "var(--primary-color)",
                                  color: "#fff",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                }}
                              >
                                {data.schoolId?.schoolName?.[0] || "S"}
                              </Avatar>
                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#111827",
                                    mb: 0.2,
                                  }}
                                >
                                  {data.schoolId?.schoolName || "N/A"}
                                </Typography>
                                {data.schoolId?.schoolCode && (
                                  <Tooltip
                                    title={
                                      copiedSchoolId === data._id
                                        ? "Copied!"
                                        : "Click to copy code"
                                    }
                                    arrow
                                    placement="top"
                                  >
                                    <Box
                                      onClick={() =>
                                        handleCopySchoolCode(
                                          data._id,
                                          data.schoolId.schoolCode
                                        )
                                      }
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        cursor: "pointer",
                                        width: "fit-content",
                                        "&:hover .school-code-text": {
                                          color: "#111827",
                                        },
                                        "&:hover .copy-icon-img": { opacity: 1 },
                                      }}
                                    >
                                      <Typography
                                        className="school-code-text"
                                        sx={{
                                          fontSize: "11px",
                                          color: "#6b7280",
                                          transition: "color 0.2s",
                                        }}
                                      >
                                        #{data.schoolId.schoolCode}
                                      </Typography>
                                      <CopyIcon
                                        className="copy-icon-img"
                                        sx={{
                                          fontSize: 11,
                                          color:
                                            copiedSchoolId === data._id
                                              ? "#4caf50"
                                              : "#9ca3af",
                                          opacity: copiedSchoolId === data._id ? 1 : 0.6,
                                          transition: "all 0.2s",
                                        }}
                                      />
                                    </Box>
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Box
                              sx={{
                                display: "inline-flex",
                                px: 1.2,
                                py: 0.4,
                                borderRadius: "6px",
                                bgcolor: badgeStyle.bg,
                                border: `1px solid ${badgeStyle.border}`,
                                color: badgeStyle.text,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                {data.planId?.planName || "N/A"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell className="table-td" align="right">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "var(--primary-color)",
                              }}
                            >
                              ₹{data.totalAmount?.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: "#9ca3af",
                              }}
                            >
                              Base: ₹{data.amount} + Tax: ₹{data.taxAmount}
                            </Typography>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Typography
                              sx={{
                                fontSize: "13px",
                                textTransform: "capitalize",
                              }}
                            >
                              {data.billingCycle === "6month"
                                ? "6 Months"
                                : data.billingCycle || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            {data.transactionId || data.razorpayPaymentId ? (
                              <Tooltip
                                title={
                                  copiedTxId === data._id
                                    ? "Copied!"
                                    : "Click to copy Tx ID"
                                }
                                arrow
                                placement="top"
                              >
                                <Box
                                  onClick={() =>
                                    handleCopyTxId(
                                      data._id,
                                      data.transactionId || data.razorpayPaymentId
                                    )
                                  }
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    cursor: "pointer",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: "4px",
                                    transition: "background-color 0.2s",
                                    "&:hover": {
                                      bgcolor: "#f3f4f6",
                                    },
                                    "&:hover .tx-copy-icon": {
                                      opacity: 1,
                                    },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "12px",
                                      fontFamily: "monospace",
                                      color: "#374151",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {data.transactionId || data.razorpayPaymentId}
                                  </Typography>
                                  <CopyIcon
                                    className="tx-copy-icon"
                                    sx={{
                                      fontSize: 11,
                                      color:
                                        copiedTxId === data._id
                                          ? "#4caf50"
                                          : "#9ca3af",
                                      opacity: copiedTxId === data._id ? 1 : 0,
                                      transition: "all 0.2s",
                                    }}
                                  />
                                </Box>
                              </Tooltip>
                            ) : (
                              <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Typography sx={{ fontSize: "13px" }}>
                              {data.method || "Online"}
                            </Typography>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Typography sx={{ fontSize: "13px" }}>
                              {data.createdAt
                                ? moment(data.createdAt).format("DD MMM YYYY")
                                : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1.2,
                                py: 0.3,
                                borderRadius: "20px",
                                backgroundColor: color.bg,
                                color: color.text,
                                width: "fit-content",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: "currentColor",
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                {data.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Tooltip title="View Roadmap Details" arrow placement="top">
                              <IconButton
                                onClick={() => handleOpenDetailsModal(data)}
                                size="small"
                                sx={{
                                  color: "var(--primary-color)",
                                  "&:hover": {
                                    bgcolor: "rgba(139, 92, 246, 0.08)",
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <DataNotFound colSpan={9} />
                  )
                ) : (
                  <Loader colSpan={9} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className="admin-pagination-main">
          {total ? (
            <Pagination
              page={currentPage}
              rowsPerPage={rowsPerPage}
              setPage={setCurrentPage}
              setRowsPerPage={setRowsPerPage}
              count={total}
            />
          ) : null}
        </Box>
      </Box>

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Transaction Filters"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <Dialog
        open={openRangeModal}
        onClose={() => setOpenRangeModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "var(--primary-color)",
            borderBottom: "1px solid #f3f4f6",
            bgcolor: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {getModalHeaderDetails().icon}
          <span>{getModalHeaderDetails().title}</span>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Typography
            variant="body2"
            sx={{ mb: 2, color: "#4b5563", lineHeight: 1.6 }}
          >
            {getModalHeaderDetails().description} Exporting a large number of records may cause browser performance issues or print preview crashes. Please select a record range slot to export (max 1,000 records per slot):
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography sx={labelSx}>
              Record Range
            </Typography>
            <Select
              id="range-slot-select"
              value={selectedSlot ? JSON.stringify(selectedSlot) : ""}
              onChange={(e) => {
                try {
                  setSelectedSlot(JSON.parse(e.target.value));
                } catch (err) {
                  console.error(err);
                }
              }}
              fullWidth
              sx={inputSx}
            >
              {generateSlots(total).map((slot, idx) => (
                <MenuItem key={idx} value={JSON.stringify(slot)}>
                  Records {slot.label} ({slot.limit} items)
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid #f3f4f6",
            bgcolor: "#fafafa",
            gap: 1.5,
          }}
        >
          <Button
            onClick={() => setOpenRangeModal(false)}
            sx={{
              borderRadius: "8px",
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              color: "#4b5563",
              border: "1px solid #e5e7eb",
              "&:hover": {
                bgcolor: "#f3f4f6",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRangeExport}
            variant="contained"
            className="admin-btn-theme"
            sx={{
              borderRadius: "8px",
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            Export Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Details & Roadmap Modal */}
      <Dialog
        open={openDetailsModal}
        onClose={handleCloseDetailsModal}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            overflow: "hidden",
            width: "680px",
            maxWidth: "95%",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "var(--primary-color)",
            borderBottom: "1px solid #f3f4f6",
            bgcolor: "#fafafa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Payment Details & Roadmap</span>
          <IconButton onClick={handleCloseDetailsModal} size="small" sx={{ color: "#9ca3af" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          {selectedTransaction && (
            <Box>
              {/* School Details Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar
                  src={`${import.meta.env.VITE_BASE_URL_IMAGE}/${selectedTransaction.schoolId?.logo}`}
                  variant="circular"
                  sx={{
                    width: 56,
                    height: 56,
                    border: "2px solid #e5e7eb",
                    bgcolor: "var(--primary-color)",
                    color: "#fff",
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  {selectedTransaction.schoolId?.schoolName?.[0] || "S"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
                    {selectedTransaction.schoolId?.schoolName || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Code: #{selectedTransaction.schoolId?.schoolCode || "N/A"} | Email: {selectedTransaction.schoolId?.email || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Roadmap Timeline */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#374151", mb: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Payment Distribution Roadmap
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pl: 1 }}>
                
                {/* Step 1: School Payment */}
                <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
                  {/* Vertical connector line */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 11,
                      top: 24,
                      bottom: -24,
                      width: 2,
                      bgcolor: "#e5e7eb",
                      zIndex: 0,
                    }}
                  />
                  <Box sx={{ zIndex: 1 }}>
                    {selectedTransaction.status === "success" || selectedTransaction.status === "active" ? (
                      <CheckCircleIcon sx={{ color: "#10b981", bgcolor: "#fff", borderRadius: "50%" }} />
                    ) : selectedTransaction.status === "failed" ? (
                      <ErrorIcon sx={{ color: "#ef4444", bgcolor: "#fff", borderRadius: "50%" }} />
                    ) : (
                      <AccessTimeIcon sx={{ color: "#f59e0b", bgcolor: "#fff", borderRadius: "50%" }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
                      Step 1: School Payment ({selectedTransaction.status?.toUpperCase()})
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4b5563", mt: 0.5 }}>
                      Total amount paid: <strong>₹{selectedTransaction.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> (Base: ₹{selectedTransaction.amount} + GST Tax: ₹{selectedTransaction.taxAmount})
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mt: 0.5 }}>
                      Tx ID: {selectedTransaction.transactionId || selectedTransaction.razorpayPaymentId || "N/A"} | Method: {selectedTransaction.method || "Online"} | Date: {selectedTransaction.createdAt ? moment(selectedTransaction.createdAt).format("DD MMM YYYY, hh:mm A") : "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* Step 2: Commission Split */}
                <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 11,
                      top: 24,
                      bottom: -24,
                      width: 2,
                      bgcolor: "#e5e7eb",
                      zIndex: 0,
                    }}
                  />
                  <Box sx={{ zIndex: 1 }}>
                    {selectedTransaction.referralId ? (
                      <CheckCircleIcon sx={{ color: "#3b82f6", bgcolor: "#fff", borderRadius: "50%" }} />
                    ) : (
                      <InfoIcon sx={{ color: "#6b7280", bgcolor: "#fff", borderRadius: "50%" }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
                      Step 2: Commission Calculation (30% split)
                    </Typography>
                    {selectedTransaction.referralId ? (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" sx={{ color: "#4b5563" }}>
                          Referral Commission Amount: <strong>₹{(selectedTransaction.commissionAmount || selectedTransaction.referralAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                          Sales Admin: <strong>{selectedTransaction.referralId?.name || "Referral Developer"}</strong> ({selectedTransaction.referralId?.email || "N/A"})
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          Target UPI ID: <code>{selectedTransaction.referralUpiId || selectedTransaction.referralId?.UPIId || "N/A"}</code>
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5, fontStyle: "italic" }}>
                        No Referral / Sales Admin linked. 100% of revenue is allocated to Platform Admin.
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Step 3: Referral Payout Status */}
                {selectedTransaction.referralId && (
                  <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: 11,
                        top: 24,
                        bottom: -24,
                        width: 2,
                        bgcolor: "#e5e7eb",
                        zIndex: 0,
                      }}
                    />
                    <Box sx={{ zIndex: 1 }}>
                      {selectedTransaction.referralPaymentStatus === "sent" ? (
                        <CheckCircleIcon sx={{ color: "#10b981", bgcolor: "#fff", borderRadius: "50%" }} />
                      ) : selectedTransaction.referralPaymentStatus === "failed" ? (
                        <ErrorIcon sx={{ color: "#ef4444", bgcolor: "#fff", borderRadius: "50%" }} />
                      ) : (
                        <AccessTimeIcon sx={{ color: "#f59e0b", bgcolor: "#fff", borderRadius: "50%" }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
                        Step 3: Referral Payout ({selectedTransaction.referralPaymentStatus?.toUpperCase() || "PENDING"})
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#4b5563", mt: 0.5 }}>
                        Payout amount: <strong>₹{(selectedTransaction.commissionAmount || selectedTransaction.referralAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                      </Typography>
                      {selectedTransaction.referralPayoutId && (
                        <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                          Payout ID: {selectedTransaction.referralPayoutId}
                        </Typography>
                      )}
                      {selectedTransaction.referralPaymentStatus === "failed" && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px" }}>
                          <Typography variant="caption" sx={{ color: "#991b1b", fontWeight: 600, display: "block" }}>
                            Payout Error Message:
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#991b1b" }}>
                            {selectedTransaction.errorMessage || "Unknown Razorpay error / invalid UPI ID"}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Step 4: Platform Revenue Allocation */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ zIndex: 1 }}>
                    {selectedTransaction.status === "success" || selectedTransaction.status === "active" ? (
                      <CheckCircleIcon sx={{ color: "#10b981", bgcolor: "#fff", borderRadius: "50%" }} />
                    ) : (
                      <AccessTimeIcon sx={{ color: "#f59e0b", bgcolor: "#fff", borderRadius: "50%" }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
                      {selectedTransaction.referralId ? "Step 4: Platform Net Revenue" : "Step 3: Platform Gross Revenue"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#4b5563", mt: 0.5 }}>
                      Allocated to Platform Admin: <strong>₹{(selectedTransaction.adminAmount || selectedTransaction.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                      Settlement Status: {selectedTransaction.adminPaymentStatus?.toUpperCase() || "PENDING"}
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "1px solid #f3f4f6", bgcolor: "#fafafa" }}>
          <Button
            onClick={handleCloseDetailsModal}
            sx={{
              borderRadius: "8px",
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              color: "#4b5563",
              border: "1px solid #e5e7eb",
              "&:hover": {
                bgcolor: "#f3f4f6",
              },
            }}
          >
            Close Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
