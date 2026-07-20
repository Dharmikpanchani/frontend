import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
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
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  debounce,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  FilePresent as FileIcon,
} from "@mui/icons-material";
import { masterService } from "@/api/services/master.service";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import moment from "moment";

const typeTitles: Record<string, string> = {
  teacher: "Teacher Import Logs",
  student: "Student Import Logs",
  fee_structure: "Fee Structure Import Logs",
  fee_category: "Fee Category Import Logs",
  class: "Class Import Logs",
  section: "Section Import Logs",
  department: "Department Import Logs",
  subject: "Subject Import Logs",
  role: "Role Import Logs",
};

export default function ImportLogs() {
  const { type = "teacher" } = useParams<{ type: string }>();

  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal state
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const pageTitle = typeTitles[type] || `${type.replace(/_/g, " ").toUpperCase()} Import Logs`;

  const fetchLogs = useCallback(
    async (page: number, limit: number, search: string) => {
      setLoading(true);
      try {
        const res = await masterService.getImportLogs({
          page: page + 1,
          perPage: limit,
          importType: type,
          search: search.trim() || undefined,
        });

        if (res.status === 200 || res.success) {
          const docs = res.data?.docs || res.data?.data || (Array.isArray(res.data) ? res.data : []);
          const totalRecords = res.data?.pagination?.totalArrayLength ?? res.data?.total ?? docs.length;
          setLogs(docs);
          setTotal(totalRecords);
        } else {
          setLogs([]);
          setTotal(0);
        }
      } catch (err: any) {
        console.error("Fetch import logs failed:", err);
        setLogs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    setCurrentPage(0);
    fetchLogs(0, rowsPerPage, searchQuery);
  }, [type, rowsPerPage, fetchLogs]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setCurrentPage(0);
        fetchLogs(0, rowsPerPage, val);
      }, 400),
    [fetchLogs, rowsPerPage]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    debouncedSearch(val);
  };



  const getStatusChipStyle = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "SUCCESS" || s === "COMPLETED") {
      return { bg: "#e8f5e9", color: "#2e7d32", shadow: "rgba(76, 175, 80, 0.4)" };
    }
    if (s === "PARTIAL") {
      return { bg: "#fff3e0", color: "#e65100", shadow: "rgba(230, 81, 0, 0.35)" };
    }
    return { bg: "#ffebee", color: "#d32f2f", shadow: "rgba(244, 67, 54, 0.4)" };
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  return (
    <Box className="admin-body-content">
      {/* Header Card */}
      <Box className="admin-page-title-main" sx={{ mb: 2.5 }}>
        <Box className="admin-page-title-left">
          <Typography variant="h5" fontWeight="bold" sx={{ color: "var(--text-primary)" }}>
            {pageTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>
            View and audit bulk CSV import history and log reports.
          </Typography>
        </Box>

        <Box className="admin-page-title-right" sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {/* Search Bar */}
          <Box className="admin-search-main">
            <Box className="admin-search-box">
              <Box className="admin-form-group">
                <TextField
                  value={searchQuery}
                  fullWidth
                  id="search"
                  className="admin-form-control"
                  placeholder="Search logs..."
                  onChange={handleSearchChange}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <SearchIcon
                  className="school-admin-search-grey-img admin-icon"
                  sx={{ color: "var(--primary-color)", fontSize: "20px" }}
                />
              </Box>
            </Box>
          </Box>

          <Button
            className="admin-btn-theme"
            onClick={() => fetchLogs(currentPage, rowsPerPage, searchQuery)}
            startIcon={<RefreshIcon />}
            sx={{
              height: "36px !important",
              px: "16px !important",
              fontSize: "12px !important",
              borderRadius: "6px !important",
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Table Container */}
      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container" elevation={0}>
            <Table aria-label="import logs table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell component="th" className="table-th" width="22%">
                    File / Import Name
                  </TableCell>
                  <TableCell component="th" className="table-th" width="12%">
                    Total Records
                  </TableCell>
                  <TableCell component="th" className="table-th" width="12%">
                    Success
                  </TableCell>
                  <TableCell component="th" className="table-th" width="12%">
                    Failed
                  </TableCell>
                  <TableCell component="th" className="table-th" width="15%">
                    Status
                  </TableCell>
                  <TableCell component="th" className="table-th" width="17%">
                    Import Date
                  </TableCell>
                  <TableCell component="th" className="table-th" width="10%" align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody className="table-body">
                {loading ? (
                  <Loader colSpan={7} />
                ) : logs.length === 0 ? (
                  <DataNotFound text="No Import Logs Found" colSpan={7} />
                ) : (
                  logs.map((row: any, idx: number) => {
                    const statusStyle = getStatusChipStyle(row.status || (row.failCount > 0 ? "PARTIAL" : "SUCCESS"));
                    const dateStr = row.createdAt ? moment(row.createdAt).format("DD MMM YYYY, hh:mm A") : "—";
                    const fileName = row.fileName || row.originalName || row.file || `${type}_import_${idx + 1}.csv`;

                    return (
                      <TableRow key={row._id || idx} className="table-row">
                        <TableCell component="td" className="table-td">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FileIcon sx={{ color: "var(--primary-color)", fontSize: "18px" }} />
                            <Tooltip title={fileName} arrow placement="bottom">
                              <Typography className="admin-table-data-text" sx={{ fontWeight: 600 }}>
                                {fileName}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell component="td" className="table-td">
                          <Typography className="admin-table-data-text">
                            {row.totalRecords ?? row.totalCount ?? (row.successCount || 0) + (row.failCount || 0)}
                          </Typography>
                        </TableCell>

                        <TableCell component="td" className="table-td">
                          <Typography className="admin-table-data-text" sx={{ color: "#2e7d32", fontWeight: 600 }}>
                            {row.successCount ?? row.passedCount ?? 0}
                          </Typography>
                        </TableCell>

                        <TableCell component="td" className="table-td">
                          <Typography className="admin-table-data-text" sx={{ color: row.failCount > 0 ? "#d32f2f" : "#616161", fontWeight: 600 }}>
                            {row.failCount ?? row.failedCount ?? 0}
                          </Typography>
                        </TableCell>

                        <TableCell component="td" className="table-td">
                          <Chip
                            label={row.status || (row.failCount > 0 ? "PARTIAL" : "SUCCESS")}
                            sx={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              boxShadow: `0px 0px 8px ${statusStyle.shadow}`,
                              fontWeight: 600,
                              fontSize: "11px",
                              height: "22px",
                              width: "fit-content",
                              "& .MuiChip-label": { padding: "0 8px" },
                            }}
                          />
                        </TableCell>

                        <TableCell component="td" className="table-td">
                          <Typography className="admin-table-data-text" sx={{ color: "#475467" }}>
                            {dateStr}
                          </Typography>
                        </TableCell>

                        <TableCell component="td" className="table-td" align="right">
                          <Tooltip title="View Log Details" arrow placement="bottom">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(row)}
                              sx={{
                                color: "var(--primary-color)",
                                border: "1px solid #eaecf0",
                                borderRadius: "6px",
                                p: "4px",
                                "&:hover": { backgroundColor: "#f0f4ff" },
                              }}
                            >
                              <ViewIcon sx={{ fontSize: "18px" }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <Pagination
              count={total}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              setPage={setCurrentPage}
              setRowsPerPage={setRowsPerPage}
            />
          )}
        </Box>
      </Box>

      {/* Log Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px", color: "var(--primary-color)" }}>
          Import Log Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">File Name:</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedLog.fileName || selectedLog.originalName || "N/A"}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Import Type:</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedLog.importType || type}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Success Count:</Typography>
                <Typography variant="body2" fontWeight="bold" color="green">{selectedLog.successCount ?? 0}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Failed Count:</Typography>
                <Typography variant="body2" fontWeight="bold" color="red">{selectedLog.failCount ?? 0}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="textSecondary">Date:</Typography>
                <Typography variant="body2">{selectedLog.createdAt ? moment(selectedLog.createdAt).format("DD MMM YYYY, hh:mm A") : "N/A"}</Typography>
              </Box>

              {/* Failures / Errors */}
              {(selectedLog.failures?.length > 0 || selectedLog.errors?.length > 0) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="error" sx={{ mb: 1 }}>
                    Failure Reasons:
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 180,
                      overflowY: "auto",
                      backgroundColor: "#fff5f5",
                      p: 1.5,
                      borderRadius: "6px",
                      border: "1px solid #ffebee",
                    }}
                  >
                    {(selectedLog.failures || selectedLog.errors || []).map((err: any, i: number) => (
                      <Typography key={i} variant="caption" display="block" color="error" sx={{ mb: 0.5 }}>
                        Row {err.row || i + 1}: {err.message || err.error || JSON.stringify(err)}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} variant="contained" className="admin-btn-theme">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}