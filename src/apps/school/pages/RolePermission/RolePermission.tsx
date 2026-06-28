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
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { getAllRoles, deleteRole } from "@/redux/slices/roleSlice";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import PopupModal from "../../component/schoolCommon/popUpModal/PopupModal";
import type { RootState } from "@/redux/Store";
import { usePermissions } from "@/hooks/usePermissions";
import { toasterSuccess, toasterError } from "@/utils/toaster/Toaster";
import BulkImportModal from "@/apps/common/BulkImportModal";
import { roleService } from "@/api/services/role.service";

let initialState = {
  id: "",
  role: "",
  is_active: false,
  is_deleted: false,
};

export default function RoleList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roles, total, loading } = useSelector(
    (state: RootState) => state.RoleReducer,
  );
  const { hasPermission, hasAnyPermission } = usePermissions();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(initialState);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  // delete modal
  const handleOpenDelete = (data: any) => {
    setOpenDelete(true);
    setSelectedData(data);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedData(initialState);
  };

  const [openImportModal, setOpenImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExport = async (format: "excel" | "pdf" | "html" = "excel") => {
    try {
      setExporting(true);
      const response = await roleService.exportRoles({
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
      link.download = `roles_report_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toasterSuccess("Roles exported successfully");
    } catch (error: any) {
      toasterError(error.message || "Failed to export roles");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Role Name,Permissions\nTeacher,schoolAdminPermission.teacher.read%,schoolAdminPermission.teacher.create\nStudent,schoolAdminPermission.student.read";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Role_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadFile = async (file: File) => {
    try {
      const response = await roleService.importRoles(file);
      handleGetData();
      if (response?.data && response.data.failCount > 0) {
        return {
          success: false,
          message: `${response.data.successCount} Roles imported successfully, ${response.data.failCount} failed.`,
          errors: response.data.failures,
        };
      }
      return { success: true, message: response.message || "Roles imported successfully." };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import roles";
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

  const handleGetData = (searchQuery?: string) => {
    dispatch(
      getAllRoles({
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
    setButtonStatusSpinner(true);
    await dispatch(deleteRole(selectedData._id) as any);
    setButtonStatusSpinner(false);
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
          Roles
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
            {hasPermission(schoolAdminPermission.role.import) && (
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
            {hasPermission(schoolAdminPermission.role.create) && (
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/role-list/add")}
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
                Add Roles
              </Button>
            )}
            {hasPermission(schoolAdminPermission.role.export) && roles?.length > 0 && (
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
                  <TableCell component="th" className="table-th" width="20%">
                    Role Name
                  </TableCell>

                  {hasAnyPermission([
                    schoolAdminPermission.role.update,
                    schoolAdminPermission.role.delete,
                    schoolAdminPermission.role.read,
                  ]) && (
                    <TableCell
                      component="th"
                      className="table-th"
                      width="5%"
                      align="right"
                    >
                      Action
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  roles?.length ? (
                    roles?.map((data: any) => {
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
                                title={data?.role}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text">
                                  {data?.role}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {hasAnyPermission([
                            schoolAdminPermission?.role?.read,
                            schoolAdminPermission?.role?.update,
                            schoolAdminPermission?.role?.delete,
                          ]) && (
                            <TableCell component="td" className="table-td">
                              <Box className="admin-table-data-btn-flex">
                                {hasPermission(
                                  schoolAdminPermission?.role?.read,
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
                                        navigate("/role-list/view", {
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
                                  schoolAdminPermission?.role?.update,
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
                                        navigate("/role-list/edit", {
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
                                  schoolAdminPermission.role.delete,
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

      <PopupModal
        type="delete"
        buttonText="Delete"
        module={`Role (${selectedData?.role})`}
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonStatusSpinner={buttonStatusSpinner}
      />

      <BulkImportModal
        open={openImportModal}
        onClose={(imported) => {
          setOpenImportModal(false);
          if (imported) handleGetData();
        }}
        title="Import Roles"
        onDownloadTemplate={handleDownloadTemplate}
        onUpload={handleUploadFile}
      />
    </Box>
  );
}
