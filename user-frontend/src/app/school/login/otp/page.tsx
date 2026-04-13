"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAdmin, resendOtpAdmin } from "@/redux/slices/authSlice";
import { toasterError } from "@/utils/toaster/Toaster";
import SharedOtp from "@/components/common/SharedOtp";
import { getSubdomain } from "@/utils/commonJsFunction";
import type { OtpNumberInterface } from "@/types/interfaces/LoginInterface";

export default function LoginOtp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const isSubdomain = getSubdomain();
    
    const email = searchParams.get("email") || "";
    const type = searchParams.get("type") || "login";

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            router.replace("/login");
        }
    }, [email, router]);

    const handleVerifyOtp = async (values: OtpNumberInterface) => {
        setLoading(true);
        try {
            const urlencoded = new URLSearchParams();
            urlencoded.append("email", email);
            urlencoded.append("otp", values?.code);
            urlencoded.append("type", type);
            if (isSubdomain?.isSubdomain) {
                urlencoded.append("schoolCode", isSubdomain.name);
            }

            const resultAction = await dispatch(verifyOtpAdmin(urlencoded) as any);
            setLoading(false);

            if (verifyOtpAdmin.fulfilled.match(resultAction)) {
                if (resultAction.payload?.message?.toLowerCase().includes("fetch")) {
                    toasterError("Invalid verification response");
                    return;
                }
                router.replace("/dashboard");
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
            urlencoded.append("email", email);
            urlencoded.append("type", type);
            if (isSubdomain?.isSubdomain) {
                urlencoded.append("schoolCode", isSubdomain.name);
            }

            const resultAction = await dispatch(resendOtpAdmin(urlencoded) as any);
            setResendLoading(false);

            if (resendOtpAdmin.fulfilled.match(resultAction)) {
                setFieldValue("code", "");
            } else {
                const message = (resultAction?.payload as any)?.message;
                if (message?.includes("Too many OTP requests")) {
                    router.replace("/login");
                }
            }
        } catch (error: any) {
            setResendLoading(false);
            toasterError(error?.message || "Failed to resend OTP");
        }
    };

    return (
        <SharedOtp
            title="Login Verification"
            subtitle={`Please enter the 6-digit OTP sent to your email address ${email}.`}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            handleBack={() => router.replace("/login")}
            backLabel="Back to Login?"
            loading={loading}
            resendLoading={resendLoading}
        />
    );
}
