import React from "react";
import { TableRow, TableCell, Box, Typography } from "@mui/material";

interface DataNotFoundProps {
  image?: string;
  text?: string;
  colSpan?: number;
}

function DataNotFound({ image, text = "No Data Found", colSpan = 12 }: DataNotFoundProps) {
  const defaultImage = "https://img.freepik.com/free-vector/school-building-concept-illustration_114360-15509.jpg";

  return (
    <TableRow>
      <TableCell className="table-not-found-td" colSpan={colSpan} sx={{ borderBottom: 'none !important' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            width: '100%'
          }}
        >
          <Box
            component="img"
            src={image || defaultImage}
            alt="Not Found"
            sx={{
              width: '100%',
              maxWidth: '350px',
              height: 'auto',
              mb: 2,
              opacity: 0.8
            }}
          />
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#9ca3af',
              fontFamily: "'Poppins', sans-serif"
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
