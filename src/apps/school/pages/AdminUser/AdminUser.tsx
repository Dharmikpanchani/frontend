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
  debounce,
  Chip,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, FilterList as FilterIcon } from "@mui/icons-material";
import { getAllAdminUsers, deleteAdminUser } from "@/redux/slices/adminUserSlice";
import { getAllRolesSimple } from "@/redux/slices/roleSlice";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import ProfileAvatar from "@/apps/common/ProfileAvatar";
import PopupModal from "../../component/schoolCommon/popUpModal/PopupModal";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import { changeAdminUserStatus } from "@/redux/slices/adminUserSlice";
import type { RootState } from "@/redux/Store";

export default function AdminUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminUsers, total, loading } = useSelector((state: RootState) => state.AdminUserReducer);
  const { hasPermission, hasAnyPermission } = usePermissions();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(null);

  const [openFilter, setOpenFilter] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [filterValues, setFilterValues] = useState({
    role: "",
    isActive: "",
    isLogin: "",
    isVerified: "",
  });

  const [openDelete, setOpenDelete] = useState(false);
  // delete modal
  const handleOpenDelete = (data: any) => {
    setOpenDelete(true);
    setSelectedData(data);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedData(null);
  };

  const handleGetData = (searchQuery?: string, filters?: any) => {
    dispatch(getAllAdminUsers({
      page: currentPage + 1,
      perPage: rowsPerPage > 0 ? rowsPerPage : 10,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
      role: filters?.role !== undefined ? filters.role : filterValues.role,
      isActive: filters?.isActive !== undefined ? filters.isActive : filterValues.isActive,
      isLogin: filters?.isLogin !== undefined ? filters.isLogin : filterValues.isLogin,
      isVerified: filters?.isVerified !== undefined ? filters.isVerified : filterValues.isVerified,
    }) as any);
  };

  useEffect(() => { handleGetData(searchNameValue); }, [currentPage, rowsPerPage]);

  useEffect(() => {
    dispatch(getAllRolesSimple("filter") as any);
  }, [dispatch]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    handleGetData(searchNameValue, values);
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    const resetValues = { role: "", isActive: "", isLogin: "", isVerified: "" };
    setFilterValues(resetValues);
    handleGetData(searchNameValue, resetValues);
    setOpenFilter(false);
  };

  const handleDelete = async () => {
    setButtonStatusSpinner(true);
    await dispatch(deleteAdminUser(selectedData?._id) as any);
    setButtonStatusSpinner(false);
    handleCloseDelete();
  };

  const handleStatusChange = (data: any) => {
    setSelectedData(data);
    setOpenStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    setButtonStatusSpinner(true);
    await dispatch(changeAdminUserStatus(selectedData?._id) as any);
    setButtonStatusSpinner(false);
    setOpenStatusModal(false);
    setSelectedData(null);
  };

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    []
  );

  const { allRoles } = useSelector((state: RootState) => state.RoleReducer);

  const filterFields: any[] = [
    {
      type: "searchbaseSelect",
      name: "role",
      label: "Role",
      placeholder: "Select Role",
      options: allRoles || [],
      getOptionLabel: (option: any) => option.role || "",
      getOptionValue: (option: any) => option._id,
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
      name: "isLogin",
      label: "Login Status",
      placeholder: "Select Login Status",
      options: [
        { label: "Online", value: true },
        { label: "Offline", value: false },
      ],
    },
    {
      type: "searchbaseSelect",
      name: "isVerified",
      label: "Verification Status",
      placeholder: "Select Verification Status",
      options: [
        { label: "Verified", value: true },
        { label: "Unverified", value: false },
      ],
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
          Admin User
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
                  className="school-admin-search-grey-img admin-icon"
                  sx={{ color: 'var(--primary-color)', fontSize: '20px' }}
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
                textTransform: 'capitalize',
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
          {hasPermission(schoolAdminPermission.admin_user.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/admin-list/add")}
              >
                <AddIcon
                  className="admin-plus-icon"
                  sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
                />
                Add Admin User
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer
            component={Paper}
            className="table-container"
          >
            <Table aria-label="simple table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell
                    component="th"
                    className="table-th"
                    width="20%"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="30%"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="15%"
                  >
                    Role
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="20%"
                  >
                    Login / Verification
                  </TableCell>
                  {hasPermission(schoolAdminPermission.admin_user.status) && (
                    <TableCell
                      component="th"
                      className="table-th"
                      width="15%"
                    >
                      Status
                    </TableCell>
                  )}

                  {hasAnyPermission([
                    schoolAdminPermission.admin_user.read,
                    schoolAdminPermission.admin_user.update,
                    schoolAdminPermission.admin_user.delete,
                  ]) && (
                      <TableCell
                        component="th"
                        className="table-th"
                        width="20%"
                        align="right"
                      >
                        Action
                      </TableCell>
                    )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  adminUsers?.length ? (
                    adminUsers?.map((data: any) => {
                      return (
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                          key={data._id}
                        >
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <ProfileAvatar
                                name={data?.name}
                                imageUrl={data?.profileImage}
                                size={40}
                              />
                              <Box className="admin-table-data-flex">
                                <Tooltip
                                  title={data?.name || "N/A"}
                                  arrow
                                  placement="bottom"
                                  className="admin-tooltip"
                                >
                                  <Typography className="admin-table-data-text">
                                    {data?.name || "N/A"}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Tooltip
                                title={data?.email || "N/A"}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text email-text">
                                  {data?.email || "N/A"}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Tooltip
                                title={data?.role?.role || "N/A"}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text">
                                  {data?.role?.role || "N/A"}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Chip
                                label={data?.isLogin ? "Online" : "Offline"}
                                sx={{
                                  backgroundColor: data?.isLogin ? "#e8f5e9" : "#ffebee",
                                  color: data?.isLogin ? "#2e7d32" : "#d32f2f",
                                  boxShadow: `0px 0px 8px ${data?.isLogin ? "rgba(76, 175, 80, 0.4)" : "rgba(244, 67, 54, 0.4)"}`,
                                  fontWeight: 600,
                                  fontSize: "11px",
                                  height: "22px",
                                  width: 'fit-content',
                                  "& .MuiChip-label": {
                                    padding: "0 8px",
                                  },
                                }}
                              />
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.3,
                                borderRadius: '20px',
                                backgroundColor: data?.isVerified ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                color: data?.isVerified ? '#2196f3' : '#ff9800',
                                width: 'fit-content'
                              }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                <Typography sx={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                                  {data?.isVerified ? "Verified" : "Not Verified"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          {hasPermission(schoolAdminPermission.admin_user.status) && (<TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Tooltip title={data?.isActive ? "Deactivate" : "Activate"} arrow placement="top">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IOSSwitch
                                    checked={data?.isActive}
                                    onChange={() => handleStatusChange(data)}
                                    disabled={data?.isSuperAdmin}
                                  />
                                </Box>
                              </Tooltip>
                            </Box>
                          </TableCell>)}

                          {hasAnyPermission([
                            schoolAdminPermission.admin_user.read,
                            schoolAdminPermission.admin_user.delete,
                            schoolAdminPermission.admin_user.update,
                          ]) && (
                              <TableCell
                                component="td"
                                className="table-td"
                              >
                                <Box className="admin-table-data-btn-flex">
                                  {hasPermission(schoolAdminPermission.admin_user.read) && (
                                    <Tooltip
                                      title="View"
                                      arrow
                                      placement="bottom"
                                      className="admin-tooltip"
                                    >
                                      <Button
                                        className="admin-table-data-btn admin-table-view-btn"
                                        onClick={() => {
                                          navigate(`/admin-list/view/${data?._id}`);
                                        }}
                                      >
                                        <img
                                          src={Svg.yellowEye}
                                          className="admin-icon"
                                          alt="View"
                                        />
                                      </Button>
                                    </Tooltip>
                                  )}

                                  {hasPermission(schoolAdminPermission.admin_user.update) && (
                                    <Tooltip
                                      title="Edit"
                                      arrow
                                      placement="bottom"
                                      className="admin-tooltip"
                                    >
                                      <Button
                                        className="admin-table-data-btn admin-table-edit-btn"
                                        onClick={() => {
                                          navigate(`/admin-list/edit/${data?._id}`);
                                        }}
                                      >
                                        <img
                                          src={Svg.editIcon}
                                          className="admin-icon"
                                          alt="Edit"
                                        />
                                      </Button>
                                    </Tooltip>
                                  )}

                                  {hasPermission(schoolAdminPermission.admin_user.delete) && !data?.isSuperAdmin && (
                                    <Tooltip
                                      title="Delete"
                                      arrow
                                      placement="bottom"
                                      className="admin-tooltip"
                                    >
                                      <Button
                                        className="admin-table-data-btn admin-table-delete-btn"
                                        onClick={() => handleOpenDelete(data)}
                                      >
                                        <img
                                          src={Svg.trash}
                                          className="admin-icon"
                                          alt="Trash"
                                        />
                                      </Button>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            )}
                        </TableRow>
                      );
                    })
                  ) : (
                    <DataNotFound />
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

      {/* Filter Component */}
      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Admin Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Admin User"
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonStatusSpinner={buttonStatusSpinner}
      />

      <PopupModal
        type={selectedData?.isActive ? "deactivate" : "activate"}
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module="this admin user"
        open={openStatusModal}
        handleClose={() => {
          setOpenStatusModal(false);
          setSelectedData(null);
        }}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={buttonStatusSpinner}
      />

    </Box>
  );
}
