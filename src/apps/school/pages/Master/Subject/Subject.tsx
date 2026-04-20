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
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, FilterList as FilterIcon } from "@mui/icons-material";
import { getSubjects, deleteSubject, changeSubjectStatus } from "@/redux/slices/subjectSlice";
import { getDepartments } from "@/redux/slices/departmentSlice";
import Svg from "@/assets/Svg";
import Filter from "@/apps/common/filter/Filter";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import type { RootState } from "@/redux/Store";
import DataNotFound from "@/apps/school/component/schoolCommon/dataNotFound/DataNotFound";
import PopupModal from "@/apps/school/component/schoolCommon/popUpModal/PopupModal";
import { IOSSwitch } from "@/apps/school/component/schoolCommon/commonCssFunction/cssFunction";

export default function Subject() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subjects, total, loading, actionLoading } = useSelector((state: RootState) => state.SubjectReducer);
  const { departments } = useSelector((state: RootState) => state.DepartmentReducer);
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(null);

  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    departmentId: "",
    isActive: "",
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);

  const handleOpenDelete = (data: any) => {
    setOpenDelete(true);
    setSelectedData(data);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedData(null);
  };

  const handleStatusChange = (data: any) => {
    setSelectedData(data);
    setOpenStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    await dispatch(changeSubjectStatus(selectedData._id) as any);
    setOpenStatusModal(false);
    setSelectedData(null);
  };

  const handleGetData = (searchQuery?: string, filters?: any) => {
    dispatch(getSubjects({
      page: currentPage + 1,
      perPage: rowsPerPage > 0 ? rowsPerPage : 10,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
      departmentId: filters?.departmentId !== undefined ? filters.departmentId : filterValues.departmentId,
      isActive: filters?.isActive !== undefined ? filters.isActive : filterValues.isActive,
    }) as any);
  };

  useEffect(() => {
    dispatch(getDepartments({ type: "filter" }) as any);
  }, [dispatch]);

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    handleGetData(searchNameValue, values);
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    const resetValues = { departmentId: "", isActive: "" };
    setFilterValues(resetValues);
    handleGetData(searchNameValue, resetValues);
    setOpenFilter(false);
  };

  const handleDelete = async () => {
    if (!selectedData) return;
    await dispatch(deleteSubject(selectedData._id) as any);
    handleCloseDelete();
  };

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    []
  );

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
        >
          Subjects
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
          {hasPermission(schoolAdminPermission.subject.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/master/subject/add")}
              >
                <AddIcon
                  className="admin-plus-icon"
                  sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
                />
                Add Subject
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
                    width="25%"
                  >
                    Subject Name
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="20%"
                  >
                    Code
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="20%"
                  >
                    Departments
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="15%"
                  >
                    Created At
                  </TableCell>
                  {hasPermission(schoolAdminPermission.subject.status) && (
                    <TableCell
                      component="th"
                      className="table-th"
                      width="10%"
                    >
                      Status
                    </TableCell>
                  )}
                  {hasAnyPermission([
                    schoolAdminPermission.subject.read,
                    schoolAdminPermission.subject.update,
                    schoolAdminPermission.subject.delete,
                  ]) && (
                      <TableCell
                        component="th"
                        className="table-th"
                        width="10%"
                        align="right"
                      >
                        Action
                      </TableCell>
                    )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  subjects?.length ? (
                    subjects?.map((data: any) => {
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
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Tooltip
                                title={data?.code || "N/A"}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text">
                                  {data?.code || "N/A"}
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
                              {data?.departmentIds?.length > 0 ? (
                                <Tooltip
                                  title={data.departmentIds.map((d: any) => d.name).join(", ")}
                                  arrow
                                  placement="bottom"
                                  className="admin-tooltip"
                                >
                                  <Typography className="admin-table-data-text">
                                    {data.departmentIds[0].name}
                                    {data.departmentIds.length > 1 && ` (+${data.departmentIds.length - 1} more)`}
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography className="admin-table-data-text">N/A</Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Typography className="admin-table-data-text">
                                {new Date(data?.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          {hasPermission(schoolAdminPermission.subject.status) && (
                            <TableCell
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
                                    />
                                  </Box>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          )}

                          {hasAnyPermission([
                            schoolAdminPermission.subject.read,
                            schoolAdminPermission.subject.update,
                            schoolAdminPermission.subject.delete,
                          ]) && (
                              <TableCell
                                component="td"
                                className="table-td"
                              >
                                <Box className="admin-table-data-btn-flex">
                                  {hasPermission(schoolAdminPermission.subject.read) && (
                                    <Tooltip
                                      title="View"
                                      arrow
                                      placement="bottom"
                                      className="admin-tooltip"
                                    >
                                      <Button
                                        className="admin-table-data-btn admin-table-view-btn"
                                        onClick={() => {
                                          navigate("/master/subject/view", { state: { id: data?._id } });
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

                                  {hasPermission(schoolAdminPermission.subject.update) && (
                                    <Tooltip
                                      title="Edit"
                                      arrow
                                      placement="bottom"
                                      className="admin-tooltip"
                                    >
                                      <Button
                                        className="admin-table-data-btn admin-table-edit-btn"
                                        onClick={() => {
                                          navigate("/master/subject/edit", { state: { id: data?._id } });
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

                                  {hasPermission(schoolAdminPermission.subject.delete) && (
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

      <Filter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        title="Subject Filter"
        fields={[
          {
            type: "searchbaseSelect",
            name: "departmentId",
            label: "Department",
            placeholder: "Select Department",
            options: departments || [],
            getOptionLabel: (option: any) => option.name || "",
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
        ]}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Subject"
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonStatusSpinner={actionLoading}
      />

      <PopupModal
        type={selectedData?.isActive ? "deactivate" : "activate"}
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module="this subject"
        open={openStatusModal}
        handleClose={() => {
          setOpenStatusModal(false);
          setSelectedData(null);
        }}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={actionLoading}
      />
    </Box>
  );
}
