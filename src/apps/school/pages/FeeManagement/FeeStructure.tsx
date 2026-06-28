import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Tooltip,
  CircularProgress, Menu, MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FileDownload as ExcelIcon,
} from "@mui/icons-material";
import {
  fetchFeeStructures, removeFeeStructure, fetchFeeCategories,
} from "@/redux/slices/feeSlice";
import { getClasses } from "@/redux/slices/classSlice";
import type { RootState, AppDispatch } from "@/redux/Store";
import { toasterSuccess, toasterError } from "@/utils/toaster/Toaster";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import Pagination from "@/apps/common/pagination/Pagination";
import Loader from "@/apps/common/loader/Loader";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import { IOSSwitch } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import Svg from "@/assets/Svg";
import BulkImportModal from "@/apps/common/BulkImportModal";

const FeeStructure = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const { structures, loading } = useSelector((state: RootState) => state.FeeReducer);

  const canView = hasPermission(schoolAdminPermission.fee_structure.read);
  const canAdd = hasPermission(schoolAdminPermission.fee_structure.create);
  const canEdit = hasPermission(schoolAdminPermission.fee_structure.update);
  const canDelete = hasPermission(schoolAdminPermission.fee_structure.delete);
  const canStatus = hasPermission(schoolAdminPermission.fee_structure.status);

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);

  const [openImportModal, setOpenImportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExport = async (format: "excel" | "pdf" | "html" = "excel") => {
    try {
      setExporting(true);
      const { exportFeeStructures } = await import("@/api/services/fee.service");
      const response = await exportFeeStructures({
        format,
      });
      
      const blob = new Blob([response.data], {
        type: format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `fee_structures_report_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toasterSuccess("Fee structures exported successfully");
    } catch (error: any) {
      toasterError(error.message || "Failed to export fee structures");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Fee Category,Class,Amount,Description,Status\nAdmission Fee,Class 1,12000,Annual admission fee,Active\nTuition Fee,Class 1,5000,Tuition fee,Active";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Fee_Structure_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUploadFile = async (file: File) => {
    try {
      const { importFeeStructures } = await import("@/api/services/fee.service");
      const response = await importFeeStructures(file);
      loadStructures();
      if (response?.data?.data && response.data.data.failCount > 0) {
        return {
          success: false,
          message: `${response.data.data.successCount} Fee structures imported successfully, ${response.data.data.failCount} failed.`,
          errors: response.data.data.failures,
        };
      }
      return { success: true, message: response?.data?.message || "Fee structures imported successfully." };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to import fee structures";
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

  useEffect(() => {
    loadStructures();
    dispatch(fetchFeeCategories({ page: 1, limit: 100 }) as any);
    dispatch(getClasses({ type: "filter" }) as any);
  }, [page, rowsPerPage]);

  const loadStructures = async () => {
    try {
      const res: any = await dispatch(fetchFeeStructures({ page: page + 1, limit: rowsPerPage })).unwrap();
      if (res?.data) setTotalDocs(res.data.totalDocs || res.data.length || 0);
    } catch (err) {}
  };



  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this structure?")) {
      try {
        await dispatch(removeFeeStructure(id)).unwrap();
        toasterSuccess("Structure deleted successfully"); loadStructures();
      } catch (err: any) { toasterError(err || "Failed to delete structure"); }
    }
  };

  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      const { changeFeeStructureStatus } = await import("@/api/services/fee.service");
      await changeFeeStructureStatus(id, { isActive: !currentStatus });
      toasterSuccess("Status updated successfully"); loadStructures();
    } catch (err: any) { toasterError(err?.response?.data?.message || "Failed to update status"); }
  };

  const getTotalAmount = (structure: any) =>
    structure.installments?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Fee Structures
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box className="admin-add-user-btn-main" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {hasPermission(schoolAdminPermission.fee_structure.import) && (
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
                onClick={() => navigate("/fee/structures/add")}
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
                Create Structure
              </Button>
            )}
            {hasPermission(schoolAdminPermission.fee_structure.export) && structures?.length > 0 && (
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
            <Table aria-label="fee structures table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell className="table-th">Class</TableCell>
                  <TableCell className="table-th">Fee Category</TableCell>
                  <TableCell className="table-th">Total Amount</TableCell>
                  <TableCell className="table-th">Installments</TableCell>
                  {canStatus && <TableCell className="table-th">Status</TableCell>}
                  {hasAnyPermission([
                    schoolAdminPermission.fee_structure.read,
                    schoolAdminPermission.fee_structure.update,
                    schoolAdminPermission.fee_structure.delete,
                  ]) && (
                    <TableCell align="right" className="table-th">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {loading && structures.length === 0 ? (
                  <Loader colSpan={canStatus ? 5 : 4} />
                ) : structures.length === 0 ? (
                  <DataNotFound text="No fee structures found." colSpan={canStatus ? 5 : 4} />
                ) : (
                  structures.map((row: any) => (
                    <TableRow
                      key={row._id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                      }}
                    >
                      <TableCell className="table-td" sx={{ color: "#101828", fontWeight: 500 }}>
                        <Tooltip title={row.classId?.name || "N/A"} arrow placement="top">
                          <Typography className="admin-table-data-text" sx={{ color: "#101828", fontWeight: 500, cursor: "pointer" }}>
                            {row.classId?.name || "N/A"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="table-td" sx={{ color: "#475467" }}>
                        <Tooltip title={row.feeCategoryId?.name || "N/A"} arrow placement="top">
                          <Typography className="admin-table-data-text" sx={{ color: "#475467", cursor: "pointer" }}>
                            {row.feeCategoryId?.name || "N/A"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="table-td" sx={{ color: "#027A48", fontWeight: 600 }}>
                        ₹{getTotalAmount(row).toLocaleString()}
                      </TableCell>
                      <TableCell className="table-td">
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {row.installments?.slice(0, 2).map((inst: any, idx: number) => (
                            <Box
                              key={idx}
                              sx={{
                                fontSize: "11px",
                                p: 0.5,
                                border: "1px solid #eaecf0",
                                borderRadius: "4px",
                                backgroundColor: "#F9FAFB",
                              }}
                            >
                              {inst.label}: ₹{inst.amount}
                            </Box>
                          ))}
                          {row.installments && row.installments.length > 2 && (
                            <Tooltip
                              title={row.installments
                                .slice(2)
                                .map((inst: any) => `${inst.label}: ₹${inst.amount}`)
                                .join(", ")}
                              arrow
                              placement="top"
                            >
                              <Box
                                sx={{
                                  fontSize: "11px",
                                  p: 0.5,
                                  border: "1px solid #eaecf0",
                                  borderRadius: "4px",
                                  backgroundColor: "#F9FAFB",
                                  color: "#6b7280",
                                  fontWeight: 500,
                                  cursor: "pointer",
                                }}
                              >
                                +{row.installments.length - 2} more
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      {canStatus && (
                        <TableCell className="table-td">
                          <IOSSwitch
                            checked={row.isActive}
                            onChange={() => handleStatusChange(row._id, row.isActive)}
                          />
                        </TableCell>
                      )}
                      {hasAnyPermission([
                        schoolAdminPermission.fee_structure.read,
                        schoolAdminPermission.fee_structure.update,
                        schoolAdminPermission.fee_structure.delete,
                      ]) && (
                        <TableCell className="table-td" align="right">
                          <Box className="admin-table-data-btn-flex" sx={{ justifyContent: "flex-end", gap: 0.5 }}>
                            {canView && (
                              <Tooltip title="View" arrow placement="bottom" className="admin-tooltip">
                                <Button
                                  className="admin-table-data-btn admin-table-view-btn"
                                  onClick={() => navigate("/fee/structures/view", { state: { id: row._id } })}
                                >
                                  <img src={Svg.yellowEye} className="admin-icon" alt="View" />
                                </Button>
                              </Tooltip>
                            )}
                            {canEdit && (
                              <Tooltip title="Edit" arrow placement="bottom">
                                <Button
                                  className="admin-table-data-btn admin-table-edit-btn"
                                  onClick={() => navigate("/fee/structures/edit", { state: { id: row._id } })}
                                >
                                  <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                </Button>
                              </Tooltip>
                            )}
                            {canDelete && (
                              <Tooltip title="Delete" arrow placement="bottom">
                                <Button
                                  className="admin-table-data-btn admin-table-delete-btn"
                                  onClick={() => handleDelete(row._id)}
                                >
                                  <img src={Svg.trash} className="admin-icon" alt="Trash" />
                                </Button>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className="admin-pagination-main">
          {totalDocs ? (
            <Pagination
              count={totalDocs}
              page={page}
              rowsPerPage={rowsPerPage}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          ) : null}
        </Box>
      </Box>


      <BulkImportModal
        open={openImportModal}
        onClose={(imported) => {
          setOpenImportModal(false);
          if (imported) loadStructures();
        }}
        title="Import Fee Structures"
        onDownloadTemplate={handleDownloadTemplate}
        onUpload={handleUploadFile}
      />
    </Box>
  );
};

export default FeeStructure;
