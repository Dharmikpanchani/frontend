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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Checkbox,
} from "@mui/material";
import {
  Email as EmailIcon,
  LocalPhone as PhoneIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Wc as GenderIcon,
  CalendarMonth as CalendarIcon,
  Badge as BadgeIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";
import moment from "moment";
import { getTeachers, changeTeacherStatus, deleteTeacher, getPendingTeachers } from "@/redux/slices/teacherSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import { getSubjects } from "@/redux/slices/subjectSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import ProfileAvatar from "@/apps/common/ProfileAvatar";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader, { CommonLoader } from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import PopupModal from "../../component/schoolCommon/popUpModal/PopupModal";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import type { RootState } from "@/redux/Store";
import { masterService } from "@/api/services/master.service";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import { documentRejectionValidationSchema } from "@/utils/validation/FormikValidation";

export default function Teacher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { teachers, total, loading, pendingTeachers, pendingLoading } = useSelector((state: RootState) => state.TeacherReducer);

  // Tabs for managing Teachers and Approve Documents
  const [tabValue, setTabValue] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(10);
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");

  // States for individual teacher documents view
  const [viewingTeacherId, setViewingTeacherId] = useState<string | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [teacherDocs, setTeacherDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // Verification status action states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Bulk AI Verification states
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [bulkVerifying, setBulkVerifying] = useState(false);

  const fetchPendingTeachers = async () => {
    dispatch(getPendingTeachers() as any);
  };

  const handleBulkVerify = async () => {
    if (selectedTeacherIds.length === 0) return;
    setBulkVerifying(true);
    try {
      const res = await masterService.bulkAiVerifyTeacherDocuments({ teacherIds: selectedTeacherIds });
      if (res.status === 200) {
        toast.success(res.data.message || `${selectedTeacherIds.length} Teacher(s) documents successfully verified by Universal AI Engine!`);
        setSelectedTeacherIds([]);
        fetchPendingTeachers();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to perform bulk AI verification");
    } finally {
      setBulkVerifying(false);
    }
  };

  const fetchTeacherDocsForAdmin = async (id: string) => {
    setDocsLoading(true);
    try {
      const res = await masterService.getTeacherDocumentsForAdmin(id);
      if (res.status === 200) {
        setTeacherDetails(res.data.teacher);
        setTeacherDocs(res.data.documents || []);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch teacher documents");
    } finally {
      setDocsLoading(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    setVerifying(true);
    try {
      const res = await masterService.verifyTeacherDocument({
        documentId: docId,
        status,
        rejectReason: reason
      });
      if (res.status === 200) {
        toast.success(`Document ${status.toLowerCase()} successfully!`);
        if (viewingTeacherId) {
          fetchTeacherDocsForAdmin(viewingTeacherId);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify document");
    } finally {
      setVerifying(false);
      setRejectModalOpen(false);
      setSelectedDocId(null);
    }
  };

  useEffect(() => {
    if (!viewingTeacherId && hasPermission(schoolAdminPermission.teacher.read)) {
      fetchPendingTeachers();
    }
  }, [tabValue, viewingTeacherId, hasPermission]);

  useEffect(() => {
    if (viewingTeacherId && hasPermission(schoolAdminPermission.teacher.read)) {
      fetchTeacherDocsForAdmin(viewingTeacherId);
    }
  }, [viewingTeacherId, hasPermission]);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  const [openDelete, setOpenDelete] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);

  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    departmentId: "",
    classId: "",
    sectionId: "",
    subjectId: "",
    joiningDate: "",
    designation: "",
    employmentType: "",
    attendanceId: "",
    isActive: "",
    isVerified: "",
  });

  const handleOpenDelete = (data: any) => {
    setSelectedData(data);
    setOpenDelete(true);
  };

  const setOpenStatusChange = (data: any) => {
    setSelectedData(data);
    setOpenStatusModal(true);
  };

  const handleGetData = (searchQuery?: string, filters?: any) => {
    dispatch(getTeachers({
      page: currentPage + 1,
      perPage: rowsPerPage > 0 ? rowsPerPage : 10,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
      ...(filters || filterValues),
    }) as any);
  };

  const { allDepartments } = useSelector((state: RootState) => state.DepartmentReducer);
  const { allSubjects } = useSelector((state: RootState) => state.SubjectReducer);
  const { allClasses } = useSelector((state: RootState) => state.ClassReducer);
  const { allSections } = useSelector((state: RootState) => state.SectionReducer);

  useEffect(() => {
    handleGetData(searchNameValue);
    dispatch(getDepartments({ type: "filter" }) as any);
    dispatch(getSubjects({ type: "filter" }) as any);
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
      departmentId: "",
      classId: "",
      sectionId: "",
      subjectId: "",
      joiningDate: "",
      designation: "",
      employmentType: "",
      attendanceId: "",
      isActive: "",
      isVerified: "",
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
    []
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
      type: "date",
      name: "joiningDate",
      label: "Joining Date",
      placeholder: "Select Joining Date",
    },
    {
      type: "searchbaseSelect",
      name: "departmentId",
      label: "Department",
      placeholder: "Select Department",
      options: allDepartments || [],
      getOptionLabel: (opt: any) => opt.name || "",
      getOptionValue: (opt: any) => opt._id,
    },
    {
      type: "inputSelect",
      name: "designation",
      label: "Designation",
      placeholder: "Enter Designation",
    },
    {
      type: "searchbaseSelect",
      name: "subjectId",
      label: "Subjects Specialty",
      placeholder: "Select Subject",
      options: allSubjects || [],
      getOptionLabel: (opt: any) => opt.name || "",
      getOptionValue: (opt: any) => opt._id,
    },
    {
      type: "searchbaseSelect",
      name: "classId",
      label: "Assigned Classes",
      placeholder: "Select Class",
      options: allClasses || [],
      getOptionLabel: (opt: any) => opt.name || "",
      getOptionValue: (opt: any) => opt._id,
    },
    {
      type: "searchbaseSelect",
      name: "sectionId",
      label: "Assigned Section",
      placeholder: "Select Section",
      options: allSections || [],
      getOptionLabel: (opt: any) => opt.code || "",
      getOptionValue: (opt: any) => opt._id,
    },
    {
      type: "searchbaseSelect",
      name: "employmentType",
      label: "Employment Type",
      placeholder: "Select Employment Type",
      options: [
        { label: "Full-time", value: "Full-time" },
        { label: "Part-time", value: "Part-time" },
        { label: "Contract", value: "Contract" },
      ],
    },
    {
      type: "inputSelect",
      name: "attendanceId",
      label: "Attendance ID",
      placeholder: "Enter Attendance ID",
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
      type: "searchbaseSelect",
      name: "isVerified",
      label: "Verification Status",
      placeholder: "Select Status",
      options: [
        { label: "Verified", value: "true" },
        { label: "Unverified", value: "false" },
      ],
    },
  ];

  const handleDelete = async () => {
    if (!selectedData) return;
    setButtonStatusSpinner(true);
    const result = await dispatch(deleteTeacher(selectedData._id) as any);
    setButtonStatusSpinner(false);
    if (deleteTeacher.fulfilled.match(result)) {
      setOpenDelete(false);
      setSelectedData(null);
      handleGetData();
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    setButtonStatusSpinner(true);
    const result = await dispatch(changeTeacherStatus(selectedData._id) as any);
    setButtonStatusSpinner(false);
    if (changeTeacherStatus.fulfilled.match(result)) {
      setOpenStatusModal(false);
      setSelectedData(null);
      handleGetData();
    }
  };

  const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE || "";

  const handleViewFile = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith("http") ? url : `${imageBaseUrl}/${url}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const getStatusConfig = (status: string, isNotUploaded?: boolean) => {
    if (isNotUploaded) {
      return {
        label: "NOT UPLOADED",
        color: "default",
        bgColor: "#E4E7EC",
        textColor: "#475467",
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
      };
    }

    switch (status) {
      case "APPROVED":
        return {
          label: "APPROVED",
          color: "success",
          bgColor: "#ECFDF3",
          textColor: "#027A48",
          icon: <ApprovedIcon sx={{ fontSize: 16, color: "#12B76A" }} />,
        };
      case "REJECTED":
        return {
          label: "REJECTED",
          color: "error",
          bgColor: "#FEF3F2",
          textColor: "#B42318",
          icon: <RejectedIcon sx={{ fontSize: 16, color: "#F04438" }} />,
        };
      case "UNDER_REVIEW":
        return {
          label: "UNDER REVIEW",
          color: "info",
          bgColor: "#F0F9FF",
          textColor: "#026AA2",
          icon: <PendingIcon sx={{ fontSize: 16, color: "#0086C9" }} />,
        };
      case "PENDING":
      default:
        return {
          label: "PENDING",
          color: "warning",
          bgColor: "#FFFAEB",
          textColor: "#B54708",
          icon: <PendingIcon sx={{ fontSize: 16, color: "#F79009" }} />,
        };
    }
  };

  return (
    <Box className="admin-dashboard-content">
      {/* 🏷️ Tab Switcher Section */}
      <Box sx={{ borderBottom: 1, borderColor: "#E9ECEF", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => {
            setTabValue(newValue);
            setViewingTeacherId(null);
          }}
          className="admin-tabs-main"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--primary-color)',
              height: '2.4px',
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 600,
              minHeight: '44px',
              color: '#667085',
              mr: 4,
              px: 0,
              '&.Mui-selected': {
                color: 'var(--primary-color)',
                fontWeight: 700,
              },
            }
          }}
        >
          <Tab label="Teachers List" />
          {hasPermission(schoolAdminPermission.teacher.read) && (
            <Tab label={`Approve Documents (${pendingTeachers.length || 0})`} />
          )}
        </Tabs>
      </Box>

      {/* ────────────────── 1️⃣ TAB 1: TEACHER LIST ────────────────── */}
      {tabValue === 0 && (
        <>
          <Box className="admin-user-list-flex admin-page-title-main">
            <Typography className="admin-page-title" component="h2" variant="h2">
              Teachers
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
                        let value = e.target.value;
                        setSearchNameValue(value);
                        debouncedCallGetApi(value);
                      }}
                      inputProps={{ maxLength: 80 }}
                    />
                    <SearchIcon
                      sx={{ color: 'var(--primary-color)', fontSize: '20px' }}
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
                    minWidth: '45px',
                    p: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FilterIcon
                    sx={{ color: 'var(--button-text, #fff)', fontSize: '18px' }}
                  />
                </Button>
              </Box>
              {hasPermission(schoolAdminPermission.teacher.create) && (
                <Box className="admin-add-user-btn-main">
                  <Button
                    className="admin-btn-theme"
                    onClick={() => navigate("/teacher/add")}
                  >
                    <AddIcon
                      sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
                    />
                    Add Teacher
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          <Box className="card-border common-card">
            <Box className="brand-table-main page-table-main">
              <TableContainer component={Paper} className="table-container">
                <Table aria-label="simple table" className="table">
                  <TableHead className="table-head">
                    <TableRow className="table-row">
                      <TableCell component="th" className="table-th" width="22%">TEACHER INFO</TableCell>
                      <TableCell component="th" className="table-th" width="13%">PERSONAL</TableCell>
                      <TableCell component="th" className="table-th" width="18%">PROFESSIONAL</TableCell>
                      <TableCell component="th" className="table-th" width="20%">ASSIGNMENTS</TableCell>
                      <TableCell component="th" className="table-th" width="17%">STATUS / LOGIN</TableCell>
                      {hasAnyPermission([
                        schoolAdminPermission.teacher.read,
                        schoolAdminPermission.teacher.update,
                        schoolAdminPermission.teacher.delete,
                      ]) && (
                        <TableCell component="th" className="table-th" width="10%" align="center">ACTIONS</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody className="table-body">
                    {!loading ? (
                      teachers?.length ? (
                        teachers?.map((data: any) => (
                          <TableRow key={data._id} sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                          }}>
                            {/* TEACHER INFO: Img, Name, Email, Phone, Address */}
                            <TableCell component="td" className="table-td">
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <ProfileAvatar
                                  name={data?.fullName}
                                  imageUrl={data?.profileImage}
                                  size={45}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 0.2 }}>
                                    {data?.fullName || "N/A"}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                                    <EmailIcon sx={{ fontSize: 13, color: 'var(--primary-color)' }} />
                                    <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{data?.email || "N/A"}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                                    <PhoneIcon sx={{ fontSize: 13, color: 'var(--primary-color)' }} />
                                    <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>{data?.phoneNumber || "N/A"}</Typography>
                                  </Box>
                                  {data?.address && (
                                    <Typography sx={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.2, mt: 0.5 }}>
                                      {data?.address}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            {/* PERSONAL: Gender, DOB, Blood Group */}
                            <TableCell component="td" className="table-td">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <GenderIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                                  <Typography sx={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>SEX:</Typography>
                                  <Typography sx={{ fontSize: '12px', color: '#111827' }}>{data?.gender || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                                  <Typography sx={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>DOB:</Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#111827' }}>
                                    {data?.dateOfBirth ? moment(data.dateOfBirth).format('DD MMM YY') : 'N/A'}
                                  </Typography>
                                </Box>
                                {data?.bloodGroup && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography sx={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>BLOOD:</Typography>
                                    <Chip
                                      label={data.bloodGroup}
                                      size="small"
                                      sx={{
                                        height: '16px',
                                        fontSize: '9px',
                                        backgroundColor: '#fff1f0',
                                        color: '#f5222d',
                                        border: '1px solid #ffccc7',
                                        fontWeight: 700
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            </TableCell>

                            {/* PROFESSIONAL: Dept, Designation, Experience, Joining */}
                            <TableCell component="td" className="table-td">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-color)' }}>
                                  {data?.departmentId?.name || "N/A"}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#111827', fontStyle: 'italic' }}>
                                  {data?.designation || "N/A"}
                                </Typography>
                                {data?.userId?.role?.role && (
                                  <Typography sx={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', mt: 0.2 }}>
                                    Role: {data?.userId?.role?.role}
                                  </Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                  <BadgeIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                                  <Typography sx={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>EXP:</Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#111827' }}>{data?.experienceYears || 0} Yrs</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                                  <Typography sx={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>JOINED:</Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#111827' }}>
                                    {data?.joiningDate ? moment(data.joiningDate).format('DD MMM YY') : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* ASSIGNMENTS: Classes, Sections, Subjects */}
                            <TableCell component="td" className="table-td">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                <Box>
                                  <Typography sx={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, mb: 0.2, textTransform: 'uppercase' }}>Classes & Sections</Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                    {data?.classesAssigned?.slice(0, 3).map((cls: any, i: number) => (
                                      <Box key={cls._id || i} sx={{
                                        px: 0.8, py: 0.2, borderRadius: '4px', bgcolor: '#f0f7ff', border: '1px solid #bae7ff',
                                        fontSize: '10px', fontWeight: 500, color: '#0050b3'
                                      }}>
                                        {cls.name}
                                      </Box>
                                    ))}
                                    {data?.classesAssigned?.length > 3 && (
                                      <Typography sx={{ fontSize: '10px', color: '#9ca3af' }}>+{data.classesAssigned.length - 3}</Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, mb: 0.2, textTransform: 'uppercase' }}>Subjects Specialty</Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                    {data?.subjects?.slice(0, 3).map((sub: any, i: number) => (
                                      <Box key={sub._id || i} sx={{
                                        px: 0.8, py: 0.2, borderRadius: '4px', bgcolor: '#fff7e6', border: '1px solid #ffd591',
                                        fontSize: '10px', fontWeight: 500, color: '#ad4e00'
                                      }}>
                                        {sub.name}
                                      </Box>
                                    ))}
                                    {data?.subjects?.length > 3 && (
                                      <Typography sx={{ fontSize: '10px', color: '#9ca3af' }}>+{data.subjects.length - 3}</Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* STATUS / LOGIN: EmployType, Verification, Login, Active */}
                            <TableCell component="td" className="table-td">
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>
                                    {data?.employmentType || 'NA'}
                                  </Typography>
                                  {data?.isVerified ? (
                                    <Tooltip title={data?.isActive ? "Active" : "Inactive"} arrow>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IOSSwitch
                                          checked={data?.isActive}
                                          onChange={() => setOpenStatusChange(data)}
                                          size="small"
                                        />
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Typography sx={{ fontSize: '10px', color: '#ff9800', fontStyle: 'italic' }}>Status locked</Typography>
                                  )}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={data?.isLogin ? "Online" : "Offline"}
                                    size="small"
                                    sx={{
                                      backgroundColor: data?.isLogin ? "#e8f5e9" : "#f5f5f5",
                                      color: data?.isLogin ? "#2e7d32" : "#9e9e9e",
                                      fontWeight: 700,
                                      fontSize: "9px",
                                      height: "18px",
                                    }}
                                  />
                                  <Box sx={{
                                    display: 'inline-flex', alignItems: 'center', gap: 0.4, px: 0.8, py: 0.2, borderRadius: '10px',
                                    backgroundColor: data?.isVerified ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                    color: data?.isVerified ? '#2196f3' : '#ff9800', border: '1px solid currentColor'
                                  }}>
                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                    <Typography sx={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>
                                      {data?.isVerified ? "Verified" : "Unverified"}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ mt: 0.3 }}>
                                  <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#111827', fontFamily: "'Poppins', sans-serif" }}>
                                    {data?.lastLogin ? moment(data?.lastLogin).format("DD MMM YY") : (data?.updatedAt ? moment(data?.updatedAt).format("DD MMM YY") : "---")}
                                  </Typography>
                                  <Typography sx={{ fontSize: '10px', color: '#6B7280', fontWeight: 400, fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}>
                                    {data?.lastLogin ? moment(data?.lastLogin).fromNow() : (data?.updatedAt ? moment(data?.updatedAt).fromNow() : "---")}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {hasAnyPermission([
                              schoolAdminPermission.teacher.read,
                              schoolAdminPermission.teacher.update,
                              schoolAdminPermission.teacher.delete,
                            ]) && (
                              <TableCell component="td" className="table-td" align="center">
                                <Box className="admin-table-data-btn-flex" sx={{ justifyContent: "center" }}>
                                  {hasPermission(schoolAdminPermission.teacher.read) && (
                                    <Tooltip title="View" arrow placement="bottom">
                                      <Button
                                        className="admin-table-data-btn admin-table-view-btn"
                                        onClick={() => navigate("/teacher/view", { state: { id: data?._id } })}
                                      >
                                        <img src={Svg.yellowEye} className="admin-icon" alt="View" />
                                      </Button>
                                    </Tooltip>
                                  )}
                                  {hasPermission(schoolAdminPermission.teacher.update) && (
                                    <Tooltip title="Edit" arrow placement="bottom">
                                      <Button
                                        className="admin-table-data-btn admin-table-edit-btn"
                                        onClick={() => navigate("/teacher/edit", { state: { id: data?._id } })}
                                      >
                                        <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                      </Button>
                                    </Tooltip>
                                  )}
                                  {hasPermission(schoolAdminPermission.teacher.delete) && (
                                    <Tooltip title="Delete" arrow placement="bottom">
                                      <Button
                                        className="admin-table-data-btn admin-table-delete-btn"
                                        onClick={() => handleOpenDelete(data)}
                                      >
                                        <img src={Svg.trash} className="admin-icon" alt="Delete" />
                                      </Button>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <DataNotFound text="No Teachers Found" />
                      )
                    ) : (
                      <Loader />
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
        </>
      )}

      {/* ────────────────── 2️⃣ TAB 2: APPROVE DOCUMENTS ────────────────── */}
      {tabValue === 1 && (
        <Box>
          {/* Case A: Show list of pending teachers */}
          {!viewingTeacherId ? (
            (() => {
              const filteredPending = pendingTeachers.filter((item) =>
                item.fullName?.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
                item.email?.toLowerCase().includes(pendingSearchQuery.toLowerCase())
              );

              return (
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                      <Typography variant="h5" sx={{ fontSize: "16px", fontWeight: 700, color: "#344054", fontFamily: "'PlusJakartaSans-Bold', sans-serif" }}>
                        Document Verification Requests
                      </Typography>
                      {selectedTeacherIds.length > 0 && (
                        <Button
                          variant="contained"
                          disabled={bulkVerifying}
                          onClick={handleBulkVerify}
                          sx={{
                            backgroundColor: "var(--primary-color)",
                            color: "#fff",
                            textTransform: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            borderRadius: "8px",
                            px: 2,
                            py: 0.8,
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "var(--primary-color)", opacity: 0.9 },
                          }}
                        >
                          {bulkVerifying ? "Processing AI Engine..." : `Bulk AI Verify Selected (${selectedTeacherIds.length})`}
                        </Button>
                      )}
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "300px" } }}>
                      <Box className="admin-search-box">
                        <Box className="admin-form-group" sx={{ m: 0 }}>
                          <TextField
                            value={pendingSearchQuery}
                            fullWidth
                            id="pendingSearch"
                            className="admin-form-control"
                            placeholder="Search Name or Email"
                            onChange={(e) => {
                              setPendingSearchQuery(e.target.value);
                              setPendingPage(0);
                            }}
                            inputProps={{ maxLength: 80 }}
                          />
                          <SearchIcon
                            sx={{ color: 'var(--primary-color)', fontSize: '20px' }}
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
                              <TableCell className="table-th" width="5%" align="center">
                                <Checkbox
                                  size="small"
                                  checked={filteredPending.length > 0 && selectedTeacherIds.length === filteredPending.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTeacherIds(filteredPending.map((item) => item.teacherId));
                                    } else {
                                      setSelectedTeacherIds([]);
                                    }
                                  }}
                                  sx={{
                                    color: "var(--primary-color)",
                                    "&.Mui-checked": { color: "var(--primary-color)" },
                                  }}
                                />
                              </TableCell>
                              <TableCell className="table-th">TEACHER NAME</TableCell>
                              <TableCell className="table-th">PENDING REQUESTS</TableCell>
                              <TableCell className="table-th">SUBMITTED DATE</TableCell>
                              <TableCell className="table-th" align="center">ACTION</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody className="table-body">
                            {!pendingLoading ? (
                              filteredPending.length ? (
                                filteredPending
                                  .slice(pendingPage * pendingRowsPerPage, (pendingPage + 1) * pendingRowsPerPage)
                                  .map((row) => (
                                    <TableRow key={row.teacherId} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                                      <TableCell className="table-td" align="center">
                                        <Checkbox
                                          size="small"
                                          checked={selectedTeacherIds.includes(row.teacherId)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedTeacherIds((prev) => [...prev, row.teacherId]);
                                            } else {
                                              setSelectedTeacherIds((prev) => prev.filter((id) => id !== row.teacherId));
                                            }
                                          }}
                                          sx={{
                                            color: "var(--primary-color)",
                                            "&.Mui-checked": { color: "var(--primary-color)" },
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell className="table-td">
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                          <ProfileAvatar name={row.fullName} imageUrl={row.profileImage} size={40} />
                                          <Box>
                                            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                                              {row.fullName}
                                            </Typography>
                                            <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
                                              {row.email}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell className="table-td">
                                        <Chip
                                          label={`${row.pendingCount} Pending Doc(s)`}
                                          color="warning"
                                          size="small"
                                          sx={{ fontWeight: 700, fontSize: "11px", borderRadius: "6px" }}
                                        />
                                      </TableCell>
                                      <TableCell className="table-td" sx={{ fontSize: "13px", color: "#475467" }}>
                                        {moment(row.latestUploadDate).format("DD MMM YYYY, hh:mm A")}
                                      </TableCell>
                                      <TableCell className="table-td" align="center">
                                        <Button
                                          variant="outlined"
                                          onClick={() => setViewingTeacherId(row.teacherId)}
                                          startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
                                          sx={{
                                            textTransform: "none",
                                            borderColor: "var(--primary-color)",
                                            color: "var(--primary-color)",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            borderRadius: "8px",
                                            "&:hover": {
                                              backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.04)",
                                              borderColor: "var(--primary-color)"
                                            }
                                          }}
                                        >
                                          Verify Documents
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4}>
                                    <DataNotFound text="No Pending Document Requests Found" />
                                  </TableCell>
                                </TableRow>
                              )
                            ) : (
                              <Loader colSpan={4} />
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                    <Box className="admin-pagination-main" sx={{ mt: 2 }}>
                      {filteredPending.length ? (
                        <Pagination
                          page={pendingPage}
                          rowsPerPage={pendingRowsPerPage}
                          setPage={setPendingPage}
                          setRowsPerPage={setPendingRowsPerPage}
                          count={filteredPending.length}
                        />
                      ) : null}
                    </Box>
                  </Box>
                </Box>
              );
            })()
          ) : (
            /* Case B: Show Verification details for selected teacher */
            <Box>
              <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={() => setViewingTeacherId(null)}
                  sx={{
                    border: "1px solid #EAECF0",
                    borderRadius: "8px",
                    backgroundColor: "#FFF",
                    p: 1,
                    "&:hover": { backgroundColor: "#F9FAFB" }
                  }}
                >
                  <BackIcon sx={{ fontSize: 18, color: "#344054" }} />
                </IconButton>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: "16px", fontWeight: 700, color: "#344054", fontFamily: "'PlusJakartaSans-Bold', sans-serif" }}>
                    Verify Documents — {teacherDetails?.fullName || "Teacher"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#667085" }}>
                    {teacherDetails?.email} • {teacherDetails?.phoneNumber}
                  </Typography>
                </Box>
              </Box>

              {docsLoading ? (
                <CommonLoader />
              ) : (
                <Grid container spacing={3}>
                  {teacherDocs.map((doc, idx) => {
                    const statusCfg = getStatusConfig(doc.status, doc.isNotUploaded);

                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={idx}>
                        <Card
                          sx={{
                            borderRadius: "12px",
                            border: "1px solid #EAECF0",
                            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                          }}
                        >
                          <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                              <Box>
                                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#1D2939", fontFamily: "'PlusJakartaSans-Bold', sans-serif", mb: 0.5 }}>
                                  {doc.documentType}
                                </Typography>
                                <Typography sx={{ fontSize: "11px", color: "#667085" }}>
                                  Version {doc.version || 0} {doc.isVirtual && "(Imported Profile Field)"}
                                </Typography>
                              </Box>

                              <Chip
                                icon={statusCfg.icon}
                                label={statusCfg.label}
                                size="small"
                                sx={{
                                  backgroundColor: statusCfg.bgColor,
                                  color: statusCfg.textColor,
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  borderRadius: "6px",
                                  "& .MuiChip-icon": { color: statusCfg.textColor },
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                p: 2,
                                borderRadius: "8px",
                                backgroundColor: "#F9FAFB",
                                border: "1px dashed #EAECF0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: doc.status === "REJECTED" && doc.rejectReason ? 2 : 3,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
                                {doc.documentUrl?.endsWith(".pdf") ? (
                                  <PdfIcon sx={{ color: "#F04438", fontSize: 28 }} />
                                ) : (
                                  <FileIcon sx={{ color: "var(--primary-color, #5c1a1a)", fontSize: 28 }} />
                                )}
                                <Box sx={{ overflow: "hidden" }}>
                                  <Typography noWrap sx={{ fontSize: "12px", fontWeight: 600, color: "#344054", fontFamily: "'PlusJakartaSans-Bold', sans-serif" }}>
                                    {doc.documentUrl ? doc.documentUrl.split("/").pop() : "No document uploaded"}
                                  </Typography>
                                  {doc.uploadedAt && (
                                    <Typography sx={{ fontSize: "10px", color: "#667085" }}>
                                      Uploaded on {moment(doc.uploadedAt).format("DD MMM YYYY")}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>

                              {doc.documentUrl && (
                                <Tooltip title="View Document File" arrow>
                                  <IconButton
                                    onClick={() => handleViewFile(doc.documentUrl)}
                                    size="small"
                                    sx={{
                                      border: "1px solid #D0D5DD",
                                      borderRadius: "8px",
                                      backgroundColor: "#FFF",
                                      "&:hover": { backgroundColor: "#F9FAFB", borderColor: "var(--primary-color)" }
                                    }}
                                  >
                                    <ViewIcon sx={{ fontSize: 18, color: "#475467" }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>

                            {doc.status === "REJECTED" && doc.rejectReason && (
                              <Box sx={{ mb: 3, p: 1.5, borderRadius: "8px", backgroundColor: "#FEF3F2", borderLeft: "4px solid #F04438" }}>
                                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#B42318", fontFamily: "'PlusJakartaSans-Bold', sans-serif", mb: 0.5 }}>
                                  Rejection Reason:
                                </Typography>
                                {doc.rejectReason.length > 35 ? (
                                  <Tooltip title={doc.rejectReason} arrow placement="top">
                                    <Typography
                                      sx={{
                                        fontSize: "11px",
                                        color: "#B42318",
                                        lineHeight: 1.4,
                                        cursor: "pointer",
                                        display: "inline-block",
                                        borderBottom: "1px dashed #FDA29B",
                                        pb: "1px"
                                      }}
                                    >
                                      {doc.rejectReason.slice(0, 35)}...
                                    </Typography>
                                  </Tooltip>
                                ) : (
                                  <Typography sx={{ fontSize: "11px", color: "#B42318", lineHeight: 1.4 }}>
                                    {doc.rejectReason}
                                  </Typography>
                                )}
                              </Box>
                            )}

                            {/* Verification Actions (Only for pending documents) */}
                            {doc.status === "PENDING" && !doc.isNotUploaded && !doc.isVirtual && hasPermission(schoolAdminPermission.teacher.update) && (
                              <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  fullWidth
                                  onClick={() => handleVerifyDocument(doc._id, 'APPROVED')}
                                  disabled={verifying}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    borderRadius: "8px",
                                    boxShadow: "none",
                                    backgroundColor: "#12B76A",
                                    "&:hover": { backgroundColor: "#027A48" }
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  fullWidth
                                  onClick={() => {
                                    setSelectedDocId(doc._id);
                                    setRejectModalOpen(true);
                                  }}
                                  disabled={verifying}
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    borderRadius: "8px",
                                    boxShadow: "none",
                                    backgroundColor: "#F04438",
                                    "&:hover": { backgroundColor: "#B42318" }
                                  }}
                                >
                                  Reject
                                </Button>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* 📜 Dialogs & Modals */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: "12px", p: 1 } }
        }}
      >
        <Formik
          initialValues={{ rejectReason: "" }}
          validationSchema={documentRejectionValidationSchema}
          onSubmit={(values, { resetForm }) => {
            if (selectedDocId) {
              handleVerifyDocument(selectedDocId, "REJECTED", values.rejectReason);
              resetForm();
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <DialogTitle sx={{ fontWeight: 700, pb: 1, fontFamily: "'PlusJakartaSans-Bold', sans-serif" }}>
                Rejection Reason
              </DialogTitle>
              <DialogContent sx={{ pb: 1.5 }}>
                <Typography sx={{ fontSize: "12px", color: "#667085", mb: 2 }}>
                  Please specify why this document is being rejected. The teacher will see this feedback in their profile.
                </Typography>
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  id="rejectReason"
                  name="rejectReason"
                  placeholder="e.g. Aadhaar number not matching, document is blurry..."
                  value={values.rejectReason}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.rejectReason && Boolean(errors.rejectReason)}
                  helperText={touched.rejectReason && errors.rejectReason}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "13px",
                      "& fieldset": {
                        borderColor: touched.rejectReason && errors.rejectReason ? "#d32f2f" : "#D0D5DD",
                      },
                      "&:hover fieldset": {
                        borderColor: touched.rejectReason && errors.rejectReason ? "#d32f2f" : "var(--primary-color) !important",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: touched.rejectReason && errors.rejectReason ? "#d32f2f" : "var(--primary-color) !important",
                        borderWidth: "1.5px !important",
                      }
                    }
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: "1px solid #EAECF0" }}>
                <Button
                  onClick={() => setRejectModalOpen(false)}
                  variant="text"
                  sx={{
                    textTransform: "none",
                    color: "#475467",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "13px",
                    px: 2,
                    "&:hover": { backgroundColor: "#F2F4F7" }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={verifying}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#D92D20",
                    color: "#FFF",
                    fontWeight: 600,
                    borderRadius: "8px",
                    fontSize: "13px",
                    px: 2,
                    py: 0.75,
                    "&:hover": { backgroundColor: "#B42318" }
                  }}
                >
                  {verifying ? "Rejecting..." : "Reject Document"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Teacher Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Teacher"
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        handleFunction={handleDelete}
        buttonStatusSpinner={buttonStatusSpinner}
      />

      <PopupModal
        type={selectedData?.isActive ? "deactivate" : "activate"}
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module={`Teacher (${selectedData?.fullName})`}
        open={openStatusModal}
        handleClose={() => setOpenStatusModal(false)}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={buttonStatusSpinner}
      />
    </Box>
  );
}
