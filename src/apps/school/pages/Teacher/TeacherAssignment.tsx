import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  CircularProgress,
  Autocomplete,
  Chip,
  Select,
  MenuItem,
  FormControlLabel,
  FormHelperText,
  debounce,
} from "@mui/material";
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import { teacherAssignmentService } from "../../../../api/services/teacherAssignment.service";
import { getTeachers } from "@/redux/slices/teacherSlice";
import { getClasses } from "@/redux/slices/classSlice";
import { getSections } from "@/redux/slices/sectionSlice";
import { getSubjects } from "@/redux/slices/subjectSlice";
import type { RootState } from "@/redux/Store";
import toast from "react-hot-toast";
import Svg from "@/assets/Svg";
import Loader from "@/apps/common/loader/Loader";
import DataNotFound from "../../component/schoolCommon/dataNotFound/DataNotFound";
import { BpCheckbox } from "@/apps/school/component/schoolCommon/commonCssFunction/cssFunction";
import { inputSx, labelSx } from "@/utils/styles/commonSx";
import Pagination from "@/apps/common/pagination/Pagination";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import { teacherAssignmentValidationSchema, cloneAssignmentsValidationSchema } from "@/utils/validation/FormikValidation";

const getAvailableYears = (): number[] => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const currentYear = month >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const years: number[] = [];
  for (let y = 2020; y <= currentYear; y++) {
    years.push(y);
  }
  return years.reverse();
};

const CustomDropdownIcon = (props: any) => (
  <img
    src={Svg.down}
    style={{ width: "10px", marginRight: "14px", pointerEvents: "none" }}
    className={props.className}
    alt="dropdown"
  />
);

const employmentTypeOptions = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
];

export default function TeacherAssignment() {
  const dispatch = useDispatch();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [historyTeacher, setHistoryTeacher] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [cloneSpinner, setCloneSpinner] = useState(false);
  
  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  // Dialog controls
  const [openEdit, setOpenEdit] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openClone, setOpenClone] = useState(false);

  // Master Data
  const classes = useSelector((state: RootState) => state.ClassReducer.allClasses);
  const sections = useSelector((state: RootState) => state.SectionReducer.allSections);
  const subjects = useSelector((state: RootState) => state.SubjectReducer.allSubjects);
  const { teachers, total, loading: teacherLoading } = useSelector((state: RootState) => state.TeacherReducer);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await teacherAssignmentService.getAssignments();
      // backend returns { status, message, data } — no "success" field
      if (response?.status === 200) {
        setAssignments((response?.data as any[]) || []);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleGetData = useCallback((searchQuery?: string) => {
    const query = searchQuery !== undefined ? searchQuery : searchNameValue;
    dispatch(
      getTeachers({
        page: currentPage + 1,
        perPage: rowsPerPage > 0 ? rowsPerPage : 10,
        search: query?.trim() || undefined,
      }) as any
    );
  }, [dispatch, currentPage, rowsPerPage]);

  const debouncedCallGetApi = useCallback(
    debounce((query: string, page: number, limit: number) => {
      dispatch(
        getTeachers({
          page: page + 1,
          perPage: limit > 0 ? limit : 10,
          search: query.trim() || undefined,
        }) as any
      );
    }, 1000),
    [dispatch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchNameValue(val);
    setCurrentPage(0);
    debouncedCallGetApi(val, 0, rowsPerPage);
  };

  useEffect(() => {
    dispatch(getClasses({ type: "filter" }) as any);
    dispatch(getSections({ type: "filter" }) as any);
    dispatch(getSubjects({ type: "filter" }) as any);
    fetchAssignments();
  }, [dispatch]);

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage, handleGetData]);

  // Filtered teachers list to assign (mapped to their assignments)
  const filteredAssignments = useMemo(() => {
    // Map teachers to their assignment if it exists
    const assignmentMap = new Map(assignments.map(a => [a.teacherId?._id?.toString() || a.teacherId?.toString(), a]));
    
    return (teachers || []).map(t => {
      const assignObj = assignmentMap.get(t._id.toString());
      return {
        teacher: t,
        assignment: assignObj || null
      };
    });
  }, [teachers, assignments]);

  // Form initial values computed dynamically when selectedAssignment changes
  const editInitialValues = useMemo(() => {
    if (!selectedAssignment) {
      return {
        subjects: [],
        assignments: [],
        employmentType: "",
        salaryForYear: "",
        status: "ACTIVE",
        remarks: "",
      };
    }
    const assign = selectedAssignment.assignment;
    if (assign) {
      return {
        subjects: assign.subjects?.map((s: any) => s._id || s) || [],
        assignments: assign.assignments?.map((a: any) => ({
          classId: a.classId?._id || a.classId || "",
          sectionId: a.sectionId?._id || a.sectionId || "",
          isClassTeacher: !!a.isClassTeacher,
        })) || [],
        employmentType: assign.employmentType || "",
        salaryForYear: assign.salaryForYear !== null && assign.salaryForYear !== undefined ? assign.salaryForYear : "",
        status: assign.status || "ACTIVE",
        remarks: assign.remarks || "",
      };
    } else {
      return {
        subjects: [],
        assignments: [],
        employmentType: selectedAssignment.teacher?.employmentType || "",
        salaryForYear: selectedAssignment.teacher?.salary !== null && selectedAssignment.teacher?.salary !== undefined ? selectedAssignment.teacher.salary : "",
        status: "ACTIVE",
        remarks: "",
      };
    }
  }, [selectedAssignment]);

  const handleOpenEdit = (item: any) => {
    setSelectedAssignment(item);
    setOpenEdit(true);
  };

  const handleOpenHistory = async (teacher: any) => {
    setHistoryTeacher(teacher);
    setOpenHistory(true);
    setHistoryLoading(true);
    try {
      const response = await teacherAssignmentService.getHistory(teacher._id);
      // backend returns { status, message, data } — no "success" field
      if (response?.status === 200) {
        setHistoryData((response?.data as any[]) || []);
      }
    } catch (err: any) {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };



  return (
    <Box className="admin-dashboard-content">
      {/* Header with Search and Actions */}
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Teacher Assignments
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
                  onChange={handleSearchChange}
                />
                <SearchIcon
                  className="school-admin-search-grey-img admin-icon"
                  sx={{ color: "var(--primary-color)", fontSize: "20px" }}
                />
              </Box>
            </Box>
          </Box>
          <Box className="admin-add-user-btn-main" sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              className="admin-btn-theme"
              onClick={() => setOpenClone(true)}
              sx={{
                height: "36px !important",
                px: "20px !important",
                fontSize: "12px !important",
                borderRadius: "6px !important",
              }}
            >
              <CopyIcon sx={{ color: "var(--button-text, #fff)", fontSize: "16px !important", mr: 0.5 }} />
              Clone Assignments
            </Button>
            <Button
              className="admin-btn-theme"
              onClick={fetchAssignments}
              sx={{
                height: "36px !important",
                px: "20px !important",
                fontSize: "12px !important",
                borderRadius: "6px !important",
              }}
            >
              <RefreshIcon sx={{ color: "var(--button-text, #fff)", fontSize: "16px !important", mr: 0.5 }} />
              Refresh
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Table Card Wrapper */}
      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container">
            {(loading || teacherLoading) ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                <Loader />
              </Box>
            ) : (
              <Table aria-label="simple table" className="table">
                <TableHead className="table-head">
                  <TableRow className="table-row">
                    <TableCell component="th" className="table-th" width="15%">Teacher Code</TableCell>
                    <TableCell component="th" className="table-th" width="20%">Teacher Name</TableCell>
                    <TableCell component="th" className="table-th" width="25%">Assigned Classes</TableCell>
                    <TableCell component="th" className="table-th" width="20%">Subjects Specialty</TableCell>
                    <TableCell component="th" className="table-th" width="10%">Type / Status</TableCell>
                    <TableCell component="th" className="table-th" width="10%" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="table-body">
                  {filteredAssignments.length === 0 ? (
                    <DataNotFound text="No Assignments Found" colSpan={6} />
                  ) : (
                    filteredAssignments.map((item: any) => {
                      const assign = item.assignment;
                      return (
                        <TableRow
                          key={item.teacher._id}
                          className="table-row"
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.02)",
                            },
                          }}
                        >
                          <TableCell className="table-td" sx={{ fontWeight: 600, color: "#111827" }}>
                            {item.teacher.teacherCode || "—"}
                          </TableCell>
                          <TableCell className="table-td" sx={{ fontWeight: 600, color: "#111827" }}>
                            {item.teacher.fullName}
                          </TableCell>
                          <TableCell className="table-td">
                            {assign && assign.assignments?.length > 0 ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {assign.assignments.map((a: any, idx: number) => (
                                  <Chip
                                    key={idx}
                                    label={`${a.classId?.name || "Class"}${a.sectionId?.code ? ` - ${a.sectionId.code}` : ""}${a.isClassTeacher ? " (CT)" : ""}`}
                                    size="small"
                                    sx={{
                                      height: "22px",
                                      fontSize: "11px",
                                      backgroundColor: a.isClassTeacher ? "rgba(92,26,26,0.1)" : "#f1f5f9",
                                      color: a.isClassTeacher ? "var(--primary-color)" : "#475569",
                                      fontWeight: 500,
                                      borderRadius: "4px",
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                                Not Assigned
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell className="table-td">
                            {assign && assign.subjects?.length > 0 ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {assign.subjects.map((sub: any, idx: number) => (
                                  <Chip
                                    key={idx}
                                    label={sub.name || sub}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      height: "22px",
                                      fontSize: "11px",
                                      color: "var(--primary-color)",
                                      borderColor: "var(--primary-color)",
                                      borderRadius: "4px",
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                                None
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell className="table-td">
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                {assign?.employmentType || item.teacher.employmentType || "Full-time"}
                              </Typography>
                              <Chip
                                label={assign?.status || "ACTIVE"}
                                size="small"
                                sx={{
                                  width: "fit-content",
                                  fontSize: "10px",
                                  backgroundColor: (assign?.status || "ACTIVE") === "ACTIVE" ? "#e8f5e9" : "#ffebee",
                                  color: (assign?.status || "ACTIVE") === "ACTIVE" ? "#2e7d32" : "#c62828",
                                  fontWeight: 600,
                                  height: "20px",
                                  borderRadius: "20px",
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell className="table-td" align="center">
                            <Box className="admin-table-data-btn-flex" sx={{ justifyContent: "center" }}>
                              <Tooltip title="Edit Assignment" arrow placement="bottom" className="admin-tooltip">
                                <Button
                                  className="admin-table-data-btn admin-table-edit-btn"
                                  onClick={() => handleOpenEdit(item)}
                                >
                                  <img src={Svg.editIcon} className="admin-icon" alt="Edit" />
                                </Button>
                              </Tooltip>
                              <Tooltip title="View Timeline / History" arrow placement="bottom" className="admin-tooltip">
                                <Button
                                  className="admin-table-data-btn admin-table-view-btn"
                                  onClick={() => handleOpenHistory(item.teacher)}
                                >
                                  <HistoryIcon sx={{ fontSize: "16px !important", color: "#E09B1F" }} />
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
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

      {/* Edit Assignment Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Assign Classes & Subjects: {selectedAssignment?.teacher.fullName}
          </Typography>
          <IconButton onClick={() => setOpenEdit(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik
          enableReinitialize
          initialValues={editInitialValues}
          validationSchema={teacherAssignmentValidationSchema}
          onSubmit={async (values) => {
            if (!selectedAssignment) return;
            const validRows = values.assignments.filter((r: any) => r.classId);
            setButtonSpinner(true);
            try {
              const response = await teacherAssignmentService.saveAssignment({
                teacherId: selectedAssignment.teacher._id,
                subjects: values.subjects,
                assignments: validRows.map((r: any) => ({
                  classId: r.classId,
                  sectionId: r.sectionId || null,
                  isClassTeacher: r.isClassTeacher
                })),
                employmentType: values.employmentType || null,
                salaryForYear: values.salaryForYear === "" ? null : Number(values.salaryForYear),
                status: values.status,
                remarks: values.remarks || null,
              });

              // Backend ResponseHandler returns { status, message, data } — no "success" field
              const isSuccess = response?.status === 200 || response?.status === 201;
              if (isSuccess) {
                toast.success(response?.message || "Assignment saved successfully");
                setOpenEdit(false);
                fetchAssignments();
              } else {
                toast.error(response?.message || "Failed to save assignment");
              }
            } catch (err: any) {
              toast.error(err?.response?.data?.message || err?.message || "An error occurred");
            } finally {
              setButtonSpinner(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit }) => {
            // Build a set of used class+section combos for duplicate detection
            const usedCombos = (values.assignments || []).map((a: any) =>
              `${a.classId}__${a.sectionId || ""}`
            );
            return (
            <Form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 64px)", overflow: "hidden" }}
            >
              <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  {/* Subjects Selection */}
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={labelSx}>
                        Subjects Specialty
                      </Typography>
                      <Tooltip title="Refresh Subjects" arrow>
                        <IconButton
                          onClick={() =>
                            dispatch(getSubjects({ type: "filter" }) as any)
                          }
                          size="small"
                          sx={{
                            mb: 0.5,
                            color: "var(--primary-color)",
                            "&:hover": {
                              backgroundColor:
                                "rgba(var(--primary-color-rgb, 92, 26, 26), 0.1)",
                            },
                          }}
                        >
                          <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Autocomplete
                      multiple
                      options={subjects || []}
                      getOptionLabel={(o) => o.name || ""}
                      value={subjects?.filter(s => (values.subjects || []).includes(s._id)) || []}
                      onChange={(_, val) => setFieldValue("subjects", val.map(v => v._id))}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                      slotProps={{
                        popper: {
                          sx: {
                            zIndex: "999999 !important",
                          }
                        }
                      }}
                      popupIcon={
                        <img
                          src={Svg.down}
                          style={{ width: "10px" }}
                          alt="dropdown"
                        />
                      }
                      clearIcon={null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select subjects..."
                          variant="outlined"
                          sx={inputSx}
                          error={touched.subjects && Boolean(errors.subjects)}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          paddingTop: "0 !important",
                          paddingBottom: "0 !important",
                          paddingLeft: "0 !important",
                          paddingRight: "30px !important",
                          height: "auto",
                          minHeight: "40px",
                          "& .MuiAutocomplete-input": {
                            padding: "0 10px !important",
                            height: "40px",
                            fontFamily: "'Poppins', sans-serif !important",
                            fontSize: "14px !important",
                          },
                        },
                      }}
                    />
                    <FormHelperText className="error-text">
                      {touched.subjects && errors.subjects && typeof errors.subjects === "string"
                        ? errors.subjects
                        : ""}
                    </FormHelperText>
                  </Grid>

                  {/* Class-Section allocations list */}
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography sx={labelSx}>
                        Class & Section Allocations
                      </Typography>
                      <Button
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() => {
                          setFieldValue("assignments", [
                            ...values.assignments,
                            { classId: "", sectionId: "", isClassTeacher: false }
                          ]);
                        }}
                      >
                        Add Allocation
                      </Button>
                    </Box>

                    {values.assignments.length === 0 ? (
                      <>
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic", my: 2 }}>
                          No allocations added yet. Click "Add Allocation" to assign a class and section.
                        </Typography>
                        {touched.assignments && errors.assignments && typeof errors.assignments === "string" && (
                          <FormHelperText className="error-text" sx={{ mt: -1 }}>
                            {errors.assignments}
                          </FormHelperText>
                        )}
                      </>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                        {values.assignments.map((row: any, idx: number) => (
                          <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 1.5,
                                alignItems: { xs: "stretch", sm: "center" },
                                p: { xs: 1.5, sm: 0 },
                                border: { xs: "1px solid #e2e8f0", sm: "none" },
                                borderRadius: { xs: "6px", sm: 0 },
                                mb: { xs: 1, sm: 0 },
                              }}
                              className="admin-table-data-btn-flex"
                            >
                              {/* Sub-row for Dropdowns */}
                              <Box sx={{ display: "flex", gap: 1.5, flex: 1 }}>
                                 <Select
                                  size="small"
                                  value={row.classId}
                                  onChange={(e) => {
                                    const updated = [...values.assignments];
                                    // Reset section when class changes to avoid stale duplicates
                                    updated[idx] = { ...updated[idx], classId: e.target.value, sectionId: "" };
                                    setFieldValue("assignments", updated);
                                  }}
                                  displayEmpty
                                  sx={{ ...inputSx, flex: 1 }}
                                  error={Boolean((touched.assignments as any)?.[idx]) && Boolean((errors.assignments as any)?.[idx]?.classId)}
                                  IconComponent={CustomDropdownIcon}
                                  renderValue={(selected) => {
                                    if (selected === "" || !selected) {
                                      return <span style={{ color: "#aaa" }}>Select Class</span>;
                                    }
                                    const cls = classes?.find((c) => c._id === selected);
                                    return cls ? (cls.name as string) : (selected as string);
                                  }}
                                >
                                  {classes?.map((c) => {
                                    // Disable if every section of this class is already used (all combos taken)
                                    const classUsed = usedCombos.filter((_: string, i: number) => i !== idx).some(
                                      (combo: string) => combo === `${c._id}__`
                                    ) && !sections?.some(
                                      (s) => !usedCombos.filter((_: string, i: number) => i !== idx).includes(`${c._id}__${s._id}`)
                                    );
                                    return (
                                      <MenuItem key={c._id} value={c._id} disabled={classUsed}>
                                        {c.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>

                                {/* Section Dropdown */}
                                 <Select
                                  size="small"
                                  value={row.sectionId}
                                  onChange={(e) => {
                                    const updated = [...values.assignments];
                                    updated[idx] = { ...updated[idx], sectionId: e.target.value };
                                    setFieldValue("assignments", updated);
                                  }}
                                  displayEmpty
                                  sx={{ ...inputSx, flex: 1 }}
                                  IconComponent={CustomDropdownIcon}
                                  renderValue={(selected) => {
                                    if (selected === "" || !selected) {
                                      return <span style={{ color: "#aaa" }}>Select Section</span>;
                                    }
                                    const sec = sections?.find((s) => s._id === selected);
                                    return sec ? (sec.code as string) : (selected as string);
                                  }}
                                >
                                  {sections?.map((s) => {
                                    // Disable if this class+section combo is already used in another row
                                    const alreadyUsed = usedCombos
                                      .filter((_: string, i: number) => i !== idx)
                                      .includes(`${row.classId}__${s._id}`);
                                    return (
                                      <MenuItem
                                        key={s._id}
                                        value={s._id}
                                        disabled={alreadyUsed}
                                        sx={alreadyUsed ? { opacity: 0.4, fontStyle: "italic" } : {}}
                                      >
                                        {s.code}{alreadyUsed ? " (already used)" : ""}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </Box>

                              {/* Sub-row for Checkbox and Actions */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 1.5,
                                  mt: { xs: 0.5, sm: 0 },
                                }}
                              >
                                {/* Class Teacher Checkbox */}
                                <FormControlLabel
                                  control={
                                    <BpCheckbox
                                      checked={row.isClassTeacher}
                                      onChange={(e) => {
                                        const updated = [...values.assignments];
                                        updated[idx] = { ...updated[idx], isClassTeacher: e.target.checked };
                                        setFieldValue("assignments", updated);
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography
                                      sx={{
                                        fontFamily: "'Poppins', sans-serif !important",
                                        fontSize: "14px !important",
                                        fontWeight: "500 !important",
                                        color: "#334155",
                                      }}
                                    >
                                      Class Teacher
                                    </Typography>
                                  }
                                  sx={{ mr: 0 }}
                                />

                                {/* Remove Button */}
                                <Tooltip title="Remove Allocation" arrow>
                                  <Button
                                    className="admin-table-data-btn admin-table-delete-btn"
                                    onClick={() => {
                                      setFieldValue("assignments", values.assignments.filter((_: any, i: number) => i !== idx));
                                    }}
                                  >
                                    <img
                                      src={Svg.trash}
                                      className="admin-icon"
                                      alt="Remove"
                                    />
                                  </Button>
                                </Tooltip>
                              </Box>
                            </Box>
                            {Boolean((touched.assignments as any)?.[idx]) && Boolean((errors.assignments as any)?.[idx]?.classId) && (
                              <FormHelperText className="error-text" sx={{ ml: 1 }}>
                                {String((errors.assignments as any)[idx].classId)}
                              </FormHelperText>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>

                  {/* Employment and Salary details */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>
                      Employment Type
                    </Typography>
                    <Autocomplete
                      options={employmentTypeOptions}
                      getOptionLabel={(o) => o.label || ""}
                      value={
                        employmentTypeOptions.find(
                          (o) => o.value === values.employmentType
                        ) || null
                      }
                      onChange={(_, v) =>
                        setFieldValue("employmentType", v?.value || "")
                      }
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      slotProps={{
                        popper: {
                          sx: {
                            zIndex: "999999 !important",
                          }
                        }
                      }}
                      popupIcon={
                        <img
                          src={Svg.down}
                          style={{ width: "10px" }}
                          alt="dropdown"
                        />
                      }
                      clearIcon={null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Employment Type"
                          variant="outlined"
                          sx={inputSx}
                          error={touched.employmentType && Boolean(errors.employmentType)}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          paddingTop: "0 !important",
                          paddingBottom: "0 !important",
                          paddingLeft: "0 !important",
                          paddingRight: "30px !important",
                          height: "auto",
                          minHeight: "40px",
                          "& .MuiAutocomplete-input": {
                            padding: "0 10px !important",
                            height: "40px",
                            fontFamily: "'Poppins', sans-serif !important",
                            fontSize: "14px !important",
                          },
                        },
                      }}
                    />
                    <FormHelperText className="error-text">
                      {touched.employmentType && errors.employmentType ? (errors.employmentType as string) : ""}
                    </FormHelperText>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>
                      Salary (This Year)
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      name="salaryForYear"
                      placeholder="Enter annual/monthly salary..."
                      value={values.salaryForYear}
                      onChange={(e) => setFieldValue("salaryForYear", e.target.value === "" ? "" : Number(e.target.value))}
                      sx={inputSx}
                      error={touched.salaryForYear && Boolean(errors.salaryForYear)}
                    />
                    <FormHelperText className="error-text">
                      {touched.salaryForYear && errors.salaryForYear ? (errors.salaryForYear as string) : ""}
                    </FormHelperText>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={labelSx}>
                      Assignment Status
                    </Typography>
                    <Select
                      size="small"
                      fullWidth
                      name="status"
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      sx={inputSx}
                      error={touched.status && Boolean(errors.status)}
                      IconComponent={CustomDropdownIcon}
                    >
                      <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                      <MenuItem value="ON_LEAVE">ON LEAVE</MenuItem>
                      <MenuItem value="RESIGNED">RESIGNED</MenuItem>
                      <MenuItem value="TRANSFERRED">TRANSFERRED</MenuItem>
                    </Select>
                    <FormHelperText className="error-text">
                      {touched.status && errors.status ? (errors.status as string) : ""}
                    </FormHelperText>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography sx={labelSx}>
                      Remarks
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="remarks"
                      placeholder="Any specific assignment notes..."
                      value={values.remarks}
                      onChange={(e) => setFieldValue("remarks", e.target.value)}
                      sx={{
                        ...inputSx,
                        height: "auto",
                        "& .MuiOutlinedInput-root, & .MuiInputBase-root": {
                          height: "auto",
                        }
                      }}
                      error={touched.remarks && Boolean(errors.remarks)}
                    />
                    <FormHelperText className="error-text">
                      {touched.remarks && errors.remarks ? (errors.remarks as string) : ""}
                    </FormHelperText>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
                <Button
                  className="admin-btn-secondary"
                  onClick={() => setOpenEdit(false)}
                  variant="outlined"
                  disabled={buttonSpinner}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="admin-btn-theme"
                  disabled={buttonSpinner}
                  sx={{ textTransform: "none", minWidth: 140 }}
                >
                  {buttonSpinner ? <Spinner /> : "Save Assignment"}
                </Button>
              </DialogActions>
            </Form>
          );}}
        </Formik>
      </Dialog>

      {/* History timeline Dialog */}
      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Career Assignment History: {historyTeacher?.fullName}
          </Typography>
          <IconButton onClick={() => setOpenHistory(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {historyLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "var(--primary-color)" }} />
            </Box>
          ) : historyData.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "#94a3b8" }}>
              No historical assignments found for this teacher.
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
              {historyData.map((item, idx) => (
                <Box key={item._id} sx={{ display: "flex", gap: 2, position: "relative" }}>
                  {idx !== historyData.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 15,
                        top: 30,
                        bottom: -30,
                        width: 2,
                        backgroundColor: "#cbd5e1",
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-color)",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: 600,
                      fontSize: 12,
                      zIndex: 1,
                    }}
                  >
                    H
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                      Academic Year: {item.academicYearId?.label || "Unknown"}
                    </Typography>
                    <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        <strong>Classes:</strong>{" "}
                        {item.assignments?.map((a: any) => `${a.classId?.name || "Class"}${a.sectionId?.code ? ` - ${a.sectionId.code}` : ""}`).join(", ") || "None"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        <strong>Subjects:</strong> {item.subjects?.map((s: any) => s.name).join(", ") || "None"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        <strong>Status:</strong> {item.status} {item.remarks ? `(${item.remarks})` : ""}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
          <Button
            className="admin-btn-secondary"
            onClick={() => setOpenHistory(false)}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Assignments Dialog */}
      <Dialog
        open={openClone}
        onClose={() => setOpenClone(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "10px",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Clone Assignments
          </Typography>
          <IconButton onClick={() => setOpenClone(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Formik
          initialValues={{ fromYearId: "" }}
          validationSchema={cloneAssignmentsValidationSchema}
          onSubmit={async (values) => {
            setCloneSpinner(true);
            try {
              const response = await teacherAssignmentService.cloneAssignments(values.fromYearId);
              // backend returns { status, message, data } — no "success" field
              const isSuccess = response?.status === 200 || response?.status === 201;
              if (isSuccess) {
                toast.success(response?.message || "Assignments cloned successfully");
                setOpenClone(false);
                fetchAssignments();
              } else {
                toast.error(response?.message || "Clone failed");
              }
            } catch (err: any) {
              toast.error(err?.response?.data?.message || err?.message || "Clone failed");
            } finally {
              setCloneSpinner(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit }) => (
            <Form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 64px)", overflow: "hidden" }}>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                    Copy all teacher class & subject assignments from a prior academic year to the active current year. This will only clone for teachers who do not already have assignments in the current year.
                  </Typography>
                  <Typography sx={labelSx}>
                    Source Academic Year
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    name="fromYearId"
                    value={values.fromYearId}
                    onChange={(e) => setFieldValue("fromYearId", e.target.value)}
                    displayEmpty
                    sx={inputSx}
                    error={touched.fromYearId && Boolean(errors.fromYearId)}
                    IconComponent={CustomDropdownIcon}
                    renderValue={(selected) => {
                      if (selected === "" || selected === undefined) {
                        return (
                          <span style={{ color: "#aaa" }}>
                            Select Source Year
                          </span>
                        );
                      }
                      return selected as string;
                    }}
                  >
                    {getAvailableYears().map((y) => {
                      const yearLabel = `${y}-${y + 1}`;
                      return (
                        <MenuItem key={y} value={yearLabel}>
                          {yearLabel}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText className="error-text">
                    {touched.fromYearId && errors.fromYearId ? (errors.fromYearId as string) : ""}
                  </FormHelperText>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0" }}>
                <Button
                  className="admin-btn-secondary"
                  onClick={() => setOpenClone(false)}
                  variant="outlined"
                  disabled={cloneSpinner}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="admin-btn-theme"
                  disabled={cloneSpinner}
                  sx={{ textTransform: "none", minWidth: 130 }}
                >
                  {cloneSpinner ? <Spinner /> : "Clone Now"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}
