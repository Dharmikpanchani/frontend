import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtpAdmin, resendOtpAdmin } from "@/redux/slices/authSlice";
import { addEditAdminUser } from "@/redux/slices/adminUserSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import SharedOtp from "@/apps/common/Otp/SharedOtp";
import type { OtpNumberInterface } from "@/types/interfaces/LoginInterface";

export default function AdminUserOtp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { type, email, updateData } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate("/admin-list", { replace: true });
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (values: OtpNumberInterface) => {
        setLoading(true);
        try {
            let resultAction;
            if (type === "admin_update") {
                const urlencodedUpdate = new URLSearchParams();
                Object.keys(updateData).forEach(key => {
                    urlencodedUpdate.append(key, updateData[key]);
                });
                urlencodedUpdate.append("otp", values?.code);
                resultAction = await dispatch(addEditAdminUser(urlencodedUpdate) as any);
            } else {
                const urlencoded = new URLSearchParams();
                urlencoded.append("email", email);
                urlencoded.append("otp", values?.code);
                urlencoded.append("type", type || "registration");
                resultAction = await dispatch(verifyOtpAdmin(urlencoded) as any);
            }

            setLoading(false);

            if (resultAction && (verifyOtpAdmin.fulfilled.match(resultAction) || addEditAdminUser.fulfilled.match(resultAction))) {
                if (resultAction.payload?.message?.toLowerCase().includes("fetch")) {
                    toasterError("Invalid verification response");
                    return;
                }
                navigate("/admin-list", { replace: true });
            }
        } catch (error: any) {
            setLoading(false);
            toasterError(error?.message || "Verification failed");
        }
    };

    const handleResendOtp = async (setFieldValue: any) => {
        setResendLoading(true);
        try {
            const urlencoded = new URLSearchParams();
            urlencoded.append("email", email);
            urlencoded.append("type", type || "registration");

            const resultAction = await dispatch(resendOtpAdmin(urlencoded) as any);
            setResendLoading(false);

            if (resendOtpAdmin.fulfilled.match(resultAction)) {
                setFieldValue("code", "");
            }
        } catch (error: any) {
            setResendLoading(false);
            toasterError(error?.message || "Failed to resend OTP");
        }
    };

    return (
        <SharedOtp
            title="Admin User Verification"
            subtitle={`Please enter the 6-digit OTP sent to your email address ${email}.`}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            handleBack={() => navigate("/admin-list", { replace: true })}
            backLabel="Back to Admin List?"
            loading={loading}
            resendLoading={resendLoading}
        />
    );
}
