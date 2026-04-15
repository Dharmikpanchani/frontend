import React, { useState } from "react";
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
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import Svg from "@/assets/Svg";
import { useNavigate } from "react-router-dom";

const staticPlans = [
  {
    _id: "1",
    planName: "Basic Plan",
    permissions: "View, Add, Edit",
    price: "₹1,000",
  },
  {
    _id: "2",
    planName: "Premium Plan",
    permissions: "All Permissions",
    price: "₹5,000",
  },
  {
    _id: "3",
    planName: "Standard Plan",
    permissions: "View, Add, Edit, Status",
    price: "₹2,500",
  },
];

export default function PlanDetails() {
  const navigate = useNavigate();
  const [searchNameValue, setSearchNameValue] = useState<string>("");

  return (
    <Box>
      <Box className="admin-user-list-flex admin-page-title-main" sx={{ mb: 3 }}>
        <Typography
          className="admin-page-title"
          component="h2"
          variant="h2"
          sx={{ fontSize: '18px', fontWeight: 700 }}
        >
          Plan Details
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
                  placeholder="Search Plans"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchNameValue(e.target.value);
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
              onClick={() => {
                 navigate("/plan-list/add");
              }}
            >
              <AddIcon
                className="admin-plus-icon"
                sx={{ color: 'var(--button-text, #fff)', fontSize: '18px', mr: 1 }}
              />
              Add Plan
            </Button>
          </Box>
        </Box>
      </Box>

      <Box className="card-border common-card">
        <Box className="brand-table-main page-table-main">
          <TableContainer
            component={Paper}
            className="table-container"
            sx={{ boxShadow: 'none' }}
          >
            <Table aria-label="plan table" className="table">
              <TableHead className="table-head">
                <TableRow className="table-row">
                  <TableCell
                    component="th"
                    className="table-th"
                    width="25%"
                  >
                    Plan Name
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="40%"
                  >
                    Permissions
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="15%"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    component="th"
                    className="table-th"
                    width="20%"
                    align="right"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="table-body">
                {staticPlans.length ? (
                  staticPlans
                    .filter(plan => plan.planName.toLowerCase().includes(searchNameValue.toLowerCase()))
                    .map((data: any) => {
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
                                title={data?.planName}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text">
                                  {data?.planName}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Tooltip
                                title={data?.permissions}
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Typography className="admin-table-data-text">
                                  {data?.permissions}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell
                            component="td"
                            scope="row"
                            className="table-td"
                          >
                            <Box className="admin-table-data-flex">
                              <Typography className="admin-table-data-text">
                                {data?.price}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell component="td" className="table-td">
                            <Box className="admin-table-data-btn-flex" sx={{ justifyContent: 'flex-end' }}>
                              <Tooltip
                                title="View"
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Button 
                                  className="admin-table-data-btn admin-table-view-btn"
                                  onClick={() => navigate(`/plan-list/view/${data._id}`)}
                                >
                                  <img
                                    src={Svg.yellowEye}
                                    className="admin-icon"
                                    alt="View"
                                  />
                                </Button>
                              </Tooltip>

                              <Tooltip
                                title="Edit"
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Button 
                                  className="admin-table-data-btn admin-table-edit-btn"
                                  onClick={() => navigate(`/plan-list/edit/${data._id}`)}
                                >
                                  <img
                                    src={Svg.editIcon}
                                    className="admin-icon"
                                    alt="Edit"
                                  />
                                </Button>
                              </Tooltip>

                              <Tooltip
                                title="Delete"
                                arrow
                                placement="bottom"
                                className="admin-tooltip"
                              >
                                <Button className="admin-table-data-btn admin-table-delete-btn">
                                  <img
                                    src={Svg.trash}
                                    className="admin-icon"
                                    alt="Trash"
                                  />
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                     <TableCell colSpan={4} align="center">No plans found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}
