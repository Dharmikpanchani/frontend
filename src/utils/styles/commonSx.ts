import type { SxProps, Theme } from "@mui/material";

export const labelSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#344054',
    fontFamily: "'PlusJakartaSans-SemiBold', sans-serif !important",
    minHeight: 'auto',
    '& svg': {
        fontSize: '16px',
        color: 'var(--primary-color, #942F15)',
    }
};

export const inputSx: SxProps<Theme> = {
    height: '40px',
    backgroundColor: '#ffffff !important',
    borderRadius: 'var(--button-radius, 6px) !important',
    '&.MuiOutlinedInput-root, & .MuiOutlinedInput-root': {
        height: '40px',
        backgroundColor: '#ffffff !important',
        borderRadius: 'var(--button-radius, 6px) !important',
        padding: '0 !important',
        border: 'none !important', // Ensure no double border from the container
        '& fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            transition: 'all 0.3s ease !important',
        },
        '&:hover:not(.Mui-focused) fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important', // Keep it grey on hover unless focused
            opacity: 1,
        },
        '&.Mui-focused fieldset': {
            borderColor: 'var(--primary-color, #942F15) !important',
            borderWidth: '1px !important',
            boxShadow: 'none !important', // Remove shadow that looks like a second border
        },
        '&.Mui-disabled': {
            backgroundColor: '#f8f9fa !important',
            '& fieldset': {
                borderColor: '#e9ecef !important',
            },
        },
        // Target Autocomplete specific root padding
        '&.MuiAutocomplete-inputRoot': {
            padding: '0 14px !important',
            display: 'flex',
            alignItems: 'center',
            '& .MuiAutocomplete-input': {
                padding: '0 !important',
                height: '40px',
            }
        }
    },
    '& .MuiOutlinedInput-input, & input': {
        padding: '0 14px !important',
        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
        fontSize: '14px !important',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        '&.Mui-disabled': {
            '-webkit-text-fill-color': '#6b7280 !important',
        },
    },
};

export const multiInputSx: SxProps<Theme> = {
    ...inputSx,
    height: 'auto',
    minHeight: '40px',
    '&.MuiOutlinedInput-root, & .MuiOutlinedInput-root': {
        height: 'auto',
        minHeight: '40px',
        backgroundColor: '#ffffff !important',
        borderRadius: 'var(--button-radius, 6px) !important',
        padding: '0 8px !important', // Root padding for chips alignment
        border: 'none !important',
        '& fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            transition: 'all 0.3s ease !important',
        },
        '&:hover:not(.Mui-focused) fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'var(--primary-color, #942F15) !important',
            borderWidth: '1px !important',
            boxShadow: 'none !important',
        },
        '&.Mui-disabled': {
            backgroundColor: '#f8f9fa !important',
            '& fieldset': {
                borderColor: '#e9ecef !important',
            },
        },
        '& .MuiAutocomplete-input': {
            padding: '7px 4px !important',
            height: 'auto !important',
        }
    },
};
