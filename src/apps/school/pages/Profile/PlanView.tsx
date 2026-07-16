import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  AccessTime as ExpiryIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  People as StudentIcon,
  AccountBalance as FeeIcon,
  Settings as SettingsIcon,
  Palette as ThemeIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import {
  planStaticData as roleStaticData,
  planModuleGroups,
} from "@/apps/common/StaticArrayData";
import type { PlanModuleGroup } from "@/apps/common/StaticArrayData";
import { subscriptionService } from "@/api/services/subscription.service";
import { BpCheckbox } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { authService } from "@/api/services/auth.service";
import moment from "moment";
import { toasterError } from "@/utils/toaster/Toaster";

const groupIconMap: Record<string, any> = {
  dashboard: DashboardIcon,
  admin: AdminIcon,
  teacher: TeacherIcon,
  student: StudentIcon,
  fee: FeeIcon,
  settings: SettingsIcon,
  theme: ThemeIcon,
  ai_copilot: BotIcon,
};

export default function PlanView() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [futurePlan, setFuturePlan] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSchoolProfile = async () => {
    try {
      setLoading(true);
      const res: any = await authService.getSchoolProfile();
      if (res.status === 200) {
        setProfileData(res.data);
      } else {
        toasterError(res.message || "Failed to fetch school profile");
      }
    } catch (error: any) {
      toasterError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchFuturePlan = async () => {
    try {
      const res: any = await subscriptionService.getFuturePlan();
      if (res?.status === 200 && res.data) {
        setFuturePlan(res.data);
      } else {
        setFuturePlan(null);
      }
    } catch (error) {
      console.error("Failed to fetch future plan:", error);
      setFuturePlan(null);
    }
  };

  useEffect(() => {
    fetchSchoolProfile();
    fetchFuturePlan();
  }, []);

  const selectedPlan = profileData?.planData;
  const planExpiryDate = profileData?.planExpiryDate;

  const initialValues = useMemo(() => {
    if (selectedPlan) {
      return {
        planName: selectedPlan.planName || "",
        monthlyPrice: selectedPlan.monthlyPrice || "0",
        monOfferPrice: selectedPlan.monOfferPrice || "0",
        yearlyPrice: selectedPlan.yearlyPrice || "0",
        yerOfferPrice: selectedPlan.yerOfferPrice || "0",
        billingCycle: selectedPlan.billingCycle || "6month",
        maxStudents: selectedPlan.maxStudents || "",
        maxTeachers: selectedPlan.maxTeachers || "",
        maxClasses: selectedPlan.maxClasses || "",
        permissions: selectedPlan.permissions || [],
      };
    }
    return null;
  }, [selectedPlan]);

  const SectionTitle = ({
    icon: Icon,
    title,
  }: {
    icon: any;
    title: string;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 3,
        mt: 1,
        pb: 1,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "8px",
          backgroundColor: (theme) =>
            alpha(theme.palette.primary.main || "#002147", 0.1),
          color: "var(--primary-color)",
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Typography
        sx={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#1f2937",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const permissions = initialValues?.permissions || [];

  const getGroupSubModules = (g: PlanModuleGroup) =>
    roleStaticData.filter((m) => g.subModuleIds.includes(m.mainTitleId));

  const getDefaultKeys = (g: PlanModuleGroup): string[] =>
    getGroupSubModules(g).flatMap((m) =>
      m.subRole
        .filter(
          (sr) =>
            sr.is_show &&
            sr.titleId !== "export" &&
            sr.titleId !== "import",
        )
        .map((sr) => `${m.mainTitleId}_${sr.titleId}`),
    );

  const getExportKeys = (g: PlanModuleGroup): string[] =>
    getGroupSubModules(g).flatMap((m) =>
      m.subRole.some((sr) => sr.titleId === "export")
        ? [`${m.mainTitleId}_export`]
        : [],
    );

  const getImportKeys = (g: PlanModuleGroup): string[] =>
    getGroupSubModules(g).flatMap((m) =>
      m.subRole.some((sr) => sr.titleId === "import")
        ? [`${m.mainTitleId}_import`]
        : [],
    );

  const isGroupDefaultChecked = (g: PlanModuleGroup, permissionsList = permissions) => {
    const k = getDefaultKeys(g);
    return k.length > 0 && k.every((x) => permissionsList.includes(x));
  };

  const isGroupDefaultIndeterminate = (g: PlanModuleGroup, permissionsList = permissions) => {
    const k = getDefaultKeys(g);
    const n = k.filter((x) => permissionsList.includes(x)).length;
    return n > 0 && n < k.length;
  };

  const isGroupExportChecked = (g: PlanModuleGroup, permissionsList = permissions) => {
    const k = getExportKeys(g);
    return k.length > 0 && k.every((x) => permissionsList.includes(x));
  };

  const isGroupImportChecked = (g: PlanModuleGroup, permissionsList = permissions) => {
    const k = getImportKeys(g);
    return k.length > 0 && k.every((x) => permissionsList.includes(x));
  };

  const isAllExportChecked = planModuleGroups
    .filter((g) => g.hasExport)
    .every((g) => isGroupExportChecked(g, permissions));

  const isAllImportChecked = planModuleGroups
    .filter((g) => g.hasImport)
    .every((g) => isGroupImportChecked(g, permissions));

  if (loading) return <CommonLoader />;

  if (!initialValues) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          No active plan found for this school.
        </Typography>
      </Box>
    );
  }

  const isFreePlan = initialValues.planName?.trim().toLowerCase() === "free";

  return (
    <Box className="admin-tabpanel-main" sx={{ p: 0 }}>
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: "16px",
          background: "var(--theme-gradient)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2.5, zIndex: 1 }}
        >
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: "14px",
              bgcolor: "rgba(255,255,255,0.18)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}
          >
            <ExpiryIcon sx={{ color: "white", fontSize: 30 }} />
          </Box>
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.7 }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  opacity: 0.9,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Subscription Expiry
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.3,
                  borderRadius: "20px",
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <VerifiedIcon sx={{ fontSize: 13, color: "white" }} />
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "0.5px",
                  }}
                >
                  ACTIVE
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: { xs: "20px", sm: "26px" },
                fontWeight: 800,
                fontFamily: "'Poppins', sans-serif",
                lineHeight: 1.1,
              }}
            >
              {planExpiryDate
                ? planExpiryDate < 10000000000
                  ? moment.unix(planExpiryDate).format("MMMM DD, YYYY")
                  : moment(planExpiryDate).format("MMMM DD, YYYY")
                : "No Expiry Set"}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            zIndex: 1,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          {futurePlan && (
            <Button
              variant="outlined"
              onClick={() => setOpenModal(true)}
              sx={{
                color: "#FFFFFF !important",
                background: "rgba(255, 255, 255, 0.15) !important",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "25px",
                px: 3,
                py: 1.1,
                fontSize: "14px",
                whiteSpace: "nowrap",
                border: "1px solid rgba(255, 255, 255, 0.5) !important",
                backdropFilter: "blur(8px)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.25) !important",
                  border: "1px solid rgba(255, 255, 255, 0.9) !important",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
                flex: { xs: 1, sm: "initial" },
              }}
            >
              Available Future Plans
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate("/user-plan")}
            sx={{
              background: "var(--primary-color) !important",
              color: "#FFFFFF !important",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "25px",
              px: 3.5,
              py: 1.1,
              fontSize: "14px",
              whiteSpace: "nowrap",
              border: "1px solid rgba(255, 255, 255, 0.2) !important",
              boxShadow: "0 8px 20px -4px rgba(0,0,0,0.3)",
              "&:hover": {
                background:
                  "var(--selected-color, var(--primary-color)) !important",
                opacity: 0.95,
                transform: "translateY(-2px)",
                boxShadow: "0 12px 24px -5px rgba(0,0,0,0.4)",
              },
              transition: "all 0.3s ease",
              flex: { xs: 1, sm: "initial" },
            }}
          >
            Upgrade Plan
          </Button>
        </Box>
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: "20%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
      </Box>

      <Box sx={{ maxWidth: 1100 }}>
        {/* 1. Plan Details */}
        <SectionTitle icon={AssignmentIcon} title="Plan Overview" />
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gap={{ xs: 2, sm: 3 }}
          sx={{ mb: 6 }}
        >
          <Box
            gridColumn={{
              xs: "span 12",
              sm: isFreePlan ? "span 12" : "span 4",
            }}
          >
            <Typography sx={labelSx}>Plan Name</Typography>
            <TextField
              fullWidth
              variant="outlined"
              sx={inputSx}
              value={initialValues.planName}
              disabled
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          </Box>

          {!isFreePlan && (
            <>
              <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                <Typography sx={labelSx}>
                  {initialValues.billingCycle === "6month"
                    ? "6 Months Price"
                    : "Yearly Price"}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  sx={inputSx}
                  value={
                    initialValues.billingCycle === "6month"
                      ? initialValues.monthlyPrice
                      : initialValues.yearlyPrice
                  }
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                <Typography sx={labelSx}>
                  {initialValues.billingCycle === "6month"
                    ? "6 Months Offer Price"
                    : "Yearly Offer Price"}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  sx={inputSx}
                  value={
                    initialValues.billingCycle === "6month"
                      ? initialValues.monOfferPrice
                      : initialValues.yerOfferPrice
                  }
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", sm: "span 4" }}>
                <Typography sx={labelSx}>Billing Cycle</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  sx={inputSx}
                  value={
                    initialValues.billingCycle === "6month"
                      ? "6 Months"
                      : initialValues.billingCycle.charAt(0).toUpperCase() +
                        initialValues.billingCycle.slice(1)
                  }
                  disabled
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* 2. Permissions */}
        <SectionTitle icon={SecurityIcon} title="Included Features" />
        {/* Grid of Included Feature Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 1.2,
            mb: 2.5,
          }}
        >
          {planModuleGroups.map((group) => {
            const GroupIcon = groupIconMap[group.icon || ""] || SettingsIcon;
            const defChecked = isGroupDefaultChecked(group);
            const defIndet = isGroupDefaultIndeterminate(group);
            return (
              <Box
                key={group.groupId}
                sx={{
                  p: 1.2,
                  borderRadius: "8px",
                  border: defChecked
                    ? "2px solid var(--primary-color)"
                    : "1px solid #e2e8f0",
                  bgcolor: defChecked ? "rgba(0, 33, 71, 0.01)" : "white",
                  boxShadow: defChecked
                    ? "0 4px 8px -4px rgba(0, 33, 71, 0.08)"
                    : "0 1px 4px rgba(0, 0, 0, 0.01)",
                  transition: "all 0.15s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "95px",
                  position: "relative",
                }}
              >
                <Box>
                  {/* Header inside Card */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 26,
                        height: 26,
                        borderRadius: "6px",
                        bgcolor: defChecked ? "rgba(0, 33, 71, 0.09)" : "#f1f5f9",
                        color: defChecked ? "var(--primary-color)" : "#64748b",
                        transition: "all 0.2s",
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 14 }} />
                    </Box>
                    <BpCheckbox
                      checked={defChecked}
                      indeterminate={defIndet}
                      disabled
                      sx={{ transform: "scale(0.75)", p: 0.1 }}
                    />
                  </Box>

                  {/* Title & Description */}
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#0f172a",
                      mb: 0.3,
                      lineHeight: 1.1,
                    }}
                  >
                    {group.groupTitle}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "9px",
                      color: "#64748b",
                      lineHeight: 1.2,
                      mb: 1,
                    }}
                  >
                    {group.subModuleIds
                      .map((s) =>
                        s
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                      )
                      .join(" · ")}
                  </Typography>
                </Box>

                {/* Pricing Tag in Footer hidden for School View */}
              </Box>
            );
          })}
        </Box>

        {/* Add-on Features Section Title */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "12px",
            color: "#0f172a",
            mb: 1,
            mt: 2.5,
          }}
        >
          Add-on Features
        </Typography>

        {/* Import / Export Add-on Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            gap: 1.2,
            mb: 2.5,
          }}
        >
          {/* Export Add-on Card */}
          <Box
            sx={{
              p: 1.2,
              borderRadius: "8px",
              border: isAllExportChecked
                ? "2px solid #16a34a"
                : "1px solid #e2e8f0",
              bgcolor: isAllExportChecked ? "rgba(22, 163, 74, 0.01)" : "white",
              boxShadow: isAllExportChecked
                ? "0 4px 8px -4px rgba(22, 163, 74, 0.08)"
                : "0 1px 4px rgba(0, 0, 0, 0.01)",
              transition: "all 0.15s ease-in-out",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "85px",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                <Box
                  sx={{
                    width: 26, height: 26,
                    borderRadius: "6px",
                    bgcolor: isAllExportChecked ? "rgba(22, 163, 74, 0.12)" : "#f1f5f9",
                    color: isAllExportChecked ? "#16a34a" : "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </Box>
                <BpCheckbox
                  checked={isAllExportChecked}
                  disabled
                  sx={{ transform: "scale(0.75)", p: 0.1 }}
                />
              </Box>

              <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#0f172a", mb: 0.2 }}>
                Export
              </Typography>
              <Typography sx={{ fontSize: "9px", color: "#64748b", mb: 1 }}>
                Enables export/download actions across all eligible school modules.
              </Typography>
            </Box>

            {/* Pricing Hidden for School View */}
          </Box>

          {/* Import Add-on Card */}
          <Box
            sx={{
              p: 1.2,
              borderRadius: "8px",
              border: isAllImportChecked
                ? "2px solid #2563eb"
                : "1px solid #e2e8f0",
              bgcolor: isAllImportChecked ? "rgba(37, 99, 235, 0.01)" : "white",
              boxShadow: isAllImportChecked
                ? "0 4px 8px -4px rgba(37, 99, 235, 0.08)"
                : "0 1px 4px rgba(0, 0, 0, 0.01)",
              transition: "all 0.15s ease-in-out",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "85px",
            }}
          >
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                <Box
                  sx={{
                    width: 26, height: 26,
                    borderRadius: "6px",
                    bgcolor: isAllImportChecked ? "rgba(37, 99, 235, 0.12)" : "#f1f5f9",
                    color: isAllImportChecked ? "#2563eb" : "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 16 12 21 17 16"/><line x1="12" y1="21" x2="12" y2="9"/></svg>
                </Box>
                <BpCheckbox
                  checked={isAllImportChecked}
                  disabled
                  sx={{ transform: "scale(0.75)", p: 0.1 }}
                />
              </Box>

              <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#0f172a", mb: 0.2 }}>
                Import
              </Typography>
              <Typography sx={{ fontSize: "9px", color: "#64748b", mb: 1 }}>
                Enables import/upload actions across all eligible school modules.
              </Typography>
            </Box>

            {/* Pricing Hidden for School View */}
          </Box>
        </Box>
      </Box>

      {/* Future Plan Modal */}
      <Dialog
        open={openModal}
        onClose={() => !actionLoading && setOpenModal(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            padding: 1,
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--primary-color)",
            }}
          >
            Upcoming Plan Details
          </Typography>
          <IconButton
            onClick={() => setOpenModal(false)}
            disabled={actionLoading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {futurePlan && (() => {
            const futurePlanPermissions =
              futurePlan.newPlanSnapshot?.permissions ||
              futurePlan.newPlanId?.permissions ||
              [];

            const includedGroups = planModuleGroups.filter(
              (group) =>
                isGroupDefaultChecked(group, futurePlanPermissions) ||
                isGroupDefaultIndeterminate(group, futurePlanPermissions)
            );

            const isAllExportCheckedForFuture = planModuleGroups
              .filter((g) => g.hasExport)
              .every((g) => isGroupExportChecked(g, futurePlanPermissions));

            const isAllImportCheckedForFuture = planModuleGroups
              .filter((g) => g.hasImport)
              .every((g) => isGroupImportChecked(g, futurePlanPermissions));

            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: "14px",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "#64748b",
                      mb: 0.5,
                      fontWeight: 600,
                    }}
                  >
                    Plan Name
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                      textTransform: "capitalize",
                    }}
                  >
                    {futurePlan.newPlanSnapshot?.planName ||
                      futurePlan.newPlanId?.planName ||
                      "Plan"}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#64748b",
                        mb: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      Billing Cycle
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0f172a",
                        textTransform: "capitalize",
                      }}
                    >
                      {futurePlan.newPlanSnapshot?.billingCycle || "Yearly"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#64748b",
                        mb: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      Price
                    </Typography>
                    <Typography
                      sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}
                    >
                      ₹
                      {futurePlan.amountPaid ||
                        futurePlan.newPlanSnapshot?.price ||
                        0}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor: "rgba(0, 80, 157, 0.05)",
                      border: "1px solid rgba(0, 80, 157, 0.15)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--primary-color)",
                        mb: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      Booked On (Today)
                    </Typography>
                    <Typography
                      sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}
                    >
                      {moment(futurePlan.createdAt).format("MMMM DD, YYYY")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      bgcolor: "rgba(255, 165, 0, 0.08)",
                      border: "1px solid rgba(255, 165, 0, 0.2)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "var(--secondary-color)",
                        mb: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      Scheduled Expiry Date
                    </Typography>
                    <Typography
                      sx={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}
                    >
                      {(() => {
                        const cycle =
                          futurePlan.newPlanSnapshot?.billingCycle || "yearly";
                        const baseDate = moment(futurePlan.createdAt);
                        if (cycle === "monthly") baseDate.add(1, "month");
                        else if (cycle === "6month") baseDate.add(6, "months");
                        else if (cycle === "yearly") baseDate.add(1, "year");
                        else baseDate.add(30, "days");
                        return baseDate.format("MMMM DD, YYYY");
                      })()}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: "14px",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "#64748b",
                      mb: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    Included Modules & Features
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                      },
                      gap: 1.2,
                      mb: (isAllExportCheckedForFuture || isAllImportCheckedForFuture) ? 2.5 : 0,
                    }}
                  >
                    {includedGroups.map((group) => {
                      const GroupIcon = groupIconMap[group.icon || ""] || SettingsIcon;
                      const defChecked = isGroupDefaultChecked(group, futurePlanPermissions);
                      const defIndet = isGroupDefaultIndeterminate(group, futurePlanPermissions);
                      return (
                        <Box
                          key={group.groupId}
                          sx={{
                            p: 1.2,
                            borderRadius: "8px",
                            border: defChecked
                              ? "2px solid var(--primary-color)"
                              : "1px solid #e2e8f0",
                            bgcolor: defChecked ? "rgba(0, 33, 71, 0.01)" : "white",
                            boxShadow: defChecked
                              ? "0 4px 8px -4px rgba(0, 33, 71, 0.08)"
                              : "0 1px 4px rgba(0, 0, 0, 0.01)",
                            transition: "all 0.15s ease-in-out",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: "95px",
                            position: "relative",
                          }}
                        >
                          <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 26,
                                  height: 26,
                                  borderRadius: "6px",
                                  bgcolor: defChecked ? "rgba(0, 33, 71, 0.09)" : "#f1f5f9",
                                  color: defChecked ? "var(--primary-color)" : "#64748b",
                                  transition: "all 0.2s",
                                }}
                              >
                                <GroupIcon sx={{ fontSize: 14 }} />
                              </Box>
                              <BpCheckbox
                                checked={defChecked}
                                indeterminate={defIndet}
                                disabled
                                sx={{ transform: "scale(0.75)", p: 0.1 }}
                              />
                            </Box>

                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "12px",
                                color: "#0f172a",
                                mb: 0.3,
                                lineHeight: 1.1,
                              }}
                            >
                              {group.groupTitle}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "9px",
                                color: "#64748b",
                                lineHeight: 1.2,
                                mb: 1,
                              }}
                            >
                              {group.subModuleIds
                                .map((s) =>
                                  s
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase())
                                )
                                .join(" · ")}
                            </Typography>
                          </Box>

                          {/* Pricing Hidden for School View */}
                        </Box>
                      );
                    })}
                  </Box>

                  {(isAllExportCheckedForFuture || isAllImportCheckedForFuture) && (
                    <>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "12px",
                          color: "#0f172a",
                          mb: 1.5,
                          mt: 2.5,
                        }}
                      >
                        Included Add-on Features
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                          },
                          gap: 1.2,
                        }}
                      >
                        {isAllExportCheckedForFuture && (
                          <Box
                            sx={{
                              p: 1.2,
                              borderRadius: "8px",
                              border: "2px solid #16a34a",
                              bgcolor: "rgba(22, 163, 74, 0.01)",
                              boxShadow: "0 4px 8px -4px rgba(22, 163, 74, 0.08)",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: "85px",
                            }}
                          >
                            <Box>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                                <Box
                                  sx={{
                                    width: 26, height: 26,
                                    borderRadius: "6px",
                                    bgcolor: "rgba(22, 163, 74, 0.12)",
                                    color: "#16a34a",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                </Box>
                                <BpCheckbox
                                  checked={true}
                                  disabled
                                  sx={{ transform: "scale(0.75)", p: 0.1 }}
                                />
                              </Box>

                              <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#0f172a", mb: 0.2 }}>
                                Export
                              </Typography>
                              <Typography sx={{ fontSize: "9px", color: "#64748b", mb: 1 }}>
                                Enables export/download actions across all eligible school modules.
                              </Typography>
                            </Box>

                            {/* Pricing Hidden for School View */}
                          </Box>
                        )}

                        {isAllImportCheckedForFuture && (
                          <Box
                            sx={{
                              p: 1.2,
                              borderRadius: "8px",
                              border: "2px solid #2563eb",
                              bgcolor: "rgba(37, 99, 235, 0.01)",
                              boxShadow: "0 4px 8px -4px rgba(37, 99, 235, 0.08)",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              minHeight: "85px",
                            }}
                          >
                            <Box>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.8 }}>
                                <Box
                                  sx={{
                                    width: 26, height: 26,
                                    borderRadius: "6px",
                                    bgcolor: "rgba(37, 99, 235, 0.12)",
                                    color: "#2563eb",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 16 12 21 17 16"/><line x1="12" y1="21" x2="12" y2="9"/></svg>
                                </Box>
                                <BpCheckbox
                                  checked={true}
                                  disabled
                                  sx={{ transform: "scale(0.75)", p: 0.1 }}
                                />
                              </Box>

                              <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "#0f172a", mb: 0.2 }}>
                                Import
                              </Typography>
                              <Typography sx={{ fontSize: "9px", color: "#64748b", mb: 1 }}>
                                Enables import/upload actions across all eligible school modules.
                              </Typography>
                            </Box>

                            {/* Pricing Hidden for School View */}
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            disabled={actionLoading}
            onClick={async () => {
              try {
                setActionLoading(true);
                const res = await subscriptionService.instantUpgrade({
                  futurePlanId: futurePlan._id,
                });
                if (res.status === 200) {
                  setOpenModal(false);
                  window.location.reload();
                }
              } catch (error: any) {
                console.error(error);
              } finally {
                setActionLoading(false);
              }
            }}
            sx={{
              borderRadius: "25px",
              px: 4,
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              background:
                "var(--theme-gradient, var(--primary-color)) !important",
              color: "#fff !important",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Activate Instantly"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
