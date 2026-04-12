import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box, Typography, TextField, FormHelperText, Button
} from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikProps } from "formik";
import type { EmailInterface } from "@/types/interfaces/LoginInterface";
import { forgotPasswordAdmin } from "@/redux/slices/authSlice";
import { emailValidationSchema } from "@/utils/validation/FormikValidation";
import { toasterError } from "@/utils/toaster/Toaster";
import Spinner from "../component/schoolCommon/spinner/Spinner";
import Png from "@/assets/Png";
import { getSubdomain } from "@/apps/common/commonJsFunction";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";

export default function ForgotPassword() {
  const isSubdomain = getSubdomain();
  const { schoolLogo } = useSelector((state: RootState) => state.SchoolReducer);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues: EmailInterface = {
    email: "",
  };

  const handleResetPassword = async (values: EmailInterface) => {
    const urlencoded = new URLSearchParams();
    urlencoded.append("email", values?.email.toLowerCase());
    urlencoded.append("schoolCode", isSubdomain?.name);

    setButtonSpinner(true);
    try {
      const resultAction = await dispatch(forgotPasswordAdmin(urlencoded) as any);
      setButtonSpinner(false);
      if (forgotPasswordAdmin.fulfilled.match(resultAction)) {
        navigate("/forgot-password/otp", {
          replace: true,
          state: { type: "forgotPassword", email: values.email },
        });
      } else {
        if (
          resultAction.payload?.message?.includes('Too many OTP requests')) {
          navigate("/");
        }
      }
    } catch (error: any) {
      setButtonSpinner(false);
      toasterError(error?.message || "Error occurred");
    }
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={handleResetPassword}
      initialValues={initialValues}
      validationSchema={emailValidationSchema}
    >
      {(formikProps: FormikProps<typeof initialValues>) => {
        const { values, errors, touched, handleChange, handleSubmit } =
          formikProps;
        return (
          <Form onSubmit={handleSubmit}>
            <Box className="login-page-container forgot-password-page">
              <Box className="login-card">
                <Box component="img" src={isSubdomain?.isSubdomain ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + schoolLogo : Png?.logoImg} alt="Logo" className="login-logo" />

                <Typography className="login-title">
                  Forgot Password!
                </Typography>
                <Typography className="login-subtitle">
                  Enter your email address to receive OTP.
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
                          handleSubmit();
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

                <Link to="/" className="forgot-password-link">
                  Back to Login?
                </Link>

                <Button
                  type="submit"
                  fullWidth
                  className="login-btn-primary"
                  disabled={buttonSpinner}
                >
                  {buttonSpinner ? <Spinner size={20} color="white" /> : "Submit"}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
