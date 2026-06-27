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
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FileDownload as ExcelIcon,
} from "@mui/icons-material";
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
import { toasterSuccess, toasterError } from "@/utils/toaster/Toaster";
import BulkImportModal from "@/apps/common/BulkImportModal";
import { masterService } from "@/api/services/master.service";

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

  const [openImportModal, setOpenImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExport = async (format: "excel" | "pdf" | "html" = "excel") => {
    try {
      setExporting(true);
      const response = await masterService.exportClasses({
        searchRequest: searchNameValue,
        isActive: filterValues.isActive,
        startYear: filterValues.startYears.length > 0 ? filterValues.startYears : undefined,
        format,
      });
      
      const blob = new Blob([response], {
        type: format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `classes_report_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toasterSuccess("Classes exported successfully");
    } catch (error: any) {
      toasterError(error.message || "Failed to export classes");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Class Name,Status\nClass 1,Active\nClass 2,Active";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Class_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadFile = async (file: File) => {
    try {
      const response = await masterService.importClasses(file);
      handleGetData();
      if (response?.data && response.data.failCount > 0) {
        return {
          success: false,
          message: `${response.data.successCount} Classes imported successfully, ${response.data.failCount} failed.`,
          errors: response.data.failures,
        };
      }
      return { success: true, message: response.message || "Classes imported successfully." };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import classes";
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
          <Box className="admin-add-user-btn-main" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {hasPermission(schoolAdminPermission.class.import) && (
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
            {hasPermission(schoolAdminPermission.class.create) && (
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/master/class/add")}
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
                Add Class
              </Button>
            )}
            {hasPermission(schoolAdminPermission.class.export) && classes?.length > 0 && (
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
                  <MenuItem onClick={() => { setExportAnchorEl(null); handleExport("excel"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                    <ExcelIcon sx={{ fontSize: "18px", color: "#12B76A" }} /> Export Excel
                  </MenuItem>
                  <MenuItem onClick={() => { setExportAnchorEl(null); handleExport("pdf"); }} sx={{ gap: 1.5, fontSize: "14px" }}>
                    <PrintIcon sx={{ fontSize: "18px", color: "#667085" }} /> Export PDF
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
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

      <BulkImportModal
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        title="Import Classes"
        onDownloadTemplate={handleDownloadTemplate}
        onUpload={handleUploadFile}
      />
    </Box>
  );
}
