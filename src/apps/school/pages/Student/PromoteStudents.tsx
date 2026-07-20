import React, { useEffect, useState } from "react";
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
  FormHelperText,
} from "@mui/material";
import {
  School as SchoolIcon,
  FilterList as FilterIcon,
  CheckCircle as PromoteIcon,
} from "@mui/icons-material";
import { masterService } from "@/api/services/master.service";
import AsyncPaginatedSelect from "@/apps/common/filter/AsyncPaginatedSelect";
import toast from "react-hot-toast";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

export default function PromoteStudents() {
  // Lists
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [_loadingYears, setLoadingYears] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Form selections
  const [fromYearId, setFromYearId] = useState("");
  const [fromClassId, setFromClassId] = useState("");
  const [fromSectionId, setFromSectionId] = useState("");

  const [toYearId, setToYearId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [toSectionId, setToSectionId] = useState("");
  // Full option objects for the two fields shown in the confirmation dialog —
  // needed now that Class/Section are fetched on demand (paginated) instead
  // of kept whole in Redux.
  const [toClassOption, setToClassOption] = useState<any>(null);
  const [toSectionOption, setToSectionOption] = useState<any>(null);

  // Form errors
  const [fromYearError, setFromYearError] = useState("");
  const [fromClassError, setFromClassError] = useState("");
  const [toYearError, setToYearError] = useState("");
  const [toClassError, setToClassError] = useState("");

  // Selected students mapping
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchClassPage = async (page: number, search: string) => {
    const res: any = await masterService.getClasses({ page, perPage: 25, search, type: "filter" });
    return { items: res?.data || [], hasMore: (res?.pagination?.totalPages ?? 0) > page };
  };

  const fetchSectionPage = async (page: number, search: string, classId?: string) => {
    const res: any = await masterService.getSections({ page, perPage: 25, search, classId, type: "filter" });
    return { items: res?.data || [], hasMore: (res?.pagination?.totalPages ?? 0) > page };
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    setLoadingYears(true);
    try {
      const res = await masterService.getAcademicYears();
      if (res.status === 200) {
        const years = res.data || [];
        setAcademicYears(years);
        if (years.length > 0) {
          const current = years.find((y: any) => y.isCurrent) || years[0];
          if (current) {
            setFromYearId(current._id);
            const fromStart = Number(current.startYear || (current.label || "").split("-")[0]);
            const validNextYear = years.find((y: any) => {
              const yStart = Number(y.startYear || (y.label || "").split("-")[0]);
              return yStart > fromStart;
            });
            if (validNextYear) {
              setToYearId(validNextYear._id);
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load academic years");
    } finally {
      setLoadingYears(false);
    }
  };

  const handleFromYearSelect = (selectedId: string) => {
    setFromYearId(selectedId);
    const selectedFrom = academicYears.find((y) => y._id === selectedId);
    const fromStart = selectedFrom ? Number(selectedFrom.startYear || (selectedFrom.label || "").split("-")[0]) : 0;

    const validNextYear = academicYears.find((y) => {
      const yStart = Number(y.startYear || (y.label || "").split("-")[0]);
      return yStart > fromStart;
    });

    if (validNextYear) {
      setToYearId(validNextYear._id);
    } else {
      setToYearId("");
    }
  };

  const handleFetchStudents = async () => {
    let hasError = false;
    if (!fromYearId) {
      setFromYearError("Please select Academic Year");
      hasError = true;
    } else {
      setFromYearError("");
    }

    if (!fromClassId) {
      setFromClassError("Please select Class");
      hasError = true;
    } else {
      setFromClassError("");
    }

    if (hasError) return;

    const selectedYear = academicYears.find((y) => y._id === fromYearId);
    if (!selectedYear) return;

    setLoadingStudents(true);
    setStudents([]);
    setSelectedStudentIds([]);

    try {
      const res = await masterService.getStudents({
        classId: fromClassId,
        sectionId: fromSectionId || undefined,
        academicYearId: fromYearId,
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

    let hasError = false;
    if (!toYearId) {
      setToYearError("Please select target Academic Year");
      hasError = true;
    } else {
      setToYearError("");
    }

    if (!toClassId) {
      setToClassError("Please select target Class");
      hasError = true;
    } else {
      setToClassError("");
    }

    if (hasError) return;

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
                  <FormControl fullWidth size="small" error={Boolean(fromYearError)}>
                    <InputLabel id="from-year-label" sx={labelSx}>Academic Year *</InputLabel>
                    <Select
                      labelId="from-year-label"
                      value={fromYearId}
                      onChange={(e) => {
                        handleFromYearSelect(e.target.value);
                        setFromYearError("");
                      }}
                      label="Academic Year *"
                      error={Boolean(fromYearError)}
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
                    {fromYearError && <FormHelperText sx={{ color: "#d32f2f" }}>{fromYearError}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography sx={labelSx}>Class *</Typography>
                  <AsyncPaginatedSelect
                    fetchPage={fetchClassPage}
                    value={fromClassId}
                    onChange={(val) => { setFromClassId(val); setFromSectionId(""); setFromClassError(""); }}
                    getOptionLabel={(o: any) => o.name || ""}
                    getOptionValue={(o: any) => o._id}
                    placeholder="Select Class"
                  />
                  {fromClassError && <FormHelperText sx={{ color: "#d32f2f", mt: 0.5 }}>{fromClassError}</FormHelperText>}
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography sx={labelSx}>Section</Typography>
                  <AsyncPaginatedSelect
                    key={`from-section-${fromClassId || "none"}`}
                    fetchPage={(page, search) => fetchSectionPage(page, search, fromClassId)}
                    value={fromSectionId}
                    onChange={(val) => setFromSectionId(val)}
                    getOptionLabel={(o: any) => o.code || o.name || ""}
                    getOptionValue={(o: any) => o._id}
                    placeholder="All Sections"
                    disabled={!fromClassId}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={handleFetchStudents}
                disabled={loadingStudents}
                sx={{
                  backgroundColor: "var(--primary-color)",
                  textTransform: "none",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                  minWidth: "150px",
                  height: "38px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": { backgroundColor: "var(--primary-hover)" },
                }}
              >
                {loadingStudents ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FilterIcon sx={{ fontSize: "18px" }} />
                    <span>Fetch Students</span>
                  </Box>
                )}
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
                  <FormControl fullWidth size="small" error={Boolean(toYearError)}>
                    <InputLabel id="to-year-label" sx={labelSx}>Academic Year *</InputLabel>
                    <Select
                      labelId="to-year-label"
                      value={toYearId}
                      onChange={(e) => { setToYearId(e.target.value); setToYearError(""); }}
                      label="Academic Year *"
                      error={Boolean(toYearError)}
                      sx={inputSx}
                    >
                      {academicYears && academicYears.length > 0 ? (
                        academicYears.map((y) => {
                          const selectedFrom = academicYears.find((yr) => yr._id === fromYearId);
                          const fromStart = selectedFrom ? Number(selectedFrom.startYear || (selectedFrom.label || "").split("-")[0]) : 0;
                          const yStart = Number(y.startYear || (y.label || "").split("-")[0]);
                          const isDisabled = fromStart ? yStart <= fromStart : false;

                          return (
                            <MenuItem key={y._id} value={y._id} disabled={isDisabled}>
                              {y.label} {y.isCurrent ? "(Current)" : ""} {isDisabled ? "(Must be future year)" : ""}
                            </MenuItem>
                          );
                        })
                      ) : (
                        <MenuItem disabled value="">
                          No academic years found
                        </MenuItem>
                      )}
                    </Select>
                    {toYearError && <FormHelperText sx={{ color: "#d32f2f" }}>{toYearError}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography sx={labelSx}>Class *</Typography>
                  <AsyncPaginatedSelect
                    fetchPage={fetchClassPage}
                    value={toClassId}
                    onChange={(val) => { setToClassId(val); setToSectionId(""); setToSectionOption(null); setToClassError(""); }}
                    onOptionSelect={(opt) => setToClassOption(opt)}
                    getOptionLabel={(o: any) => o.name || ""}
                    getOptionValue={(o: any) => o._id}
                    placeholder="Select Class"
                  />
                  {toClassError && <FormHelperText sx={{ color: "#d32f2f", mt: 0.5 }}>{toClassError}</FormHelperText>}
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography sx={labelSx}>Section</Typography>
                  <AsyncPaginatedSelect
                    key={`to-section-${toClassId || "none"}`}
                    fetchPage={(page, search) => fetchSectionPage(page, search, toClassId)}
                    value={toSectionId}
                    onChange={(val) => setToSectionId(val)}
                    onOptionSelect={(opt) => setToSectionOption(opt)}
                    getOptionLabel={(o: any) => o.code || o.name || ""}
                    getOptionValue={(o: any) => o._id}
                    placeholder="None / To Assign Later"
                    disabled={!toClassId}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={handlePromoteClick}
                disabled={promoting}
                sx={{
                  backgroundColor: "#12B76A",
                  textTransform: "none",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                  minWidth: "220px",
                  height: "38px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": { backgroundColor: "#0e9153" },
                }}
              >
                {promoting ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PromoteIcon sx={{ fontSize: "18px" }} />
                    <span>Promote Selected Students</span>
                  </Box>
                )}
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
                <strong>Class:</strong> {toClassOption?.name}
              </Typography>
              {toSectionId && (
                <Typography variant="body2">
                  <strong>Section:</strong> {toSectionOption?.code || toSectionOption?.name}
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
