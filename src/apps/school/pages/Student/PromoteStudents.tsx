import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  School as SchoolIcon,
  FilterList as FilterIcon,
  CheckCircle as PromoteIcon,
} from "@mui/icons-material";
import { masterService } from "@/api/services/master.service";
import toast from "react-hot-toast";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import type { RootState, AppDispatch } from "@/redux/Store";

export default function PromoteStudents() {
  const dispatch = useDispatch<AppDispatch>();

  const { allClasses } = useSelector((state: RootState) => state.ClassReducer);
  const { allSections } = useSelector((state: RootState) => state.SectionReducer);

  // Lists
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Form selections
  const [fromYearId, setFromYearId] = useState("");
  const [fromClassId, setFromClassId] = useState("");
  const [fromSectionId, setFromSectionId] = useState("");

  const [toYearId, setToYearId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [toSectionId, setToSectionId] = useState("");

  // Selected students mapping
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch initial setup
  useEffect(() => {
    dispatch(getClasses({ type: "filter" }));
    dispatch(getSections({ type: "filter" }));
    fetchAcademicYears();
  }, [dispatch]);

  const fetchAcademicYears = async () => {
    setLoadingYears(true);
    try {
      const res = await masterService.getAcademicYears();
      if (res.status === 200) {
        setAcademicYears(res.data || []);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load academic years");
    } finally {
      setLoadingYears(false);
    }
  };

  const handleFetchStudents = async () => {
    if (!fromYearId || !fromClassId) {
      toast.error("Please select both Year and Class to filter students");
      return;
    }

    const selectedYear = academicYears.find((y) => y._id === fromYearId);
    if (!selectedYear) return;

    setLoadingStudents(true);
    setStudents([]);
    setSelectedStudentIds([]);

    try {
      const res = await masterService.getStudents({
        classId: fromClassId,
        sectionId: fromSectionId || undefined,
        startYear: selectedYear.startYear,
        perPage: 500, // Fetch all in one go for promotion select
      });

      if (res.status === 200) {
        setStudents(res.data?.data || []);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map((s) => s._id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePromoteClick = () => {
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student to promote");
      return;
    }
    if (!toYearId || !toClassId) {
      toast.error("Please select target Academic Year and Class");
      return;
    }
    if (fromYearId === toYearId && fromClassId === toClassId && fromSectionId === toSectionId) {
      toast.error("Target class/section and year cannot be identical to source");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPromote = async () => {
    setConfirmOpen(false);
    setPromoting(true);

    try {
      const res = await masterService.promoteStudents({
        studentIds: selectedStudentIds,
        toClassId,
        toSectionId: toSectionId || null,
        fromAcademicYearId: fromYearId,
        toAcademicYearId: toYearId,
      });

      if (res.status === 200) {
        toast.success(res.message || "Students promoted successfully!");
        setStudents([]);
        setSelectedStudentIds([]);
      }
    } catch (err: any) {
      toast.error(err?.message || "Promotion failed");
    } finally {
      setPromoting(false);
    }
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "var(--text-primary)" }}>
            Student Promotion
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mt: 0.5 }}>
            Promote students from one academic year/class to another in bulk.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Source Filters Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%", boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1)" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <FilterIcon sx={{ color: "var(--primary-color)" }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Promote From (Source)
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="from-year-label" sx={labelSx}>Academic Year *</InputLabel>
                    <Select
                      labelId="from-year-label"
                      value={fromYearId}
                      onChange={(e) => setFromYearId(e.target.value)}
                      label="Academic Year *"
                      sx={inputSx}
                    >
                      {academicYears && academicYears.length > 0 ? (
                        academicYears.map((y) => (
                          <MenuItem key={y._id} value={y._id}>
                            {y.label} {y.isCurrent ? "(Current)" : ""}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No academic years found
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="from-class-label" sx={labelSx}>Class *</InputLabel>
                    <Select
                      labelId="from-class-label"
                      value={fromClassId}
                      onChange={(e) => setFromClassId(e.target.value)}
                      label="Class *"
                      sx={inputSx}
                    >
                      {allClasses && allClasses.length > 0 ? (
                        allClasses.map((c) => (
                          <MenuItem key={c._id} value={c._id}>
                            {c.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No classes found
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="from-section-label" sx={labelSx}>Section</InputLabel>
                    <Select
                      labelId="from-section-label"
                      value={fromSectionId}
                      onChange={(e) => setFromSectionId(e.target.value)}
                      label="Section"
                      sx={inputSx}
                    >
                      <MenuItem value="">All Sections</MenuItem>
                      {(allSections || [])
                        .filter((s) => (typeof s.classId === "object" ? s.classId?._id === fromClassId : s.classId === fromClassId))
                        .map((s) => (
                          <MenuItem key={s._id} value={s._id}>
                            {s.code || s.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={handleFetchStudents}
                disabled={loadingStudents || loadingYears}
                startIcon={loadingStudents ? <CircularProgress size={20} color="inherit" /> : <FilterIcon />}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  textTransform: "none",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                  "&:hover": { backgroundColor: "var(--primary-hover)" },
                }}
              >
                Fetch Students
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Target Promotion Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%", boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1)" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon sx={{ color: "var(--primary-color)" }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Promote To (Destination)
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="to-year-label" sx={labelSx}>Academic Year *</InputLabel>
                    <Select
                      labelId="to-year-label"
                      value={toYearId}
                      onChange={(e) => setToYearId(e.target.value)}
                      label="Academic Year *"
                      sx={inputSx}
                    >
                      {academicYears && academicYears.length > 0 ? (
                        academicYears.map((y) => (
                          <MenuItem key={y._id} value={y._id}>
                            {y.label} {y.isCurrent ? "(Current)" : ""}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No academic years found
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="to-class-label" sx={labelSx}>Class *</InputLabel>
                    <Select
                      labelId="to-class-label"
                      value={toClassId}
                      onChange={(e) => setToClassId(e.target.value)}
                      label="Class *"
                      sx={inputSx}
                    >
                      {allClasses && allClasses.length > 0 ? (
                        allClasses.map((c) => (
                          <MenuItem key={c._id} value={c._id}>
                            {c.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No classes found
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="to-section-label" sx={labelSx}>Section</InputLabel>
                    <Select
                      labelId="to-section-label"
                      value={toSectionId}
                      onChange={(e) => setToSectionId(e.target.value)}
                      label="Section"
                      sx={inputSx}
                    >
                      <MenuItem value="">None / To Assign Later</MenuItem>
                      {(allSections || [])
                        .filter((s) => (typeof s.classId === "object" ? s.classId?._id === toClassId : s.classId === toClassId))
                        .map((s) => (
                          <MenuItem key={s._id} value={s._id}>
                            {s.code || s.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={handlePromoteClick}
                disabled={promoting}
                startIcon={promoting ? <CircularProgress size={20} color="inherit" /> : <PromoteIcon />}
                sx={{
                  backgroundColor: "#12B76A",
                  textTransform: "none",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                  "&:hover": { backgroundColor: "#0e9153" },
                }}
              >
                Promote Selected Students
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Student List Section */}
      <Card sx={{ boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1)" }}>
        <CardContent sx={{ p: 0 }}>
          <Box px={3} py={2} borderBottom="1px solid #eaecf0" display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold">
              Student List ({selectedStudentIds.length} of {students.length} selected)
            </Typography>
          </Box>

          {loadingStudents ? (
            <Box py={10} display="flex" justifyContent="center">
              <Loader />
            </Box>
          ) : students.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: "#f9fafb" }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedStudentIds.length > 0 && selectedStudentIds.length < students.length}
                        checked={students.length > 0 && selectedStudentIds.length === students.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Admission No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Roll No</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Current Class/Section</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const isSelected = selectedStudentIds.includes(student._id);
                    return (
                      <TableRow
                        key={student._id}
                        hover
                        selected={isSelected}
                        onClick={() => handleSelectStudent(student._id)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectStudent(student._id)}
                          />
                        </TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell>{student.rollNumber || "—"}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>
                          {student.classId?.name || "—"} {student.sectionId?.code || student.sectionId?.name || ""}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box py={8}>
              <DataNotFound isTable={false} text="No students found. Select filters above and click Fetch Students." />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="promote-dialog-title"
        aria-describedby="promote-dialog-description"
      >
        <DialogTitle id="promote-dialog-title" sx={{ fontWeight: "bold" }}>
          Confirm Student Promotion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="promote-dialog-description">
            You are about to promote **{selectedStudentIds.length}** student(s) to the following:
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f9fafb", borderRadius: 1, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2">
                <strong>Academic Year:</strong> {academicYears.find((y) => y._id === toYearId)?.label}
              </Typography>
              <Typography variant="body2">
                <strong>Class:</strong> {allClasses.find((c) => c._id === toClassId)?.name}
              </Typography>
              {toSectionId && (
                <Typography variant="body2">
                  <strong>Section:</strong> {allSections.find((s) => s._id === toSectionId)?.code || allSections.find((s) => s._id === toSectionId)?.name}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: "var(--text-secondary)" }}>
              This action will mark their current academic year records as **PROMOTED** and create new active enrollment records for the target academic year.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: "none", color: "var(--text-secondary)" }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPromote}
            variant="contained"
            sx={{
              backgroundColor: "#12B76A",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#0e9153" },
            }}
            autoFocus
          >
            Confirm Promotion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
