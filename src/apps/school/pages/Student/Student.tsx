import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Chip,
  debounce,
  TableBody,
  Tooltip,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  IconButton,
  Autocomplete,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  LocalPhone as PhoneIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Wc as GenderIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { masterService } from "@/api/services/master.service";
import { admissionService } from "@/api/services/admission.service";
import toast from "react-hot-toast";
import moment from "moment";
import {
  getStudents,
  changeStudentStatus,
  deleteStudent,
  getPendingAdmissionsCount,
  generateRollNumbersAction,
} from "@/redux/slices/studentSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import ProfileAvatar from "@/apps/common/ProfileAvatar";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import PopupModal from "../../component/schoolCommon/popUpModal/PopupModal";
import BulkImportModal from "@/apps/common/BulkImportModal";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import type { RootState, AppDispatch } from "@/redux/Store";
import { Formik, Form } from "formik";
import { generateRollNumbersValidationSchema } from "@/utils/validation/FormikValidation";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
interface SectionItem {
  _id: string;
  code?: string;
  name?: string;
  classId?: string | { _id: string };
}

const getAvailableYears = (): number[] => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const currentYear = month >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const years: number[] = [];
  for (let y = 2020; y <= currentYear; y++) {
    years.push(y);
  }
  return years.reverse();
};

export default function Student() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { students, total, loading, pendingAdmissionsCount } = useSelector(
    (state: RootState) => state.StudentReducer,
  );

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  const [openDelete, setOpenDelete] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);

  // Import state
  const [openImportModal, setOpenImportModal] = useState(false);

  // Auto Roll Number state
  const [openRollNoModal, setOpenRollNoModal] = useState(false);
  const [generatingRollNos, setGeneratingRollNos] = useState(false);

  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    classId: "",
    sectionId: "",
    isActive: "",
    startYears: [] as number[],
  });

  const [exportingFormat, setExportingFormat] = useState<"excel" | "pdf" | "print" | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const exporting = exportingFormat !== null;

  const [openRangeModal, setOpenRangeModal] = useState<boolean>(false);
  const [pendingFormat, setPendingFormat] = useState<"excel" | "pdf" | "print" | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const studentExportFields = [
    { key: "admissionNo", label: "Adm No" },
    { key: "rollNo", label: "Roll No" },
    { key: "fullName", label: "Student Name" },
    { key: "classSection", label: "Class/Section" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "dateOfBirth", label: "DOB" },
    { key: "bloodGroup", label: "Blood Group" },
    { key: "fatherName", label: "Father Name" },
    { key: "fatherPhone", label: "Father Phone" },
    { key: "motherName", label: "Mother Name" },
    { key: "admissionDate", label: "Adm Date" },
    { key: "address", label: "Address" },
    { key: "status", label: "Status" },
  ];

  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(
    studentExportFields.map((f) => f.key)
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
          description: "Generate and download the students directory report in Microsoft Excel (.xlsx) format.",
        };
      case "pdf":
        return {
          title: "Export Report to PDF",
          icon: <PdfIcon sx={{ color: "#F04438", fontSize: "24px" }} />,
          description: "Generate and download the students directory report in PDF format.",
        };
      case "print":
        return {
          title: "Print Report View",
          icon: <PrintIcon sx={{ color: "#667085", fontSize: "24px" }} />,
          description: "Open the printer-friendly students directory report view.",
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

  // For Admission tabs ──
  const [tabValue, setTabValue] = useState(0);
  const [pendingAdmissions, setPendingAdmissions] = useState<any[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(10);
  const [pendingSearch, setPendingSearch] = useState("");

  const [reviewModal, setReviewModal] = useState<any>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [admissionNumberOverride, setAdmissionNumberOverride] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingAdmissions = async () => {
    setPendingLoading(true);
    try {
      const res: any = await admissionService.getPendingAdmissions({
        pageNumber: pendingPage + 1,
        perPageData: pendingRowsPerPage,
        searchRequest: pendingSearch.trim(),
      });
      setPendingAdmissions(res?.data || []);
      setPendingTotal(res?.pagination?.totalArrayLength || 0);
    } catch {
      setPendingAdmissions([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 1) fetchPendingAdmissions();
  }, [tabValue, pendingPage, pendingSearch, pendingRowsPerPage]);

  useEffect(() => {
    dispatch(getPendingAdmissionsCount() as any);
  }, [dispatch]);

  const handleAdmissionAction = async (action: "approved" | "rejected") => {
    if (!reviewModal) return;
    if (action === "rejected" && !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await admissionService.admissionAction(reviewModal._id, {
        action,
        rejectReason: action === "rejected" ? rejectReason.trim() : undefined,
        admissionNumber: admissionNumberOverride.trim() || undefined,
      });
      toast.success(action === "approved" ? "Application approved!" : "Application rejected");
      setReviewModal(null);
      setRejectModalOpen(false);
      setRejectReason("");
      setAdmissionNumberOverride("");
      fetchPendingAdmissions();
      dispatch(getPendingAdmissionsCount() as any);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };



  const { allClasses } = useSelector((state: RootState) => state.ClassReducer);
  const { allSections } = useSelector(
    (state: RootState) => state.SectionReducer,
  );

  const handleGetData = (searchQuery?: string, filters?: any) => {
    const activeFilters = filters || filterValues;
    const { startYears, ...restFilters } = activeFilters;

    dispatch(
      getStudents({
        page: currentPage + 1,
        perPage: rowsPerPage > 0 ? rowsPerPage : 10,
        search: searchQuery?.trim() ?? searchNameValue.trim(),
        ...restFilters,
        startYear: startYears && startYears.length > 0 ? startYears : undefined,
      }) as any,
    );
  };

  useEffect(() => {
    handleGetData(searchNameValue);
    dispatch(getClasses({ type: "filter" }) as any);
    dispatch(getSections({ type: "filter" }) as any);
  }, [currentPage, rowsPerPage]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    handleGetData(searchNameValue, values);
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    const resetValues = {
      fullName: "",
      phoneNumber: "",
      email: "",
      classId: "",
      sectionId: "",
      isActive: "",
      startYears: [],
    };
    setFilterValues(resetValues);
    handleGetData(searchNameValue, resetValues);
    setOpenFilter(false);
  };

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    [],
  );

  const filterFields: any[] = [
    {
      type: "inputSelect",
      name: "fullName",
      label: "Full Name",
      placeholder: "Enter Full Name",
    },
    {
      type: "inputSelect",
      name: "phoneNumber",
      label: "Phone Number",
      placeholder: "Enter Phone Number",
    },
    {
      type: "inputSelect",
      name: "email",
      label: "Email",
      placeholder: "Enter Email",
    },
    {
      type: "searchbaseSelect",
      name: "classId",
      label: "Class",
      placeholder: "Select Class",
      options: allClasses || [],
      getOptionLabel: (opt: any) => opt.name || "",
      getOptionValue: (opt: any) => opt._id,
    },
    {
      type: "searchbaseSelect",
      name: "sectionId",
      label: "Section",
      placeholder: "Select Section",
      options: allSections || [],
      getOptionLabel: (opt: any) => opt.code || "",
      getOptionValue: (opt: any) => opt._id,
    },
    {
      type: "searchbaseSelect",
      name: "isActive",
      label: "Status",
      placeholder: "Select Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      type: "multiSearchSelect",
      name: "startYears",
      label: "Academic Year",
      placeholder: "Select Academic Years",
      options: getAvailableYears().map((y) => ({
        label: `${y}-${y + 1}`,
        value: y,
      })),
      getOptionLabel: (option: any) => option.label || "",
      getOptionValue: (option: any) => option.value,
    },
  ];

  const handleOpenDelete = (data: any) => {
    setSelectedData(data);
    setOpenDelete(true);
  };

  const setOpenStatusChange = (data: any) => {
    setSelectedData(data);
    setOpenStatusModal(true);
  };

  const handleDelete = async () => {
    if (!selectedData) return;
    setButtonStatusSpinner(true);
    const result = await dispatch(deleteStudent(selectedData._id) as any);
    setButtonStatusSpinner(false);
    if (deleteStudent.fulfilled.match(result)) {
      setOpenDelete(false);
      setSelectedData(null);
      handleGetData();
    }
  };

  const handleIdCard = async (id: string) => {
    try {
      const response: any = await masterService.getStudentIdCard(id);
      const blob = new Blob([response?.data ?? response], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      // silently ignore
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    setButtonStatusSpinner(true);
    const result = await dispatch(changeStudentStatus(selectedData._id) as any);
    setButtonStatusSpinner(false);
    if (changeStudentStatus.fulfilled.match(result)) {
      setOpenStatusModal(false);
      setSelectedData(null);
      handleGetData();
    }
  };

  const handleExport = async (
    format: "excel" | "pdf" | "print",
    limit?: number,
    offset?: number
  ) => {
    try {
      setExportingFormat(format);
      const params = {
        search: searchNameValue,
        classId: filterValues.classId,
        sectionId: filterValues.sectionId,
        isActive: filterValues.isActive,
        fullName: filterValues.fullName,
        phoneNumber: filterValues.phoneNumber,
        email: filterValues.email,
        format,
        limit,
        offset,
        fields: selectedExportFields.join(","),
      };

      const response: any = await masterService.exportStudents(params);
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
          `Students_Report_${moment().format("YYYYMMDD_HHmmss")}.${format === "excel" ? "xlsx" : format === "pdf" ? "pdf" : "html"
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
      toast.error(error.message || "Failed to export students");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Admission Number,Roll Number,Full Name,Email,Phone Number,Gender,Date of Birth,Blood Group,Father Name,Father Phone,Mother Name,Admission Date,Address,Class Name,Section Name,Role Name\nADM001,Roll 1,Alice Smith,alice@example.com,9876543210,Female,15/05/2012,O+,John Smith,9876543211,Jane Smith,10/01/2023,123 Street Name,Class 1,Section A,Student";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadFile = async (file: File) => {
    try {
      const response = await masterService.importStudents(file);
      handleGetData();
      
      if (response?.data && response.data.failCount > 0) {
        return {
          success: false,
          message: `${response.data.successCount} Students imported successfully, ${response.data.failCount} failed.`,
          errors: response.data.failures,
        };
      }
      
      return { success: true, message: response.message || "Students imported successfully." };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import students";
      const errors = error.response?.data?.data?.failures || 
                     error.response?.data?.data?.errors || 
                     error.response?.data?.errors || 
                     null;
      return {
        success: false,
        message,
        errors,
      };
    }
  };

  return (
    <Box className="admin-dashboard-content">
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "#E9ECEF", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--primary-color)",
              height: "2.4px",
              borderRadius: "3px 3px 0 0",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              minHeight: "44px",
              color: "#667085",
              mr: 4,
              px: 0,
              "&.Mui-selected": {
                color: "var(--primary-color) !important",
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab label="Students" />
          <Tab label={`Pending Admissions (${pendingAdmissionsCount || 0})`} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box className="admin-user-list-flex admin-page-title-main">
          <Typography
            className="admin-page-title"
            component="h2"
            variant="h2"
          >
            Students
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      setSearchNameValue(value);
                      debouncedCallGetApi(value);
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
                  minWidth: "45px !important",
                  height: "36px !important",
                  p: "0 12px !important",
                  borderRadius: "6px !important",
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
            <Box className="admin-add-user-btn-main" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {hasPermission(schoolAdminPermission.student.update) && students?.length > 0 && hasPermission(schoolAdminPermission.student.create) && (
                <Button
                  className="admin-btn-theme"
                  onClick={() => setOpenRollNoModal(true)}
                  sx={{
                    height: "36px !important",
                    px: "20px !important",
                    fontSize: "12px !important",
                    borderRadius: "6px !important",
                  }}
                >
                  Auto Roll No
                </Button>
              )}
              {hasPermission(schoolAdminPermission.student.import) && (
                <Button
                  className="admin-btn-theme"
                  onClick={() => setOpenImportModal(true)}
                  sx={{
                    height: "36px !important",
                    px: "20px !important",
                    fontSize: "12px !important",
                    borderRadius: "6px !important",
                  }}
                >
                  Import
                </Button>
              )}
              {hasPermission(schoolAdminPermission.student.create) && (
                <Button
                  className="admin-btn-theme"
                  onClick={() => {
                    navigate("/student/add");
                  }}
                  sx={{
                    height: "36px !important",
                    px: "20px !important",
                    fontSize: "12px !important",
                    borderRadius: "6px !important",
                  }}
                >
                  <AddIcon
                    sx={{
                      color: "var(--button-text, #fff)",
                      fontSize: "16px !important",
                      mr: 0.5,
                    }}
                  />
                  Add Student
                </Button>
              )}
            </Box>
            {hasPermission(schoolAdminPermission.student.export) && students?.length > 0 && (
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
                  }}
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
      )}

      {tabValue === 1 ? (
        /* ── Pending Admissions Tab ── */
        <Box>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#344054",
                  fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                }}
              >
                Pending Admission Applications
              </Typography>
            </Box>

            <Box sx={{ width: { xs: "100%", sm: "300px" } }}>
              <Box className="admin-search-box">
                <Box className="admin-form-group" sx={{ m: 0 }}>
                  <TextField
                    value={pendingSearch}
                    fullWidth
                    id="pendingSearch"
                    className="admin-form-control"
                    placeholder="Search"
                    onChange={(e) => {
                      setPendingSearch(e.target.value);
                      setPendingPage(0);
                    }}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                  <SearchIcon
                    sx={{
                      color: "var(--primary-color)",
                      fontSize: "20px",
                    }}
                    className="school-admin-search-grey-img admin-icon"
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="card-border common-card">
            <Box className="brand-table-main page-table-main">
              <TableContainer component={Paper} className="table-container">
                <Table className="table">
                  <TableHead className="table-head">
                    <TableRow className="table-row">
                      <TableCell className="table-th" width="25%">STUDENT INFO</TableCell>
                      <TableCell className="table-th" width="15%">CLASS APPLIED</TableCell>
                      <TableCell className="table-th" width="15%">PREVIOUS ACADEMIC</TableCell>
                      <TableCell className="table-th" width="15%">GUARDIAN</TableCell>
                      <TableCell className="table-th" width="15%" align="center">APPLIED ON</TableCell>
                      <TableCell className="table-th" width="15%" align="center">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="table-body">
                    {pendingLoading ? (
                      <Loader colSpan={6} />
                    ) : pendingAdmissions.length ? (
                      pendingAdmissions.map((app: any) => (
                        <TableRow key={app._id} sx={{ "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" } }}>
                          <TableCell className="table-td">
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                              <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                                  {app.fullName}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                                  <PhoneIcon sx={{ fontSize: 12, color: "var(--primary-color)" }} />
                                  <Typography sx={{ fontSize: 11, color: "#6b7280" }}>{app.phoneNumber}</Typography>
                                </Box>
                                {app.email && (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <EmailIcon sx={{ fontSize: 12, color: "var(--primary-color)" }} />
                                    <Typography sx={{ fontSize: 11, color: "#6b7280" }}>{app.email}</Typography>
                                  </Box>
                                )}
                                <Chip
                                  label={`App: ${app.admissionNumber}`}
                                  size="small"
                                  sx={{ mt: 0.4, height: 18, fontSize: 10, fontWeight: 700, backgroundColor: "rgba(var(--primary-color-rgb, 92,26,26), 0.08)", color: "var(--primary-color)", borderRadius: "4px" }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell className="table-td">
                            {app.classId?.name ? (
                              <Chip icon={<SchoolIcon sx={{ fontSize: 13 }} />} label={app.classId.name} size="small"
                                sx={{ height: 22, fontSize: 11, fontWeight: 600, backgroundColor: "#f0f7ff", color: "#1565c0", border: "1px solid #bae7ff" }} />
                            ) : "N/A"}
                          </TableCell>
                          <TableCell className="table-td">
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                              {app.previousClass && (
                                <Typography sx={{ fontSize: 11, color: "#374151" }}>Prev Class: <strong>{app.previousClass}</strong></Typography>
                              )}
                              {app.previousSchool && (
                                <Typography sx={{ fontSize: 11, color: "#374151" }}>School: <strong>{app.previousSchool}</strong></Typography>
                              )}
                              {app.percentage !== undefined && app.percentage !== null && (
                                <Chip label={`${app.percentage}%`} size="small"
                                  sx={{ height: 18, fontSize: 10, fontWeight: 700, backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", width: "fit-content" }} />
                              )}
                              {!app.previousClass && !app.previousSchool && app.percentage == null && (
                                <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>N/A</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell className="table-td">
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                              {app.fatherName && <Typography sx={{ fontSize: 11, color: "#111827" }}>{app.fatherName}</Typography>}
                              {app.fatherPhone && <Typography sx={{ fontSize: 10, color: "#6b7280" }}>{app.fatherPhone}</Typography>}
                              {app.motherName && <Typography sx={{ fontSize: 11, color: "#111827", mt: 0.3 }}>{app.motherName}</Typography>}
                              {!app.fatherName && !app.motherName && <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>N/A</Typography>}
                            </Box>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Typography sx={{ fontSize: 12, color: "#374151" }}>
                              {moment(app.createdAt).format("DD MMM YYYY")}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                              {moment(app.createdAt).fromNow()}
                            </Typography>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Tooltip title="Review Application" arrow>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => { setReviewModal(app); setAdmissionNumberOverride(""); setRejectReason(""); }}
                                sx={{ fontSize: 11, borderColor: "var(--primary-color)", color: "var(--primary-color)", px: 1.5, py: 0.3, minWidth: "auto" }}
                                startIcon={<ViewIcon sx={{ fontSize: 14 }} />}
                              >
                                Review
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <DataNotFound text="No pending admission applications" colSpan={6} />
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box className="admin-pagination-main">
              {pendingTotal ? (
                <Pagination
                  page={pendingPage}
                  rowsPerPage={pendingRowsPerPage}
                  setPage={setPendingPage}
                  setRowsPerPage={setPendingRowsPerPage}
                  count={pendingTotal}
                />
              ) : null}
            </Box>
          </Box>
        </Box>
      ) : (

        <Box className="card-border common-card">
          <Box className="brand-table-main page-table-main">
            <TableContainer component={Paper} className="table-container">
              <Table aria-label="simple table" className="table">
                <TableHead className="table-head">
                  <TableRow className="table-row">
                    <TableCell component="th" className="table-th" width="22%">
                      STUDENT INFO
                    </TableCell>
                    <TableCell component="th" className="table-th" width="15%">
                      CLASS / SECTION
                    </TableCell>
                    <TableCell component="th" className="table-th" width="13%">
                      PERSONAL
                    </TableCell>
                    <TableCell component="th" className="table-th" width="20%">
                      GUARDIAN
                    </TableCell>
                    <TableCell component="th" className="table-th" width="17%">
                      STATUS / LOGIN
                    </TableCell>
                    {hasAnyPermission([
                      schoolAdminPermission.student.read,
                      schoolAdminPermission.student.update,
                      schoolAdminPermission.student.delete,
                    ]) && (
                        <TableCell
                          component="th"
                          className="table-th"
                          width="10%"
                          align="center"
                        >
                          ACTIONS
                        </TableCell>
                      )}
                  </TableRow>
                </TableHead>
                <TableBody className="table-body">
                  {!loading ? (
                    students?.length ? (
                      students?.map((data: any) => (
                        <TableRow
                          key={data._id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                          }}
                        >
                          {/* STUDENT INFO */}
                          <TableCell component="td" className="table-td">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.5,
                              }}
                            >
                              <ProfileAvatar
                                name={data?.fullName}
                                imageUrl={data?.profileImage}
                                size={45}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#111827",
                                    mb: 0.2,
                                  }}
                                >
                                  {data?.fullName || "N/A"}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    mb: 0.2,
                                  }}
                                >
                                  <EmailIcon
                                    sx={{
                                      fontSize: 13,
                                      color: "var(--primary-color)",
                                    }}
                                  />
                                  <Typography
                                    sx={{ fontSize: "11px", color: "#6b7280" }}
                                  >
                                    {data?.email || "N/A"}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    mb: 0.2,
                                  }}
                                >
                                  <PhoneIcon
                                    sx={{
                                      fontSize: 13,
                                      color: "var(--primary-color)",
                                    }}
                                  />
                                  <Typography
                                    sx={{ fontSize: "11px", color: "#6b7280" }}
                                  >
                                    {data?.phoneNumber || "N/A"}
                                  </Typography>
                                </Box>
                                {data?.admissionNumber && (
                                  <Chip
                                    label={`Code: ${data.admissionNumber}`}
                                    size="small"
                                    sx={{
                                      height: "18px",
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      backgroundColor:
                                        "rgba(var(--primary-color-rgb, 92,26,26), 0.1)",
                                      color: "var(--primary-color)",
                                      borderRadius: "4px",
                                      "& .MuiChip-label": { px: "6px" },
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* CLASS / SECTION */}
                          <TableCell component="td" className="table-td">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              {data?.classId?.name && (
                                <Chip
                                  label={data.classId.name}
                                  size="small"
                                  sx={{
                                    height: "20px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    backgroundColor: "#f0f7ff",
                                    color: "#1565c0",
                                    border: "1px solid #bae7ff",
                                    borderRadius: "4px",
                                  }}
                                />
                              )}
                              {data?.sectionId?.code && (
                                <Typography
                                  sx={{
                                    fontSize: "11px",
                                    color: "#475467",
                                    fontWeight: 500,
                                  }}
                                >
                                  Section: {data.sectionId.code}
                                </Typography>
                              )}
                              {data?.rollNumber && (
                                <Typography
                                  sx={{ fontSize: "10px", color: "#9ca3af" }}
                                >
                                  Roll No: {data.rollNumber}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* PERSONAL */}
                          <TableCell component="td" className="table-td">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <GenderIcon
                                  sx={{ fontSize: 13, color: "#9ca3af" }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "10px",
                                    color: "#9ca3af",
                                    fontWeight: 600,
                                  }}
                                >
                                  SEX:
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "12px", color: "#111827" }}
                                >
                                  {data?.gender || "N/A"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CalendarIcon
                                  sx={{ fontSize: 13, color: "#9ca3af" }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "10px",
                                    color: "#9ca3af",
                                    fontWeight: 600,
                                  }}
                                >
                                  DOB:
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "11px", color: "#111827" }}
                                >
                                  {data?.dateOfBirth
                                    ? moment(data.dateOfBirth).format("DD MMM YY")
                                    : "N/A"}
                                </Typography>
                              </Box>
                              {data?.bloodGroup && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "10px",
                                      color: "#9ca3af",
                                      fontWeight: 600,
                                    }}
                                  >
                                    BLOOD:
                                  </Typography>
                                  <Chip
                                    label={data.bloodGroup}
                                    size="small"
                                    sx={{
                                      height: "16px",
                                      fontSize: "9px",
                                      backgroundColor: "#fff1f0",
                                      color: "#f5222d",
                                      border: "1px solid #ffccc7",
                                      fontWeight: 700,
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          {/* GUARDIAN */}
                          <TableCell component="td" className="table-td">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.4,
                              }}
                            >
                              {data?.fatherName && (
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "10px",
                                      color: "#9ca3af",
                                      fontWeight: 600,
                                    }}
                                  >
                                    FATHER
                                  </Typography>
                                  <Typography
                                    sx={{ fontSize: "12px", color: "#111827" }}
                                  >
                                    {data.fatherName}
                                  </Typography>
                                  {data?.fatherPhone && (
                                    <Typography
                                      sx={{ fontSize: "10px", color: "#6b7280" }}
                                    >
                                      {data.fatherPhone}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                              {data?.motherName && (
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "10px",
                                      color: "#9ca3af",
                                      fontWeight: 600,
                                      mt: 0.3,
                                    }}
                                  >
                                    MOTHER
                                  </Typography>
                                  <Typography
                                    sx={{ fontSize: "12px", color: "#111827" }}
                                  >
                                    {data.motherName}
                                  </Typography>
                                  {data?.motherPhone && (
                                    <Typography
                                      sx={{ fontSize: "10px", color: "#6b7280" }}
                                    >
                                      {data.motherPhone}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                              {!data?.fatherName && !data?.motherName && (
                                <Typography
                                  sx={{ fontSize: "11px", color: "#9ca3af" }}
                                >
                                  N/A
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* STATUS / LOGIN */}
                          <TableCell component="td" className="table-td">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.8,
                              }}
                            >
                              {hasPermission(
                                schoolAdminPermission.student.update,
                              ) ? (
                                <Tooltip
                                  title={
                                    data?.isActive ? "Deactivate" : "Activate"
                                  }
                                  arrow
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <IOSSwitch
                                      checked={data?.isActive}
                                      onChange={() => setOpenStatusChange(data)}
                                      size="small"
                                    />
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Typography
                                  sx={{
                                    fontSize: "10px",
                                    color: "#ff9800",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Status locked
                                </Typography>
                              )}

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={data?.isLogin ? "Online" : "Offline"}
                                  size="small"
                                  sx={{
                                    backgroundColor: data?.isLogin
                                      ? "#e8f5e9"
                                      : "#f5f5f5",
                                    color: data?.isLogin ? "#2e7d32" : "#9e9e9e",
                                    fontWeight: 700,
                                    fontSize: "9px",
                                    height: "18px",
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>

                          {hasAnyPermission([
                            schoolAdminPermission.student.read,
                            schoolAdminPermission.student.update,
                            schoolAdminPermission.student.delete,
                          ]) && (
                              <TableCell
                                component="td"
                                className="table-td"
                                align="center"
                              >
                                <Box
                                  className="admin-table-data-btn-flex"
                                  sx={{ justifyContent: "center" }}
                                >
                                  {hasPermission(
                                    schoolAdminPermission.student.read,
                                  ) && (
                                      <Tooltip
                                        title="View"
                                        arrow
                                        placement="bottom"
                                      >
                                        <Button
                                          className="admin-table-data-btn admin-table-view-btn"
                                          onClick={() =>
                                            navigate("/student/view", {
                                              state: { id: data?._id },
                                            })
                                          }
                                        >
                                          <img
                                            src={Svg.yellowEye}
                                            className="admin-icon"
                                            alt="View"
                                          />
                                        </Button>
                                      </Tooltip>
                                    )}
                                  {hasPermission(
                                    schoolAdminPermission.student.read,
                                  ) && (
                                      <Tooltip
                                        title="ID Card"
                                        arrow
                                        placement="bottom"
                                      >
                                        <Button
                                          className="admin-table-data-btn admin-table-idcard-btn"
                                          onClick={() => handleIdCard(data?._id)}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-idcard-icon"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 9h4M14 12h4M14 15h2"/></svg>
                                        </Button>
                                      </Tooltip>
                                    )}
                                  {hasPermission(
                                    schoolAdminPermission.student.update,
                                  ) && (
                                      <Tooltip
                                        title="Edit"
                                        arrow
                                        placement="bottom"
                                      >
                                        <Button
                                          className="admin-table-data-btn admin-table-edit-btn"
                                          onClick={() =>
                                            navigate("/student/edit", {
                                              state: { id: data?._id },
                                            })
                                          }
                                        >
                                          <img
                                            src={Svg.editIcon}
                                            className="admin-icon"
                                            alt="Edit"
                                          />
                                        </Button>
                                      </Tooltip>
                                    )}
                                  {hasPermission(
                                    schoolAdminPermission.student.delete,
                                  ) && (
                                      <Tooltip
                                        title="Delete"
                                        arrow
                                        placement="bottom"
                                      >
                                        <Button
                                          className="admin-table-data-btn admin-table-delete-btn"
                                          onClick={() => handleOpenDelete(data)}
                                        >
                                          <img
                                            src={Svg.trash}
                                            className="admin-icon"
                                            alt="Delete"
                                          />
                                        </Button>
                                      </Tooltip>
                                    )}
                                </Box>
                              </TableCell>
                            )}
                        </TableRow>
                      ))
                    ) : (
                      <DataNotFound text="No Students Found" colSpan={6} />
                    )
                  ) : (
                    <Loader colSpan={6} />
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

      )} {/* end tabValue === 0 */}

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Student Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Student"
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        handleFunction={handleDelete}
        buttonStatusSpinner={buttonStatusSpinner}
      />

      <PopupModal
        type={selectedData?.isActive ? "deactivate" : "activate"}
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module={`Are you sure you want to ${selectedData?.isActive ? "deactivate" : "activate"} this student?`}
        open={openStatusModal}
        handleClose={() => {
          setOpenStatusModal(false);
          setSelectedData(null);
        }}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={buttonStatusSpinner}
      />

      <BulkImportModal
        open={openImportModal}
        onClose={(imported) => {
          setOpenImportModal(false);
          if (imported) handleGetData();
        }}
        title="Import Students"
        onDownloadTemplate={handleDownloadTemplate}
        onUpload={handleUploadFile}
      />

      {/* Review Admission Modal */}
      {/* Review Admission Modal */}
      <Dialog
        open={!!reviewModal}
        onClose={() => !actionLoading && setReviewModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" } }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#0f172a" }}>
            Review Admission Application
          </Typography>
          <IconButton onClick={() => !actionLoading && setReviewModal(null)} size="small" sx={{ color: "#94a3b8" }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
          {reviewModal && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Student info main card */}
              <Box sx={{ 
                background: "#ffffff", 
                borderRadius: "12px", 
                p: 2.5, 
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}>
                <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                  {reviewModal.fullName}
                </Typography>
                
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {reviewModal.phoneNumber && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b", fontSize: "13px" }}>
                      <PhoneIcon sx={{ fontSize: 15 }} />
                      {reviewModal.phoneNumber}
                    </Box>
                  )}
                  {reviewModal.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b", fontSize: "13px" }}>
                      <EmailIcon sx={{ fontSize: 15 }} />
                      {reviewModal.email}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {reviewModal.classId?.name && (
                    <Chip 
                      icon={<SchoolIcon sx={{ fontSize: "14px !important", color: "#1e40af !important" }} />} 
                      label={`Class: ${reviewModal.classId.name}`} 
                      size="small"
                      sx={{ 
                        fontSize: "12px", 
                        fontWeight: 600,
                        backgroundColor: "#eff6ff", 
                        color: "#1e40af", 
                        border: "1px solid #bfdbfe",
                        borderRadius: "6px",
                        py: 1.5
                      }} 
                    />
                  )}
                  {reviewModal.percentage != null && (
                    <Chip 
                      label={`${reviewModal.percentage}%`} 
                      size="small"
                      sx={{ 
                        fontSize: "12px", 
                        fontWeight: 700, 
                        backgroundColor: "#f0fdf4", 
                        color: "#166534", 
                        border: "1px solid #bbf7d0",
                        borderRadius: "6px",
                        py: 1.5
                      }} 
                    />
                  )}
                </Box>

                {(reviewModal.previousClass || reviewModal.previousSchool) && (
                  <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 1.5, mt: 1.5 }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.5 }}>
                      Previous Education
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
                      {[reviewModal.previousClass, reviewModal.previousSchool].filter(Boolean).join(" at ")}
                    </Typography>
                  </Box>
                )}

                {reviewModal.resultDocument && (
                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PdfIcon sx={{ fontSize: 16 }} />}
                      href={`${import.meta.env.VITE_BASE_URL_IMAGE}/${reviewModal.resultDocument}`}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        textTransform: "none",
                        borderColor: "#cbd5e1",
                        color: "#475569",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: "#f8fafc",
                        "&:hover": {
                          borderColor: "var(--primary-color)",
                          color: "var(--primary-color)",
                          backgroundColor: "#f0fdfa"
                        }
                      }}
                    >
                      View Marksheet/Result
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Guardian info card */}
              {(reviewModal.fatherName || reviewModal.motherName) && (
                <Box sx={{ 
                  background: "#ffffff", 
                  borderRadius: "12px", 
                  p: 2.5, 
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                }}>
                  <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", mb: 2 }}>
                    Guardian Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {reviewModal.fatherName && (
                      // @ts-ignore
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: "12px", color: "#94a3b8", mb: 0.2 }}>Father</Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>{reviewModal.fatherName}</Typography>
                        {reviewModal.fatherPhone && (
                          <Typography sx={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                            <PhoneIcon sx={{ fontSize: 12 }} /> {reviewModal.fatherPhone}
                          </Typography>
                        )}
                      </Grid>
                    )}
                    {reviewModal.motherName && (
                      // @ts-ignore
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: "12px", color: "#94a3b8", mb: 0.2 }}>Mother</Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>{reviewModal.motherName}</Typography>
                        {reviewModal.motherPhone && (
                          <Typography sx={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                            <PhoneIcon sx={{ fontSize: 12 }} /> {reviewModal.motherPhone}
                          </Typography>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* GR Number Field */}
              <Box>
                <Typography sx={labelSx}>
                  Admission Number (GR Number) <Typography component="span" sx={{ fontSize: "11px", color: "#94a3b8", textTransform: "none", fontWeight: 400 }}>(optional — auto-generated if blank)</Typography>
                </Typography>
                <TextField
                  value={admissionNumberOverride}
                  onChange={(e) => setAdmissionNumberOverride(e.target.value)}
                  placeholder="e.g. GR-2024-001"
                  fullWidth 
                  size="small"
                  sx={inputSx}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <Button
            onClick={() => setReviewModal(null)}
            disabled={actionLoading}
            className="admin-btn-secondary"
            sx={{ px: 3, minWidth: "100px", textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              onClick={() => setRejectModalOpen(true)}
              disabled={actionLoading}
              variant="outlined"
              sx={{ 
                borderColor: "#ef4444", 
                color: "#ef4444", 
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                px: 3,
                py: 1,
                "&:hover": { 
                  borderColor: "#dc2626", 
                  backgroundColor: "#fef2f2" 
                } 
              }}
              startIcon={<RejectedIcon sx={{ fontSize: 16 }} />}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleAdmissionAction("approved")}
              disabled={actionLoading}
              variant="contained"
              sx={{ 
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                textTransform: "none", 
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "8px",
                px: 3.5,
                py: 1,
                boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.3)"
                } 
              }}
              startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <ApprovedIcon sx={{ fontSize: 16 }} />}
            >
              {actionLoading ? "Processing..." : "Approve"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => !actionLoading && setRejectModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" } }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>
            Rejection Reason
          </Typography>
          <IconButton onClick={() => !actionLoading && setRejectModalOpen(false)} size="small" sx={{ color: "#94a3b8" }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: "#ffffff" }}>
          <Typography sx={{ fontSize: "13px", color: "#64748b", mb: 2, lineHeight: 1.5 }}>
            Please provide a reason for rejecting this application. The student will be able to see this.
          </Typography>
          <TextField
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline 
            rows={3} 
            fullWidth
            placeholder="Enter rejection reason..."
            sx={{
              ...inputSx,
              height: "auto",
              "& .MuiOutlinedInput-root, & .MuiOutlinedInput-root.MuiInputBase-root": {
                height: "auto !important",
                minHeight: "80px",
                py: 1.5,
                px: 1.5,
                "& .MuiOutlinedInput-notchedOutline, & fieldset": {
                  borderColor: "var(--input-border, #ced4da) !important",
                  borderWidth: "1px !important",
                  transition: "all 0.3s ease !important",
                },
                "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline, &:hover:not(.Mui-focused):not(.Mui-error) fieldset": {
                  borderColor: "var(--input-border, #ced4da) !important",
                },
                "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline, &.Mui-focused:not(.Mui-error) fieldset": {
                  borderColor: "var(--primary-color, #002147) !important",
                  borderWidth: "1px !important",
                }
              },
              "& .MuiOutlinedInput-input": {
                height: "auto !important",
                padding: "0 !important",
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <Button 
            onClick={() => setRejectModalOpen(false)} 
            disabled={actionLoading} 
            className="admin-btn-secondary"
            sx={{ px: 3, minWidth: "100px", textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAdmissionAction("rejected")}
            disabled={actionLoading || !rejectReason.trim()}
            variant="contained"
            sx={{ 
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
              textTransform: "none", 
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "8px",
              px: 3,
              py: 1,
              boxShadow: "0 4px 10px rgba(239, 68, 68, 0.2)",
              "&:hover": { 
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)"
              },
              "&.Mui-disabled": {
                background: "#f1f5f9",
                color: "#cbd5e1",
                boxShadow: "none"
              }
            }}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <RejectedIcon sx={{ fontSize: 16 }} />}
          >
            {actionLoading ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Roll Number Modal */}
      <Dialog
        open={openRollNoModal}
        onClose={() => !generatingRollNos && setOpenRollNoModal(false)}
        maxWidth="sm"
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Auto Generate Roll Numbers</span>
          <IconButton
            onClick={() => !generatingRollNos && setOpenRollNoModal(false)}
            size="small"
            sx={{ color: "#9ca3af" }}
            disabled={generatingRollNos}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Formik
          initialValues={{
            classId: "",
            sectionId: "",
          }}
          validationSchema={generateRollNumbersValidationSchema}
          onSubmit={async (values, { resetForm }) => {
            setGeneratingRollNos(true);
            try {
              const result = await dispatch(
                generateRollNumbersAction({
                  classId: values.classId,
                  sectionId: values.sectionId,
                })
              );
              if (generateRollNumbersAction.fulfilled.match(result)) {
                setOpenRollNoModal(false);
                resetForm();
                handleGetData(searchNameValue);
              }
            } catch (err) {
              const errMsg = err instanceof Error ? err.message : String(err);
              toast.error(errMsg || "Failed to generate roll numbers");
            } finally {
              setGeneratingRollNos(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit, resetForm }) => (
            <Form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "inherit" }}>
              <DialogContent
                sx={{
                  p: 3,
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                  overflowY: "auto",
                  maxHeight: "60vh",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#4b5563", lineHeight: 1.6 }}
                >
                  Select Class and Section to automatically generate roll numbers sequentially (1, 2, 3...) for all active students sorted by their **Admission Number (GR Number)**.
                </Typography>

                {/* Class Select */}
                <Box>
                  <Typography sx={labelSx}>
                    Class <span style={{ color: "#f04438" }}>*</span>
                  </Typography>
                  <Autocomplete
                    options={allClasses || []}
                    getOptionLabel={(opt: any) => opt.name || ""}
                    value={
                      (allClasses || []).find(
                        (c: any) => c._id === values.classId,
                      ) || null
                    }
                    onChange={(_, newVal) => {
                      setFieldValue("classId", (newVal as any)?._id || "");
                      setFieldValue("sectionId", ""); // Reset section
                    }}
                    disabled={generatingRollNos}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Class"
                        error={touched.classId && Boolean(errors.classId)}
                        slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                      />
                    )}
                  />
                  {touched.classId && errors.classId && (
                    <FormHelperText className="error-text">
                      {errors.classId as string}
                    </FormHelperText>
                  )}
                </Box>

                {/* Section Select */}
                <Box>
                  <Typography sx={labelSx}>
                    Section <span style={{ color: "#f04438" }}>*</span>
                  </Typography>
                  <Autocomplete
                    options={(allSections || []).filter((sec: SectionItem) => {
                      const classId = typeof sec.classId === "object" && sec.classId !== null ? sec.classId._id : sec.classId;
                      return classId === values.classId;
                    })}
                    getOptionLabel={(opt: any) => opt.code || opt.name || ""}
                    value={
                      (allSections || []).find(
                        (s: any) => s._id === values.sectionId,
                      ) || null
                    }
                    onChange={(_, newVal) =>
                      setFieldValue("sectionId", (newVal as any)?._id || "")
                    }
                    disabled={!values.classId || generatingRollNos}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Section"
                        error={touched.sectionId && Boolean(errors.sectionId)}
                        slotProps={{ input: { ...params.InputProps, sx: inputSx } }}
                      />
                    )}
                  />
                  {touched.sectionId && errors.sectionId && (
                    <FormHelperText className="error-text">
                      {errors.sectionId as string}
                    </FormHelperText>
                  )}
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
                  onClick={() => {
                    resetForm();
                    setOpenRollNoModal(false);
                  }}
                  disabled={generatingRollNos}
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
                  type="submit"
                  variant="contained"
                  className="admin-btn-theme"
                  disabled={generatingRollNos}
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
                  {generatingRollNos ? (
                    <CircularProgress size={20} sx={{ color: "var(--button-text, #fff)" }} />
                  ) : (
                    "Generate Now"
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

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
                    checked={selectedExportFields.length === studentExportFields.length}
                    indeterminate={
                      selectedExportFields.length > 0 &&
                      selectedExportFields.length < studentExportFields.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExportFields(studentExportFields.map((f) => f.key));
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
              {studentExportFields.map((field) => (
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
