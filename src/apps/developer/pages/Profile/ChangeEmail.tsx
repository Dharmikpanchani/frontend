import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import {
  Box,
  Button,
  FormHelperText,
  Typography,
  Grid,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import type { EmailChangeInterface } from "@/types/interfaces/LoginInterface";
import { useDispatch } from "react-redux";
import { changeEmailRequestAdmin } from "@/redux/slices/authSlice";
import { emailChangeValidationSchema } from "@/utils/validation/FormikValidation";
import Spinner from "../../component/developerCommon/spinner/Spinner";

export default function ChangeEmail() {
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues: EmailChangeInterface = {
    password: "",
    newEmail: "",
  };

  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (values: EmailChangeInterface) => {
    const urlencoded = new URLSearchParams();
    urlencoded.append("password", values.password);
    urlencoded.append("newEmail", values.newEmail.toLowerCase());

    setButtonSpinner(true);
    try {
      const resultAction = await dispatch(
        changeEmailRequestAdmin(urlencoded) as any
      );
      setButtonSpinner(false);
      if (changeEmailRequestAdmin.fulfilled.match(resultAction)) {
        navigate("/otp", {
          state: {
            email: values.newEmail,
            type: "developer_email_change",
          },
        });
      }
    } catch (error: any) {
      setButtonSpinner(false);
    }
  };

  const labelSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.2,
    fontSize: "13px",
    fontWeight: 500,
    color: "#344054",
    mb: 1,
    fontFamily: "'Poppins', sans-serif",
  };

  const inputSx = {
    height: "40px",
    width: "100%",
    "&.MuiOutlinedInput-root": {
      height: "40px",
      backgroundColor: "white",
      borderRadius: "6px",
      "& fieldset": {
        borderColor: "#E4E7EC",
        transition: "all 0.3s ease",
      },
      "&:hover fieldset": {
        borderColor: "#ced4da",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ff8c00",
        borderWidth: "1.5px",
      },
    },
    "& .MuiOutlinedInput-input": {
      height: "40px",
      padding: "0 14px",
      fontSize: "14px",
      color: "#1D2939",
      fontFamily: "'Poppins', sans-serif",
    },
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={emailChangeValidationSchema}
    >
      {(formikProps: FormikProps<EmailChangeInterface>) => {
        const { values, errors, touched, handleChange, handleBlur, resetForm } =
          formikProps;

        return (
          <Form>
            <Box sx={{ maxWidth: "800px", mx: "auto" }}>
              <Box
                sx={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: "12px",
                  p: 3,
                  mb: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  border: "1px solid #E5E7EB",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <EmailIcon sx={{ color: "#942F15", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#344054",
                      fontFamily: "'PlusJakartaSans-Bold', sans-serif",
                      marginBottom: "4px",
                    }}
                  >
                    Update your email address
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#667085",
                      fontFamily: "'PlusJakartaSans-Medium', sans-serif",
                    }}
                  >
                    Provide your current password and a new email to receive a
                    verification OTP.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box className="admin-input-box" sx={{ mb: 1 }}>
                    <Typography sx={labelSx}>
                      <LockIcon sx={{ fontSize: 14, color: "#942F15" }} />
                      Password <span className="astrick-sing">*</span>
                    </Typography>

                    <OutlinedInput
                      fullWidth
                      name="password"
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter password"
                      value={values.password}
                      error={touched.password && !!errors.password}
                      sx={inputSx}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handlePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOff sx={{ fontSize: 20 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                    />

                    <FormHelperText className="error-text">
                      {errors?.password && touched?.password ? errors.password : null}
                    </FormHelperText>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box className="admin-input-box" sx={{ mb: 1 }}>
                    <Typography sx={labelSx}>
                      <EmailIcon sx={{ fontSize: 14, color: "#942F15" }} />
                      New Email Address <span className="astrick-sing">*</span>
                    </Typography>

                    <OutlinedInput
                      fullWidth
                      name="newEmail"
                      autoComplete="off"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter new email address"
                      value={values.newEmail}
                      error={touched.newEmail && !!errors.newEmail}
                      sx={inputSx}
                    />

                    <FormHelperText className="error-text">
                      {errors?.newEmail && touched?.newEmail ? errors.newEmail : null}
                    </FormHelperText>
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 4,
                }}
              >
                <Button
                  variant="outlined"
                  disabled={buttonSpinner}
                  onClick={() => resetForm()}
                  sx={{
                    minWidth: "130px",
                    height: "40px",
                    borderRadius: "8px",
                    color: "#667085",
                    borderColor: "#D0D5DD",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#F9FAFB",
                      borderColor: "#D0D5DD",
                    },
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={buttonSpinner}
                  className="admin-btn-theme"
                  sx={{
                    minWidth: "150px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#942F15 !important",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#7A2711",
                      boxShadow: "none",
                    },
                  }}
                >
                  {buttonSpinner ? (
                    <Spinner />
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SaveIcon sx={{ fontSize: 18 }} />
                      Update Email
                    </Box>
                  )}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
