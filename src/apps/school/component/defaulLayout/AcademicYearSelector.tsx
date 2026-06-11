import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { CalendarMonth, ExpandMore } from "@mui/icons-material";
import { setAcademicYear } from "@/redux/slices/academicYearSlice";
import type { RootState } from "@/redux/Store";

const getAvailableYears = (): number[] => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const currentYear = month >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const years: number[] = [];
  for (let y = 2020; y <= currentYear; y++) {
    years.push(y);
  }
  return years.reverse();
};

export default function AcademicYearSelector() {
  const dispatch = useDispatch();
  const { startYear } = useSelector(
    (state: RootState) => state.AcademicYearReducer,
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const years = getAvailableYears();

  const handleSelect = (year: number) => {
    dispatch(setAcademicYear({ startYear: year, endYear: year }));
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: "8px",
          padding: "5px 10px",
          textTransform: "none",
          color: "var(--header-text, #fff)",
          fontFamily: "var(--font-family)",
          minWidth: "auto",
          "&:hover": { background: "rgba(255,255,255,0.22)" },
        }}
      >
        <CalendarMonth sx={{ fontSize: "16px", color: "inherit" }} />
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: "600",
            fontFamily: "var(--font-family)",
            color: "inherit",
            letterSpacing: "0.3px",
            display: { xs: "none", sm: "block" },
          }}
        >
          {startYear}-{startYear + 1}
        </Typography>
        <ExpandMore sx={{ fontSize: "15px", color: "inherit", display: { xs: "none", sm: "block" } }} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 115,
            maxHeight: 260,
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: "var(--border-radius, 10px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            border: "1px solid var(--card-border, rgba(0,0,0,0.07))",
            backgroundColor: "var(--card-bg, #fff)",
            "&::-webkit-scrollbar": {
              width: "4.8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "var(--primary-color, #002147)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(var(--primary-color-rgb, 0, 33, 71), 0.8)",
            },
            "& .MuiMenuItem-root": {
              fontSize: "13px",
              fontFamily: "var(--font-family)",
              fontWeight: "500",
              px: 2,
              py: 1,
              color: "var(--text-primary)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(var(--primary-color-rgb, 0, 33, 71), 0.08)",
                color: "var(--primary-color, #002147)",
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(var(--primary-color-rgb, 0, 33, 71), 0.15)",
                color: "var(--primary-color, #002147)",
                fontWeight: "700",
                "&:hover": {
                  backgroundColor: "rgba(var(--primary-color-rgb, 0, 33, 71), 0.2)",
                  color: "var(--primary-color, #002147)",
                },
              },
            },
          },
        }}
      >
        {years.map((year) => (
          <MenuItem
            key={year}
            selected={year === startYear}
            onClick={() => handleSelect(year)}
          >
            {year}-{year + 1}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
