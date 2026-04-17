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
  Tooltip,
  debounce,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import Svg from "@/assets/Svg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllPlans, changePlanStatus, deletePlan } from "@/redux/slices/planSlice";
import type { RootState } from "@/redux/Store";
import { IOSSwitch } from "../../component/developerCommon/commonCssFunction/cssFunction";
import PopupModal from "../../component/developerCommon/popUpModal/PopupModal";
import Loader from "@/apps/common/loader/Loader";
import DataNotFound from "../../component/developerCommon/dataNotFound/DataNotFound";
import Pagination from "@/apps/common/pagination/Pagination";

export default function PlanDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, total, loading, actionLoading } = useSelector((state: RootState) => state.PlanReducer);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const handleGetData = (searchQuery?: string) => {
    dispatch(getAllPlans({
      page: currentPage + 1,
      perPage: rowsPerPage,
      search: searchQuery ?? searchNameValue,
    }) as any);
  };

  useEffect(() => {
    handleGetData();
  }, [currentPage, rowsPerPage]);

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    []
  );

  const handleStatusChangeToggle = (data: any) => {
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

  return (
    <Box>
      <Box className="admin-user-list-flex admin-page-title-main" sx={{ mb: 3 }}>
        <Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
          sx={{ fontSize: '18px', fontWeight: 700 }}
        >
          Plan Details
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
                  className="school-admin-search-grey-img admin-icon"
                  sx={{ color: 'var(--primary-color)', fontSize: '20px' }}
                />
              </Box>
            </Box>
          </Box>
          <Box className="admin-add-user-btn-main">
            <Button
              className="admin-btn-theme"
              onClick={() => {
                 navigate("/plan-list/add");
              }}
            >
              <AddIcon
                className="admin-plus-icon"
                sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
              />
              Add Plan
            </Button>
          </Box>
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer
            component={Paper}
            className="table-container"
            sx={{ boxShadow: 'none' }}
          >
            <Table aria-label="plan table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell component="th" className="table-th" sx={{ fontWeight: 700 }}>Plan Name</TableCell>
                  <TableCell component="th" className="table-th" align="center" sx={{ fontWeight: 700 }}>Cycle</TableCell>
                  <TableCell component="th" className="table-th" align="center" sx={{ fontWeight: 700 }}>Limits (S/T/C)</TableCell>
                  <TableCell component="th" className="table-th" align="center" sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell component="th" className="table-th" align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell component="th" className="table-th" align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                    plans.length ? (
                        plans.map((data: any) => (
                            <TableRow
                                sx={{
                                    "&:last-child td, &:last-child th": { border: 0 },
                                    '&:hover': { bgcolor: '#f9fafb' }
                                }}
                                key={data._id}
                            >
                                <TableCell component="td" className="table-td">
                                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{data.planName}</Typography>
                                </TableCell>
                                <TableCell component="td" align="center" className="table-td">
                                    <Typography sx={{ fontSize: '13px', textTransform: 'capitalize' }}>{data.billingCycle}</Typography>
                                </TableCell>
                                <TableCell component="td" align="center" className="table-td">
                                    <Typography sx={{ fontSize: '13px', color: '#666' }}>
                                        {data.maxStudents} / {data.maxTeachers} / {data.maxClasses}
                                    </Typography>
                                </TableCell>
                                <TableCell component="td" align="center" className="table-td">
                                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-color)' }}>{data.price}</Typography>
                                </TableCell>
                                <TableCell component="td" align="center" className="table-td">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.2,
                                            py: 0.3,
                                            borderRadius: '20px',
                                            backgroundColor: data.isActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                            color: data.isActive ? '#4caf50' : '#f44336',
                                            width: 'fit-content'
                                        }}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                                                {data.isActive ? "Active" : "Inactive"}
                                            </Typography>
                                        </Box>
                                        <Tooltip title={data.isActive ? "Deactivate" : "Activate"} arrow placement="top">
                                            <Box>
                                                <IOSSwitch
                                                    checked={data.isActive}
                                                    onChange={() => handleStatusChangeToggle(data)}
                                                />
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                </TableCell>

                                <TableCell component="td" className="table-td">
                                    <Box className="admin-table-data-btn-flex" sx={{ justifyContent: 'flex-end' }}>
                                        <Tooltip title="View" arrow placement="bottom">
                                            <Button className="admin-table-data-btn admin-table-view-btn" onClick={() => navigate(`/plan-list/view/${data._id}`)}>
                                                <img src={Svg.yellowEye} className="admin-icon" alt="View" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Edit" arrow placement="bottom">
                                            <Button className="admin-table-data-btn admin-table-edit-btn" onClick={() => navigate(`/plan-list/edit/${data._id}`)}>
                                                <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete" arrow placement="bottom">
                                            <Button className="admin-table-data-btn admin-table-delete-btn" onClick={() => handleOpenDelete(data)}>
                                                <img src={Svg.trash} className="admin-icon" alt="Trash" />
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
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
