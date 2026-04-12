import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtpAdmin, resendOtpAdmin } from "@/redux/slices/authSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import SharedOtp from "@/apps/common/Otp/SharedOtp";
import { getSubdomain } from "@/apps/common/commonJsFunction";
import type { OtpNumberInterface } from "@/types/interfaces/LoginInterface";

export default function TeacherOtp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isSubdomain = getSubdomain();
    const { phone, email } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!phone) {
            navigate("/teacher", { replace: true });
        }
    }, [phone, navigate]);

    const handleVerifyOtp = async (values: OtpNumberInterface) => {
        setLoading(true);
        try {
            const urlencoded = new URLSearchParams();
            urlencoded.append("email", phone); // Backend handles email/phone based on type
            urlencoded.append("otp", values?.code);
            urlencoded.append("type", "teacher");
            urlencoded.append("schoolCode", isSubdomain?.name);

            const resultAction = await dispatch(verifyOtpAdmin(urlencoded) as any);
            setLoading(false);

            if (verifyOtpAdmin.fulfilled.match(resultAction)) {
                if (resultAction.payload?.message?.toLowerCase().includes("fetch")) {
                    toasterError("Invalid verification response");
                    return;
                }
                navigate("/teacher", { replace: true });
            }
        } catch (error: any) {
            setLoading(false);
            toasterError(error?.message || "OTP verification failed");
        }
    };

    const handleResendOtp = async (setFieldValue: any) => {
        setResendLoading(true);
        try {
            const urlencoded = new URLSearchParams();
            urlencoded.append("email", phone);
            urlencoded.append("type", "teacher");
            urlencoded.append("schoolCode", isSubdomain?.name);

            const resultAction = await dispatch(resendOtpAdmin(urlencoded) as any);
            setResendLoading(false);

            if (resendOtpAdmin.fulfilled.match(resultAction)) {
                setFieldValue("code", "");
            } else {
                const message = resultAction?.payload?.message;
                if (message?.includes("Too many OTP requests")) {
                    navigate("/");
                }
            }
        } catch (error: any) {
            setResendLoading(false);
            toasterError(error?.message || "Failed to resend OTP");
        }
    };

    return (
        <SharedOtp
            title="Teacher Verification"
            subtitle={`Please enter the 6-digit OTP sent to your phone number ${phone}.`}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            handleBack={() => navigate("/teacher", { replace: true })}
            backLabel="Back to Teacher List?"
            loading={loading}
            resendLoading={resendLoading}
        />
    );
}
