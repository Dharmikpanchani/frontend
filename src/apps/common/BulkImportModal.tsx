import React, { useRef, useState } from "react";
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
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrors([]);
      setSuccessMessage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setErrors([]);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setErrors([]);
    setSuccessMessage(null);

    try {
      const result = await onUpload(file);
      if (result.success) {
        setSuccessMessage(result.message || "Data imported successfully.");
        setFile(null);
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
  };

  const resetState = () => {
    setFile(null);
    setErrors([]);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}
        <Button onClick={handleClose} sx={{ minWidth: "auto", p: 0.5 }}>
          <CloseIcon />
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownloadTemplate}
            sx={{ textTransform: "none" }}
          >
            Download Template
          </Button>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Please download the template, fill in your data, and upload it below. Supported formats: .xlsx, .csv
          </Typography>
        </Box>

        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
            onChange={handleFileChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: "none" }}
          />
          <CloudUploadIcon sx={{ fontSize: 40, color: "var(--primary-color)", mb: 1 }} />
          {file ? (
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {file.name}
            </Typography>
          ) : (
            <Typography variant="body1">
              Drag & Drop file here or <strong>Click to Browse</strong>
            </Typography>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errors.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Upload failed due to validation errors. Please fix them and try again.
            </Alert>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 250 }}>
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
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!file || loading}
          sx={{
            bgcolor: "var(--primary-color) !important",
            textTransform: "none",
          }}
        >
          {loading ? "Importing..." : "Upload & Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
