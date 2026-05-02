import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Container,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  NorthEast as ExternalIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { schoolService } from "@/api/services/school.service";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/Store";
import toast from "react-hot-toast";

interface PlanCardProps {
  isPopular?: boolean;
}

const PlanCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isPopular',
})<PlanCardProps>(({ isPopular }) => ({
  borderRadius: "32px",
  padding: "40px",
  background: isPopular
    ? "#ffffff"
    : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px)",
  border: isPopular
    ? "2px solid var(--primary-color)"
    : "1px solid rgba(0, 33, 71, 0.1)",
  boxShadow: isPopular
    ? "0 25px 50px -12px rgba(0, 33, 71, 0.25)"
    : "0 10px 30px -10px rgba(0, 33, 71, 0.05)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "visible",
  "&:hover": {
    transform: "translateY(-12px)",
    boxShadow: "0 40px 80px -20px rgba(0, 33, 71, 0.2)",
    borderColor: "var(--secondary-color)",
  },
}));

const PopularBadge = styled(Box)(() => ({
  position: "absolute",
  top: "-14px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "var(--accent-color, #f1b000)",
  color: "#000",
  padding: "4px 16px",
  borderRadius: "20px",
  fontSize: "10px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "1px",
  boxShadow: "0 4px 12px rgba(241, 176, 0, 0.3)",
  zIndex: 2,
  whiteSpace: "nowrap",
}));

const CustomSwitch = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  padding: "6px",
  background: "rgba(0, 33, 71, 0.05)",
  borderRadius: "40px",
  width: "fit-content",
  margin: "0 auto",
  "& .toggle-tab": {
    padding: "10px 24px",
    borderRadius: "32px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--text-secondary)",
  },
  "& .active": {
    background: "var(--primary-color)",
    color: "#fff",
    boxShadow: "0 8px 16px -4px rgba(0, 33, 71, 0.3)",
  },
}));

const PriceTag = styled(Typography)(() => ({
  fontSize: "48px",
  fontWeight: 900,
  color: "var(--text-primary)",
  lineHeight: 1,
  display: "flex",
  alignItems: "baseline",
  gap: "4px",
  "& span": {
    fontSize: "20px",
    fontWeight: 600,
    color: "var(--text-muted)",
  }
}));

export default function UserPlan() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [apiPlans, setApiPlans] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { adminDetails } = useSelector((state: RootState) => state.AdminReducer);

  const schoolId = adminDetails?.schoolId || adminDetails?.schoolData?._id;

  const handlePayment = async (plan: any) => {
    try {
      setPaymentLoading(true);

      const schoolCode = adminDetails?.schoolData?.schoolCode;

      if (!schoolCode) {
        toast.error("School code not found");
        return;
      }

      // Build central payment URL
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : "";
      const baseDomain = import.meta.env.VITE_END_WITH_DOMAIN || ".yoursaas.com";

      let checkoutBase: string;
      if (window.location.hostname.includes("lvh.me")) {
        // Local dev on lvh.me subdomain → redirect to root lvh.me (no subdomain)
        checkoutBase = `${protocol}//lvh.me${port}`;
      } else if (window.location.hostname === "localhost") {
        checkoutBase = `${protocol}//localhost${port}`;
      } else {
        checkoutBase = `${protocol}//pay${baseDomain}${port}`;
      }

      const checkoutUrl = `${checkoutBase}/checkout/school-plan?schoolCode=${schoolCode}&planId=${plan._id}&billingCycle=${billingCycle}`;

      console.log("Redirecting to checkout:", checkoutUrl);
      window.location.href = checkoutUrl;

    } catch (error: any) {
      console.error("Redirect Error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setDataLoading(true);
        const res = await schoolService.getDeveloperWiseSchoolPlan(schoolId);
        setApiPlans(res.data || []);
      } catch (error) {
        console.error("Error fetching plan data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (schoolId) {
      fetchPlanData();
    } else {
      // If no schoolId yet, we still set loading to false after a timeout 
      // or just wait for the profile fetch in Header to finish and trigger this again
      const timer = setTimeout(() => setDataLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [schoolId]);

  if (dataLoading && apiPlans.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
        <Box className="loader-main">
          <Box className="loader">
            <span></span>
            <span></span>
          </Box>
        </Box>
      </Box>
    );
  }

  const filteredPlans = apiPlans.filter((plan: any) => {
    const isNotFree = plan.planName?.toLowerCase() !== "free";
    const matchesCycle = plan.billingCycle === billingCycle;
    return isNotFree && matchesCycle;
  });

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: `radial-gradient(circle at 100% 0%, rgba(0, 80, 157, 0.08) 0%, transparent 40%),
                     radial-gradient(circle at 0% 100%, rgba(241, 176, 0, 0.05) 0%, transparent 40%),
                     #fcfcfd`,
        width: "100%",
        py: 4,
        minHeight: "100vh"
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              color: "var(--secondary-color)",
              letterSpacing: "2px",
              mb: 2,
              display: "inline-block",
              background: "rgba(0, 80, 157, 0.08)",
              px: 2,
              py: 0.5,
              borderRadius: "100px",
              fontSize: "10px",
              border: "1px solid rgba(0, 80, 157, 0.1)"
            }}
          >
            Flexible Pricing
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: "32px", md: "56px" },
              color: "var(--text-primary)",
              letterSpacing: "-1.5px"
            }}
          >
            Upgrade Your School Experience
          </Typography>
          <Typography
            sx={{
              color: "var(--text-secondary)",
              maxWidth: "600px",
              mx: "auto",
              fontSize: "18px",
              lineHeight: 1.6,
              opacity: 0.8
            }}
          >
            Select the perfect plan to streamline your school operations.
            Simple, transparent pricing for institutions of all sizes.
          </Typography>
        </Box>

        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <Box sx={{ position: 'relative' }}>
            <CustomSwitch>
              <Box
                className={`toggle-tab ${billingCycle === "yearly" ? "active" : ""}`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly Billing
              </Box>
              <Box
                className={`toggle-tab ${billingCycle === "monthly" ? "active" : ""}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Box>
            </CustomSwitch>
          </Box>
        </Box>

        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {filteredPlans.map((plan: any, index: number) => {
            const price = billingCycle === "monthly" ? plan.monPrice : plan.yerPrice;
            const offerPrice = billingCycle === "monthly" ? plan.monOfferPrice : plan.yerOfferPrice;
            const isPopular = index === 1; // Highlight the middle plan for better UX

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <PlanCard isPopular={isPopular}>
                  {isPopular && <PopularBadge>Recommended</PopularBadge>}

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      mb: 1,
                      textTransform: 'capitalize'
                    }}>
                      {plan.planName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                      Best for growing institutions
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <PriceTag>
                      ₹{price}
                      <span>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </PriceTag>
                    {offerPrice > 0 && (
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          textDecoration: "line-through",
                          mt: 1
                        }}
                      >
                        Was ₹{offerPrice}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    disabled={paymentLoading}
                    onClick={() => handlePayment(plan)}
                    sx={{
                      py: 1.2,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "15px",
                      background: isPopular ? "var(--theme-gradient)" : "rgba(0, 80, 157, 0.08)",
                      color: isPopular ? "#fff" : "var(--primary-color)",
                      mb: 4,
                      boxShadow: isPopular ? "0 8px 20px -4px rgba(0, 33, 71, 0.25)" : "none",
                      border: isPopular ? "none" : "1px solid rgba(0, 80, 157, 0.1)",
                      "&:hover": {
                        background: isPopular ? "var(--theme-gradient)" : "rgba(0, 80, 157, 0.12)",
                        transform: "scale(1.01)",
                        boxShadow: isPopular ? "0 12px 28px -6px rgba(0, 33, 71, 0.35)" : "none",
                      },
                    }}
                  >
                    {paymentLoading ? "Processing..." : <>Select Plan <ExternalIcon sx={{ ml: 1, fontSize: 18 }} /></>}
                  </Button>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, mb: 3, fontSize: "14px", color: "var(--text-primary)" }}>
                      WHAT'S INCLUDED:
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {plan.moduleDescription?.map((module: string, i: number) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                          <CheckIcon sx={{ fontSize: 20, color: "var(--secondary-color)", mt: "2px" }} />
                          <Typography sx={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                            {module}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </PlanCard>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 10, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
            Need a custom enterprise solution? <Box component="span" sx={{ color: 'var(--secondary-color)', fontWeight: 700, cursor: 'pointer' }}>Contact our team</Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
