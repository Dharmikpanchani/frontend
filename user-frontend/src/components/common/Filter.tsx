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
import { Close as CloseIcon } from "@mui/icons-material";
import { Formik, Form } from "formik";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import Svg from "@/assets/Svg";

export interface FilterField {
  type: "select" | "searchbaseSelect" | "date" | "inputSelect" | "dateRange";
  name: string;
  label: string;
  placeholder?: string;
  options?: any[];
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => any;
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

// Using styles from commonSx.ts

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
                  const val = field.getOptionValue ? field.getOptionValue(opt) : (typeof opt === 'object' && opt !== null ? (opt._id || opt.value) : opt);
                  return val === values[field.name];
                }) || null
              }
              onChange={(_, newValue) => {
                let val = "";
                if (newValue !== null) {
                  val = field.getOptionValue ? field.getOptionValue(newValue) : (typeof newValue === 'object' ? (newValue._id !== undefined ? newValue._id : newValue.value) : newValue);
                }
                setFieldValue(field.name, val ?? "");
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: field.placeholder || "Select Date",
                    variant: "outlined",
                    onClick: () => toggleSelector(field.name, true),
                    sx: inputSx
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
                  backgroundColor: "#ffffff !important",
                  borderRadius: "var(--button-radius, 6px) !important",
                  border: "1px solid var(--input-border, #ced4da) !important",
                  transition: 'all 0.3s ease !important',
                  px: 1,
                  cursor: "pointer",
                  '&:hover': {
                    borderColor: 'var(--input-border, #ced4da) !important',
                  },
                  '&:focus-within': {
                    borderColor: 'var(--primary-color, #942F15) !important',
                  }
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
                          fontSize: "14px !important",
                          fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
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
                          fontSize: "14px !important",
                          fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
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
          width: { xs: '100%', sm: '400px' },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      <Box
        className="admin-filter-header"
        sx={{
          p: '12px 20px',
          backgroundColor: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography
          className="admin-filter-title"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'PlusJakartaSans-Bold', sans-serif"
          }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            p: '4px',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '20px' }} />
        </IconButton>
      </Box>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={handleApply}
      >
        {({ setFieldValue, values, resetForm }) => (
          <Form style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <Box
              className="admin-filter-inner-main"
              sx={{
                flex: 1,
                overflowY: "auto",
                p: "25px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              {fields.map((field) => renderField(field, setFieldValue, values))}
            </Box>

            <Box className="admin-filter-footer">
              <Button
                className="admin-btn-secondary"
                onClick={() => {
                  resetForm();
                  handleReset();
                }}
                sx={{ px: 3, minWidth: "100px" }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="admin-btn-theme"
                sx={{ px: 3, minWidth: "100px" }}
              >
                Apply
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Drawer>
  );
};

export default Filter;
