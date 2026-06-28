import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  DeleteOutline as DeleteIcon,
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import { bulkImportValidationSchema } from "@/utils/validation/FormikValidation";

interface BulkImportModalProps {
  open: boolean;
  onClose: (imported?: boolean) => void;
  title: string;
  onDownloadTemplate: () => void;
  onUpload: (file: File) => Promise<{ success: boolean; message?: string; errors?: any[] }>;
}

export default function BulkImportModal({
  open,
  onClose,
  title,
  onDownloadTemplate,
  onUpload,
}: BulkImportModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasImported, setHasImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setHasImported(false);
    }
  }, [open]);

  const handleClose = (resetForm: () => void) => {
    resetForm();
    setErrors([]);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose(hasImported);
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose(hasImported)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          overflow: "hidden",
        },
      }}
    >
      <Formik
        initialValues={{ file: null as File | null }}
        validationSchema={bulkImportValidationSchema}
        onSubmit={async (values, { resetForm }) => {
          if (!values.file) return;
          setLoading(true);
          setErrors([]);
          setSuccessMessage(null);

          try {
            const result = await onUpload(values.file);
            const isImportSuccess = result.success || !!(result.message && /imported successfully/i.test(result.message));
            if (isImportSuccess) {
              setHasImported(true);
            }
            if (result.success) {
              setSuccessMessage(result.message || "Data imported successfully.");
              resetForm();
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } else {
              setErrors(result.errors || [{ message: result.message || "Upload failed." }]);
              if (result.message) {
                setSuccessMessage(result.message);
              }
            }
          } catch (err: any) {
            setErrors([{ message: err.message || "An unexpected error occurred." }]);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, errors: formikErrors, touched, setFieldValue, handleSubmit, resetForm }) => (
          <Form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "inherit" }}>
            <DialogTitle
              sx={{
                m: 0,
                p: 3,
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--primary-color)",
                borderBottom: "1px solid #f3f4f6",
                bgcolor: "#fafafa",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{title}</span>
              <IconButton
                onClick={() => !loading && handleClose(resetForm)}
                size="small"
                sx={{ color: "#9ca3af" }}
                disabled={loading}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              dividers
              sx={{
                p: 3.5,
                overflowY: "auto",
                maxHeight: "65vh",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                borderColor: "#f3f4f6",
              }}
            >
              {/* Instructions banner */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  p: 2.5,
                  borderRadius: "12px",
                  bgcolor: "rgba(0, 33, 71, 0.03)",
                  border: "1px solid rgba(0, 33, 71, 0.08)",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--primary-color)", mb: 0.5, fontSize: "14px" }}>
                    Import Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475467", lineHeight: 1.5, fontSize: "12.5px" }}>
                    Download our official spreadsheet template, enter the details matching the headers, and upload it here. Supported formats are <strong>.xlsx</strong> and <strong>.csv</strong>.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                  onClick={onDownloadTemplate}
                  sx={{
                    borderRadius: "8px",
                    px: 2.5,
                    py: 1,
                    fontSize: "12.5px",
                    textTransform: "none",
                    fontWeight: 700,
                    color: "var(--primary-color)",
                    borderColor: "var(--primary-color)",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(0, 33, 71, 0.05)",
                      borderColor: "var(--primary-color)",
                    },
                  }}
                >
                  Template
                </Button>
              </Box>

              {/* Template Format Preview Section */}
              {(() => {
                const titleLower = title.toLowerCase();
                let preview = null;
                if (titleLower.includes("teacher")) {
                  preview = {
                    headers: ["Full Name", "Email", "Phone", "Gender", "RoleName"],
                    example: ["John Doe", "john@example.com", "1234567890", "Male", "Teacher"]
                  };
                } else if (titleLower.includes("student")) {
                  preview = {
                    headers: ["Full Name", "Email", "Phone", "Gender", "Class Name", "Section Name", "RoleName"],
                    example: ["Alice Smith", "alice@example.com", "9876543210", "Female", "Class 1", "Section A", "Student"]
                  };
                } else if (titleLower.includes("fee structures") || titleLower.includes("fee structure")) {
                  preview = {
                    headers: ["Fee Category", "Class", "Amount", "Description", "Status"],
                    example: ["Admission Fee", "Class 1", "12000", "Annual admission fee", "Active"]
                  };
                } else if (titleLower.includes("fee categories") || titleLower.includes("fee category")) {
                  preview = {
                    headers: ["Category Name", "Description", "Mandatory", "Status"],
                    example: ["Admission Fee", "Admission and enrollment fee", "Yes", "Active"]
                  };
                } else if (titleLower.includes("subject")) {
                  preview = {
                    headers: ["Subject Name", "Subject Code", "Subject Type", "Class Name", "Status"],
                    example: ["Mathematics", "MATH101", "Theory", "Class 1", "Active"]
                  };
                } else if (titleLower.includes("section")) {
                  preview = {
                    headers: ["Section Name", "Capacity", "Status"],
                    example: ["Section A", "40", "Active"]
                  };
                } else if (titleLower.includes("department")) {
                  preview = {
                    headers: ["Department Name", "Status"],
                    example: ["Science", "Active"]
                  };
                } else if (titleLower.includes("class")) {
                  preview = {
                    headers: ["Class Name", "Status"],
                    example: ["Class 1", "Active"]
                  };
                } else if (titleLower.includes("role")) {
                  preview = {
                    headers: ["Role Name", "Permissions"],
                    example: ["Teacher", "schoolAdminPermission.teacher.read, schoolAdminPermission.teacher.create"]
                  };
                }

                if (!preview) return null;

                return (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "var(--primary-color)",
                        mb: 1,
                        fontSize: "13px",
                      }}
                    >
                      Template Structure Preview (Expected Format)
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid #eaecf0",
                        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                        overflowX: "auto",
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "var(--primary-color)" }}>
                            {preview.headers.map((h, i) => (
                              <TableCell
                                key={i}
                                sx={{
                                  fontWeight: 700,
                                  color: "#ffffff !important",
                                  borderBottom: "1px solid #eaecf0",
                                  fontSize: "11px",
                                  py: 1,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                            {preview.example.map((ex, i) => (
                              <TableCell
                                key={i}
                                sx={{
                                  color: "#475467",
                                  fontSize: "11px",
                                  py: 1.2,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ex}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                );
              })()}

              {/* Upload Drop Zone */}
              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setFieldValue("file", e.dataTransfer.files[0]);
                    setErrors([]);
                    setSuccessMessage(null);
                  }
                }}
                sx={{
                  border: "2px dashed",
                  borderColor: values.file ? "var(--primary-color)" : "#d0d5dd",
                  borderRadius: "12px",
                  p: 4.5,
                  textAlign: "center",
                  bgcolor: values.file ? "rgba(0, 33, 71, 0.02)" : "#f9fafb",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(0, 33, 71, 0.04)",
                    borderColor: "var(--primary-color)",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFieldValue("file", e.target.files[0]);
                      setErrors([]);
                      setSuccessMessage(null);
                    }
                  }}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  style={{ display: "none" }}
                />
                
                {!values.file ? (
                  <Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "#f2f4f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        mb: 2,
                        color: "#475467",
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#344054", fontSize: "14px", mb: 0.5 }}>
                      Drag & Drop file here or <span style={{ color: "var(--primary-color)", textDecoration: "underline" }}>Click to Browse</span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#667085", fontSize: "12px" }}>
                      Excel or CSV files up to 10MB
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      maxWidth: "400px",
                      margin: "0 auto",
                      p: 2,
                      borderRadius: "8px",
                      bgcolor: "#fff",
                      border: "1px solid #e4e7ec",
                      boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering browse click
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "8px",
                        bgcolor: "rgba(0, 33, 71, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-color)",
                      }}
                    >
                      <FileIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: "left", overflow: "hidden" }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#344054", fontSize: "13px" }}>
                        {values.file.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#667085", fontSize: "11px" }}>
                        {(values.file.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <Tooltip title="Remove File" arrow>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setFieldValue("file", null);
                          setErrors([]);
                          setSuccessMessage(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        sx={{
                          color: "#f04438",
                          "&:hover": { bgcolor: "#fef3f2" },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {touched.file && formikErrors.file && (
                <Alert severity="error" icon={<ErrorIcon />} sx={{ borderRadius: "8px", fontSize: "13px" }}>
                  {formikErrors.file as string}
                </Alert>
              )}

              {successMessage && (
                <Alert
                  severity={errors.length > 0 && errors[0]?.row !== undefined ? "warning" : "success"}
                  icon={errors.length > 0 && errors[0]?.row !== undefined ? <ErrorIcon /> : <CheckCircleIcon />}
                  sx={{ borderRadius: "8px", fontSize: "13px" }}
                >
                  <AlertTitle sx={{ fontWeight: 700 }}>
                    {errors.length > 0 && errors[0]?.row !== undefined ? "Import Completed with Warnings" : "Success"}
                  </AlertTitle>
                  {successMessage}
                </Alert>
              )}

              {errors.length > 0 && (
                <Box>
                  <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: "8px", fontSize: "13px" }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>Import Validation Failed</AlertTitle>
                    Upload failed due to validation errors. Please review the details below, fix the file and try again.
                  </Alert>
                  
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                      maxHeight: 250,
                      borderRadius: "12px",
                      border: "1px solid #eaecf0",
                      boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              width: 80,
                              bgcolor: "#f9fafb",
                              color: "#475467",
                              borderBottom: "1px solid #eaecf0",
                              fontSize: "12px",
                              py: 1.5,
                            }}
                          >
                            Row No
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              width: 150,
                              bgcolor: "#f9fafb",
                              color: "#475467",
                              borderBottom: "1px solid #eaecf0",
                              fontSize: "12px",
                              py: 1.5,
                            }}
                          >
                            Name
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              bgcolor: "#f9fafb",
                              color: "#475467",
                              borderBottom: "1px solid #eaecf0",
                              fontSize: "12px",
                              py: 1.5,
                            }}
                          >
                            Error Message
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              width: 180,
                              bgcolor: "#f9fafb",
                              color: "#475467",
                              borderBottom: "1px solid #eaecf0",
                              fontSize: "12px",
                              py: 1.5,
                            }}
                          >
                            Field Value
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errors.map((err, idx) => (
                          <TableRow
                            key={idx}
                            sx={{
                              "&:hover": { bgcolor: "#f9fafb" },
                              "&:last-child td": { borderBottom: 0 },
                            }}
                          >
                            <TableCell sx={{ py: 1.5 }}>
                              <Box
                                sx={{
                                  display: "inline-block",
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: "4px",
                                  bgcolor: "#f2f4f7",
                                  color: "#344054",
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  textAlign: "center",
                                  minWidth: "24px",
                                }}
                              >
                                {err.row || "-"}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, fontSize: "12.5px", fontWeight: 600, color: "#344054" }}>
                              {err.name || "—"}
                            </TableCell>
                            <TableCell sx={{ py: 1.5, color: "#b42318", fontSize: "12.5px", fontWeight: 500 }}>
                              {err.message || JSON.stringify(err)}
                            </TableCell>
                            <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#475467", fontFamily: "monospace", wordBreak: "break-all" }}>
                              {err.value || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                p: 3,
                borderTop: "1px solid #f3f4f6",
                bgcolor: "#fafafa",
                gap: 1.5,
              }}
            >
              <Button
                onClick={() => handleClose(resetForm)}
                disabled={loading}
                sx={{
                  borderRadius: "8px",
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#344054",
                  border: "1px solid #d0d5dd",
                  bgcolor: "#ffffff",
                  "&:hover": {
                    bgcolor: "#f9fafb",
                    borderColor: "#b2b2b2",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="admin-btn-theme"
                disabled={loading}
                sx={{
                  borderRadius: "8px",
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    background: "rgba(0, 33, 71, 0.12) !important",
                    color: "rgba(0, 33, 71, 0.26) !important",
                    boxShadow: "none !important",
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "var(--button-text, #fff)" }} />
                ) : (
                  "Upload & Import"
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
