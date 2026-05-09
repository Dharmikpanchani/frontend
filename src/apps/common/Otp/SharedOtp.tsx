import { useEffect, useState } from "react";
import type { OtpNumberInterface } from "@/types/interfaces/LoginInterface";
import type { FormikProps } from "formik";
import { otpNumberValidationSchema } from "@/utils/validation/FormikValidation";
import { Box, Typography, FormHelperText, Button } from "@mui/material";
import { Formik, Form } from "formik";
import OtpInput from "react-otp-input";
import Spinner from "@/apps/school/component/schoolCommon/spinner/Spinner";
import Png from "@/assets/Png";
import { getSubdomain } from "@/apps/common/commonJsFunction";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import { useThemeManager } from "@/apps/school/hooks/useThemeManager";

interface SharedOtpProps {
    title?: string;
    subtitle: string;
    onVerify: (values: OtpNumberInterface, formikProps: any) => Promise<void>;
    onResend: (setFieldValue: any) => Promise<boolean>;
    handleBack: () => void;
    backLabel: string;
    loading: boolean;
    resendLoading: boolean;
}

export default function SharedOtp({
    title = "OTP Verification",
    subtitle,
    onVerify,
    onResend,
    handleBack,
    backLabel,
    loading,
    resendLoading
}: SharedOtpProps) {
    useThemeManager();
    const isSubdomain = getSubdomain();
    const { schoolLogo, schoolBanner } = useSelector((state: RootState) => state.SchoolReducer);
    const [timeLeft, setTimeLeft] = useState(120);

    const initialValues: OtpNumberInterface = {
        code: "",
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

    const handleResendClick = async (setFieldValue: any) => {
        const success = await onResend(setFieldValue);
        if (success) {
            startOtpTimer();
        }
    };

    return (
        <Formik
            enableReinitialize
            onSubmit={onVerify}
            initialValues={initialValues}
            validationSchema={otpNumberValidationSchema}
        >
            {(formikProps: FormikProps<OtpNumberInterface>) => {
                const { values, errors, touched, setFieldValue, handleSubmit } =
                    formikProps;
                return (
                    <Form onSubmit={handleSubmit}>
                        <Box 
                            className="login-page-container otp-page"
                            sx={{
                                backgroundImage: isSubdomain?.isSubdomain && schoolBanner 
                                    ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${import.meta.env.VITE_BASE_URL_IMAGE}/${schoolBanner}')`
                                    : undefined
                            }}
                        >
                            <Box className="login-card">
                                <Box component="img" src={(isSubdomain?.isSubdomain && schoolLogo) ? import.meta.env.VITE_BASE_URL_IMAGE + "/" + schoolLogo : Png?.logoImg} alt="Logo" className="login-logo" />

                                <Typography className="login-title">
                                    {title}
                                </Typography>
                                <Typography className="login-subtitle">
                                    {subtitle}
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
                                            onClick={() => handleResendClick(setFieldValue)}
                                            disabled={resendLoading}
                                        >
                                            {resendLoading ? "Sending..." : "Resend OTP"}
                                        </Button>
                                    )}
                                </Box>

                                <Typography
                                    className="forgot-password-link back-to-login"
                                    style={{ cursor: "pointer", display: "block" }}
                                    onClick={handleBack}
                                >
                                    {backLabel}
                                </Typography>

                                <Button
                                    type="submit"
                                    fullWidth
                                    className="login-btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size={20} color="white" /> : "Verify OTP"}
                                </Button>
                            </Box>
                        </Box>
                    </Form>
                );
            }}
        </Formik>
    );
}
