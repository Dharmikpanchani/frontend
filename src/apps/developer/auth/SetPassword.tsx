import React, { useState } from "react";
import type { SetPasswordInterface } from "@/types/interfaces/LoginInterface";
import { Form, Formik, type FormikProps } from "formik";
import { Box, Button, FormHelperText, IconButton, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { resetPasswordAdmin } from "@/redux/slices/authSlice";
import { setPasswordValidationSchema } from "@/utils/validation/FormikValidation";
import { toasterError } from "@/utils/toaster/Toaster";
import type { RootState } from "@/redux/Store";
import Spinner from "../component/developerCommon/spinner/Spinner";
import Png from "@/assets/Png";
import { getSubdomain } from "@/apps/common/commonJsFunction";

export default function SetPassWord() {
  const isSubdomain = getSubdomain();
  const { schoolLogo } = useSelector((state: RootState) => state.SchoolReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const emailForReset = useSelector((state: RootState) => state.AdminReducer.emailForReset);

  const [showPassword, setShowPassword] = useState(true);
  const [showCofPassword, setShowCofPassword] = useState(true);
  const [buttonSpinner, setButtonSpinner] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickCofShowPassword = () => setShowCofPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const initialValues: SetPasswordInterface = {
    password: "",
    confirmPassword: "",
  };

  const handleSetPassword = async (values: SetPasswordInterface) => {
    if (!emailForReset) {
      toasterError("Email is missing. Please try again.");
      navigate("/");
      return;
    }

    const urlencoded = new URLSearchParams();
    urlencoded.append("email", emailForReset);
    urlencoded.append("newPassword", values?.password);
    urlencoded.append("confirmPassword", values?.confirmPassword);

    setButtonSpinner(true);
    try {
      const resultAction = await dispatch(resetPasswordAdmin(urlencoded) as any);
      setButtonSpinner(false);

      if (resetPasswordAdmin.fulfilled.match(resultAction)) {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      setButtonSpinner(false);
      toasterError(error?.message || "Failed to reset password");
    }
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={handleSetPassword}
      initialValues={initialValues}
      validationSchema={setPasswordValidationSchema}
    >
      {(formikProps: FormikProps<SetPasswordInterface>) => {
        const {
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
        } = formikProps;
        return (
          <Form onSubmit={handleSubmit}>
            <Box className="login-page-container set-password-page">
              <Box className="login-card">
                <Box component="img" src={isSubdomain?.isSubdomain ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + schoolLogo : Png?.logoImg} alt="Logo" className="login-logo" />

                <Typography className="login-title">
                  Reset Password
                </Typography>
                <Typography className="login-subtitle">
                  Create a new password for your account.
                </Typography>

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

                <Box className="login-form-group">
                  <label htmlFor="confirmPassword">Confirm Password<span className="required-asterisk">*</span></label>
                  <Box className="password-input-box">
                    <OutlinedInput
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showCofPassword ? "password" : "text"}
                      placeholder="Confirm Password"
                      className="login-input"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickCofShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            className="password-eye-icon"
                          >
                            {showCofPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <FormHelperText className="error-text">
                        {errors.confirmPassword as string}
                      </FormHelperText>
                    )}
                  </Box>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  className="login-btn-primary"
                  disabled={buttonSpinner}
                  sx={{ mt: 2 }}
                >
                  {buttonSpinner ? <Spinner size={20} color="white" /> : "Save Password"}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
