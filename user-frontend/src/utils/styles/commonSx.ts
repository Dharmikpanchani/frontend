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
    // Override inherited input padding from inputSx
    '& .MuiOutlinedInput-input, & input': {
        padding: '0 !important',
        fontFamily: "var(--font-family, 'Poppins', sans-serif) !important",
        fontSize: '14px !important',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        '&.Mui-disabled': {
            WebkitTextFillColor: '#6b7280 !important',
        },
    },
    // Use SAME key as inputSx to fully override (including MuiAutocomplete-inputRoot)
    '&.MuiOutlinedInput-root, & .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root, & .MuiInputBase-root': {
        height: 'auto',
        minHeight: '40px',
        backgroundColor: '#ffffff !important',
        borderRadius: 'var(--button-radius, 6px) !important',
        '& .MuiOutlinedInput-notchedOutline, & fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            borderWidth: '1px !important',
            transition: 'all 0.3s ease !important',
        },
        '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline, &:hover:not(.Mui-focused) fieldset': {
            borderColor: 'var(--input-border, #ced4da) !important',
            opacity: 1,
        },
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
        // placeholder state → 10px left padding, chip state → 5px left padding
        '&.MuiAutocomplete-inputRoot': {
            padding: '5px 36px 5px 15px !important',  // default: no chips (placeholder)
            gap: '4px',
            flexWrap: 'wrap',
            display: 'flex',
            alignItems: 'center',
            // When chips present → reduce left padding, no gap needed
            '&:has(.MuiAutocomplete-tag)': {
                paddingLeft: '5px !important',
            },
            '& .MuiAutocomplete-input': {
                padding: '0 !important',
                width: 'auto !important',
                minWidth: '80px !important',
                flexGrow: 1,
                height: 'auto !important',
                lineHeight: '28px',
            }
        },
        '& .MuiAutocomplete-tag': {
            margin: '1px !important',
        }
    },
};
