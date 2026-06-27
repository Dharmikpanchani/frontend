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
  Download as DownloadIcon,
  Print as PrintIcon,
  FileDownload as ExcelIcon,
} from "@mui/icons-material";
import {
  getDepartments,
  deleteDepartment,
  changeDepartmentStatus,
} from "@/redux/slices/departmentSlice";
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

export default function Department() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departments, total, loading, actionLoading } = useSelector(
    (state: RootState) => state.DepartmentReducer,
  );
  const { hasPermission, hasAnyPermission } = usePermissions();
  const colSpanCount =
    3 +
    (hasPermission(schoolAdminPermission.department.status) ? 1 : 0) +
    (hasAnyPermission([
      schoolAdminPermission.department.read,
      schoolAdminPermission.department.update,
      schoolAdminPermission.department.delete,
    ])
      ? 1
      : 0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);

  const [openImportModal, setOpenImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExport = async (format: "excel" | "pdf" | "html" = "excel") => {
    try {
      setExporting(true);
      const response = await masterService.exportDepartments({
        searchRequest: searchNameValue,
        format,
      });
      
      const blob = new Blob([response], {
        type: format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `departments_report_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toasterSuccess("Departments exported successfully");
    } catch (error: any) {
      toasterError(error.message || "Failed to export departments");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Department Name,Department Code,Status\nComputer Science,CS,Active\nMathematics,MATH,Active";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Department_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadFile = async (file: File) => {
    try {
      const response = await masterService.importDepartments(file);
      handleGetData();
      if (response?.data && response.data.failCount > 0) {
        return {
          success: false,
          message: `${response.data.successCount} Departments imported successfully, ${response.data.failCount} failed.`,
          errors: response.data.failures,
        };
      }
      return { success: true, message: response.message || "Departments imported successfully." };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import departments";
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
    await dispatch(changeDepartmentStatus(selectedData._id) as any);
    setOpenStatusModal(false);
    setSelectedData(null);
  };

  const handleGetData = (searchQuery?: string) => {
    dispatch(
      getDepartments({
        page: currentPage + 1,
        perPage: rowsPerPage > 0 ? rowsPerPage : 10,
        search: searchQuery?.trim() ?? searchNameValue.trim(),
      }) as any,
    );
  };

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage]);

  const handleDelete = async () => {
    if (!selectedData) return;
    await dispatch(deleteDepartment(selectedData._id) as any);
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
          Departments
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
          <Box className="admin-add-user-btn-main" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {hasPermission(schoolAdminPermission.department.import) && (
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
            {hasPermission(schoolAdminPermission.department.create) && (
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/master/department/add")}
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
                Add Department
              </Button>
            )}
            {hasPermission(schoolAdminPermission.department.export) && departments?.length > 0 && (
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
                    Department Name
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Code
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Created At
                  </TableCell>
                  {hasPermission(schoolAdminPermission.department.status) && (
                    <TableCell component="th" className="table-th" width="15%">
                      Status
                    </TableCell>
                  )}
                  {hasAnyPermission([
                    schoolAdminPermission.department.read,
                    schoolAdminPermission.department.update,
                    schoolAdminPermission.department.delete,
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
                  departments?.length ? (
                    departments?.map((data: any) => {
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
                            schoolAdminPermission.department.status,
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
                            schoolAdminPermission.department.read,
                            schoolAdminPermission.department.update,
                            schoolAdminPermission.department.delete,
                          ]) && (
                            <TableCell component="td" className="table-td">
                              <Box className="admin-table-data-btn-flex">
                                {hasPermission(
                                  schoolAdminPermission.department.read,
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
                                        navigate("/master/department/view", {
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
                                  schoolAdminPermission.department.update,
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
                                        navigate("/master/department/edit", {
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
                                  schoolAdminPermission.department.delete,
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
                    <DataNotFound colSpan={colSpanCount} text="No departments found" />
                  )
                ) : (
                  <Loader colSpan={colSpanCount} />
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
        buttonText="Delete"
        module="Department"
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonStatusSpinner={actionLoading}
      />

      <PopupModal
        type={selectedData?.isActive ? "deactivate" : "activate"}
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module="this department"
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
        title="Import Departments"
        onDownloadTemplate={handleDownloadTemplate}
        onUpload={handleUploadFile}
      />
    </Box>
  );
}
