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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Grid,
  Checkbox,
  FormControlLabel,
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
import Filter from "@/apps/common/filter/Filter";
import Pagination from "@/apps/common/pagination/Pagination";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function Inquiries() {

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState<any>({
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

  const [openRangeModal, setOpenRangeModal] = useState<boolean>(false);
  const [pendingFormat, setPendingFormat] = useState<"excel" | "pdf" | "print" | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const inquiryExportFields = [
    { key: "studentName", label: "Student Name" },
    { key: "phoneNumber", label: "Mobile" },
    { key: "className", label: "Class" },
    { key: "message", label: "Message" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
  ];

  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(
    inquiryExportFields.map((f) => f.key)
  );

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
          description: "Generate and download the admission inquiries report in Microsoft Excel (.xlsx) format.",
        };
      case "pdf":
        return {
          title: "Export Report to PDF",
          icon: <PdfIcon sx={{ color: "#F04438", fontSize: "24px" }} />,
          description: "Generate and download the admission inquiries report in PDF format.",
        };
      case "print":
        return {
          title: "Print Report View",
          icon: <PrintIcon sx={{ color: "#667085", fontSize: "24px" }} />,
          description: "Open the printer-friendly admission inquiries report view.",
        };
      default:
        return {
          title: "Export Report",
          icon: <DownloadIcon sx={{ color: "var(--primary-color)", fontSize: "24px" }} />,
          description: "Select record range slot to export.",
        };
    }
  };

  const handleExportClick = (format: "excel" | "pdf" | "print") => {
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
    if (selectedExportFields.length === 0) {
      toast.error("Please select at least one column to export.");
      return;
    }
    setOpenRangeModal(false);
    if (pendingFormat && selectedSlot) {
      handleExport(pendingFormat, selectedSlot.limit, selectedSlot.offset);
    }
  };

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

  const handleExport = async (
    format: "excel" | "pdf" | "print",
    limit?: number,
    offset?: number
  ) => {
    try {
      setExportingFormat(format);
      const params = {
        searchRequest: search,
        studentName: filterValues.studentName || undefined,
        date: filterValues.date ? moment(filterValues.date).format("YYYY-MM-DD") : undefined,
        status: filterValues.status || undefined,
        format,
        limit,
        offset,
        fields: selectedExportFields.join(","),
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
          `Inquiries_Report_${moment().format("YYYYMMDD_HHmmss")}.${format === "excel" ? "xlsx" : format === "pdf" ? "pdf" : "html"
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
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExportClick("excel"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <ExcelIcon sx={{ fontSize: "18px", color: "#12B76A" }} /> Export Excel
                </MenuItem>
                <MenuItem onClick={() => { setExportAnchorEl(null); handleExportClick("pdf"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                  <PdfIcon sx={{ fontSize: "18px", color: "#F04438" }} /> Export PDF
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

          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography sx={{ ...labelSx, mb: 0 }}>
                Select Columns to Export
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedExportFields.length === inquiryExportFields.length}
                    indeterminate={
                      selectedExportFields.length > 0 &&
                      selectedExportFields.length < inquiryExportFields.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExportFields(inquiryExportFields.map((f) => f.key));
                      } else {
                        setSelectedExportFields([]);
                      }
                    }}
                    size="small"
                    sx={{
                      color: "var(--primary-color)",
                      "&.Mui-checked": {
                        color: "var(--primary-color)",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#344054" }}>
                    Select All
                  </Typography>
                }
                sx={{ mr: 0 }}
              />
            </Box>
            <Grid container spacing={1}>
              {inquiryExportFields.map((field) => (
                <Grid size={{ xs: 6 }} key={field.key}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedExportFields.includes(field.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExportFields((prev) => [...prev, field.key]);
                          } else {
                            setSelectedExportFields((prev) =>
                              prev.filter((k) => k !== field.key)
                            );
                          }
                        }}
                        size="small"
                        sx={{
                          color: "var(--primary-color)",
                          "&.Mui-checked": {
                            color: "var(--primary-color)",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "12px", color: "#475467" }}>
                        {field.label}
                      </Typography>
                    }
                  />
                </Grid>
              ))}
            </Grid>
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
    </Box>
  );
}
