import { useRef, useState } from "react";
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
  IconButton,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import { bulkImportValidationSchema } from "@/utils/validation/FormikValidation";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = (resetForm: () => void) => {
    resetForm();
    setErrors([]);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
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
            if (result.success) {
              setSuccessMessage(result.message || "Data imported successfully.");
              resetForm();
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } else {
              setErrors(result.errors || [{ message: result.message || "Upload failed." }]);
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
                p: 3,
                overflowY: "auto",
                maxHeight: "60vh",
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onDownloadTemplate}
                  sx={{
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#344054",
                    borderColor: "#eaecf0",
                    "&:hover": {
                      bgcolor: "#f9fafb",
                      borderColor: "#d0d5dd",
                    },
                  }}
                >
                  Download Template
                </Button>
                <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", lineHeight: 1.6 }}>
                  Please download the template, fill in your data, and upload it below. Supported formats: .xlsx, .csv
                </Typography>
              </Box>

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
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  bgcolor: "#f9fafb",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f3f4f6" },
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
                <CloudUploadIcon sx={{ fontSize: 40, color: "var(--primary-color)", mb: 1 }} />
                {values.file ? (
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {values.file.name}
                  </Typography>
                ) : (
                  <Typography variant="body1">
                    Drag & Drop file here or <strong>Click to Browse</strong>
                  </Typography>
                )}
              </Box>

              {touched.file && formikErrors.file && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: "8px" }}>
                  {formikErrors.file as string}
                </Alert>
              )}

              {successMessage && (
                <Alert severity="success" sx={{ mt: 3, borderRadius: "8px" }}>
                  {successMessage}
                </Alert>
              )}

              {errors.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
                    Upload failed due to validation errors. Please fix them and try again.
                  </Alert>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250, borderRadius: "8px" }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: 80 }}>Row No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Error Message</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{err.row || "-"}</TableCell>
                            <TableCell>{err.message || JSON.stringify(err)}</TableCell>
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
