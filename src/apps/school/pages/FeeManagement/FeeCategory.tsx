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
  fetchFeeCategories,
  removeFeeCategory,
} from "@/redux/slices/feeSlice";
import type { RootState, AppDispatch } from "@/redux/Store";
import { toasterSuccess, toasterError } from "@/utils/toaster/Toaster";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Pagination from "@/apps/common/pagination/Pagination";
import Svg from "@/assets/Svg";
import DataNotFound from "@/apps/school/component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import PopupModal from "@/apps/school/component/schoolCommon/popUpModal/PopupModal";
import { IOSSwitch } from "@/apps/school/component/schoolCommon/commonCssFunction/cssFunction";
import BulkImportModal from "@/apps/common/BulkImportModal";

const FeeCategory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { categories, loading } = useSelector((state: RootState) => state.FeeReducer);

  const canAdd = hasPermission(schoolAdminPermission.fee_category.create);
  const canEdit = hasPermission(schoolAdminPermission.fee_category.update);
  const canDelete = hasPermission(schoolAdminPermission.fee_category.delete);
  const canStatus = hasPermission(schoolAdminPermission.fee_category.status);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);

  // Search
  const [searchValue, setSearchValue] = useState<string>("");

  const navigate = useNavigate();

  // Status modal
  const [selectedData, setSelectedData] = useState<any>(null);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [openImportModal, setOpenImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExport = async (format: "excel" | "pdf" | "html" = "excel") => {
    try {
      setExporting(true);
      const { exportFeeCategories } = await import("@/api/services/fee.service");
      const response = await exportFeeCategories({
        search: searchValue,
        format,
      });

      const blob = new Blob([response.data], {
        type: format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `fee_categories_report_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toasterSuccess("Fee categories exported successfully");
    } catch (error: any) {
      toasterError(error.message || "Failed to export fee categories");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Category Name,Description,Mandatory,Status\nAdmission Fee,Admission and enrollment fee,Yes,Active\nTuition Fee,Monthly tuition fee,Yes,Active";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Fee_Category_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadFile = async (file: File) => {
    try {
      const { importFeeCategories } = await import("@/api/services/fee.service");
      const response = await importFeeCategories(file);
      loadCategories();
      if (response?.data?.data && response.data.data.failCount > 0) {
        return {
          success: false,
          message: `${response.data.data.successCount} Fee categories imported successfully, ${response.data.data.failCount} failed.`,
          errors: response.data.data.failures,
        };
      }
      return { success: true, message: response?.data?.message || "Fee categories imported successfully." };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import fee categories";
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

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const loadCategories = (search?: string) => {
    dispatch(
      fetchFeeCategories({
        page: currentPage + 1,
        limit: rowsPerPage,
        search: search !== undefined ? search : searchValue,
      }) as any
    ).then((res: any) => {
      if (res?.payload?.data) {
        setTotalDocs(
          res.payload.data.totalDocs ||
          res.payload.data.length ||
          0
        );
      }
    });
  };

  useEffect(() => { loadCategories(); }, [currentPage, rowsPerPage]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(0);
      loadCategories(query);
    }, 1000),
    []
  );



  // ─── Status toggle ──────────────────────────────────────────────────────────
  const handleStatusChange = (data: any) => {
    setSelectedData(data);
    setOpenStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedData) return;
    setActionLoading(true);
    try {
      const { changeFeeCategoryStatus } = await import("@/api/services/fee.service");
      await changeFeeCategoryStatus(selectedData._id, { isActive: !selectedData.isActive });
      toasterSuccess("Status updated successfully");
      loadCategories();
    } catch (err: any) {
      toasterError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
      setOpenStatusModal(false);
      setSelectedData(null);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleOpenDelete = (data: any) => {
    setSelectedData(data);
    setOpenDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedData) return;
    setActionLoading(true);
    try {
      await dispatch(removeFeeCategory(selectedData._id)).unwrap();
      toasterSuccess("Category deleted successfully");
      loadCategories();
    } catch (err: any) {
      toasterError(err || "Failed to delete category");
    } finally {
      setActionLoading(false);
      setOpenDeleteModal(false);
      setSelectedData(null);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box className="admin-dashboard-content">
      {/* ── Header ── */}
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Fee Categories
        </Typography>
        <Box className="admin-flex-end">
          {/* Search */}
          <Box className="admin-search-main">
            <Box className="admin-search-box">
              <Box className="admin-form-group">
                <TextField
                  value={searchValue}
                  fullWidth
                  id="fee-category-search"
                  className="admin-form-control"
                  placeholder="Search by category name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchValue(e.target.value);
                    debouncedSearch(e.target.value);
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

          {/* Import/Export buttons */}
          <Box
            className="admin-add-user-btn-main"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: "stretch",
              width: "100%",
            }}
          >
            {hasPermission(schoolAdminPermission.fee_category.import) && (
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
            {canAdd && (
              <Button
                className="admin-btn-theme"
                onClick={() => navigate("/fee/categories/add")}
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
                Add Category
              </Button>
            )}
            {hasPermission(schoolAdminPermission.fee_category.export) && categories?.length > 0 && (
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
                    ml: { xs: 0, sm: 1 },
                    width: { xs: "100%", sm: "auto" },
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

      {/* ── Table ── */}
      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer
            component={Paper}
            className="table-container"
            sx={{ boxShadow: "none" }}
          >
            <Table aria-label="fee categories table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th" sx={{ fontWeight: 700 }}>
                    Category Name
                  </TableCell>
                  <TableCell className="table-th" sx={{ fontWeight: 700 }}>
                    Description
                  </TableCell>
                  <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>
                    Mandatory
                  </TableCell>
                  {canStatus && (
                    <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>
                      Status
                    </TableCell>
                  )}
                  {hasAnyPermission([
                    schoolAdminPermission.fee_category.update,
                    schoolAdminPermission.fee_category.delete,
                  ]) && (
                      <TableCell className="table-th" align="right" sx={{ fontWeight: 700 }}>
                        Action
                      </TableCell>
                    )}
                </TableRow>
              </TableHead>

              <TableBody className="table-body">
                {!loading ? (
                  categories.length ? (
                    categories.map((row: any) => (
                      <TableRow
                        key={row._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { bgcolor: "#f9fafb" },
                        }}
                      >
                        {/* Name */}
                        <TableCell className="table-td">
                          <Tooltip title={row.name || ""} arrow placement="top">
                            <Typography className="admin-table-data-text" sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", cursor: "pointer" }}>
                              {row.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="table-td">
                          <Tooltip title={row.description || ""} arrow placement="top">
                            <Typography className="admin-table-data-text" sx={{ fontSize: "13px", color: "#6b7280", cursor: "pointer" }}>
                              {row.description || "-"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* Mandatory badge */}
                        <TableCell className="table-td" align="center">
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1.2,
                              py: 0.3,
                              borderRadius: "20px",
                              backgroundColor: row.isMandatory
                                ? "rgba(76, 175, 80, 0.1)"
                                : "rgba(244, 67, 54, 0.1)",
                              color: row.isMandatory ? "#4caf50" : "#f44336",
                              width: "fit-content",
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: "currentColor",
                              }}
                            />
                            <Typography sx={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                              {row.isMandatory ? "Yes" : "No"}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Status toggle */}
                        {canStatus && (
                          <TableCell className="table-td" align="center">
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.2,
                                  borderRadius: "20px",
                                  backgroundColor: row.isActive
                                    ? "rgba(76, 175, 80, 0.1)"
                                    : "rgba(244, 67, 54, 0.1)",
                                  color: row.isActive ? "#4caf50" : "#f44336",
                                  width: "fit-content",
                                }}
                              >
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "currentColor" }} />
                                <Typography sx={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>
                                  {row.isActive ? "Active" : "Inactive"}
                                </Typography>
                              </Box>
                              <IOSSwitch
                                checked={row.isActive}
                                onChange={() => handleStatusChange(row)}
                              />
                            </Box>
                          </TableCell>
                        )}

                        {/* Actions */}
                        {hasAnyPermission([
                          schoolAdminPermission.fee_category.update,
                          schoolAdminPermission.fee_category.delete,
                        ]) && (
                            <TableCell className="table-td">
                              <Box
                                className="admin-table-data-btn-flex"
                                sx={{ justifyContent: "flex-end" }}
                              >
                                {canEdit && (
                                  <Tooltip title="Edit" arrow placement="bottom">
                                    <Button
                                      className="admin-table-data-btn admin-table-edit-btn"
                                      onClick={() => navigate("/fee/categories/edit", { state: { id: row._id } })}
                                    >
                                      <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                    </Button>
                                  </Tooltip>
                                )}
                                {canDelete && (
                                  <Tooltip title="Delete" arrow placement="bottom">
                                    <Button
                                      className="admin-table-data-btn admin-table-delete-btn"
                                      onClick={() => handleOpenDelete(row)}
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
                    <DataNotFound />
                  )
                ) : (
                  <Loader />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination */}
        <Box className="admin-pagination-main">
          {totalDocs > rowsPerPage && (
            <Pagination
              page={currentPage}
              rowsPerPage={rowsPerPage}
              setPage={setCurrentPage}
              setRowsPerPage={setRowsPerPage}
              count={totalDocs}
            />
          )}
        </Box>
      </Box>



      {/* ── Status Confirm Modal ── */}
      <PopupModal
        type="delete"
        buttonText={selectedData?.isActive ? "Deactivate" : "Activate"}
        module={`Are you sure you want to ${selectedData?.isActive ? "deactivate" : "activate"} this category?`}
        open={openStatusModal}
        handleClose={() => { setOpenStatusModal(false); setSelectedData(null); }}
        handleFunction={handleConfirmStatusChange}
        buttonStatusSpinner={actionLoading}
      />

      {/* ── Delete Confirm Modal ── */}
      <PopupModal
        type="delete"
        buttonText="Delete"
        module="this fee category"
        open={openDeleteModal}
        handleClose={() => { setOpenDeleteModal(false); setSelectedData(null); }}
        handleFunction={handleDeleteCategory}
        buttonStatusSpinner={actionLoading}
      />

      <BulkImportModal
        open={openImportModal}
        onClose={(imported) => {
          setOpenImportModal(false);
          if (imported) loadCategories();
        }}
        title="Import Fee Categories"
        onDownloadTemplate={handleDownloadTemplate}
        onUpload={handleUploadFile}
      />
    </Box>
  );
};

export default FeeCategory;
