import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  Container,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  Shield as ShieldIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { paymentService } from "@/api/services/payment.service";
import { schoolService } from "@/api/services/school.service";
import toast from "react-hot-toast";

const GlassCard = styled(Card)(() => ({
  borderRadius: "32px",
  padding: "40px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(0, 33, 71, 0.1)",
  boxShadow: "0 25px 50px -12px rgba(0, 33, 71, 0.15)",
  maxWidth: "600px",
  margin: "0 auto",
  position: "relative",
  overflow: "visible",
  animation: "fadeInUp 0.6s ease-out forwards",
  "@keyframes fadeInUp": {
    from: {
      opacity: 0,
      transform: "translateY(20px) scale(0.98)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
  },
}));

const StatusBadge = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 20px",
  borderRadius: "100px",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "32px",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  }
}));

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);

  const schoolCode = searchParams.get("schoolCode");
  const planId = searchParams.get("planId");
  const billingCycle = searchParams.get("billingCycle") || "yearly";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!schoolCode || !planId) {
          toast.error("Invalid checkout parameters");
          setLoading(false);
          return;
        }

        // Fetch School Details by Code
        const schoolRes = await schoolService.getSchoolByCode(schoolCode);
        setSchoolData(schoolRes.data);

        // Fetch Plan Details
        const plansRes = await schoolService.getDeveloperWiseSchoolPlan(schoolRes.data._id);
        const selectedPlan = plansRes.data.find((p: any) => p._id === planId);
        setPlanData(selectedPlan);

      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolCode, planId]);

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      const payload = {
        schoolCode,
        planId,
        billingCycle,
        type: "SUBSCRIPTION"
      };

      const res = await paymentService.createSchoolPlan(payload);
      const { order } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vidya Setu SaaS",
        description: `${planData?.planName} Plan Upgrade`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await paymentService.verifyPayment(response);
            toast.success("Payment Successful!");

            // Redirect back to school dashboard
            const protocol = window.location.protocol;
            const baseDomain = import.meta.env.VITE_END_WITH_DOMAIN || ".yoursaas.com";
            const port = window.location.port ? `:${window.location.port}` : "";
            const redirectUrl = `${protocol}//${schoolCode?.toLowerCase() || ''}${baseDomain}${port}/dashboard?payment=success`;
            window.location.href = redirectUrl;
          } catch (err) {
            toast.error("Verification Failed");
          }
        },
        prefill: {
          name: schoolData?.schoolName,
          email: schoolData?.email,
        },
        theme: { color: schoolData.theme?.primaryColor || "#002147" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Payment Error:", error);
      toast.error(error.response?.data?.message || "Payment Failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const primaryColor = schoolData?.theme?.primaryColor || "#002147";
  const secondaryColor = schoolData?.theme?.secondaryColor || "#00509d";

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f8fafc",
          gap: 3
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: primaryColor }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#475569", letterSpacing: "0.5px" }}>
          Preparing Secure Checkout...
        </Typography>
      </Box>
    );
  }

  if (!schoolData || !planData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 0% 0%, ${primaryColor}0D 0%, transparent 50%), #f8fafc`,
          p: 3
        }}
      >
        <GlassCard sx={{ textAlign: "center", py: 8, borderTop: `6px solid ${primaryColor}` }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `${primaryColor}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px"
            }}
          >
            <BackIcon sx={{ fontSize: 40, color: primaryColor }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: "#1e293b" }}>
            Invalid Checkout
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 4, maxWidth: "400px", mx: "auto" }}>
            We couldn't find the school or plan details associated with this link. Please try again from your dashboard.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              if (schoolCode) {
                const protocol = window.location.protocol;
                const baseDomain = import.meta.env.VITE_END_WITH_DOMAIN || ".yoursaas.com";
                const port = window.location.port ? `:${window.location.port}` : "";
                window.location.href = `${protocol}//${schoolCode.toLowerCase()}${baseDomain}${port}/dashboard`;
              } else {
                window.history.back();
              }
            }}
            startIcon={<BackIcon />}
            sx={{
              background: primaryColor,
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { background: primaryColor, opacity: 0.9 }
            }}
          >
            Go Back to Dashboard
          </Button>
        </GlassCard>
      </Box>
    );
  }

  const price = billingCycle === "6month" ? planData.monPrice : planData.yerPrice;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: `radial-gradient(circle at 0% 0%, ${primaryColor}0D 0%, transparent 50%),
                     radial-gradient(circle at 100% 100%, ${primaryColor}08 0%, transparent 50%),
                     #f8fafc`,
        py: 8,
        "--primary-color": primaryColor,
        "--secondary-color": secondaryColor,
      }}
    >
      <Container maxWidth="lg">
        <GlassCard sx={{ borderTop: `6px solid ${primaryColor}` }}>
          <StatusBadge sx={{ background: `${primaryColor}14`, color: primaryColor }}>
            <ShieldIcon sx={{ fontSize: 16 }} /> Secure Checkout
          </StatusBadge>

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: "#1e293b" }}>
            Complete Subscription
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 4 }}>
            Review your plan details and proceed to secure payment.
          </Typography>

          <Stack spacing={3} sx={{ mb: 4 }}>
            <Box sx={{ p: 3, borderRadius: "20px", background: `${primaryColor}08`, border: `1px solid ${primaryColor}1A` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SchoolIcon sx={{ color: primaryColor }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{schoolData.schoolName}</Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>{schoolCode}{import.meta.env.VITE_END_WITH_DOMAIN || ".yoursaas.com"}</Typography>
                  </Box>
                </Stack>
                <CheckIcon sx={{ color: "success.main" }} />
              </Stack>
              <Divider sx={{ my: 2, opacity: 0.1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, textTransform: "capitalize" }}>
                    {planData.planName} Plan
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Billed {billingCycle === "6month" ? "6 Months" : "Yearly"}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: primaryColor }}>
                  ₹{price}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={paymentLoading}
            onClick={handlePayment}
            sx={{
              py: 2,
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: 800,
              textTransform: "none",
              boxShadow: `0 15px 30px -5px ${primaryColor}4D`,
              background: primaryColor,
              "&:hover": {
                background: primaryColor,
                opacity: 0.9,
                transform: "translateY(-2px)",
                boxShadow: `0 20px 40px -8px ${primaryColor}66`,
              }
            }}
          >
            {paymentLoading ? "Initialising Secure Payment..." : `Pay ₹${price} Now`}
          </Button>

          <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 3, color: "#94a3b8" }}>
            By proceeding, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </GlassCard>
      </Container>
    </Box>
  );
}
