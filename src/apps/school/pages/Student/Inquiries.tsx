import { useEffect, useState } from "react";
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
  Chip,
  CircularProgress,
  MenuItem,
  Menu,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { admissionService } from "@/api/services/admission.service";
import Loader from "@/apps/common/loader/Loader";
import DataNotFound from "@/apps/school/component/schoolCommon/dataNotFound/DataNotFound";
import toast from "react-hot-toast";
import moment from "moment";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import Pagination from "@/apps/common/pagination/Pagination";

export default function Inquiries() {
  const { hasPermission } = usePermissions();

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    studentName: "",
    date: "",
  });

  const filterFields: any[] = [
    {
      type: "inputSelect",
      name: "studentName",
      label: "Student Name",
      placeholder: "Enter Student Name",
    },
    {
      type: "date",
      name: "date",
      label: "Date",
      placeholder: "Select Date",
    },
  ];

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    setPage(0);
    setOpenFilter(false);
  };

  const handleResetFilters = () => {
    setFilterValues({ studentName: "", date: "" });
    setPage(0);
    setOpenFilter(false);
  };

  const [exportingFormat, setExportingFormat] = useState<"excel" | "pdf" | "print" | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const exporting = exportingFormat !== null;

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res: any = await admissionService.getInquiries({
        pageNumber: page + 1,
        perPageData: rowsPerPage,
        searchRequest: search.trim(),
        studentName: filterValues.studentName || undefined,
        date: filterValues.date ? moment(filterValues.date).format("YYYY-MM-DD") : undefined,
      });
      setInquiries(res?.data || []);
      setTotal(res?.pagination?.totalArrayLength || 0);
    } catch {
      setInquiries([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search, filterValues, rowsPerPage]);

  const handleExport = async (format: "excel" | "pdf" | "print") => {
    try {
      setExportingFormat(format);
      const params = {
        searchRequest: search,
        studentName: filterValues.studentName || undefined,
        date: filterValues.date ? moment(filterValues.date).format("YYYY-MM-DD") : undefined,
        format,
      };

      const response: any = await admissionService.exportInquiries(params);
      const data = response?.data || response;

      if (format === "print") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(data as any);
          printWindow.document.close();
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
          `Inquiries_Report_${moment().format("YYYYMMDD_HHmmss")}.${
            format === "excel" ? "xlsx" : format === "pdf" ? "pdf" : "html"
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
      toast.error(error.message || "Failed to export inquiries");
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main" sx={{ mb: 3 }}>
        <Typography className="admin-page-title" component="h2" variant="h2">
          Admission Inquiries
        </Typography>
        <Box className="admin-flex-end">
          <Box className="admin-search-main">
            <Box className="admin-search-box">
              <Box className="admin-form-group">
                <TextField
                  value={search}
                  fullWidth
                  id="search"
                  className="admin-form-control"
                  placeholder="Search"
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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

          {inquiries.length > 0 && (
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
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExport("excel"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <ExcelIcon sx={{ fontSize: "18px", color: "#12B76A" }} /> Export Excel
                </MenuItem>
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExport("pdf"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PdfIcon sx={{ fontSize: "18px", color: "#F04438" }} /> Export PDF
                </MenuItem>
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExport("print"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PrintIcon sx={{ fontSize: "18px", color: "#667085" }} /> Print View
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container">
            <Table className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th">STUDENT NAME</TableCell>
                  <TableCell className="table-th">PHONE NUMBER</TableCell>
                  <TableCell className="table-th">CLASS</TableCell>
                  <TableCell className="table-th">MESSAGE</TableCell>
                  <TableCell className="table-th">DATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {loading ? (
                  <Loader colSpan={5} />
                ) : inquiries.length ? (
                  inquiries.map((inq: any) => (
                    <TableRow key={inq._id} sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                      <TableCell className="table-td" sx={{ fontWeight: 600, color: "#111827" }}>
                        {inq.studentName}
                      </TableCell>
                      <TableCell className="table-td">{inq.phoneNumber}</TableCell>
                      <TableCell className="table-td">
                        {inq.classId?.name && (
                          <Chip label={inq.classId.name} size="small" sx={{ height: 22, fontSize: 11, backgroundColor: "#f0f7ff", color: "#1565c0" }} />
                        )}
                      </TableCell>
                      <TableCell className="table-td">
                        <Typography sx={{ fontSize: 12, maxWidth: 200, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {inq.message || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell className="table-td">
                        <Typography sx={{ fontSize: 12 }}>{moment(inq.createdAt).format("DD MMM YYYY")}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <DataNotFound colSpan={5} text="No inquiries found" />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className="admin-pagination-main">
          {total ? (
            <Pagination
              count={total}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          ) : null}
        </Box>
      </Box>

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Inquiries Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilters}
        initialValues={filterValues}
      />
    </Box>
  );
}
