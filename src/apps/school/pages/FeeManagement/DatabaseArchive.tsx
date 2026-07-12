import React, { useCallback, useEffect, useState } from "react";
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
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Archive as ArchiveIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  getArchivesList,
  getArchivedRecords,
  runArchiveProcess,
} from "@/api/services/fee.service";
import { toasterSuccess, toasterError } from "@/utils/toaster/Toaster";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Pagination from "@/apps/common/pagination/Pagination";
import Svg from "@/assets/Svg";
import DataNotFound from "@/apps/school/component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import PopupModal from "@/apps/school/component/schoolCommon/popUpModal/PopupModal";
import moment from "moment";
import { debounce } from "lodash-es";

const DatabaseArchive = () => {
  const { hasPermission } = usePermissions();
  const canArchive = hasPermission(schoolAdminPermission.school_settings.update);

  // View States
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // List States
  const [archives, setArchives] = useState<any[]>([]);
  const [archivesLoading, setArchivesLoading] = useState(true);

  // Records States
  const [records, setRecords] = useState<any[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [searchValue, setSearchValue] = useState<string>("");

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [triggeringArchive, setTriggeringArchive] = useState(false);

  // Fetch Archives list
  const loadArchives = async () => {
    setArchivesLoading(true);
    try {
      const res: any = await getArchivesList();
      setArchives(res?.data || []);
    } catch (err: any) {
      toasterError(err?.response?.data?.message || "Failed to load archives");
    } finally {
      setArchivesLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, []);

  // Fetch Records for Selected Year
  const loadRecords = async (searchVal?: string) => {
    if (!selectedYear) return;
    setRecordsLoading(true);
    try {
      const targetSearch = searchVal !== undefined ? searchVal : searchValue;
      const res: any = await getArchivedRecords(
        selectedYear,
        currentPage + 1,
        rowsPerPage,
        targetSearch
      );
      setRecords(res?.data?.records || []);
      setTotalDocs(res?.data?.pagination?.total || 0);
    } catch (err: any) {
      toasterError(err?.response?.data?.message || "Failed to load archived records");
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      loadRecords();
    }
  }, [selectedYear, currentPage, rowsPerPage]);

  // Debounced Search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(0);
      loadRecords(query);
    }, 1000),
    [selectedYear]
  );

  const handleRunArchive = async () => {
    if (!canArchive) return;
    setTriggeringArchive(true);
    try {
      const res: any = await runArchiveProcess();
      if (res?.data?.success) {
        toasterSuccess(`Archiving successful for year ${res?.data?.yearLabel}!`);
        loadArchives();
      } else if (res?.data?.skipped) {
        toasterSuccess(`Archiving skipped: ${res?.data?.yearLabel} is already archived.`);
      } else {
        toasterError(res?.data?.error || "Archiving run failed.");
      }
    } catch (err: any) {
      toasterError(err?.response?.data?.message || "Failed to run archiving process");
    } finally {
      setTriggeringArchive(false);
      setShowConfirmModal(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase() || "";
    let bgColor = "rgba(100, 116, 139, 0.1)";
    let color = "#64748b";

    if (["PAID", "SUCCESS"].includes(statusUpper)) {
      bgColor = "rgba(76, 175, 80, 0.1)";
      color = "#4caf50";
    } else if (["PARTIAL", "PENDING"].includes(statusUpper)) {
      bgColor = "rgba(255, 152, 0, 0.1)";
      color = "#ff9800";
    } else if (["FAILED", "OVERDUE"].includes(statusUpper)) {
      bgColor = "rgba(244, 67, 54, 0.1)";
      color = "#f44336";
    }

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.2,
          py: 0.3,
          borderRadius: "20px",
          backgroundColor: bgColor,
          color: color,
          width: "fit-content",
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "currentColor" }} />
        <Typography sx={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
          {statusUpper}
        </Typography>
      </Box>
    );
  };

  return (
    <Box className="admin-dashboard-content">
      {/* ── Header ── */}
      <Box className="admin-user-list-flex admin-page-title-main" sx={{ flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {selectedYear && (
            <Button
              onClick={() => {
                setSelectedYear(null);
                setSearchValue("");
                setCurrentPage(0);
              }}
              sx={{
                minWidth: "auto",
                p: 1,
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                color: "#475569",
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </Button>
          )}
          <Typography className="admin-page-title" component="h2" variant="h2">
            {selectedYear ? `Archived Fee Records (${selectedYear})` : "Database Archive Center"}
          </Typography>
        </Box>

        <Box className="admin-flex-end" sx={{ gap: 2 }}>
          {/* View Mode dependent search/actions */}
          {selectedYear ? (
            <Box className="admin-search-main" sx={{ width: "350px" }}>
              <Box className="admin-search-box">
                <Box className="admin-form-group">
                  <TextField
                    value={searchValue}
                    fullWidth
                    id="archive-records-search"
                    className="admin-form-control"
                    placeholder="Search by Student, Admission No, Receipt No..."
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchValue(e.target.value);
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
          ) : (
            canArchive && (
              <Button
                className="admin-btn-theme"
                onClick={() => setShowConfirmModal(true)}
                sx={{
                  height: "36px !important",
                  px: "20px !important",
                  fontSize: "12px !important",
                  borderRadius: "6px !important",
                  textTransform: "none",
                }}
              >
                <ArchiveIcon sx={{ fontSize: "16px !important", mr: 0.5 }} />
                Run Archive Job
              </Button>
            )
          )}
        </Box>
      </Box>

      {/* ── Main View Panel ── */}
      {!selectedYear ? (
        // VIEW 1: List of Archive Runs
        <Box>
          <Box sx={{ mb: 3.5, p: 2.5, bgcolor: "rgba(2, 132, 199, 0.05)", border: "1px solid rgba(2, 132, 199, 0.15)", borderRadius: "8px", display: "flex", gap: 1.5 }}>
            <InfoIcon sx={{ color: "#0284c7", mt: 0.2 }} />
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0369a1", mb: 0.5 }}>
                Archiving Information
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#0c4a6e" }}>
                Fee collection tables older than 3 years are automatically compiled into single archive collections.
                The original collections are dropped to optimize database execution speed. You can search and view all archived records below.
              </Typography>
            </Box>
          </Box>

          <Box className="admin-dashboard-inner-main admin-table-overflow">
            <TableContainer component={Paper} className="admin-table-container">
              <Table sx={{ minWidth: 650 }}>
                <TableHead className="table-head">
                  <TableRow>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Academic Year</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Archive Collection</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Record Count (Your School)</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Archived Date</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Archived By</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody className="table-body">
                  {!archivesLoading ? (
                    archives.length ? (
                      archives.map((row: any) => (
                        <TableRow key={row._id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                          <TableCell className="table-td" sx={{ fontWeight: 700, color: "#111827" }}>
                            {row.yearLabel}
                          </TableCell>
                          <TableCell className="table-td" sx={{ fontFamily: "monospace", fontSize: "12px", color: "#4b5563" }}>
                            {row.archiveCollectionName}
                          </TableCell>
                          <TableCell className="table-td" sx={{ color: "#475569" }}>
                            {row.schoolRecordCount ?? 0}
                          </TableCell>
                          <TableCell className="table-td" sx={{ color: "#475569" }}>
                            {moment(row.archivedAt).format("DD MMM YYYY, hh:mm A")}
                          </TableCell>
                          <TableCell className="table-td" sx={{ color: "#475569" }}>
                            {row.archivedBy}
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            {getStatusBadge(row.status)}
                          </TableCell>
                          <TableCell className="table-td" align="right">
                            <Tooltip title="Explore records" arrow>
                              <Button
                                className="admin-btn-theme"
                                size="small"
                                disabled={!(row.schoolRecordCount > 0)}
                                onClick={() => {
                                  setSelectedYear(row.yearLabel);
                                  setCurrentPage(0);
                                  setSearchValue("");
                                }}
                                sx={{
                                  height: "30px !important",
                                  px: "12px !important",
                                  fontSize: "11px !important",
                                  borderRadius: "4px !important",
                                  textTransform: "none",
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: "14px !important", mr: 0.5 }} />
                                Explore
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <DataNotFound />
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Loader />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      ) : (
        // VIEW 2: Archived Records list
        <Box>
          <Box className="admin-dashboard-inner-main admin-table-overflow">
            <TableContainer component={Paper} className="admin-table-container">
              <Table sx={{ minWidth: 1200 }}>
                <TableHead className="table-head">
                  <TableRow>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Student Name</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Admission No.</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Class / Section</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Fee Structure</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Installment</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Amount Due</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Amount Paid</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Balance Due</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Payment Date</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }}>Receipt No.</TableCell>
                    <TableCell className="table-th" sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody className="table-body">
                  {!recordsLoading ? (
                    records.length ? (
                      records.map((row: any) => {
                        const student = row.studentId || {};
                        const className = student.classId?.className || "—";
                        const sectionName = student.sectionId?.sectionName || "—";
                        return (
                          <TableRow key={row._id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                            <TableCell className="table-td" sx={{ fontWeight: 700, color: "#111827" }}>
                              {student.fullName || "—"}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#4b5563" }}>
                              {student.admissionNumber || "—"}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#4b5563" }}>
                              {className} / {sectionName}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#4b5563" }}>
                              {row.feeStructureId?.structureName || "—"}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#4b5563" }}>
                              {row.installmentLabel || `Inst. ${row.installmentNumber}`}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#111827" }}>
                              ₹ {row.amountDue}
                            </TableCell>
                            <TableCell className="table-td" sx={{ fontWeight: 700, color: "#111827" }}>
                              ₹ {row.amountPaid}
                            </TableCell>
                            <TableCell
                              className="table-td"
                              sx={{
                                color: row.balanceDue > 0 ? "#dc2626" : "#4b5563",
                                fontWeight: row.balanceDue > 0 ? 600 : 400,
                              }}
                            >
                              ₹ {row.balanceDue}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#4b5563" }}>
                              {row.paymentMethod}
                            </TableCell>
                            <TableCell className="table-td" sx={{ color: "#4b5563" }}>
                              {moment(row.paymentDate).format("DD MMM YYYY")}
                            </TableCell>
                            <TableCell className="table-td" sx={{ fontFamily: "monospace", fontSize: "12px", color: "#4b5563" }}>
                              {row.receiptNumber}
                            </TableCell>
                            <TableCell className="table-td" align="center">
                              {getStatusBadge(row.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12}>
                          <DataNotFound />
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <Loader />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Pagination */}
          <Box className="admin-pagination-main" sx={{ mt: 2 }}>
            {totalDocs > rowsPerPage && (
              <Pagination
                page={currentPage}
                rowsPerPage={rowsPerPage}
                setPage={setCurrentPage}
                setRowsPerPage={setRowsPerPage}
                count={totalDocs}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Confirmation Dialog for running Manual Archive */}
      <PopupModal
        type="delete"
        buttonText="Yes, Run Archive"
        module="Do you really want to run the database archiving process? This will move fee records older than 3 years to the archive and drop the original tables. This action is irreversible!"
        open={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        handleFunction={handleRunArchive}
        buttonStatusSpinner={triggeringArchive}
      />
    </Box>
  );
};

export default DatabaseArchive;
