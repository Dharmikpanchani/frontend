import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Autocomplete,
  TextField,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import { Formik, Form } from "formik";
import Svg from "@/assets/Svg";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

export interface FilterField {
  type: "select" | "searchbaseSelect" | "date" | "inputSelect" | "dateRange";
  name: string;
  label: string;
  placeholder?: string;
  options?: any[];
  getOptionLabel?: (option: any) => string;
}

interface FilterProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FilterField[];
  handleApply: (values: any) => void;
  handleReset: () => void;
  initialValues: any;
}

const labelSx = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  marginBottom: "4px",
  color: "#374151",
  fontFamily: "'Poppins', sans-serif !important",
};

const inputSx = {
  "&.MuiFormControl-root, & .MuiOutlinedInput-root, & .MuiInputBase-root": {
    height: "40px",
    backgroundColor: "var(--input-bg) !important",
    borderRadius: "5px !important",
    "& fieldset": {
      borderColor: "var(--main-border) !important",
    },
    "&:hover fieldset": {
      borderColor: "var(--main-border) !important",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--selected-color) !important",
      borderWidth: "1px !important",
    },
  },
  "& .MuiOutlinedInput-input": {
    fontSize: "12px !important",
    height: "40px",
    display: "flex",
    alignItems: "center",
    fontFamily: "'PlusJakartaSans-Medium', sans-serif !important",
    color: "var(--secondary-color) !important",
    backgroundColor: "transparent !important",
  },
};

const Filter: React.FC<FilterProps> = ({
  open,
  onClose,
  title,
  fields,
  handleApply,
  handleReset,
  initialValues,
}) => {
  const [openSelectors, setOpenSelectors] = useState<any>({});

  const toggleSelector = (name: string, open: boolean) => {
    setOpenSelectors((prev: any) => ({ ...prev, [name]: open }));
  };

  const renderField = (field: FilterField, setFieldValue: any, values: any) => {
    switch (field.type) {
      case "select":
        return (
          <Box key={field.name}>
            <Typography sx={labelSx}>{field.label}</Typography>
            <FormControl fullWidth sx={inputSx}>
              <Select
                value={values[field.name] || ""}
                onChange={(e) => setFieldValue(field.name, e.target.value)}
                displayEmpty
                renderValue={(selected: any) => {
                  if (selected === "" || selected === undefined) {
                    return <span style={{ color: "#aaa" }}>{field.placeholder || "Select"}</span>;
                  }
                  const option = field.options?.find(opt => opt.value === selected);
                  return option ? option.label : selected;
                }}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case "searchbaseSelect":
        return (
          <Box key={field.name}>
            <Typography sx={labelSx}>{field.label}</Typography>
            <Autocomplete
              options={field.options || []}
              getOptionLabel={field.getOptionLabel || ((option: any) => option.label || option)}
              value={
                field.options?.find((opt: any) => {
                  if (typeof opt === 'object' && opt !== null) {
                    return (opt._id || opt.value) === values[field.name];
                  }
                  return opt === values[field.name];
                }) || null
              }
              onChange={(_, newValue) => {
                if (typeof newValue === 'object' && newValue !== null) {
                  setFieldValue(field.name, newValue._id !== undefined ? newValue._id : newValue.value !== undefined ? newValue.value : "");
                } else {
                  setFieldValue(field.name, newValue !== undefined ? newValue : "");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={field.placeholder || "Select"}
                  sx={inputSx}
                />
              )}
            />
          </Box>
        );
      case "date":
        return (
          <Box key={field.name}>
            <Typography sx={labelSx}>{field.label}</Typography>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                value={values[field.name] ? moment(values[field.name]) : null}
                onChange={(date) =>
                  setFieldValue(field.name, date ? date.toISOString() : "")
                }
                open={!!openSelectors[field.name]}
                onOpen={() => toggleSelector(field.name, true)}
                onClose={() => toggleSelector(field.name, false)}
                slots={{ openPickerIcon: () => null }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: field.placeholder || "Select Date",
                    variant: "outlined",
                    onClick: () => toggleSelector(field.name, true),
                    sx: {
                      "& .MuiPickersOutlinedInput-root": {
                        height: "40px",
                        background: "#ededed !important",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ced4da",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ced4da !important",
                        },
                        // ✅ HOVER (RED)
                        "&:hover .MuiPickersOutlinedInput-notchedOutline": {
                          borderColor: "#ced4da",
                          borderWidth: "1px",
                        },
                        "&.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline": {
                          border: "1px solid #ff8c00 !important",
                        },
                      },
                      "& .MuiPickersSectionList-root": {
                        padding: "12px 0px",
                        fontSize: "12px",
                      },
                      "& .MuiPickersInputBase-sectionContent": {
                        fontSize: "13px",
                        padding: "12px 0px",
                      },
                      "& .MuiOutlinedInput-input": {
                        padding: "0 12px !important",
                        fontSize: "13px !important",
                        fontFamily: "'Poppins', sans-serif !important",
                        height: "40px",
                        cursor: "pointer",
                      }
                    }
                  },
                  field: {
                    readOnly: true,
                  } as any,
                }}
              />
            </LocalizationProvider>
          </Box>
        );
      case "dateRange":
        return (
          <Box key={field.name}>
            <Typography sx={labelSx}>{field.label}</Typography>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Box
                className="admin-form-control"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "40px",
                  backgroundColor: "var(--input-bg) !important",
                  borderRadius: "5px !important",
                  border: "1px solid var(--main-border) !important",
                  px: 1,
                  cursor: "pointer",
                }}
              >
                <DatePicker
                  value={values[`${field.name}Start`] ? moment(values[`${field.name}Start`]) : null}
                  onChange={(date) =>
                    setFieldValue(`${field.name}Start`, date ? date.toISOString() : "")
                  }
                  open={!!openSelectors[`${field.name}Start`]}
                  onOpen={() => toggleSelector(`${field.name}Start`, true)}
                  onClose={() => toggleSelector(`${field.name}Start`, false)}
                  slots={{ openPickerIcon: () => null }}
                  sx={{ flex: 1 }}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      InputProps: { disableUnderline: true },
                      onClick: () => toggleSelector(`${field.name}Start`, true),
                      fullWidth: true,
                      sx: {
                        "& .MuiInputBase-input": {
                          padding: "0 4px !important",
                          fontSize: "12px !important",
                          fontFamily: "'PlusJakartaSans-Medium', sans-serif !important",
                          cursor: "pointer",
                          textAlign: "center",
                          width: "100%",
                        },
                      },
                      placeholder: "Start Date",
                    },
                  }}
                />
                <Box sx={{ color: "#aaa", mx: 0.5, fontWeight: "bold" }}>-</Box>
                <DatePicker
                  value={values[`${field.name}End`] ? moment(values[`${field.name}End`]) : null}
                  onChange={(date) =>
                    setFieldValue(`${field.name}End`, date ? date.toISOString() : "")
                  }
                  open={!!openSelectors[`${field.name}End`]}
                  onOpen={() => toggleSelector(`${field.name}End`, true)}
                  onClose={() => toggleSelector(`${field.name}End`, false)}
                  slots={{ openPickerIcon: () => null }}
                  sx={{ flex: 1 }}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      InputProps: { disableUnderline: true },
                      onClick: () => toggleSelector(`${field.name}End`, true),
                      fullWidth: true,
                      sx: {
                        "& .MuiInputBase-input": {
                          padding: "0 4px !important",
                          fontSize: "12px !important",
                          fontFamily: "'PlusJakartaSans-Medium', sans-serif !important",
                          cursor: "pointer",
                          textAlign: "center",
                          width: "100%",
                        },
                      },
                      placeholder: "End Date",
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        );
      case "inputSelect":
        return (
          <Box key={field.name}>
            <Typography sx={labelSx}>{field.label}</Typography>
            <TextField
              fullWidth
              value={values[field.name] || ""}
              onChange={(e) => setFieldValue(field.name, e.target.value)}
              placeholder={field.placeholder || "Enter text"}
              sx={inputSx}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      className="admin-filter-main"
      sx={{
        "& .MuiDrawer-paper": {
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box className="admin-filter-header">
        <Typography className="admin-filter-title">{title}</Typography>
        <IconButton onClick={onClose} sx={{ p: 0 }}>
          <img
            src={Svg.close}
            className="admin-filter-close-icon"
            alt="Close"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </IconButton>
      </Box>

      <Box className="admin-filter-inner-main" sx={{ flex: 1, overflowY: "auto", p: "25px" }}>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={handleApply}
        >
          {({ setFieldValue, values, resetForm }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", pb: "100px" }}>
                {fields.map((field) => renderField(field, setFieldValue, values))}
              </Box>

              <Box className="admin-filter-footer">
                <Button
                  className="admin-filter-cancel-btn btn-border"
                  onClick={() => {
                    resetForm();
                    handleReset();
                  }}
                  sx={{
                    backgroundColor: "var(--header-maroon) !important",
                    color: "#fff !important",
                    textTransform: "none",
                    px: 3,
                    borderRadius: "6px !important",
                    "&:hover": {
                      backgroundColor: "#3a0000 !important",
                    },
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="admin-filter-apply-btn btn-primary"
                  sx={{
                    backgroundColor: "var(--apply-orange) !important",
                    color: "#fff !important",
                    textTransform: "none",
                    px: 3,
                    borderRadius: "6px !important",
                    "&:hover": {
                      backgroundColor: "#a03025 !important",
                    },
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Drawer>
  );
};

export default Filter;
