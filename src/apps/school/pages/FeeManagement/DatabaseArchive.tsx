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
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Archive as ArchiveIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
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
import Filter from "@/apps/common/filter/Filter";
import moment from "moment";
import { debounce } from "lodash-es";

const DatabaseArchive = () => {
  const { hasPermission } = usePermissions();
  const canArchive = hasPermission(schoolAdminPermission.school_settings.update);

  // View States
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Filtered Archives getter
  const getFilteredArchives = () => {
    switch (activeTab) {
      case 0:
        return archives.filter((a) => a.collectionName && a.collectionName.startsWith("feecollections"));
      case 1:
        return archives.filter((a) => a.collectionName === "StudentEnrollment");
      case 2:
        return archives.filter((a) => a.collectionName === "TeacherAssignment");
      case 3:
        return archives.filter((a) => a.collectionName === "FeeStructure");
      default:
        return [];
    }
  };

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

  // Filter States
  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    status: "",
    paymentMethod: "",
    yearLabel: "",
  });

  const getFilterFields = () => {
    if (selectedYear) {
      // Explore view: Archived Fee Records filters
      return [
        {
          type: "searchbaseSelect",
          name: "status",
          label: "Payment Status",
          placeholder: "Select Status",
          options: [
            { label: "Paid", value: "PAID" },
            { label: "Partial", value: "PARTIAL" },
            { label: "Pending", value: "PENDING" },
            { label: "Failed", value: "FAILED" },
            { label: "Overdue", value: "OVERDUE" },
          ],
        },
        {
          type: "searchbaseSelect",
          name: "paymentMethod",
          label: "Payment Method",
          placeholder: "Select Method",
          options: [
            { label: "Cash", value: "Cash" },
            { label: "Online", value: "Online" },
            { label: "Cheque", value: "Cheque" },
            { label: "DD", value: "DD" },
            { label: "UPI", value: "UPI" },
            { label: "NEFT", value: "NEFT" },
            { label: "RTGS", value: "RTGS" },
          ],
        },
      ];
    } else {
      // Main runs view: Archive Runs filters
      const uniqueYears = Array.from(new Set(archives.map((a) => a.yearLabel).filter(Boolean)));
      return [
        {
          type: "searchbaseSelect",
          name: "yearLabel",
          label: "Academic Year",
          placeholder: "Select Year",
          options: uniqueYears.map((year) => ({ label: year, value: year })),
        },
        {
          type: "searchbaseSelect",
          name: "status",
          label: "Run Status",
          placeholder: "Select Status",
          options: [
            { label: "Success", value: "success" },
            { label: "Failed", value: "failed" },
          ],
        },
      ];
    }
  };

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    setCurrentPage(0);
    setOpenFilter(false);
    if (selectedYear) {
      loadRecords(searchValue, values);
    } else {
      loadArchives(values);
    }
  };

  const handleResetFilter = () => {
    const initial = { status: "", paymentMethod: "", yearLabel: "" };
    setFilterValues(initial);
    setCurrentPage(0);
    setOpenFilter(false);
    if (selectedYear) {
      loadRecords(searchValue, initial);
    } else {
      loadArchives(initial);
    }
  };

  // Fetch Archives list
  const loadArchives = async (currentFilters?: any) => {
    setArchivesLoading(true);
    try {
      const activeFilters = currentFilters !== undefined ? currentFilters : filterValues;
      const params: any = {};
      if (activeFilters.yearLabel) params.yearLabel = activeFilters.yearLabel;
      if (activeFilters.status) params.status = activeFilters.status;

      const res: any = await getArchivesList(params);
      setArchives(res?.data?.data || []);
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
  const loadRecords = async (searchVal?: string, currentFilters?: any) => {
    if (!selectedYear) return;
    setRecordsLoading(true);
    try {
      const targetSearch = searchVal !== undefined ? searchVal : searchValue;
      const activeFilters = currentFilters !== undefined ? currentFilters : filterValues;
      const res: any = await getArchivedRecords(
        selectedYear,
        currentPage + 1,
        rowsPerPage,
        targetSearch,
        activeFilters.status || undefined,
        activeFilters.paymentMethod || undefined
      );
      setRecords(res?.data?.data?.records || []);
      setTotalDocs(res?.data?.data?.pagination?.total || 0);
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
    [selectedYear, filterValues]
  );

  const handleRunArchive = async () => {
    if (!canArchive) return;
    setTriggeringArchive(true);
    try {
      const res: any = await runArchiveProcess();
      const result = res?.data?.data;
      if (result?.success) {
        toasterSuccess(`Archiving successful for year ${result?.yearLabel}!`);
        loadArchives();
      } else {
        toasterError(result?.error || "Archiving run failed.");
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
                setFilterValues({ status: "", paymentMethod: "" });
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

        <Box className="admin-flex-end" sx={{ gap: 2, alignItems: "center" }}>
          {/* Always visible Search and Filter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box className="admin-search-main" sx={{ width: "350px" }}>
              <Box className="admin-search-box">
                <Box className="admin-form-group">
                  <TextField
                    value={searchValue}
                    fullWidth
                    id="archive-records-search"
                    className="admin-form-control"
                    placeholder={selectedYear ? "Search by Student, Admission No, Receipt No..." : "Search by Year..."}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      setSearchValue(val);
                      if (selectedYear) {
                        debouncedSearch(val);
                      }
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

            {/* Filter Button */}
            <Box className="admin-filter-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => setOpenFilter(true)}
                sx={{
                  minWidth: "45px !important",
                  height: "36px !important",
                  p: "0 12px !important",
                  borderRadius: "6px !important",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FilterIcon
                  sx={{ color: "var(--button-text, #fff)", fontSize: "18px" }}
                />
              </Button>
            </Box>
          </Box>

          {/* Run Archive Job (only when not in explore mode) */}
          {!selectedYear && canArchive && (
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

          {/* 🗂️ Tabs to select Collection Category */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              aria-label="archive categories tabs"
              sx={{
                ".MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#64748b",
                },
                ".Mui-selected": {
                  color: "var(--primary-color) !important",
                  fontWeight: 700,
                },
                ".MuiTabs-indicator": {
                  backgroundColor: "var(--primary-color)",
                }
              }}
            >
              <Tab label="Fee Collections" />
              <Tab label="Student Enrollments" />
              <Tab label="Teacher Assignments" />
              <Tab label="Fee Structures" />
            </Tabs>
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
                    {activeTab === 0 && (
                      <TableCell className="table-th" sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody className="table-body">
                  {!archivesLoading ? (
                    getFilteredArchives().length ? (
                      getFilteredArchives().map((row: any) => (
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
                          {activeTab === 0 && (
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
                                    setFilterValues({ status: "", paymentMethod: "" });
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
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <DataNotFound text="No Archives Found" colSpan={activeTab === 0 ? 7 : 6} />
                    )
                  ) : (
                    <Loader colSpan={activeTab === 0 ? 7 : 6} />
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
                      <DataNotFound text="No Archived Records Found" colSpan={12} />
                    )
                  ) : (
                    <Loader colSpan={12} />
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

      {/* 🔍 Filter Drawer */}
      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Archived Records Filter"
        fields={getFilterFields()}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />
    </Box>
  );
};

export default DatabaseArchive;
