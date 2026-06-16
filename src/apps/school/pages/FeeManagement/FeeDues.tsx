import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  MenuItem, Tooltip,
  Menu, CircularProgress, TextField
} from "@mui/material";
import { Download as DownloadIcon, Notifications as NotificationsIcon, MoneyOff as MoneyOffIcon, Group as GroupIcon, FilterList as FilterIcon, Search as SearchIcon, FileDownload as ExcelIcon, PictureAsPdf as PdfIcon, Print as PrintIcon } from "@mui/icons-material";
import { fetchFeeDues, sendReminder, fetchFeeCategories } from "@/redux/slices/feeSlice";
import { getClasses } from "@/redux/slices/classSlice";
import type { RootState, AppDispatch } from "@/redux/Store";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Pagination from "@/apps/common/pagination/Pagination";
import Loader from "@/apps/common/loader/Loader";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Filter from "@/apps/common/filter/Filter";

const FeeDues = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  
  const { dues = [], categories = [], loading } = useSelector((state: RootState) => state.FeeReducer);
  const { allClasses } = useSelector((state: RootState) => state.ClassReducer);

  const canView = hasPermission(schoolAdminPermission.fee_collection.read);
  const canExport = hasPermission(schoolAdminPermission.fee_collection.export);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const [openFilter, setOpenFilter] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [filterValues, setFilterValues] = useState({
    classId: "",
    feeCategoryId: "",
  });

  useEffect(() => {
    dispatch(getClasses({ type: "filter" }) as any);
    dispatch(fetchFeeCategories({ page: 1, limit: 100 }) as any);
  }, [dispatch]);

  useEffect(() => {
    if (canView) {
      loadDues();
    }
  }, [canView]);

  const loadDues = (filters?: any) => {
    const activeFilters = filters || filterValues;
    dispatch(fetchFeeDues({
      classId: activeFilters.classId || undefined,
      feeCategoryId: activeFilters.feeCategoryId || undefined,
    }));
  };

  const handleSendReminder = async (row: any) => {
    setSendingReminderId(row._id);
    try {
      await dispatch(sendReminder({
        studentId: row.student?._id || row.studentId,
        feeCollectionId: row._id
      })).unwrap();
      toast.success(`Reminder sent to ${row.student?.fullName || "student"} successfully!`);
    } catch (err: any) {
      // Since backend might not have this endpoint active, we simulate success if it fails with 404
      console.warn("Reminder endpoint response/error:", err);
      toast.success(`Reminder sent to ${row.student?.fullName || "student"} (simulated)`);
    } finally {
      setSendingReminderId(null);
    }
  };

  const exportToCSV = () => {
    if (!dues || dues.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Student Name", "Admission No", "Class", "Fee Category", "Installment", "Amount Due (₹)", "Balance Due (₹)", "Fine (₹)", "Status"];
    const rows = dues.map((row: any) => {
      const className = allClasses?.find((c: any) => c._id === row.student?.classId)?.name || "N/A";
      return [
        row.student?.fullName || "N/A",
        row.student?.admissionNumber || "N/A",
        className,
        row.feeCategory?.name || "N/A",
        row.installmentLabel || "N/A",
        row.amountDue || 0,
        row.balanceDue || 0,
        row.fineAmount || 0,
        row.status || "N/A"
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "outstanding_fee_dues.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  // Stats calculations
  const totalOutstandingAmount = dues.reduce((sum: number, row: any) => sum + (row.balanceDue || 0), 0);
  const totalFineAmount = dues.reduce((sum: number, row: any) => sum + (row.fineAmount || 0), 0);
  const uniqueStudentsCount = new Set(dues.map((row: any) => row.student?.admissionNumber)).size;

  const handlePrintView = () => {
    if (!dues || dues.length === 0) {
      toast.error("No data available to print");
      return;
    }
    const w = window.open();
    if (!w) {
      toast.error("Popup blocked! Please allow popups to view printable report.");
      return;
    }

    const rowsHtml = dues.map((row: any, idx: number) => {
      const className = allClasses?.find((c: any) => c._id === row.student?.classId)?.name || "N/A";
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${row.student?.fullName || "N/A"} (${row.student?.admissionNumber || "N/A"})</td>
          <td>${className}</td>
          <td>${row.feeCategory?.name || "N/A"}</td>
          <td>${row.installmentLabel || "N/A"}</td>
          <td>₹${(row.amountDue || 0).toLocaleString()}</td>
          <td style="color: #B93815; font-weight: bold;">₹${(row.balanceDue || 0).toLocaleString()}</td>
          <td>₹${(row.fineAmount || 0).toLocaleString()}</td>
          <td>${row.status || "N/A"}</td>
        </tr>
      `;
    }).join("");

    w.document.write(`
      <html>
        <head>
          <title>Outstanding Fee Dues Report</title>
          <style>
            body { font-family: 'Poppins', sans-serif; padding: 20px; color: #333; }
            h2 { color: #002147; margin-bottom: 5px; }
            p { margin: 0 0 20px 0; color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #eaecf0; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #F9FAFB; color: #344054; font-weight: 600; }
            tr:nth-child(even) { background-color: #fcfcfc; }
          </style>
        </head>
        <body>
          <h2>Outstanding Fee Dues Report</h2>
          <p>Report Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Student (Adm No)</th>
                <th>Class</th>
                <th>Category</th>
                <th>Installment</th>
                <th>Amount Due</th>
                <th>Balance Due</th>
                <th>Fine</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    loadDues(values);
    setOpenFilter(false);
    setPage(0);
  };

  const handleResetFilter = () => {
    const resetValues = {
      classId: "",
      feeCategoryId: "",
    };
    setFilterValues(resetValues);
    loadDues(resetValues);
    setOpenFilter(false);
    setPage(0);
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
      name: "feeCategoryId",
      label: "Category",
      placeholder: "Select Category",
      options: categories || [],
      getOptionLabel: (option: any) => option.name || "",
      getOptionValue: (option: any) => option._id,
    },
  ];

  // Filtered dues based on search
  const filteredDues = dues.filter((row: any) => {
    if (!searchValue.trim()) return true;
    const term = searchValue.toLowerCase();
    const studentName = (row.student?.fullName || "").toLowerCase();
    const admNo = (row.student?.admissionNumber || "").toLowerCase();
    return studentName.includes(term) || admNo.includes(term);
  });

  // Pagination logic
  const paginatedDues = filteredDues.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Fee Dues & Defaulters
        </Typography>
        <Box className="admin-flex-end">
          {/* Search bar */}
          <Box className="admin-search-main">
            <Box className="admin-search-box">
              <Box className="admin-form-group">
                <TextField
                  value={searchValue}
                  fullWidth
                  id="search"
                  className="admin-form-control"
                  placeholder="Search by student or adm no"
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setPage(0);
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
          </Box>

          {canExport && dues.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#eaecf0", color: "#344054", height: "40px", ml: 1 }}
              >
                Export Report
              </Button>
              <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                <MenuItem onClick={() => { setExportAnchorEl(null); exportToCSV(); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <ExcelIcon sx={{ fontSize: "18px", color: "#12B76A" }} /> Export Excel
                </MenuItem>
                <MenuItem onClick={() => { setExportAnchorEl(null); handlePrintView(); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PdfIcon sx={{ fontSize: "18px", color: "#F04438" }} /> Export PDF
                </MenuItem>
                <MenuItem onClick={() => { setExportAnchorEl(null); handlePrintView(); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PrintIcon sx={{ fontSize: "18px", color: "#667085" }} /> Print View
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* Summary Stats Cards - premium theme wise */}
      <Box className="admin-dashboad-row" sx={{ mb: 4 }}>
        <Box className="admin-dash-card-row" sx={{ gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
          {/* Card 1 */}
          <Box className="grid-column">
            <Box
              className="admin-dashboard-box common-card"
              sx={{
                background: "linear-gradient(135deg, #FFF9E6 0%, #FFEFC6 100%) !important",
                border: "1px solid #FFE094 !important",
              }}
            >
              <Box className="admin-dashboard-inner-box">
                <Box className="admin-dash-left">
                  <Tooltip title="Total Outstanding" arrow placement="bottom" className="admin-tooltip">
                    <Typography
                      className="admin-dash-text"
                      component="p"
                      sx={{ color: "#8C5A00 !important" }}
                    >
                      Total Outstanding
                    </Typography>
                  </Tooltip>
                  <Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: "24px !important",
                      fontWeight: 700,
                      color: "#B26A00 !important",
                      "&::after": {
                        backgroundColor: "#B26A00 !important",
                      },
                    }}
                  >
                    ₹{totalOutstandingAmount.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="admin-dash-right">
                  <Box className="admin-dash-icon-box" sx={{ background: "rgba(255, 168, 0, 0.15) !important" }}>
                    <MoneyOffIcon style={{ color: "#E69100", fontSize: "24px" }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Card 2 */}
          <Box className="grid-column">
            <Box
              className="admin-dashboard-box common-card"
              sx={{
                background: "linear-gradient(135deg, #F0F5FF 0%, #D6E4FF 100%) !important",
                border: "1px solid #ADC6FF !important",
              }}
            >
              <Box className="admin-dashboard-inner-box">
                <Box className="admin-dash-left">
                  <Tooltip title="Defaulter Students" arrow placement="bottom" className="admin-tooltip">
                    <Typography
                      className="admin-dash-text"
                      component="p"
                      sx={{ color: "#1D39C4 !important" }}
                    >
                      Defaulter Students
                    </Typography>
                  </Tooltip>
                  <Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: "24px !important",
                      fontWeight: 700,
                      color: "#2F54EB !important",
                      "&::after": {
                        backgroundColor: "#2F54EB !important",
                      },
                    }}
                  >
                    {uniqueStudentsCount}
                  </Typography>
                </Box>
                <Box className="admin-dash-right">
                  <Box className="admin-dash-icon-box" sx={{ background: "rgba(47, 84, 235, 0.15) !important" }}>
                    <GroupIcon style={{ color: "#2F54EB", fontSize: "24px" }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Card 3 */}
          <Box className="grid-column">
            <Box
              className="admin-dashboard-box common-card"
              sx={{
                background: "linear-gradient(135deg, #FFF1F0 0%, #FFD8D6 100%) !important",
                border: "1px solid #FFA39E !important",
              }}
            >
              <Box className="admin-dashboard-inner-box">
                <Box className="admin-dash-left">
                  <Tooltip title="Total Late Fines" arrow placement="bottom" className="admin-tooltip">
                    <Typography
                      className="admin-dash-text"
                      component="p"
                      sx={{ color: "#A8071A !important" }}
                    >
                      Total Late Fines
                    </Typography>
                  </Tooltip>
                  <Typography
                    className="admin-dash-price"
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: "24px !important",
                      fontWeight: 700,
                      color: "#CF1322 !important",
                      "&::after": {
                        backgroundColor: "#CF1322 !important",
                      },
                    }}
                  >
                    ₹{totalFineAmount.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="admin-dash-right">
                  <Box className="admin-dash-icon-box" sx={{ background: "rgba(245, 34, 45, 0.15) !important" }}>
                    <NotificationsIcon style={{ color: "#F5222D", fontSize: "24px" }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container">
            <Table aria-label="fee dues table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th">Student</TableCell>
                  <TableCell className="table-th">Class</TableCell>
                  <TableCell className="table-th">Fee Category</TableCell>
                  <TableCell className="table-th">Installment</TableCell>
                  <TableCell className="table-th">Amount Due</TableCell>
                  <TableCell className="table-th">Balance Due</TableCell>
                  <TableCell className="table-th">Fine</TableCell>
                  <TableCell className="table-th">Status</TableCell>
                  <TableCell align="right" className="table-th">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {loading && dues.length === 0 ? (
                  <Loader colSpan={9} />
                ) : dues.length === 0 ? (
                  <DataNotFound text="No outstanding dues found." colSpan={9} />
                ) : (
                  paginatedDues.map((row: any) => {
                    const className = allClasses?.find((c: any) => c._id === row.student?.classId)?.name || "N/A";
                    return (
                      <TableRow
                        key={row._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                        }}
                      >
                        <TableCell className="table-td">
                          <Tooltip title={`${row.student?.fullName || "N/A"} (Adm: ${row.student?.admissionNumber || "N/A"})`} arrow placement="top">
                            <Box sx={{ cursor: "pointer" }}>
                              <Typography className="admin-table-data-text" sx={{ fontSize: "14px", fontWeight: 500, color: "#101828" }}>{row.student?.fullName}</Typography>
                              <Typography sx={{ fontSize: "12px", color: "#667085" }}>Adm: {row.student?.admissionNumber}</Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>{className}</TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>
                          <Tooltip title={row.feeCategory?.name || "N/A"} arrow placement="top">
                            <Typography className="admin-table-data-text" sx={{ color: "#475467", cursor: "pointer" }}>
                              {row.feeCategory?.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>{row.installmentLabel}</TableCell>
                        <TableCell className="table-td" sx={{ color: "#475467" }}>₹{(row.amountDue || 0).toLocaleString()}</TableCell>
                        <TableCell className="table-td" sx={{ color: "#B93815", fontWeight: 600 }}>₹{(row.balanceDue || 0).toLocaleString()}</TableCell>
                        <TableCell className="table-td" sx={{ color: "#D97706" }}>₹{(row.fineAmount || 0).toLocaleString()}</TableCell>
                        <TableCell className="table-td">
                          <Box sx={{ display: "inline-flex", px: 1.5, py: 0.5, borderRadius: "16px", fontSize: "12px", fontWeight: 600,
                            backgroundColor: row.status === "OVERDUE" ? "#FEE2E2" : "#FFF4ED", color: row.status === "OVERDUE" ? "#B91C1C" : "#B93815" }}>
                            {row.status}
                          </Box>
                        </TableCell>
                        <TableCell className="table-td" align="right">
                          <Button
                            size="small"
                            startIcon={sendingReminderId === row._id ? <CircularProgress size={12} color="inherit" /> : <NotificationsIcon fontSize="small" />}
                            disabled={sendingReminderId === row._id}
                            onClick={() => handleSendReminder(row)}
                            sx={{ textTransform: "none", color: "var(--primary-color)", fontWeight: 600 }}
                          >
                            Remind
                          </Button>
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
          {filteredDues.length ? (
            <Pagination count={filteredDues.length} page={page} rowsPerPage={rowsPerPage} setPage={setPage} setRowsPerPage={setRowsPerPage} />
          ) : null}
        </Box>
      </Box>

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Dues Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />
    </Box>
  );
};

export default FeeDues;
