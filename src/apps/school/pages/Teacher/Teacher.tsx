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
} from "@mui/icons-material";
import moment from "moment";
import { getTeachers, changeTeacherStatus, deleteTeacher } from "@/redux/slices/teacherSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import { getSubjects } from "@/redux/slices/subjectSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import ProfileAvatar from "@/apps/common/ProfileAvatar";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import PopupModal from "../../component/schoolCommon/popUpModal/PopupModal";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import type { RootState } from "@/redux/Store";

export default function Teacher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { teachers, total, loading } = useSelector((state: RootState) => state.TeacherReducer);

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

  return (
    <Box className="admin-dashboard-content">
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
                              <Tooltip title={data?.isActive ? "Active" : "Inactive"} arrow>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <IOSSwitch
                                    checked={data?.isActive}
                                    onChange={() => setOpenStatusChange(data)}
                                    size="small"
                                  />
                                </Box>
                              </Tooltip>
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
