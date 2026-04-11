import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { OtpNumberInterface } from "@/types/interfaces/LoginInterface";
import type { FormikProps } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtpAdmin, resendOtpAdmin, verifyEmailChangeAdmin } from "@/redux/slices/authSlice";
import { verifyTeacherOtp } from "@/redux/slices/teacherSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import { otpNumberValidationSchema } from "@/utils/validation/FormikValidation";
import { Box, Typography, FormHelperText, Button } from "@mui/material";
import { Formik, Form } from "formik";
import OtpInput from "react-otp-input";
import Spinner from "../component/schoolCommon/spinner/Spinner";
import Png from "@/assets/Png";
import { getSubdomain } from "@/apps/common/commonJsFunction";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";

export default function Otp() {
  const isSubdomain = getSubdomain();
  const { schoolLogo } = useSelector((state: RootState) => state.SchoolReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { type, email, phone } = location.state || {}; // Added phone
  const [timeLeft, setTimeLeft] = useState(120);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [resendSpinner, setResendSpinner] = useState(false);
  const initialValues: OtpNumberInterface = {
    code: "",
  };

  const handleBack = () => {
    if (type === "registration") {
      navigate("/admin-list", { replace: true });
    } else if (type === "teacher") {
      navigate("/teacher", { replace: true });
    } else if (type === "admin_email_change" || type === "developer_email_change") {
      navigate("/profile", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const getBackLabel = () => {
    if (type === "login") return "Back to Login?";
    if (type === "registration") return "Back to Admin List?";
    if (type === "teacher") return "Back to Teacher List?";
    if (type === "forgotPassword") return "Back to Login?";
    if (type === "admin_email_change" || type === "developer_email_change") return "Back to Profile";
    return "Back";
  };

  useEffect(() => {
    if (!email && !phone) {
      navigate("/", { replace: true });
    }
  }, [email, phone, navigate]);

  const handleVerifyOtp = async (values: OtpNumberInterface, { setFieldValue }: any) => {
    setButtonSpinner(true);
    try {
      let resultAction;
      if (type === "teacher") {
        const payload = {
          phone: phone,
          otp: values?.code
        };
        resultAction = await dispatch(verifyTeacherOtp(payload) as any);
      } else if (type === "admin_email_change" || type === "developer_email_change") {
        const emailChangeData = new URLSearchParams();
        emailChangeData.append("newEmail", email);
        emailChangeData.append("otp", values?.code);
        resultAction = await dispatch(verifyEmailChangeAdmin(emailChangeData) as any);
      } else {
        const urlencoded = new URLSearchParams();
        urlencoded.append("email", email);
        urlencoded.append("otp", values?.code);
        urlencoded.append("type", type);
        urlencoded.append("schoolCode", isSubdomain?.name);
        resultAction = await dispatch(verifyOtpAdmin(urlencoded) as any);
      }

      setButtonSpinner(false);
      if (resultAction && (
        verifyOtpAdmin.fulfilled.match(resultAction) ||
        verifyEmailChangeAdmin.fulfilled.match(resultAction) ||
        verifyTeacherOtp.fulfilled.match(resultAction)
      )) {
        if (resultAction.payload?.message?.toLowerCase().includes("fetch")) {
          toasterError("Invalid verification response");
          setFieldValue("code", "");
          return;
        }

        if (type === "login") {
          navigate("/dashboard", { replace: true });
        } else if (type === "registration") {
          navigate("/admin-list", { replace: true });
        } else if (type === "teacher") {
          navigate("/teacher", { replace: true });
        } else if (type === "schoolRegistration") {
          navigate("/school-list", { replace: true });
        } else if (type === "forgotPassword") {
          navigate("/set-password", { replace: true });
        } else if (type === "admin_email_change" || type === "developer_email_change") {
          navigate("/profile", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setFieldValue("code", "");
      }
    } catch (error: any) {
      setButtonSpinner(false);
      toasterError(error?.message || "OTP verification failed");
    }
  };

  const resendOtp = async (setFieldValue: any) => {
    // For now, teacher resend is not specifically implemented in backend 
    // we can use the same resend logic if we update backend to handle phone.
    // Assuming for now it's only for email types in authSlice.
    if (type === "teacher") {
        toasterError("Resend OTP for teacher coming soon. Please re-create if needed.");
        return;
    }

    const urlencoded = new URLSearchParams();
    urlencoded.append("email", email);
    urlencoded.append("type", type);
    urlencoded.append("schoolCode", isSubdomain?.name);

    setResendSpinner(true);
    try {
      const resultAction = await dispatch(resendOtpAdmin(urlencoded) as any);
      setResendSpinner(false);
      if (resendOtpAdmin.fulfilled.match(resultAction)) {
        startOtpTimer();
        setFieldValue("code", "");
      } else {
        const message = resultAction?.payload?.message;
        if (message?.includes("Too many OTP requests")) {
          navigate("/");
        }
      }
    } catch (error: any) {
      setResendSpinner(false);
      toasterError(error?.message || "Failed to resend OTP");
    }
  };

  const startOtpTimer = () => {
    setTimeLeft(120);
    const expirationTime = Date.now() + 120 * 1000;

    const interval = setInterval(() => {
      const remainingTime = Math.max(
        0,
        Math.floor((expirationTime - Date.now()) / 1000)
      );
      setTimeLeft(remainingTime);

      if (remainingTime <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return interval;
  };

  useEffect(() => {
    const interval = startOtpTimer();
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={(values, formikProps) => handleVerifyOtp(values, formikProps)}
      initialValues={initialValues}
      validationSchema={otpNumberValidationSchema}
    >
      {(formikProps: FormikProps<OtpNumberInterface>) => {
        const { values, errors, touched, setFieldValue, handleSubmit } =
          formikProps;
        return (
          <Form onSubmit={handleSubmit}>
            <Box className="login-page-container otp-page">
              <Box className="login-card">
                <Box component="img" src={isSubdomain?.isSubdomain ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + schoolLogo : Png?.logoImg} alt="Logo" className="login-logo" />

                <Typography className="login-title">
                  OTP Verification
                </Typography>
                <Typography className="login-subtitle">
                  Please enter the 6-digit OTP sent to your email address.
                </Typography>

                <Box className="login-form-group">
                  <Box className="otp-input-wrapper">
                    <OtpInput
                      value={values?.code}
                      onChange={(value: string) => setFieldValue("code", value)}
                      numInputs={6}
                      inputType="number"
                      renderInput={(props: any) => (
                        <input
                          {...props}
                          className="otp-single-input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && values.code.length === 6) {
                              handleSubmit();
                            }
                          }}
                        />
                      )}
                      containerStyle="otp-container"
                    />
                  </Box>
                  {touched.code && errors.code && (
                    <FormHelperText className="error-text error-text-center">
                      {errors.code}
                    </FormHelperText>
                  )}
                </Box>

                <Box className="resend-otp-box">
                  {timeLeft ? (
                    <Typography className="timer-text">
                      Resend OTP in <span>{formatTime(timeLeft)}</span>
                    </Typography>
                  ) : (
                    <Button
                      className="resend-btn"
                      onClick={() => resendOtp(setFieldValue)}
                      disabled={resendSpinner}
                    >
                      {resendSpinner ? "Sending..." : "Resend OTP"}
                    </Button>
                  )}
                </Box>

                <Typography
                  className="forgot-password-link back-to-login"
                  style={{ cursor: "pointer", display: "block" }}
                  onClick={handleBack}
                >
                  {getBackLabel()}
                </Typography>

                <Button
                  type="submit"
                  fullWidth
                  className="login-btn-primary"
                  disabled={buttonSpinner}
                >
                  {buttonSpinner ? <Spinner size={20} color="white" /> : "Verify OTP"}
                </Button>
              </Box>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
