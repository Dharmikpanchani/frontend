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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { Search as SearchIcon, Download as DownloadIcon, Html as HtmlIcon, Print as PrintIcon } from "@mui/icons-material";
import { admissionService } from "@/api/services/admission.service";
import toast from "react-hot-toast";
import moment from "moment";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function Inquiries() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(schoolAdminPermission.student.update);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminRemark, setAdminRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<"excel" | "html" | "print" | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res: any = await admissionService.getInquiries({
        pageNumber: page + 1,
        perPageData: rowsPerPage,
        searchRequest: search.trim(),
      });
      setInquiries(res?.data?.data || []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleOpenStatusModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status);
    setAdminRemark(inquiry.adminRemark || "");
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    try {
      await admissionService.updateInquiryStatus(selectedInquiry._id, {
        status: newStatus,
        adminRemark: adminRemark.trim(),
      });
      toast.success("Inquiry status updated");
      setStatusModalOpen(false);
      fetchInquiries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "contacted": return "info";
      case "converted": return "success";
      case "rejected": return "error";
      default: return "default";
    }
  };

  const handleExport = async (format: "excel" | "html" | "print") => {
    try {
      setExportingFormat(format);
      const params = {
        search,
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
              : "text/html; charset=utf-8",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Inquiries_Report_${moment().format("YYYYMMDD_HHmmss")}.${
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
          <TextField
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search name or phone"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ fontSize: 18, color: "var(--primary-color)", mr: 1 }} />,
            }}
            sx={{ minWidth: 250, bgcolor: "#fff", borderRadius: 1 }}
          />
          <Box className="admin-filter-btn-main">
            <Tooltip title="Export to Excel">
              <Button
                className="admin-btn-theme"
                onClick={() => handleExport("excel")}
                disabled={exportingFormat !== null}
                sx={{ ml: 1, minWidth: "45px", p: "0 12px", display: "flex", alignItems: "center" }}
              >
                {exportingFormat === "excel" ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <DownloadIcon sx={{ color: "#fff", fontSize: "18px" }} />}
              </Button>
            </Tooltip>
          </Box>
          <Box className="admin-filter-btn-main">
            <Tooltip title="Export to HTML">
              <Button
                className="admin-btn-theme"
                onClick={() => handleExport("html")}
                disabled={exportingFormat !== null}
                sx={{ ml: 1, minWidth: "45px", p: "0 12px", display: "flex", alignItems: "center" }}
              >
                {exportingFormat === "html" ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <HtmlIcon sx={{ color: "#fff", fontSize: "18px" }} />}
              </Button>
            </Tooltip>
          </Box>
          <Box className="admin-filter-btn-main">
            <Tooltip title="Export to Print">
              <Button
                className="admin-btn-theme"
                onClick={() => handleExport("print")}
                disabled={exportingFormat !== null}
                sx={{ ml: 1, minWidth: "45px", p: "0 12px", display: "flex", alignItems: "center" }}
              >
                {exportingFormat === "print" ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <PrintIcon sx={{ color: "#fff", fontSize: "18px" }} />}
              </Button>
            </Tooltip>
          </Box>
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
                  <TableCell className="table-th">STATUS</TableCell>
                  {canUpdate && <TableCell className="table-th" align="center">ACTION</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={28} sx={{ color: "var(--primary-color)" }} /></TableCell></TableRow>
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
                      <TableCell className="table-td">
                        <Chip label={inq.status.toUpperCase()} color={getStatusColor(inq.status)} size="small" sx={{ fontSize: 10, fontWeight: 600, height: 20 }} />
                        {inq.adminRemark && (
                          <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5 }}>Remark: {inq.adminRemark}</Typography>
                        )}
                      </TableCell>
                      {canUpdate && (
                        <TableCell className="table-td" align="center">
                          <Button size="small" variant="outlined" onClick={() => handleOpenStatusModal(inq)}
                            sx={{ fontSize: 11, textTransform: "none", borderColor: "var(--primary-color)", color: "var(--primary-color)" }}>
                            Update
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ fontSize: 14, color: "#9ca3af" }}>No inquiries found</Typography>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Update Status Modal */}
      <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "16px" }}>Update Inquiry Status</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box>
              <Typography sx={labelSx}>Status</Typography>
              <Select fullWidth size="small" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={inputSx}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="converted">Converted (Admission Taken)</MenuItem>
                <MenuItem value="rejected">Rejected (Not Interested)</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={labelSx}>Admin Remark (Optional)</Typography>
              <TextField fullWidth multiline rows={3} value={adminRemark} onChange={(e) => setAdminRemark(e.target.value)} placeholder="Add internal notes..." slotProps={{ input: { sx: inputSx } }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setStatusModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={actionLoading}
            sx={{ backgroundColor: "var(--primary-color) !important", textTransform: "none", boxShadow: "none" }}>
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
