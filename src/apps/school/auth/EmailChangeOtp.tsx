import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmailChangeAdmin, resendOtpAdmin } from "@/redux/slices/authSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import SharedOtp from "@/apps/common/Otp/SharedOtp";
import { getSubdomain } from "@/apps/common/commonJsFunction";
import type { OtpNumberInterface } from "@/types/interfaces/LoginInterface";

export default function EmailChangeOtp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isSubdomain = getSubdomain();
    const { email, type, targetType } = location.state || {}; // type will be admin_email_change or developer_email_change
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate("/profile", { replace: true });
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (values: OtpNumberInterface) => {
        setLoading(true);
        try {
            const emailChangeData = new URLSearchParams();
            emailChangeData.append("newEmail", email);
            emailChangeData.append("otp", values?.code);
            if (targetType) {
                emailChangeData.append("targetType", targetType);
            }
            
            const resultAction = await dispatch(verifyEmailChangeAdmin(emailChangeData) as any);
            setLoading(false);

            if (verifyEmailChangeAdmin.fulfilled.match(resultAction)) {
                if ((resultAction.payload as any)?.message?.toLowerCase().includes("fetch")) {
                    toasterError("Invalid verification response");
                    return;
                }
                navigate("/profile", { replace: true });
            }
        } catch (error: any) {
            setLoading(false);
            toasterError(error?.message || "Email verification failed");
        }
    };

    const handleResendOtp = async (setFieldValue: any) => {
        setResendLoading(true);
        try {
            const urlencoded = new URLSearchParams();
            urlencoded.append("email", email);
            urlencoded.append("type", type);
            urlencoded.append("schoolCode", isSubdomain?.name);

            const resultAction = await dispatch(resendOtpAdmin(urlencoded) as any);
            setResendLoading(false);

            if (resendOtpAdmin.fulfilled.match(resultAction)) {
                setFieldValue("code", "");
                return true;
            }
            return false;
        } catch (error: any) {
            setResendLoading(false);
            toasterError(error?.message || "Failed to resend OTP");
            return false;
        }
    };

    return (
        <SharedOtp
            title="Verify New Email"
            subtitle={`Please enter the 6-digit OTP sent to your new email address ${email}.`}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            handleBack={() => navigate("/profile", { replace: true })}
            backLabel="Back to Profile"
            loading={loading}
            resendLoading={resendLoading}
        />
    );
}
