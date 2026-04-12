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
    '&.MuiOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root, & .MuiInputBase-root': {
        height: '40px',
        backgroundColor: '#ffffff !important',
        borderRadius: 'var(--button-radius, 6px) !important',
        // default border
        '& .MuiOutlinedInput-notchedOutline, & fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            borderWidth: '1px !important',
            transition: 'all 0.3s ease !important',
        },
        // hover
        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline, &:hover:not(.Mui-focused) fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            opacity: 1,
        },
        // focus
        '&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset': {
            borderColor: 'var(--primary-color, #942F15) !important',
            borderWidth: '1px !important',
            boxShadow: 'none !important',
        },
        '&.Mui-disabled': {
            backgroundColor: '#f8f9fa !important',
            '& .MuiOutlinedInput-notchedOutline, & fieldset': {
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
            WebkitTextFillColor: '#6b7280 !important',
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
