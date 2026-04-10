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
import { developerPermission } from "@/apps/common/StaticArrayData";
import { getAllRoles, deleteRole } from "@/redux/slices/roleSlice";
import Svg from "@/assets/Svg";
import DataNotFound from "../../component/developerCommon/dataNotFound/DataNotFound";
import Loader from "@/apps/common/loader/Loader";
import Pagination from "@/apps/common/pagination/Pagination";
import PopupModal from "../../component/developerCommon/popUpModal/PopupModal";
import { usePermissions } from "@/hooks/usePermissions";
import type { RootState } from "@/redux/Store";

let initialState = {
  id: "",
  role: "",
  is_active: false,
  is_deleted: false,
};

export default function RoleList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roles, total, loading } = useSelector((state: RootState) => state.RoleReducer);
  const { hasPermission, hasAnyPermission } = usePermissions();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchNameValue, setSearchNameValue] = useState<string>("");
  const [selectedData, setSelectedData] = useState<any>(initialState);
  const [buttonStatusSpinner, setButtonStatusSpinner] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);

  // delete modal
  const handleOpenDelete = (data: any) => {
    setOpenDelete(true);
    setSelectedData(data);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedData(initialState);
  };


  const handleGetData = (searchQuery?: string) => {
    dispatch(getAllRoles({
      page: currentPage + 1,
      perPage: rowsPerPage > 0 ? rowsPerPage : 10,
      search: searchQuery?.trim() ?? searchNameValue.trim(),
    }) as any);
  };

  useEffect(() => { handleGetData(searchNameValue); }, [currentPage, rowsPerPage]);

  const handleDelete = async () => {
    setButtonStatusSpinner(true);
    await dispatch(deleteRole(selectedData._id) as any);
    setButtonStatusSpinner(false);
    handleCloseDelete();
  };

  const debouncedCallGetApi = useCallback(
    debounce((query?: string) => {
      handleGetData(query);
      setCurrentPage(0);
    }, 1000),
    []
  );

  return (
    <Box className="admin-dashboard-content">
      <Box className="admin-user-list-flex admin-page-title-main">
        <Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
        >
          Roles
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
                <img
                  src={Svg.search}
                  className="admin-search-grey-img admin-icon admin-icon-theme"
                  alt="search"
                ></img>
              </Box>
            </Box>
          </Box>
          {hasPermission(developerPermission.role.create) && (
            <Box className="admin-add-user-btn-main">
              <Button
                className="admin-btn-theme"
                onClick={() => {
                  navigate("/role-list/add");
                }}
              >
                <img
                  src={Svg.plus}
                  className="admin-plus-icon"
                  alt="plus"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                Add Roles
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer
            component={Paper}
            className="table-container"
          >
            <Table aria-label="simple table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell
                    component="th"
                    className="table-th"
                    width="20%"
                  >
                    Role Name
                  </TableCell>

                  {hasAnyPermission([developerPermission.role.update, developerPermission.role.delete, developerPermission.role.read]) && (
                    <TableCell
                      component="th"
                      className="table-th"
                      width="5%"
                      align="right"
                    >
                      Action
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {!loading ? (
                  roles?.length ? (
                    roles?.map((data: any) => {
                      return (
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                          key={data._id}
                        >
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Tooltip
                                title={data?.role}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text">
                                  {data?.role}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {hasAnyPermission([developerPermission?.role?.read, developerPermission?.role?.update, developerPermission?.role?.delete]) && (<TableCell component="td" className="table-td">
                            <Box className="admin-table-data-btn-flex">
                              {hasPermission(developerPermission?.role?.read) && (
                                <Tooltip
                                  title="View"
                                  arrow
                                  placement="bottom"
                                  className="admin-tooltip"
                                >
                                  <Button
                                    className="admin-table-data-btn admin-table-view-btn"
                                    onClick={() => {
                                      navigate(`/role-list/view/${data._id}`);
                                    }}
                                  >
                                    <img
                                      src={Svg.yellowEye}
                                      className="admin-icon"
                                      alt="View"
                                    />
                                  </Button>
                                </Tooltip>
                              )}

                              {
                                hasPermission(developerPermission?.role?.update) && (
                                  <Tooltip
                                    title="Edit"
                                    arrow
                                    placement="bottom"
                                    className="admin-tooltip"
                                  >
                                    <Button
                                      className="admin-table-data-btn admin-table-edit-btn"
                                      onClick={() => {
                                        navigate(`/role-list/edit/${data._id}`);
                                      }}
                                    >
                                      <img
                                        src={Svg.editIcon}
                                        className="admin-icon"
                                        alt="Edit"
                                      />
                                    </Button>
                                  </Tooltip>
                                )
                              }

                              {hasPermission(developerPermission.role.delete) && (
                                <Tooltip
                                  title="Delete"
                                  arrow
                                  placement="bottom"
                                  className="admin-tooltip"
                                >
                                  <Button
                                    className="admin-table-data-btn admin-table-delete-btn"
                                    onClick={() => handleOpenDelete(data)}
                                  >
                                    <img
                                      src={Svg.trash}
                                      className="admin-icon"
                                      alt="Trash"
                                    />
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>)}
                        </TableRow>
                      );
                    })
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

      <PopupModal
        type="delete"
        buttonText="Delete"
        module="Roles"
        open={openDelete}
        handleClose={handleCloseDelete}
        handleFunction={handleDelete}
        buttonStatusSpinner={buttonStatusSpinner}
      />
    </Box>
  );
}
