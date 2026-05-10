import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Description as DocumentIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Error as RejectedIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";
import { teacherDocumentService } from "@/api/services/teacherDocument.service";
import { toasterError, toasterSuccess } from "@/utils/toaster/Toaster";

interface DocumentData {
  documentType: string;
  documentUrl: string | null;
  status: "APPROVED" | "PENDING" | "REJECTED";
  rejectReason: string | null;
  version: number;
  uploadedAt: string | null;
  isVirtual?: boolean;
  isNotUploaded?: boolean;
}

export default function TeacherDocuments() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

  const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await teacherDocumentService.getDocuments();
      if (res.status === 200 || res.status === 201) {
        setDocuments(res.data || []);
      } else {
        toasterError(res?.message || "Failed to fetch documents");
      }
    } catch (error: any) {
      toasterError(error?.response?.data?.message || error?.message || "Error fetching documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (documentType: string, file: File | undefined) => {
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [documentType]: file }));
    }
  };

  const handleUpload = async (documentType: string) => {
    const file = selectedFiles[documentType];
    if (!file) {
      toasterError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("documentFile", file);

    try {
      setUploadingType(documentType);
      const res = await teacherDocumentService.reuploadDocument(formData);
      if (res.status === 200 || res.status === 201) {
        toasterSuccess(`${documentType} uploaded successfully`);
        // Remove file from selected list
        setSelectedFiles((prev) => {
          const next = { ...prev };
          delete next[documentType];
          return next;
        });
        // Refresh document list
        fetchDocuments();
      } else {
        toasterError(res?.message || "Upload failed");
      }
    } catch (error: any) {
      toasterError(error?.response?.data?.message || error?.message || "Upload failed");
    } finally {
      setUploadingType(null);
    }
  };

  const getStatusStyles = (status: string, isNotUploaded?: boolean) => {
    if (isNotUploaded) {
      return {
        bg: "rgba(102, 112, 133, 0.08)",
        color: "#667085",
        text: "Not Uploaded",
        icon: <PendingIcon sx={{ fontSize: 16, color: "#667085" }} />
      };
    }
    switch (status) {
      case "APPROVED":
        return {
          bg: "rgba(76, 175, 80, 0.08)",
          color: "#4caf50",
          text: "Approved",
          icon: <ApprovedIcon sx={{ fontSize: 16, color: "#4caf50" }} />
        };
      case "PENDING":
        return {
          bg: "rgba(255, 152, 0, 0.08)",
          color: "#ff9800",
          text: "Pending Verification",
          icon: <PendingIcon sx={{ fontSize: 16, color: "#ff9800" }} />
        };
      case "REJECTED":
        return {
          bg: "rgba(244, 67, 54, 0.08)",
          color: "#f44336",
          text: "Rejected",
          icon: <RejectedIcon sx={{ fontSize: 16, color: "#f44336" }} />
        };
      default:
        return {
          bg: "rgba(102, 112, 133, 0.08)",
          color: "#667085",
          text: "Unknown",
          icon: <PendingIcon sx={{ fontSize: 16, color: "#667085" }} />
        };
    }
  };

  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <CircularProgress size={40} sx={{ color: "var(--primary-color)" }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, pb: 2, borderBottom: "1px solid #F0F2F5" }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#344054",
            fontFamily: "'PlusJakartaSans-Bold', sans-serif",
            mb: 0.5
          }}
        >
          Verification Documents
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: "13px",
            color: "#667085",
            fontFamily: "'PlusJakartaSans-Medium', sans-serif"
          }}
        >
          View your uploaded documents and re-upload/update any document if required.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {documents.map((doc) => {
          const statusStyle = getStatusStyles(doc.status, doc.isNotUploaded);
          const isUploading = uploadingType === doc.documentType;
          const selectedFile = selectedFiles[doc.documentType];

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.documentType}>
              <Box
                sx={{
                  border: "1px solid #E4E7EC",
                  borderRadius: "12px",
                  p: 2.5,
                  backgroundColor: "#FFFFFF",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(16, 24, 40, 0.08)",
                    borderColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.2)"
                  }
                }}
              >
                <Box>
                  {/* Card Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.05)",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <DocumentIcon sx={{ color: "var(--primary-color)", fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#344054",
                            fontFamily: "'PlusJakartaSans-Bold', sans-serif"
                          }}
                        >
                          {doc.documentType}
                        </Typography>
                        {doc.version > 0 && (
                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "#98A2B3",
                              fontFamily: "'PlusJakartaSans-Regular', sans-serif"
                            }}
                          >
                            Version {doc.version}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Status Badge */}
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.2,
                        py: 0.4,
                        borderRadius: "16px",
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.color}`
                      }}
                    >
                      {statusStyle.icon}
                      <Typography sx={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                        {statusStyle.text}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Rejected Callout */}
                  {doc.status === "REJECTED" && doc.rejectReason && (
                    <Box
                      sx={{
                        backgroundColor: "rgba(244, 67, 54, 0.05)",
                        borderLeft: "3px solid #f44336",
                        p: 1.2,
                        borderRadius: "4px",
                        mb: 2
                      }}
                    >
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#f44336", mb: 0.2 }}>
                        Reason for Rejection:
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#667085" }}>
                        {doc.rejectReason}
                      </Typography>
                    </Box>
                  )}

                  {/* File Display */}
                  <Box
                    sx={{
                      border: "1px dashed #E4E7EC",
                      p: 1.2,
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#F9FAFB",
                      mb: 2.5
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedFile ? "var(--primary-color)" : "#667085",
                        fontSize: "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        pr: 1,
                        fontWeight: selectedFile ? 600 : 500
                      }}
                    >
                      {selectedFile ? selectedFile.name : (doc.documentUrl ? "Document Uploaded" : "No file uploaded")}
                    </Typography>

                    {doc.documentUrl && !selectedFile && (
                      <Link
                        onClick={() => {
                          const url = `${imageBaseUrl}/${doc.documentUrl}`;
                          window.open(url, "_blank");
                        }}
                        sx={{
                          color: "#f59e0b",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          textDecoration: "underline",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          "&:hover": { color: "#d97706" }
                        }}
                      >
                        <ViewIcon sx={{ fontSize: 14 }} />
                        View
                      </Link>
                    )}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ mt: "auto", display: "flex", gap: 1.5, width: "100%" }}>
                  {selectedFile ? (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isUploading}
                        onClick={() => {
                          setSelectedFiles((prev) => {
                            const next = { ...prev };
                            delete next[doc.documentType];
                            return next;
                          });
                        }}
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          height: "36px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#667085",
                          borderColor: "#D0D5DD",
                          "&:hover": { borderColor: "#667085", backgroundColor: "transparent" }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={isUploading}
                        onClick={() => handleUpload(doc.documentType)}
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          height: "36px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: "var(--primary-color) !important",
                          color: "#FFFFFF",
                          "&:hover": { opacity: 0.9 }
                        }}
                      >
                        {isUploading ? <CircularProgress size={16} sx={{ color: "#FFFFFF" }} /> : "Upload"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      size="small"
                      sx={{
                        textTransform: "none",
                        height: "36px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--primary-color)",
                        borderColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        "&:hover": {
                          borderColor: "var(--primary-color)",
                          backgroundColor: "rgba(var(--primary-color-rgb, 92, 26, 26), 0.02)"
                        }
                      }}
                    >
                      <UploadIcon sx={{ fontSize: 16 }} />
                      {doc.documentUrl ? "Re-upload Document" : "Choose File"}
                      <input
                        hidden
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleFileChange(doc.documentType, e.target.files?.[0])}
                      />
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
