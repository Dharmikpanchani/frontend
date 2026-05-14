import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
    Box,
    Typography,
    TextField,
    Button,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
} from "@mui/material";
import {
    Assignment as AssignmentIcon,
    Security as SecurityIcon,
    Verified as VerifiedIcon,
    AccessTime as ExpiryIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import { planStaticData as roleStaticData } from "@/apps/common/StaticArrayData";
import { subscriptionService } from "@/api/services/subscription.service";
import { BpCheckbox } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { authService } from "@/api/services/auth.service";
import moment from "moment";
import { toasterError } from "@/utils/toaster/Toaster";

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
    const planExpiryDate = profileData?.PlanExptyDate;

    const initialValues = useMemo(() => {
        if (selectedPlan) {
            return {
                planName: selectedPlan.planName || "",
                monPrice: selectedPlan.monPrice || "0",
                monOfferPrice: selectedPlan.monOfferPrice || "0",
                yerPrice: selectedPlan.yerPrice || "0",
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

    const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 1, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: (theme) => alpha(theme.palette.primary.main || '#002147', 0.1),
                color: 'var(--primary-color)'
            }}>
                <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: '17px', fontWeight: 600, color: '#1f2937', fontFamily: "'Poppins', sans-serif" }}>
                {title}
            </Typography>
        </Box>
    );

    // Filter categories for the table logic
    const adminModuleIds = ["role", "admin_user"];
    const masterModuleIds = ["teacher", "department", "subject", "class", "section"];

    const isTypeAllChecked = (typeId: string) => {
        if (!initialValues) return false;
        const allKeys = roleStaticData.flatMap((m: any) => m.subRole.some((sr: any) => sr.titleId === typeId) ? [`${m.mainTitleId}_${typeId}`] : []);
        return allKeys.length > 0 && allKeys.every((k) => initialValues.permissions.includes(k));
    };

    const isGroupChecked = (groupIds: string[]) => {
        if (!initialValues) return false;
        const groupModules = roleStaticData.filter(m => groupIds.includes(m.mainTitleId));
        return groupModules.length > 0 && groupModules.every(module =>
            module.subRole.filter((sr: any) => sr.is_show).every((sr: any) => initialValues.permissions.includes(`${module.mainTitleId}_${sr.titleId}`))
        );
    };

    if (loading) return <CommonLoader />;

    if (!initialValues) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">No active plan found for this school.</Typography>
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
                    borderRadius: '16px', 
                    background: 'var(--theme-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    flexDirection: { xs: 'column', md: 'row' },
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, zIndex: 1 }}>
                    <Box sx={{ 
                        width: 58, 
                        height: 58, 
                        borderRadius: '14px', 
                        bgcolor: 'rgba(255,255,255,0.18)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        flexShrink: 0
                    }}>
                        <ExpiryIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.7 }}>
                            <Typography sx={{ 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                opacity: 0.9, 
                                textTransform: 'uppercase', 
                                letterSpacing: '1.2px',
                                fontFamily: "'Inter', sans-serif"
                            }}>
                                Subscription Expiry
                            </Typography>
                            <Box sx={{ 
                                px: 1.5, 
                                py: 0.3, 
                                borderRadius: '20px', 
                                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                                border: '1px solid rgba(255, 255, 255, 0.35)',
                                backdropFilter: 'blur(4px)'
                            }}>
                                <VerifiedIcon sx={{ fontSize: 13, color: 'white' }} />
                                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>ACTIVE</Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ 
                            fontSize: { xs: '20px', sm: '26px' }, 
                            fontWeight: 800, 
                            fontFamily: "'Poppins', sans-serif",
                            lineHeight: 1.1
                        }}>
                            {planExpiryDate ? (planExpiryDate < 10000000000 ? moment.unix(planExpiryDate).format("MMMM DD, YYYY") : moment(planExpiryDate).format("MMMM DD, YYYY")) : "No Expiry Set"}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    {futurePlan && (
                        <Button
                            variant="outlined"
                            onClick={() => setOpenModal(true)}
                            sx={{
                                color: '#FFFFFF !important',
                                background: 'rgba(255, 255, 255, 0.15) !important',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '25px',
                                px: 3,
                                py: 1.1,
                                fontSize: '14px',
                                whiteSpace: 'nowrap',
                                border: '1px solid rgba(255, 255, 255, 0.5) !important',
                                backdropFilter: 'blur(8px)',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.25) !important',
                                    border: '1px solid rgba(255, 255, 255, 0.9) !important',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                                flex: { xs: 1, sm: 'initial' }
                            }}
                        >
                            Available Future Plans
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => navigate("/user-plan")}
                        sx={{
                            background: 'var(--primary-color) !important',
                            color: '#FFFFFF !important',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '25px',
                            px: 3.5,
                            py: 1.1,
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            border: '1px solid rgba(255, 255, 255, 0.2) !important',
                            boxShadow: '0 8px 20px -4px rgba(0,0,0,0.3)',
                            '&:hover': {
                                background: 'var(--selected-color, var(--primary-color)) !important',
                                opacity: 0.95,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 24px -5px rgba(0,0,0,0.4)'
                            },
                            transition: 'all 0.3s ease',
                            flex: { xs: 1, sm: 'initial' }
                        }}
                    >
                        Upgrade Plan
                    </Button>
                </Box>
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
                <Box sx={{ position: 'absolute', bottom: -60, left: '20%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} />
            </Box>

            <Box sx={{ maxWidth: 1100 }}>
                {/* 1. Plan Details */}
                <SectionTitle icon={AssignmentIcon} title="Plan Overview" />
                <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                    <Box gridColumn={{ xs: 'span 12', sm: isFreePlan ? 'span 12' : 'span 4' }}>
                        <Typography sx={labelSx}>Plan Name</Typography>
                        <TextField fullWidth variant="outlined" sx={inputSx} value={initialValues.planName} disabled />
                    </Box>

                    {!isFreePlan && (
                        <>
                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                <Typography sx={labelSx}>
                                    {initialValues.billingCycle === "6month" ? "6 Months Price" : "Yearly Price"}
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    sx={inputSx}
                                    value={initialValues.billingCycle === "6month" ? initialValues.monPrice : initialValues.yerPrice}
                                    disabled
                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                />
                            </Box>
         
                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                <Typography sx={labelSx}>
                                    {initialValues.billingCycle === "6month" ? "6 Months Offer Price" : "Yearly Offer Price"}
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    sx={inputSx}
                                    value={initialValues.billingCycle === "6month" ? initialValues.monOfferPrice : initialValues.yerOfferPrice}
                                    disabled
                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                />
                            </Box>

                            <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                                <Typography sx={labelSx}>Billing Cycle</Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    sx={inputSx}
                                    value={initialValues.billingCycle === "6month" ? "6 Months" : initialValues.billingCycle.charAt(0).toUpperCase() + initialValues.billingCycle.slice(1)}
                                    disabled
                                />
                            </Box>
                        </>
                    )}
                </Box>

                {/* 2. Permissions */}
                <SectionTitle icon={SecurityIcon} title="Included Features" />
                <TableContainer component={Paper} className="table-container permission-table-container" sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: '12px', mb: 4 }}>
                    <Table className="table">
                        <TableHead className="table-head" sx={{ bgcolor: '#F9FAFB' }}>
                            <TableRow className="table-row">
                                <TableCell className="table-th" sx={{ fontWeight: 700, py: 2 }}>Module Name</TableCell>
                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>All</TableCell>
                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>View</TableCell>
                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Add / Mark</TableCell>
                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Edit</TableCell>
                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Delete / Collect</TableCell>
                                <TableCell className="table-th" align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody className="table-body">
                            <TableRow className="table-row all-row" sx={{ bgcolor: '#fafafa' }}>
                                <TableCell className="table-td" sx={{ fontWeight: 600 }}>Apply to All Modules</TableCell>
                                <TableCell className="table-td" align="center">-</TableCell>
                                {['view', 'add', 'edit', 'delete', 'status'].map((typeId) => (
                                    <TableCell key={typeId} className="table-td" align="center">
                                        <BpCheckbox checked={isTypeAllChecked(typeId)} disabled />
                                    </TableCell>
                                ))}
                            </TableRow>

                            {roleStaticData.map((module: any) => {
                                const isMaster = masterModuleIds.includes(module.mainTitleId);
                                const isAdmin = adminModuleIds.includes(module.mainTitleId);
                                const rows = [];

                                if (module.mainTitleId === "role") rows.push(
                                    <TableRow key="admin_hr" sx={{ bgcolor: '#f0f4f8' }}>
                                        <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color)', py: 1.5 }}>Admin & Management</TableCell>
                                        <TableCell className="table-td" align="center">
                                            <BpCheckbox checked={isGroupChecked(adminModuleIds)} disabled />
                                        </TableCell>
                                        <TableCell colSpan={5} />
                                    </TableRow>
                                );
                                if (module.mainTitleId === "teacher") rows.push(
                                    <TableRow key="master_hr" sx={{ bgcolor: '#f0f4f8' }}>
                                        <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color)', py: 1.5 }}>Teacher Master</TableCell>
                                        <TableCell className="table-td" align="center">
                                            <BpCheckbox checked={isGroupChecked(masterModuleIds)} disabled />
                                        </TableCell>
                                        <TableCell colSpan={5} />
                                    </TableRow>
                                );

                                rows.push(
                                    <TableRow key={module.mainTitleId} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                                        <TableCell className="table-td" sx={{ py: 2, pl: (isMaster || isAdmin) ? 4 : 2 }}>{module.mainTitle}</TableCell>
                                        <TableCell className="table-td" align="center">
                                            <BpCheckbox checked={module.subRole.filter((sr: any) => sr.is_show).every((sr: any) => initialValues.permissions.includes(`${module.mainTitleId}_${sr.titleId}`))} disabled />
                                        </TableCell>
                                        {['view', 'add', 'edit', 'delete', 'status'].map((typeId) => {
                                            let actualTypeId = typeId;
                                            if (module.mainTitleId === 'attendance' && typeId === 'add') actualTypeId = 'mark';
                                            if (module.mainTitleId === 'fees' && typeId === 'delete') actualTypeId = 'collect';

                                            const subRole = module.subRole.find((sr: any) => sr.titleId === actualTypeId || sr.titleId === typeId);
                                            const key = `${module.mainTitleId}_${subRole?.titleId}`;
                                            return (
                                                <TableCell key={typeId} className="table-td" align="center">
                                                    {subRole?.is_show ? <BpCheckbox checked={initialValues.permissions.includes(key)} disabled /> : "-"}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                                return rows;
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Future Plan Modal */}
            <Dialog 
                open={openModal} 
                onClose={() => !actionLoading && setOpenModal(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        padding: 1,
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)' }}>
                        Upcoming Plan Details
                    </Typography>
                    <IconButton onClick={() => setOpenModal(false)} disabled={actionLoading}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ py: 2 }}>
                    {futurePlan && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <Typography sx={{ fontSize: '13px', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Plan Name</Typography>
                                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                                    {futurePlan.newPlanSnapshot?.planName || futurePlan.newPlanId?.planName || 'Plan'}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <Typography sx={{ fontSize: '12px', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Billing Cycle</Typography>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                                        {futurePlan.newPlanSnapshot?.billingCycle || 'Yearly'}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <Typography sx={{ fontSize: '12px', color: '#64748b', mb: 0.5, fontWeight: 600 }}>Price</Typography>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                                        ₹{futurePlan.amountPaid || futurePlan.newPlanSnapshot?.price || 0}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(0, 80, 157, 0.05)', border: '1px solid rgba(0, 80, 157, 0.15)' }}>
                                    <Typography sx={{ fontSize: '12px', color: 'var(--primary-color)', mb: 0.5, fontWeight: 700 }}>Booked On (Today)</Typography>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                                        {moment(futurePlan.createdAt).format("MMMM DD, YYYY")}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 165, 0, 0.08)', border: '1px solid rgba(255, 165, 0, 0.2)' }}>
                                    <Typography sx={{ fontSize: '12px', color: 'var(--secondary-color)', mb: 0.5, fontWeight: 700 }}>Scheduled Expiry Date</Typography>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                                        {(() => {
                                            const cycle = futurePlan.newPlanSnapshot?.billingCycle || 'yearly';
                                            const baseDate = moment(futurePlan.createdAt);
                                            if (cycle === 'monthly') baseDate.add(1, 'month');
                                            else if (cycle === '6month') baseDate.add(6, 'months');
                                            else if (cycle === 'yearly') baseDate.add(1, 'year');
                                            else baseDate.add(30, 'days');
                                            return baseDate.format("MMMM DD, YYYY");
                                        })()}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <Typography sx={{ fontSize: '13px', color: '#64748b', mb: 1.5, fontWeight: 700 }}>Included Modules & Features</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {roleStaticData
                                        .filter((module: any) => {
                                            const perms = futurePlan.newPlanSnapshot?.permissions || futurePlan.newPlanId?.permissions || [];
                                            return module.subRole.some((sr: any) => perms.includes(`${module.mainTitleId}_${sr.titleId}`));
                                        })
                                        .map((module: any) => (
                                            <Chip 
                                                key={module.mainTitleId}
                                                label={`✨ ${module.mainTitle}`}
                                                sx={{ 
                                                    bgcolor: 'white', 
                                                    color: 'var(--primary-color)', 
                                                    border: '1px solid var(--primary-color)', 
                                                    fontWeight: 700,
                                                    borderRadius: '10px',
                                                    px: 1,
                                                    py: 1.5,
                                                    fontSize: '13px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                            />
                                        ))
                                    }
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" 
                        disabled={actionLoading}
                        onClick={async () => {
                            try {
                                setActionLoading(true);
                                const res = await subscriptionService.instantUpgrade({ futurePlanId: futurePlan._id });
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
                            borderRadius: '25px', 
                            px: 4, 
                            py: 1.2, 
                            fontWeight: 700, 
                            textTransform: 'none',
                            background: 'var(--theme-gradient, var(--primary-color)) !important', 
                            color: '#fff !important',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                    >
                        {actionLoading ? "Activating..." : "Activate Instantly"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
