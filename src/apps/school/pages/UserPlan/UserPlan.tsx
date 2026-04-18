import { useState } from "react";
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

interface PlanCardProps {
  isPopular?: boolean;
}

const PlanCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isPopular',
})<PlanCardProps>(({ isPopular }) => ({
  borderRadius: "24px",
  padding: "32px",
  background: isPopular
    ? "rgba(255, 255, 255, 0.98)"
    : "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(20px)",
  border: isPopular
    ? "2.5px solid var(--primary-color)"
    : "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: isPopular
    ? "0 20px 40px -15px var(--primary-color-rgb, rgba(148, 47, 21, 0.3))"
    : "0 10px 30px -10px rgba(0,0,0,0.1)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  height: "100%",
  minWidth: "340px",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "visible",
  flex: 1,
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: isPopular
      ? "0 35px 70px -20px var(--primary-color-rgb, rgba(148, 47, 21, 0.45))"
      : "0 20px 45px -15px rgba(0,0,0,0.15)",
  },
}));

const PopularBadge = styled(Box)(() => ({
  position: "absolute",
  top: "-10px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "var(--theme-gradient)",
  color: "white",
  padding: "2px 10px",
  borderRadius: "15px",
  fontSize: "9px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  whiteSpace: "nowrap",
  zIndex: 2
}));

const CustomSwitch = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "4px",
  background: "rgba(255, 255, 255, 0.5)",
  borderRadius: "30px",
  border: "1px solid rgba(0,0,0,0.05)",
  width: "fit-content",
  margin: "0 auto",
  "& .toggle-tab": {
    padding: "8px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontWeight: 600,
  },
  "& .active": {
    background: "var(--theme-gradient)",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
}));

export default function UserPlan() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      planName: "Basic",
      price: billingCycle === "monthly" ? 9.99 : 6.99,
      modules: ["Income Tracking", "Expense Tracking", "Event Categorization"],
      isPopular: false,
    },
    {
      planName: "Pro",
      price: billingCycle === "monthly" ? 34.99 : 26.99,
      modules: [
        "Smart AI Assistant",
        "Income Tracking",
        "Expense Tracking",
        "Warranty Tracking",
        "Subscription Tracking",
        "Event Categorization",
      ],
      isPopular: true,
      oldPrice: billingCycle === "yearly" ? 46.99 : 59.99,
    },
    {
      planName: "Starter",
      price: billingCycle === "monthly" ? 19.99 : 16.99,
      modules: [
        "Income Tracking",
        "Expense Tracking",
        "Warranty Tracking",
        "Subscription Tracking",
        "Event Categorization",
      ],
      isPopular: false,
    },
    {
      planName: "Premium",
      price: billingCycle === "monthly" ? 59.99 : 49.99,
      modules: [
        "All Pro Features",
        "Advanced Analytics",
        "Custom Branding",
        "API Access",
      ],
      isPopular: false,
    },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(circle at 50% 0%, var(--primary-color-rgb, rgba(148, 47, 21, 0.08)) 0%, transparent 50%), 
                    radial-gradient(circle at 100% 100%, var(--secondary-color-rgb, rgba(0, 0, 0, 0.03)) 0%, transparent 50%)`,
        fontFamily: "var(--font-family)",
        overflowX: "hidden",
        width: "100%",
        py: 2
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1400px' }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              display: "inline-block",
              px: 1.5,
              py: 0.2,
              borderRadius: "20px",
              border: "1px solid var(--primary-color)",
              color: "var(--primary-color)",
              fontSize: "10px",
              fontWeight: 700,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            Pricing
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: "24px", md: "36px" },
              color: "var(--text-primary)",
              letterSpacing: "-0.5px"
            }}
          >
            Choose the Plan That Fits You
          </Typography>
          <Typography
            sx={{
              color: "var(--text-secondary)",
              maxWidth: "500px",
              mx: "auto",
              fontSize: "13px",
              lineHeight: 1.4,
              opacity: 0.8
            }}
          >
            Find the perfect plan for your needs, whether you're just getting
            started or looking for advanced tools.
          </Typography>
        </Box>

        <Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
          <CustomSwitch>
            <Box 
              className={`toggle-tab ${billingCycle === "yearly" ? "active" : ""}`}
              onClick={() => setBillingCycle("yearly")}
              sx={{ py: "6px !important", px: "20px !important" }}
            >
              Yearly
            </Box>
            <Box 
              className={`toggle-tab ${billingCycle === "monthly" ? "active" : ""}`}
              onClick={() => setBillingCycle("monthly")}
              sx={{ py: "6px !important", px: "20px !important" }}
            >
              Monthly
            </Box>
          </CustomSwitch>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid 
              size={{ xs: 12, md: 6, lg: 4, xl: 3 }} 
              key={index} 
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <PlanCard isPopular={plan.isPopular}>
                {plan.isPopular && <PopularBadge>Most Popular</PopularBadge>}

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "var(--text-primary)", fontSize: "16px" }}>
                  {plan.planName}
                </Typography>

                <Box sx={{ minHeight: "80px", display: "flex", flexDirection: "column", justifyContent: "flex-end", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "baseline", mb: 0.2 }}>
                    {plan.oldPrice && (
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: 500,
                          color: "var(--text-muted)",
                          textDecoration: "line-through",
                          mr: 0.8,
                        }}
                      >
                        ${plan.oldPrice}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                      }}
                    >
                      ${plan.price}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    one-time payment + Local Taxes
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: plan.isPopular ? "var(--theme-gradient)" : "#1a1a1a",
                    color: "white",
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    "&:hover": {
                      background: plan.isPopular ? "var(--theme-gradient)" : "#000",
                      opacity: 0.9,
                    },
                  }}
                >
                  Buy now <ExternalIcon sx={{ fontSize: 16 }} />
                </Button>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {plan.modules.map((module, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckIcon sx={{ fontSize: 16, color: "var(--text-muted)" }} />
                      <Typography sx={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                        {module}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </PlanCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
