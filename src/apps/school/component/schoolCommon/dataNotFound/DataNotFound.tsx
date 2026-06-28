import React from "react";
import { TableRow, TableCell, Box, Typography } from "@mui/material";

interface DataNotFoundProps {
  image?: string;
  text?: string;
  colSpan?: number;
}

const SchoolEmptyStateSvg = () => (
  <svg
    width="310"
    height="200"
    viewBox="0 0 280 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="themeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--primary-color, #002147)" />
        <stop offset="100%" stopColor="var(--secondary-color, #00509d)" />
      </linearGradient>
      <linearGradient id="themeGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--primary-color, #002147)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="var(--secondary-color, #00509d)" stopOpacity="0.03" />
      </linearGradient>
    </defs>

    {/* Background Decorative Circle */}
    <circle cx="140" cy="90" r="70" fill="url(#themeGradientLight)" stroke="url(#themeGradient)" strokeWidth="1" strokeDasharray="5 5" opacity="0.7" />

    {/* Clipboard (Right Side) */}
    <g transform="translate(155, 62)">
      {/* Clipboard Backing */}
      <rect x="0" y="0" width="46" height="60" rx="6" fill="#ffffff" stroke="var(--primary-color, #002147)" strokeWidth="2" />
      {/* Clip */}
      <path d="M13 -2 h20 v6 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 z" fill="url(#themeGradient)" />
      <circle cx="23" cy="1" r="1.5" fill="#ffffff" />
      {/* Sheet lines */}
      <line x1="8" y1="16" x2="38" y2="16" stroke="var(--primary-color, #002147)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="8" y1="26" x2="38" y2="26" stroke="var(--primary-color, #002147)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="8" y1="36" x2="28" y2="36" stroke="var(--primary-color, #002147)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="8" y1="46" x2="20" y2="46" stroke="var(--primary-color, #002147)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    </g>

    {/* Stack of Books (Center) */}
    <g transform="translate(82, 78)">
      {/* Bottom Book */}
      <rect x="5" y="34" width="75" height="12" rx="2" fill="url(#themeGradient)" />
      <rect x="8" y="36" width="69" height="8" fill="#ffffff" />
      <line x1="12" y1="40" x2="65" y2="40" stroke="var(--secondary-color, #00509d)" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Middle Book */}
      <rect x="10" y="20" width="68" height="12" rx="2" fill="var(--primary-color, #002147)" />
      <rect x="13" y="22" width="62" height="8" fill="#ffffff" />
      <line x1="18" y1="26" x2="60" y2="26" stroke="var(--primary-color, #002147)" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Top Book */}
      <rect x="15" y="6" width="60" height="12" rx="2" fill="url(#themeGradient)" />
      <rect x="18" y="8" width="54" height="8" fill="#ffffff" />
      <line x1="22" y1="12" x2="55" y2="12" stroke="var(--secondary-color, #00509d)" strokeWidth="1.5" strokeDasharray="3 3" />
    </g>

    {/* Graduation Cap (On top of Books) */}
    <g transform="translate(98, 30)">
      {/* Cap Skull/Base */}
      <path d="M13,22 C13,27 37,27 37,22 L37,29 C37,33 13,33 13,29 Z" fill="var(--primary-color, #002147)" />
      {/* Diamond Board */}
      <polygon points="25,8 50,18 25,28 0,18" fill="url(#themeGradient)" stroke="#ffffff" strokeWidth="1.5" />
      {/* Tassel Button */}
      <ellipse cx="25" cy="18" rx="2.5" ry="1.5" fill="var(--secondary-color, #00509d)" />
      {/* Tassel String & Hanging part */}
      <path d="M25,18 C33,20 40,24 41,28" stroke="var(--secondary-color, #00509d)" strokeWidth="1.5" fill="none" />
      <rect x="39.5" y="28" width="3" height="7" rx="1" fill="var(--secondary-color, #00509d)" />
    </g>

    {/* Magnifying Glass (Left Side/Front) */}
    <g transform="translate(62, 80)">
      {/* Handle */}
      <line x1="16" y1="16" x2="2" y2="30" stroke="var(--primary-color, #002147)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Handle Grip line */}
      <line x1="12" y1="20" x2="5" y2="27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* Glass Frame */}
      <circle cx="23" cy="9" r="11" fill="#ffffff" stroke="url(#themeGradient)" strokeWidth="2.5" />
      {/* Glass Highlight reflection */}
      <path d="M16 5 A 8 8 0 0 1 24 1" fill="none" stroke="var(--secondary-color, #00509d)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </g>
  </svg>
);

function DataNotFound({
  image,
  text = "No Data Found",
  colSpan = 12,
}: DataNotFoundProps) {
  return (
    <TableRow>
      <TableCell
        className="table-not-found-td"
        colSpan={colSpan}
        sx={{ borderBottom: "none !important" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
            width: "100%",
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt="Not Found"
              sx={{
                width: "100%",
                maxWidth: "310px",
                height: "auto",
                mb: 1,
                opacity: 0.9,
              }}
            />
          ) : (
            <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
              <SchoolEmptyStateSvg />
            </Box>
          )}
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#9ca3af",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {text}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
export default React.memo(DataNotFound);
