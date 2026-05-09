import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, TextField, FormHelperText, OutlinedInput, InputAdornment, IconButton, Button
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import type { LoginInterface } from "@/types/interfaces/LoginInterface";
import { loginAdmin } from "@/redux/slices/authSlice";
import { getSubdomain } from "@/apps/common/commonJsFunction";
import { getSchoolLogo } from "@/redux/slices/schoolSlice";
import { loginValidationSchema } from "@/utils/validation/FormikValidation";
import { toasterError } from "@/utils/toaster/Toaster";
import Spinner from "../component/schoolCommon/spinner/Spinner";
import Png from "@/assets/Png";
import type { RootState } from "@/redux/Store";
import { useThemeManager } from "../hooks/useThemeManager";


export default function Login() {
  const isSubdomain = getSubdomain();
  useThemeManager();
  const { schoolLogo, schoolBanner } = useSelector((state: RootState) => state.SchoolReducer);
  const [showPassword, setShowPassword] = React.useState(true);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isSubdomain?.isSubdomain) {
      const urlencoded = new URLSearchParams();
      urlencoded.append("schoolCode", isSubdomain.name);
      dispatch(getSchoolLogo(urlencoded) as any);
    }
  }, []);

  const initialValues: LoginInterface = {
    email: "",
    password: "",
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleLogin = async (values: LoginInterface) => {
    const urlencoded = new URLSearchParams();
    urlencoded.append("email", values?.email.toLowerCase());
    urlencoded.append("password", values?.password);
    if (isSubdomain?.isSubdomain) {
      urlencoded.append("schoolCode", isSubdomain?.name);
    }
    setButtonSpinner(true);
    try {
      const resultAction = await dispatch(loginAdmin(urlencoded) as any);
      setButtonSpinner(false);
      if (loginAdmin.fulfilled.match(resultAction)) {
        if (resultAction?.payload?.requireOtp == true) {
          navigate("/login/otp", {
            state: {
              email: values?.email,
              type: "login"
            },
          });
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      setButtonSpinner(false);
      toasterError(error?.message || "Login failed");
    }
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={handleLogin}
      initialValues={initialValues}
      validationSchema={loginValidationSchema}
    >
      {(formikProps: FormikProps<typeof initialValues>) => {
        const { values, errors, touched, handleChange, handleSubmit } =
          formikProps;
        return (
          <Form onSubmit={handleSubmit}>
            <Box 
              className="login-page-container"
              sx={{
                backgroundImage: isSubdomain?.isSubdomain && schoolBanner 
                  ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${import.meta.env.VITE_BASE_URL_IMAGE}/${schoolBanner}')`
                  : undefined
              }}
            >
              <Box className="login-card">
                <Box component="img" src={isSubdomain?.isSubdomain && schoolLogo ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + schoolLogo : Png?.logoImg} alt="Logo" className="login-logo" />

                <Typography className="login-title">
                  Login your account
                </Typography>
                <Typography className="login-subtitle">
                  Enter your email and password to login to your account.
                </Typography>

                <Box className="login-form-group email-group">
                  <label htmlFor="email">Email<span className="required-asterisk">*</span></label>
                  <Box className="email-input-box">
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      placeholder="Enter Email"
                      variant="outlined"
                      className="login-input"
                      value={values.email}
                      onChange={handleChange}
                      error={touched.email && Boolean(errors.email)}
                      onKeyDown={(e: any) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.getElementById("password")?.focus();
                        }
                      }}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText className="error-text">
                        {errors.email as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                <Box className="login-form-group">
                  <label htmlFor="password">Password<span className="required-asterisk">*</span></label>
                  <Box className="password-input-box">
                    <OutlinedInput
                      fullWidth
                      id="password"
                      name="password"
                      type={showPassword ? "password" : "text"}
                      placeholder="Enter Password"
                      className="login-input"
                      value={values.password}
                      onChange={handleChange}
                      error={touched.password && Boolean(errors.password)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            className="password-eye-icon"
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {touched.password && errors.password && (
                      <FormHelperText className="error-text">
                        {errors.password as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>

                <Button
                  type="submit"
                  fullWidth
                  className="login-btn-primary"
                  disabled={buttonSpinner}
                >
                  {buttonSpinner ? <Spinner size={20} color="white" /> : "Login"}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
