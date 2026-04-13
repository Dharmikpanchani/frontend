"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, TextField, FormHelperText, OutlinedInput, InputAdornment, IconButton, Button
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import type { LoginInterface } from "@/types/interfaces/LoginInterface";
import { loginAdmin } from "@/redux/slices/authSlice";
import { getSubdomain } from "@/utils/commonJsFunction";
import { getSchoolLogo } from "@/redux/slices/schoolSlice";
import { loginValidationSchema } from "@/utils/validation/FormikValidation";
import { toasterError } from "@/utils/toaster/Toaster";
import Spinner from "@/components/common/Spinner";
import Png from "@/assets/Png";
import type { RootState } from "@/redux/rootReducer";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isSubdomain = getSubdomain();

  const { schoolLogo } = useSelector((state: RootState) => state.SchoolReducer);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  useEffect(() => {
    if (isSubdomain?.isSubdomain) {
      const urlencoded = new URLSearchParams();
      urlencoded.append("schoolCode", isSubdomain.name);
      dispatch(getSchoolLogo(urlencoded) as any);
    }
  }, [isSubdomain?.isSubdomain, isSubdomain?.name, dispatch]);

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
        if (resultAction?.payload?.requireOtp === true) {
          // In Next.js we use router.push
          // Note: using query params or state in Next.js is different, 
          // but for simplicity we can use local storage or session storage if needed,
          // or just pass it in the URL.
          router.push(`/login/otp?email=${encodeURIComponent(values.email)}&type=login`);
        } else {
          router.push("/dashboard");
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
      {(formikProps: FormikProps<LoginInterface>) => {
        const { values, errors, touched, handleChange, handleSubmit } =
          formikProps;
        return (
          <Form onSubmit={handleSubmit}>
            <Box className="login-page-container">
              <Box className="login-card">
                <Box
                  component="img"
                  src={isSubdomain?.isSubdomain && schoolLogo ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}/${schoolLogo}` : (typeof Png?.logoImg === 'object' ? Png.logoImg.src : Png?.logoImg)}
                  alt="Logo"
                  className="login-logo"
                  sx={{ width: 'auto', height: 60, mb: 2 }}
                />

                <Typography className="login-title" sx={{ fontWeight: 700, fontSize: '1.5rem', mt: 1 }}>
                  Developer Login
                </Typography>
                <Typography className="login-subtitle" sx={{ color: 'text.secondary', mb: 3 }}>
                  Enter your developer credentials to login.
                </Typography>

                <Box className="login-form-group email-group" sx={{ mb: 2 }}>
                  <Typography variant="body2" component="label" htmlFor="email" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Email<span style={{ color: 'red' }}>*</span></Typography>
                  <Box className="email-input-box">
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      placeholder="Enter Email"
                      variant="outlined"
                      size="small"
                      value={values.email}
                      onChange={handleChange}
                      error={touched.email && Boolean(errors.email)}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText className="error-text">
                        {errors.email as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                <Box className="login-form-group" sx={{ mb: 2 }}>
                  <Typography variant="body2" component="label" htmlFor="password" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Password<span style={{ color: 'red' }}>*</span></Typography>
                  <Box className="password-input-box">
                    <OutlinedInput
                      fullWidth
                      id="password"
                      name="password"
                      size="small"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
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
                          >
                            {showPassword ? <Visibility sx={{ fontSize: 18 }} /> : <VisibilityOff sx={{ fontSize: 18 }} />}
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

                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary-color)', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1,
                    '&:hover': { bgcolor: '#333' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                  disabled={buttonSpinner}
                >
                  {buttonSpinner ? <Spinner /> : "Login"}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
