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
        '& fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            transition: 'all 0.3s ease !important',
        },
        '&:hover:not(.Mui-focused) fieldset': {
            borderColor: 'var(--primary-color, #adb5bd) !important',
            opacity: 0.7,
        },
        '&.Mui-focused fieldset': {
            borderColor: 'var(--primary-color, #942F15) !important',
            borderWidth: '1px !important',
            boxShadow: '0 0 0 3px rgba(var(--primary-color-rgb), 0.1) !important',
        },
        '&.Mui-disabled': {
            backgroundColor: '#f8f9fa !important',
            '& fieldset': {
                borderColor: '#e9ecef !important',
            },
        },
    },
    '& .MuiOutlinedInput-input, & input': {
        padding: '0 15px !important',
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
