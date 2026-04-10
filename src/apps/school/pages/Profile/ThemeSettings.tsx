import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Button,
  OutlinedInput,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  RestartAlt as ResetIcon,
  FormatSize as FontIcon,
  SmartButton as ButtonIcon,
  DashboardCustomize as ComponentIcon,
  Save as SaveIcon,
  AutoAwesome as AIIcon,
} from "@mui/icons-material";
import { updateTheme, resetTheme, persistTheme, type ThemeState } from "@/redux/slices/themeSlice";
import type { RootState } from "@/redux/Store";
import toast from "react-hot-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { schoolAdminPermission } from "@/apps/common/StaticArrayData";
import { useColorExtractor } from "@/hooks/useColorExtractor";
import { authService } from "@/api/services/auth.service";
import { labelSx, inputSx } from "@/utils/styles/commonSx";

const imageBaseUrl = import.meta.env.VITE_BASE_URL_IMAGE;


const ColorPicker = ({
  label,
  field,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  field: keyof ThemeState;
  value: string;
  onChange: (field: keyof ThemeState, value: string) => void;
  disabled?: boolean;
}) => (
  <Box sx={{ mb: 1 }}>
    <Typography sx={labelSx}>{label}</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <OutlinedInput
        fullWidth
        disabled={disabled}
        value={value.toUpperCase()}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder="#000000"
        sx={inputSx}
      />
      <Box
        sx={{
          minWidth: "40px",
          width: "40px",
          height: "40px",
          borderRadius: "6px",
          backgroundColor: value,
          border: "1px solid #E4E7EC",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <input
          type="color"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: -5,
            left: -5,
            width: "150%",
            height: "150%",
            border: "none",
            padding: 0,
            cursor: "pointer",
            opacity: 0,
          }}
        />
      </Box>
    </Box>
  </Box>
);

const ThemeSettings = () => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const theme = useSelector((state: RootState) => state.ThemeReducer);
  const initialTheme = useRef<ThemeState | null>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  const { extractColors, extracting } = useColorExtractor();

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res: any = await authService.getSchoolProfile();
      if (res.status === 200 || res.status === 201) {
        setSchoolData({
          ...res.data,
          logoUrl: res.data.logo ? `${imageBaseUrl}/${res.data.logo}` : ""
        });
      }
    } catch (e) {
      console.error("Failed to fetch school profile", e);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTheme.current) {
      initialTheme.current = theme;
    }
    fetchProfile();
  }, []);

  const canEdit = hasPermission(schoolAdminPermission.theme.update);

  const handleChange = (field: keyof ThemeState, value: any) => {
    if (!canEdit) return;
    dispatch(updateTheme({ [field]: value }));
  };

  const handleReset = () => {
    dispatch(resetTheme());
    toast.success("Theme reset to defaults");
  };

  const handleAiSuggest = async () => {
    if (!schoolData?.logoUrl) {
      toast.error("School logo not found. Please upload a logo in School Details first.");
      return;
    }

    const suggested = await extractColors(schoolData.logoUrl);
    if (suggested && suggested.success) {
      dispatch(updateTheme({
        primaryColor: suggested.primary,
        secondaryColor: suggested.secondary,
        textPrimary: suggested.textPrimary,
        textSecondary: suggested.textSecondary,
        linkColor: suggested.linkColor,
        buttonBg: suggested.buttonBg,
        buttonText: suggested.buttonText,
        buttonHoverBg: suggested.buttonHoverBg,
        sidebarBg: suggested.sidebarBg,
        sidebarActiveBg: suggested.sidebarActiveBg,
        headerBg: suggested.headerBg,
        pageBg: suggested.pageBg,
        cardBg: suggested.cardBg,
      }));
      toast.success("Theme suggested based on your school logo!", {
        icon: '✨',
        duration: 4000
      });
    } else {
      toast.error("Failed to analyze logo colors. Make sure the logo is accessible.");
    }
  };

  const SectionHeader = ({ icon: Icon, title, showReset, children }: { icon: any; title: string; showReset?: boolean; children?: React.ReactNode }) => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      pb: 1.5,
      borderBottom: '1px solid #F0F0F0',
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Icon sx={{ color: 'var(--primary-color, #942F15)', fontSize: 24 }} />
        <Typography sx={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary, #344054)',
          fontFamily: 'var(--font-family)'
        }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {children}
        {showReset && canEdit && (
          <Button
            variant="text"
            size="small"
            onClick={handleReset}
            startIcon={<ResetIcon sx={{ fontSize: 18 }} />}
            sx={{
              color: '#667085',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': { backgroundColor: 'transparent', color: 'var(--primary-color, #942F15)' }
            }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box className="common-card profile-main" sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionHeader icon={PaletteIcon} title="School Branding Colors" showReset>
        {canEdit && (
          <Tooltip title="Magically set colors based on your school logo" arrow>
            <Button
              variant="contained"
              disabled={extracting || profileLoading}
              onClick={handleAiSuggest}
              startIcon={extracting ? <CircularProgress size={16} color="inherit" /> : <AIIcon />}
              sx={{
                background: `linear-gradient(45deg, ${theme.primaryColor} 30%, ${theme.secondaryColor || theme.primaryColor} 90%)`,
                color: theme.buttonText,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                boxShadow: `0 4px 12px ${theme.primaryColor}40`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: `0 6px 16px ${theme.primaryColor}60`,
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  background: '#F2F4F7',
                  color: '#98A2B3'
                }
              }}
            >
              {extracting ? "Analyzing Logo..." : "Manage theme with AI"}
            </Button>
          </Tooltip>
        )}
      </SectionHeader>

      {/* Preview Section */}
      {schoolData?.logoUrl && (
        <Box sx={{
          mb: 4,
          p: 2,
          borderRadius: '12px',
          backgroundColor: '#F9FAFB',
          border: '1px solid #EAECF0',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{
            width: 'fit-content',
            maxWidth: 150,
            height: 'auto',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #E4E7EC',
            backgroundColor: 'transparent',
            p: 0.5
          }}>
            <img 
              src={schoolData.logoUrl} 
              alt="School Logo" 
              style={{ 
                display: 'block',
                width: 'auto', 
                height: 'auto', 
                maxWidth: '100px', 
                maxHeight: '60px', 
                objectFit: 'contain' 
              }} 
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#344054' }}>AI Color Source: School Logo</Typography>
            <Typography sx={{ fontSize: '12px', color: '#667085' }}>Update your logo in School Details to get new suggestions.</Typography>
          </Box>
        </Box>
      )}

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ColorPicker label="Primary Color" field="primaryColor" value={theme.primaryColor} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ColorPicker label="Secondary Color (Gradient End)" field="secondaryColor" value={theme.secondaryColor} onChange={handleChange} disabled={!canEdit} />
        </Grid>
      </Grid>

      <SectionHeader icon={FontIcon} title="Typography & Font Settings" />
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Text Primary" field="textPrimary" value={theme.textPrimary} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Text Secondary" field="textSecondary" value={theme.textSecondary} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Links" field="linkColor" value={theme.linkColor} onChange={handleChange} disabled={!canEdit} />
        </Grid>
      </Grid>

      <SectionHeader icon={ButtonIcon} title="Button Customization" />
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Button Background" field="buttonBg" value={theme.buttonBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Button Text" field="buttonText" value={theme.buttonText} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Button Hover" field="buttonHoverBg" value={theme.buttonHoverBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
      </Grid>

      <SectionHeader icon={ComponentIcon} title="Surface & Component Colors" />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Sidebar Background" field="sidebarBg" value={theme.sidebarBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Sidebar Active BG" field="sidebarActiveBg" value={theme.sidebarActiveBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Sidebar Active Text" field="sidebarActiveText" value={theme.sidebarActiveText} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Header Background" field="headerBg" value={theme.headerBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Page Background" field="pageBg" value={theme.pageBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ColorPicker label="Card Background" field="cardBg" value={theme.cardBg} onChange={handleChange} disabled={!canEdit} />
        </Grid>
      </Grid>

      {canEdit && (
        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end', gap: 2, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (initialTheme.current) {
                dispatch(updateTheme(initialTheme.current));
                toast.success("Changes discarded");
              }
            }}
            sx={{
              minWidth: { xs: '100%', sm: '130px' },
              height: '40px',
              borderRadius: '8px',
              color: '#667085',
              borderColor: '#D0D5DD',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#F9FAFB',
                borderColor: '#D0D5DD',
              },
            }}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            className="admin-btn-theme"
            onClick={() => {
              dispatch(persistTheme(theme) as any);
              initialTheme.current = theme;
            }}
            sx={{
              minWidth: { xs: '100%', sm: '150px' },
              height: '40px',
              borderRadius: '8px',
              background: 'var(--theme-gradient, var(--primary-color, #942F15)) !important',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'var(--theme-gradient, var(--primary-color))',
                opacity: 0.8,
                boxShadow: 'none',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <SaveIcon sx={{ fontSize: 18 }} />
              Save Changes
            </Box>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ThemeSettings;
