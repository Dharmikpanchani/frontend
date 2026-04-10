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
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import { getTeachers } from "@/redux/slices/teacherSlice";
import DataNotFound from "@/apps/school/component/schoolCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import type { RootState } from "@/redux/Store";

export default function Teacher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teachers, total, loading } = useSelector((state: RootState) => state.TeacherReducer);
  const { selectedSchool } = useSelector((state: RootState) => state.SchoolReducer);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  const handleGetData = (searchQuery?: string) => {
    if (!selectedSchool?._id) return;
    dispatch(getTeachers({
      schoolId: selectedSchool._id,
      page: currentPage + 1,
      perPage: rowsPerPage > 0 ? rowsPerPage : 10,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
    }) as any);
  };

  useEffect(() => {
    handleGetData(searchNameValue);
  }, [currentPage, rowsPerPage, selectedSchool?._id]);

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    [selectedSchool?._id]
  );

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography className="admin-page-title" component="h2" variant="h2">
          Teachers
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
                  inputProps={{ maxLength: 80 }}
                />
                <SearchIcon
                  className="school-admin-search-grey-img admin-icon"
                  sx={{ color: 'var(--primary-color)', fontSize: '20px' }}
                />
              </Box>
            </Box>
          </Box>
          <Box className="admin-add-user-btn-main">
            <Button
              className="admin-btn-theme"
              onClick={() => navigate("/teacher/add")}
            >
              <AddIcon
                className="admin-plus-icon"
                sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
              />
              Add Teacher
            </Button>
          </Box>
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer component={Paper} className="table-container">
            <Table aria-label="simple table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell component="th" className="table-th" width="25%">
                    Teacher Details
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Department
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Subjects
                  </TableCell>
                  <TableCell component="th" className="table-th" width="20%">
                    Classes
                  </TableCell>
                  <TableCell component="th" className="table-th" width="15%" align="right">
                    Joined At
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  teachers?.length ? (
                    teachers?.map((data: any) => (
                      <TableRow key={data._id}>
                        <TableCell component="td" className="table-td">
                          <Box>
                            <Typography className="admin-table-data-text" sx={{ fontWeight: 600 }}>
                              {data?.name || "N/A"}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>
                              {data?.email || "N/A"}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#6b7280' }}>
                              {data?.phoneNumber || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell component="td" className="table-td">
                          <Typography className="admin-table-data-text">
                            {data?.departmentId?.name || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell component="td" className="table-td">
                          <Tooltip title={data?.subjectIds?.map((s: any) => s.name).join(", ") || "N/A"}>
                            <Typography className="admin-table-data-text" noWrap sx={{ maxWidth: '150px' }}>
                              {data?.subjectIds?.map((s: any) => s.name).join(", ") || "N/A"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell component="td" className="table-td">
                          <Tooltip title={data?.classIds?.map((c: any) => c.name).join(", ") || "N/A"}>
                            <Typography className="admin-table-data-text" noWrap sx={{ maxWidth: '150px' }}>
                              {data?.classIds?.map((c: any) => c.name).join(", ") || "N/A"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell component="td" className="table-td" align="right">
                          <Typography className="admin-table-data-text">
                            {new Date(data?.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
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
    </Box>
  );
}
