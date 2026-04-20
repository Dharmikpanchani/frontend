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
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Email as EmailIcon,
  LocalPhone as PhoneIcon,
} from "@mui/icons-material";
import { getAllPlans, changePlanStatus, deletePlan } from "@/redux/slices/planSlice";
import { getAllAdminUsersSimple } from "@/redux/slices/adminUserSlice";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/developerCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import PopupModal from "../../component/developerCommon/popUpModal/PopupModal";
import { usePermissions } from "@/hooks/usePermissions";
import { developerPermission } from "@/apps/common/StaticArrayData";
import Filter from "@/apps/common/filter/Filter";
import { IOSSwitch } from "../../component/developerCommon/commonCssFunction/cssFunction";
import type { RootState } from "@/redux/Store";

export default function PlanList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, total, loading, actionLoading } = useSelector((state: RootState) => state.PlanReducer);
  const { allAdminUsersSimple } = useSelector((state: RootState) => state.AdminUserReducer);
  const { hasPermission, hasAnyPermission, isSuperDeveloper } = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(null);

  const [openFilter, setOpenFilter] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [filterValues, setFilterValues] = useState({
    planName: "",
    developerId: "",
    developerEmail: "",
    developerName: "",
    developerPhoneNumber: "",
    isActive: "",
  });

  const handleGetData = (searchQuery?: string, filters?: any) => {
    dispatch(getAllPlans({
      page: currentPage + 1,
      perPage: rowsPerPage > 0 ? rowsPerPage : 10,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
      filters: filters ?? filterValues,
    }) as any);
  };

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    if (isSuperDeveloper) {
      dispatch(getAllAdminUsersSimple("filter") as any);
    }
  }, [isSuperDeveloper, dispatch]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    handleGetData(searchNameValue, values);
    setOpenFilter(false);
    setCurrentPage(0);
  };

  const handleResetFilter = () => {
    const resetValues = {
      planName: "",
      developerId: "",
      developerEmail: "",
      developerName: "",
      developerPhoneNumber: "",
      isActive: "",
    };
    setFilterValues(resetValues);
    handleGetData(searchNameValue, resetValues);
    setOpenFilter(false);
    setCurrentPage(0);
  };

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    []
  );

  const handleStatusChange = (data: any) => {
    setSelectedData(data);
    setOpenStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    await dispatch(changePlanStatus(selectedData._id) as any);
    setOpenStatusModal(false);
    setSelectedData(null);
  };

  const handleOpenDelete = (data: any) => {
    setSelectedData(data);
    setOpenDeleteModal(true);
  };

  const handleDeletePlan = async () => {
    if (!selectedData) return;
    await dispatch(deletePlan(selectedData._id) as any);
    setOpenDeleteModal(false);
    setSelectedData(null);
  };

  const filterFields: any[] = [
    {
      type: "inputSelect",
      name: "developerEmail",
      label: "Creator Email",
      placeholder: "Enter Creator Email",
    },
    {
      type: "inputSelect",
      name: "developerPhoneNumber",
      label: "Creator Number",
      placeholder: "Enter Creator Number",
    },
    {
      type: "inputSelect",
      name: "planName",
      label: "Plan Name",
      placeholder: "Enter Plan Name",
    },
    ...(isSuperDeveloper ? [
      {
        type: "searchbaseSelect",
        name: "developerId",
        label: "Developer User",
        placeholder: "Select Developer",
        options: allAdminUsersSimple,
        getOptionLabel: (option: any) => option.name || option.email || "",
        getOptionValue: (option: any) => option._id,
      },
      {
        type: "inputSelect",
        name: "developerName",
        label: "Creator Name",
        placeholder: "Enter Creator Name",
      },
    ] : []),
    {
      type: "searchbaseSelect",
      name: "isActive",
      label: "Plan Status",
      placeholder: "Select Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Plan List
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
                  placeholder="Search Plans"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchNameValue(e.target.value);
                    debouncedCallGetApi(e.target.value);
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
          {isSuperDeveloper && (
            <Box className="admin-filter-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => setOpenFilter(true)}
                sx={{ ml: 1, minWidth: '45px', p: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FilterIcon sx={{ color: 'var(--button-text, #fff)', fontSize: '18px' }} />
              </Button>
            </Box>
          )}
          {hasPermission(developerPermission.plan.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/plan-list/add")}
              >
                <AddIcon sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }} />
                Add Plan
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container" sx={{ boxShadow: 'none' }}>
            <Table aria-label="plan table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th" sx={{ fontWeight: 700 }}>{isSuperDeveloper ? "Plan & Creator" : "Plan Name"}</TableCell>
                  <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Offer Price</TableCell>
                  <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Cycle</TableCell>
                  <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  {hasAnyPermission([
                    developerPermission.plan.read,
                    developerPermission.plan.update,
                    developerPermission.plan.delete,
                  ]) && (
                      <TableCell className="table-th" align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                    )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  plans.length ? (
                    plans.map((data: any) => (
                      <TableRow key={data._id} sx={{ "&:last-child td, &:last-child th": { border: 0 }, '&:hover': { bgcolor: '#f9fafb' } }}>
                        <TableCell className="table-td">
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            {isSuperDeveloper && (
                              <Avatar
                                src={`${import.meta.env.VITE_BASE_URL_IMAGE}/${data.adminId?.image || ""}`}
                                variant="circular"
                                sx={{ width: 45, height: 45, border: '1px solid #ddd' }}
                              >
                                {data.adminId?.name?.[0]?.toUpperCase() || "A"}
                              </Avatar>
                            )}
                            <Box sx={{ textAlign: 'left' }}>
                              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#111827', mb: 0.2 }}>
                                {data.planName}
                              </Typography>
                              {isSuperDeveloper && (
                                <>
                                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#4B5563', mb: 0.4 }}>
                                    {data.adminId?.name || "N/A"}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                    <EmailIcon sx={{ fontSize: 13, color: '#942F15' }} />
                                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                                      {data.adminId?.email || "N/A"}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon sx={{ fontSize: 13, color: '#942F15' }} />
                                    <Typography sx={{ fontSize: '12px', color: '#6b7280' }}>
                                      {data.adminId?.phoneNumber || "N/A"}
                                    </Typography>
                                  </Box>
                                </>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center" className="table-td">
                          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-color)' }}>
                            ₹{data.billingCycle === "monthly" ? data.monPrice : data.yerPrice}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" className="table-td">
                          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-color)' }}>
                            ₹{data.billingCycle === "monthly" ? (data.monOfferPrice || "-") : (data.yerOfferPrice || "-")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" className="table-td">
                          <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>{data.billingCycle}</Typography>
                        </TableCell>
                        <TableCell align="center" className="table-td">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1,
                              py: 0.2,
                              borderRadius: '20px',
                              backgroundColor: data.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              color: data.isActive ? '#4caf50' : '#f44336',
                              width: 'fit-content'
                            }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                              <Typography sx={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                                {data.isActive ? "Active" : "Inactive"}
                              </Typography>
                            </Box>
                            {hasPermission(developerPermission.plan.status) && (
                              <IOSSwitch checked={data.isActive} onChange={() => handleStatusChange(data)} />
                            )}
                          </Box>
                        </TableCell>
                        {hasAnyPermission([
                          developerPermission.plan.read,
                          developerPermission.plan.update,
                          developerPermission.plan.delete,
                        ]) && (
                            <TableCell className="table-td">
                              <Box className="admin-table-data-btn-flex" sx={{ justifyContent: 'flex-end' }}>
                                {hasPermission(developerPermission.plan.read) && (
                                  <Tooltip title="View" arrow placement="bottom">
                                    <Button className="admin-table-data-btn admin-table-view-btn" onClick={() => navigate("/plan-list/view", { state: { id: data._id } })}>
                                      <img src={Svg.yellowEye} className="admin-icon" alt="View" />
                                    </Button>
                                  </Tooltip>
                                )}
                                {hasPermission(developerPermission.plan.update) && (
                                  <Tooltip title="Edit" arrow placement="bottom">
                                    <Button className="admin-table-data-btn admin-table-edit-btn" onClick={() => navigate("/plan-list/edit", { state: { id: data._id } })}>
                                      <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                    </Button>
                                  </Tooltip>
                                )}
                                {hasPermission(developerPermission.plan.delete) && (
                                  <Tooltip title="Delete" arrow placement="bottom">
                                    <Button className="admin-table-data-btn admin-table-delete-btn" onClick={() => handleOpenDelete(data)}>
                                      <img src={Svg.trash} className="admin-icon" alt="Trash" />
                                    </Button>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          )}
                      </TableRow>
                    ))
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

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Plan Filter"
        fields={filterFields}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module={`Are you sure you want to ${selectedData?.isActive ? "deactivate" : "activate"} this plan?`}
        open={openStatusModal}
        handleClose={() => setOpenStatusModal(false)}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={actionLoading}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Plan"
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        handleFunction={handleDeletePlan}
        buttonStatusSpinner={actionLoading}
      />
    </Box>
  );
}
