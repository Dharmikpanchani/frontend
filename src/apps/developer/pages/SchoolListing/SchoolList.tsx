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
  TableBody,
  Tooltip,
  Avatar,
  debounce,
} from "@mui/material";
import {
  Email as EmailIcon,
  LocalPhone as PhoneIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { getAllSchools } from "@/redux/slices/schoolSlice";
import { getAllAdminUsersSimple } from "@/redux/slices/adminUserSlice";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/developerCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import { usePermissions } from "@/hooks/usePermissions";
import { developerPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import { IOSSwitch } from "../../component/developerCommon/commonCssFunction/cssFunction";
import PopupModal from "../../component/developerCommon/popUpModal/PopupModal";
import { deleteSchool, changeSchoolStatus } from "@/redux/slices/schoolSlice";
import moment from "moment";
import type { RootState } from "@/redux/Store";
import { boardOptions, schoolTypeOptions } from "@/apps/common/StaticArrayData";


export default function SchoolList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { schools, total, loading } = useSelector((state: RootState) => state.SchoolReducer);
  const { allAdminUsersSimple } = useSelector((state: RootState) => state.AdminUserReducer);
  const { hasPermission, hasAnyPermission } = usePermissions();

  const [openFilter, setOpenFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  const [filterValues, setFilterValues] = useState({
    board: "",
    schoolType: "",
    isActive: "",
    isVerified: "",
    schoolCode: "",
    panNumber: "",
    gstNumber: "",
    registrationNumber: "",
    establishedYear: "",
    planStatus: "",
    planName: "",
    adminId: "",
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);

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
    await dispatch(deleteSchool(selectedData._id) as any);
    setButtonStatusSpinner(false);
    setOpenDelete(false);
    setSelectedData(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    setButtonStatusSpinner(true);
    await dispatch(changeSchoolStatus(selectedData._id) as any);
    setButtonStatusSpinner(false);
    setOpenStatusModal(false);
    setSelectedData(null);
  };


  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGetData = (searchQuery?: string, filters?: any) => {
    dispatch(getAllSchools({
      page: currentPage + 1,
      perPage: rowsPerPage,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
      board: filters?.board ?? filterValues.board,
      schoolType: filters?.schoolType ?? filterValues.schoolType,
      isActive: filters?.isActive ?? filterValues.isActive,
      isVerified: filters?.isVerified ?? filterValues.isVerified,
      schoolCode: filters?.schoolCode ?? filterValues.schoolCode,
      panNumber: filters?.panNumber ?? filterValues.panNumber,
      gstNumber: filters?.gstNumber ?? filterValues.gstNumber,
      registrationNumber: filters?.registrationNumber ?? filterValues.registrationNumber,
      establishedYear: filters?.establishedYear ?? filterValues.establishedYear,
      planStatus: filters?.planStatus ?? filterValues.planStatus,
      planName: filters?.planName ?? filterValues.planName,
      adminId: filters?.adminId ?? filterValues.adminId,
    }) as any);
  };

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    dispatch(getAllAdminUsersSimple("filter") as any);
  }, [dispatch]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    handleGetData(searchNameValue, values);
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    const resetValues = {
      board: "",
      schoolType: "",
      isActive: "",
      isVerified: "",
      schoolCode: "",
      panNumber: "",
      gstNumber: "",
      registrationNumber: "",
      establishedYear: "",
      planStatus: "",
      planName: "",
      adminId: "",
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
      type: "searchbaseSelect",
      name: "board",
      label: "Board",
      placeholder: "Select Board",
      options: boardOptions,
    },
    {
      type: "searchbaseSelect",
      name: "schoolType",
      label: "School Type",
      placeholder: "Select School Type",
      options: schoolTypeOptions,
    },
    {
      type: "searchbaseSelect",
      name: "isActive",
      label: "Status",
      placeholder: "Select Status",
      options: [
        { label: "Active", value: true },
        { label: "Deactive", value: false },
      ],
    },
    {
      type: "searchbaseSelect",
      name: "isVerified",
      label: "Verification Status",
      placeholder: "Select Status",
      options: [
        { label: "Verified", value: true },
        { label: "Not Verified", value: false },
      ],
    },
    {
      type: "inputSelect",
      name: "schoolCode",
      label: "School Code",
      placeholder: "Enter School Code",
    },
    {
      type: "inputSelect",
      name: "panNumber",
      label: "PAN Number",
      placeholder: "Enter PAN Number",
    },
    {
      type: "inputSelect",
      name: "gstNumber",
      label: "GST Number",
      placeholder: "Enter GST Number",
    },
    {
      type: "inputSelect",
      name: "registrationNumber",
      label: "Registration Number",
      placeholder: "Enter Registration Number",
    },
    {
      type: "searchbaseSelect",
      name: "planStatus",
      label: "Plan Status",
      placeholder: "Select Plan Status",
      options: [
        { label: "Active", value: true },
        { label: "Expired", value: false },
      ],
    },
    {
      type: "inputSelect",
      name: "planName",
      label: "Plan Name",
      placeholder: "Enter Plan Name",
    },
    {
      type: "searchbaseSelect",
      name: "adminId",
      label: "Admin/Developer",
      placeholder: "Select Admin/Developer",
      options: allAdminUsersSimple || [],
      getOptionLabel: (option: any) => option.name || "",
      getOptionValue: (option: any) => option._id,
    },
    {
      type: "date",
      name: "establishedYear",
      label: "Established Year",
      placeholder: "Select year",
    },
  ];

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
        >
          School List
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
                  placeholder="Search School"
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
          {hasPermission(developerPermission.school.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/school-list/add")}
              >
                <AddIcon
                  sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
                />
                Add School
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
                  <TableCell className="table-th" width="16%">SCHOOL DETAILS</TableCell>
                  <TableCell className="table-th" width="16%">LOCATION</TableCell>
                  {hasPermission(developerPermission.school.status) && (
                    <TableCell className="table-th" width="10%">STATUS</TableCell>
                  )}
                  <TableCell className="table-th" width="12%">ACADEMIC INFO</TableCell>
                  <TableCell className="table-th" width="12%">PLAN INFO</TableCell>
                  <TableCell className="table-th" width="10%">TAX INFO</TableCell>
                  <TableCell className="table-th" width="14%">JOINED</TableCell>
                  {hasAnyPermission([
                    developerPermission.school.read,
                    developerPermission.school.update,
                    developerPermission.school.delete,
                  ]) && (
                      <TableCell className="table-th" width="10%" align="center">ACTIONS</TableCell>
                    )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  schools?.length ? (
                    schools?.map((data: any) => (
                      <TableRow key={data._id} sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                      }}>
                        <TableCell className="table-td">
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Avatar
                              src={`${import.meta.env.VITE_BASE_URL_IMAGE}/${data?.logo}`}
                              variant="circular"
                              sx={{ width: 45, height: 45, border: '1px solid #ddd' }}
                            >
                              {data?.schoolName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#111827', mb: 0.2 }}>
                                {data?.schoolName}
                              </Typography>
                              <Tooltip title={copiedId === data?._id ? "Copied!" : "Click to copy code"} arrow placement="top">
                                <Box
                                  onClick={() => handleCopyCode(data?._id, data?.schoolCode)}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    mb: 0.8,
                                    width: 'fit-content',
                                    '&:hover .school-code-text': { color: '#111827' },
                                    '&:hover .copy-icon-img': { opacity: 1 }
                                  }}
                                >
                                  <Typography
                                    className="school-code-text"
                                    sx={{
                                      fontSize: '11px',
                                      color: '#6b7280',
                                      transition: 'color 0.2s'
                                    }}
                                  >
                                    #{data?.schoolCode || '---'}
                                  </Typography>
                                  <CopyIcon
                                    className="copy-icon-img"
                                    sx={{
                                      fontSize: 12,
                                      color: copiedId === data?._id ? '#4caf50' : '#9ca3af',
                                      opacity: copiedId === data?._id ? 1 : 0.6,
                                      transition: 'all 0.2s'
                                    }}
                                  />
                                </Box>
                              </Tooltip>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                <EmailIcon sx={{ fontSize: 14, color: '#942F15' }} />
                                <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>{data?.email}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 14, color: '#942F15' }} />
                                <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>{data?.phoneNumber}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="table-td">
                          <Typography sx={{ fontSize: '13px', color: '#111827', fontWeight: 500, lineHeight: 1.4 }}>
                            {data?.address}, {data?.city},
                          </Typography>
                          <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
                            {data?.state}, {data?.country} - {data?.zipCode}
                          </Typography>
                        </TableCell>
                        <TableCell className="table-td">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.2,
                                py: 0.3,
                                borderRadius: '20px',
                                backgroundColor: data?.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                color: data?.isActive ? '#4caf50' : '#f44336',
                                width: 'fit-content'
                              }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                                  {data?.isActive ? "Active" : "Inactive"}
                                </Typography>
                              </Box>
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.2,
                                py: 0.3,
                                borderRadius: '20px',
                                backgroundColor: data?.isVerified ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                color: data?.isVerified ? '#2196f3' : '#ff9800',
                                width: 'fit-content'
                              }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                                  {data?.isVerified ? "Verified" : "Not Verified"}
                                </Typography>
                              </Box>
                            </Box>
                            {hasPermission(developerPermission.school.status) && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip title={data?.isActive ? "Deactivate" : "Activate"} arrow placement="top">
                                  <Box>
                                    <IOSSwitch
                                      checked={data?.isActive}
                                      onChange={() => setOpenStatusChange(data)}
                                    />
                                  </Box>
                                </Tooltip>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell className="table-td">
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{data?.board}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>{data?.schoolType}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>Medium: {data?.medium}</Typography>
                        </TableCell>
                        <TableCell className="table-td">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                              {data?.planId?.planName || '---'}
                            </Typography>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1.2,
                              py: 0.3,
                              borderRadius: '20px',
                              backgroundColor: data?.planStatus ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              color: data?.planStatus ? '#4caf50' : '#f44336',
                              width: 'fit-content'
                            }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                              <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                                {data?.planStatus ? "Active" : "Expired"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="table-td">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {data?.panNumber && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>PAN:</Typography>
                              <Typography sx={{ fontSize: '12px', color: '#111827' }}>{data?.panNumber || 'NA'}</Typography>
                            </Box>)}
                            {data?.gstNumber && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>GST:</Typography>
                              <Typography sx={{ fontSize: '12px', color: '#111827' }}>{data?.gstNumber || 'NA'}</Typography>
                            </Box>)}
                            {data?.registrationNumber && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>Reg:</Typography>
                              <Typography sx={{ fontSize: '12px', color: '#111827' }}>{data?.registrationNumber || 'NA'}</Typography>
                            </Box>)}
                          </Box>
                        </TableCell>
                        {hasPermission(developerPermission.school.status) && (<TableCell className="table-td">
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                            <Typography sx={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#111827',
                              fontFamily: "'Poppins', sans-serif"
                            }}>
                              {data?.updatedAt ? moment(data?.updatedAt).format('DD MMM YY') : '---'}
                            </Typography>
                            <Typography sx={{
                              fontSize: '11px',
                              color: '#6B7280',
                              fontWeight: 400,
                              fontFamily: "'Poppins', sans-serif",
                              lineHeight: 1
                            }}>
                              {data?.updatedAt ? moment(data?.updatedAt).fromNow() : '---'}
                            </Typography>
                          </Box>
                        </TableCell>)}
                        {hasAnyPermission([
                          developerPermission.school.read,
                          developerPermission.school.update,
                          developerPermission.school.delete,
                        ]) && (
                            <TableCell className="table-td" align="center">
                              <Box className="admin-table-data-btn-flex" sx={{ justifyContent: 'center' }}>
                                {hasPermission(developerPermission.school.read) && (
                                  <Tooltip title="View" arrow placement="bottom" className="admin-tooltip">
                                    <Button
                                      className="admin-table-data-btn admin-table-view-btn"
                                      onClick={() => navigate(`/school-list/view/${data?._id}`)}
                                    >
                                      <img src={Svg.yellowEye} className="admin-icon" alt="View" />
                                    </Button>
                                  </Tooltip>
                                )}
                                {hasPermission(developerPermission.school.update) && (
                                  <Tooltip title="Edit" arrow placement="bottom" className="admin-tooltip">
                                    <Button
                                      className="admin-table-data-btn admin-table-edit-btn"
                                      onClick={() => navigate(`/school-list/edit/${data?._id}`)}
                                    >
                                      <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                    </Button>
                                  </Tooltip>
                                )}
                                {hasPermission(developerPermission.school.delete) && (
                                  <Tooltip title="Delete" arrow placement="bottom" className="admin-tooltip">
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
                    <DataNotFound
                      text="No Schools Found"
                    />
                  )
                ) : (
                  <Loader colSpan={hasAnyPermission([
                    developerPermission.school.read,
                    developerPermission.school.update,
                    developerPermission.school.delete,
                  ]) ? 7 : 6} />
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
        title="School Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="School"
        open={openDelete}
        handleClose={() => setOpenDelete(false)}
        handleFunction={handleDelete}
        buttonStatusSpinner={buttonStatusSpinner}
      />

      <PopupModal
        type="delete"
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module={`Are you sure you want to ${selectedData?.isActive ? "deactivate" : "activate"} this school?`}
        open={openStatusModal}
        handleClose={() => setOpenStatusModal(false)}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={buttonStatusSpinner}
      />
    </Box>
  );
}
