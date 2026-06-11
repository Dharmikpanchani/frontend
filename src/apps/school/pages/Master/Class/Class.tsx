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
import Filter from "@/apps/common/filter/Filter";
import {
  getClasses,
  deleteClass,
  changeClassStatus,
} from "@/redux/slices/classSlice";
import Svg from "@/assets/Svg";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import type { RootState } from "@/redux/Store";
import DataNotFound from "@/apps/school/component/schoolCommon/dataNotFound/DataNotFound";
import PopupModal from "@/apps/school/component/schoolCommon/popUpModal/PopupModal";
import { IOSSwitch } from "@/apps/school/component/schoolCommon/commonCssFunction/cssFunction";

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

export default function Class() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classes, total, loading, actionLoading } = useSelector(
    (state: RootState) => state.ClassReducer,
  );
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(null);

  const [openFilter, setOpenFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    isActive: "",
    startYears: [] as number[],
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
    await dispatch(changeClassStatus(selectedData._id) as any);
    setOpenStatusModal(false);
    setSelectedData(null);
  };

  const handleGetData = (searchQuery?: string, filters?: any) => {
    const selectedYears = filters?.startYears !== undefined
      ? filters.startYears
      : filterValues.startYears;

    dispatch(
      getClasses({
        page: currentPage + 1,
        perPage: rowsPerPage > 0 ? rowsPerPage : 10,
        search: searchQuery?.trim() ?? searchNameValue.trim(),
        isActive:
          filters?.isActive !== undefined
            ? filters.isActive
            : filterValues.isActive,
        startYear: selectedYears.length > 0 ? selectedYears : undefined,
      }) as any,
    );
  };

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage]);

  const handleApplyFilter = (values: any) => {
    setFilterValues(values);
    handleGetData(searchNameValue, values);
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    const resetValues = { isActive: "", startYears: [] };
    setFilterValues(resetValues);
    handleGetData(searchNameValue, resetValues);
    setOpenFilter(false);
  };

  const handleDelete = async () => {
    if (!selectedData) return;
    await dispatch(deleteClass(selectedData._id) as any);
    handleCloseDelete();
  };

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    [],
  );

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Classes
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
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <SearchIcon
                  className="school-admin-search-grey-img admin-icon"
                  sx={{ color: "var(--primary-color)", fontSize: "20px" }}
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
          {hasPermission(schoolAdminPermission.class.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/master/class/add")}
              >
                <AddIcon
                  className="admin-plus-icon"
                  sx={{
                    color: "var(--button-text, #fff)",
                    fontSize: "18px",
                    mr: 1,
                  }}
                />
                Add Class
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
                  <TableCell component="th" className="table-th" width="25%">
                    Class Name
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Code
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Created At
                  </TableCell>
                  {hasPermission(schoolAdminPermission.class.status) && (
                    <TableCell component="th" className="table-th" width="15%">
                      Status
                    </TableCell>
                  )}
                  {hasAnyPermission([
                    schoolAdminPermission.class.read,
                    schoolAdminPermission.class.update,
                    schoolAdminPermission.class.delete,
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
                  classes?.length ? (
                    classes?.map((data: any) => {
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
                              <Typography className="admin-table-data-text">
                                {new Date(data?.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          {hasPermission(
                            schoolAdminPermission.class.status,
                          ) && (
                            <TableCell
                              component="td"
                              scope="row"
                              className="table-td"
                            >
                              <Box className="admin-table-data-flex">
                                <Tooltip
                                  title={
                                    data?.isActive ? "Deactivate" : "Activate"
                                  }
                                  arrow
                                  placement="top"
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
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
                            schoolAdminPermission.class.read,
                            schoolAdminPermission.class.update,
                            schoolAdminPermission.class.delete,
                          ]) && (
                            <TableCell component="td" className="table-td">
                              <Box className="admin-table-data-btn-flex">
                                {hasPermission(
                                  schoolAdminPermission.class.read,
                                ) && (
                                  <Tooltip
                                    title="View"
                                    arrow
                                    placement="bottom"
                                    className="admin-tooltip"
                                  >
                                    <Button
                                      className="admin-table-data-btn admin-table-view-btn"
                                      onClick={() => {
                                        navigate("/master/class/view", {
                                          state: { id: data?._id },
                                        });
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

                                {hasPermission(
                                  schoolAdminPermission.class.update,
                                ) && (
                                  <Tooltip
                                    title="Edit"
                                    arrow
                                    placement="bottom"
                                    className="admin-tooltip"
                                  >
                                    <Button
                                      className="admin-table-data-btn admin-table-edit-btn"
                                      onClick={() => {
                                        navigate("/master/class/edit", {
                                          state: { id: data?._id },
                                        });
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

                                {hasPermission(
                                  schoolAdminPermission.class.delete,
                                ) && (
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
        title="Class Filter"
        fields={[
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
        ]}
        handleApply={handleApplyFilter}
        handleReset={handleResetFilter}
        initialValues={filterValues}
      />

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Class"
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonStatusSpinner={actionLoading}
      />

      <PopupModal
        type={selectedData?.isActive ? "deactivate" : "activate"}
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module="this class"
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
