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
} from "@mui/icons-material";
import moment from "moment";
import {
  getStudents,
  changeStudentStatus,
  deleteStudent,
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
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import type { RootState } from "@/redux/Store";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { students, total, loading } = useSelector(
    (state: RootState) => state.StudentReducer,
  );

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  const [openDelete, setOpenDelete] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);

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

  return (
    <Box className="admin-dashboard-content">
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
          {hasPermission(schoolAdminPermission.student.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/student/add")}
              >
                <AddIcon
                  sx={{
                    color: "var(--button-text, #fff)",
                    fontSize: "18px",
                    mr: 1,
                  }}
                />
                Add Student
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
                                  label={`Adm: ${data.admissionNumber}`}
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
                    <DataNotFound text="No Students Found" />
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
        module={`Student (${selectedData?.fullName})`}
        open={openStatusModal}
        handleClose={() => setOpenStatusModal(false)}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={buttonStatusSpinner}
      />
    </Box>
  );
}
