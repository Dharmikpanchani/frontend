import { useEffect, useState, useMemo } from "react";
import { alpha } from "@mui/material/styles";
import {
    Box,
    Typography,
    TextField,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    InputAdornment,
} from "@mui/material";
import {
    Assignment as AssignmentIcon,
    SignalCellularAlt as LimitsIcon,
    Security as SecurityIcon,
    Verified as VerifiedIcon,
    AccessTime as ExpiryIcon
} from "@mui/icons-material";
import { planStaticData as roleStaticData } from "@/apps/common/StaticArrayData";
import { BpCheckbox } from "../../component/schoolCommon/commonCssFunction/cssFunction";
import { CommonLoader } from "@/apps/common/loader/Loader";
import { labelSx, inputSx } from "@/utils/styles/commonSx";
import { authService } from "@/api/services/auth.service";
import moment from "moment";
import { toasterError } from "@/utils/toaster/Toaster";

export default function PlanView() {
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);

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

    useEffect(() => {
        fetchSchoolProfile();
    }, []);

    const selectedPlan = profileData?.planData;
    const planExpiryDate = profileData?.PlanExptyDate;

    const initialValues = useMemo(() => {
        if (selectedPlan) {
            return {
                planName: selectedPlan.planName || "",
                price: selectedPlan.price || "0",
                billingCycle: selectedPlan.billingCycle || "monthly",
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
                backgroundColor: (theme) => alpha(theme.palette.primary.main || '#942F15', 0.1),
                color: 'var(--primary-color, #942F15)'
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

    return (
        <Box className="admin-tabpanel-main" sx={{ p: 0 }}>
            {/* Expiry Banner */}
            <Box 
                sx={{ 
                    mb: 4, 
                    p: 2.5, 
                    borderRadius: '12px', 
                    background: 'var(--theme-gradient, linear-gradient(135deg, #942F15 0%, #E35D5B 100%))',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 15px rgba(148, 47, 21, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
                    <Box sx={{ 
                        width: 45, 
                        height: 45, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                    }}>
                        <ExpiryIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 500, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Current Plan Expiry
                        </Typography>
                        <Typography sx={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                            {planExpiryDate ? moment.unix(planExpiryDate).format("MMMM DD, YYYY") : "No Expiry Set"}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ 
                    px: 2, 
                    py: 1, 
                    borderRadius: '8px', 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    zIndex: 1
                }}>
                    <VerifiedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Active Status</Typography>
                </Box>
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Box sx={{ position: 'absolute', bottom: -50, left: 100, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>

            <Box sx={{ maxWidth: 1100 }}>
                {/* 1. Plan Details */}
                <SectionTitle icon={AssignmentIcon} title="Plan Overview" />
                <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                        <Typography sx={labelSx}>Plan Name</Typography>
                        <TextField fullWidth variant="outlined" sx={inputSx} value={initialValues.planName} disabled />
                    </Box>

                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                        <Typography sx={labelSx}>Price</Typography>
                        <TextField 
                            fullWidth 
                            variant="outlined" 
                            sx={inputSx} 
                            value={initialValues.price} 
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
                            value={initialValues.billingCycle.charAt(0).toUpperCase() + initialValues.billingCycle.slice(1)} 
                            disabled 
                        />
                    </Box>
                </Box>

                {/* 2. Usage Limits */}
                <SectionTitle icon={LimitsIcon} title="Usage & Limits" />
                <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={{ xs: 2, sm: 3 }} sx={{ mb: 6 }}>
                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                        <Typography sx={labelSx}>Max Students</Typography>
                        <TextField fullWidth variant="outlined" sx={inputSx} value={initialValues.maxStudents} disabled />
                    </Box>
                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                        <Typography sx={labelSx}>Max Teachers</Typography>
                        <TextField fullWidth variant="outlined" sx={inputSx} value={initialValues.maxTeachers} disabled />
                    </Box>
                    <Box gridColumn={{ xs: 'span 12', sm: 'span 4' }}>
                        <Typography sx={labelSx}>Max Classes</Typography>
                        <TextField fullWidth variant="outlined" sx={inputSx} value={initialValues.maxClasses} disabled />
                    </Box>
                </Box>

                {/* 3. Permissions */}
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
                                        <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color, #942F15)', py: 1.5 }}>Admin & Management</TableCell>
                                        <TableCell className="table-td" align="center">
                                            <BpCheckbox checked={isGroupChecked(adminModuleIds)} disabled />
                                        </TableCell>
                                        <TableCell colSpan={5} />
                                    </TableRow>
                                );
                                if (module.mainTitleId === "teacher") rows.push(
                                    <TableRow key="master_hr" sx={{ bgcolor: '#f0f4f8' }}>
                                        <TableCell className="table-td" sx={{ fontWeight: 700, color: 'var(--primary-color, #942F15)', py: 1.5 }}>Teacher Master</TableCell>
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
        </Box>
    );
}
