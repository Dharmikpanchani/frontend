import React from "react";
import { TableRow, TableCell, Box } from "@mui/material";

export const CommonLoader = () => (
  <Box className="loader-main">
    <Box className="loader">
      <span></span>
      <span></span>
    </Box>
  </Box>
);

function Loader({ colSpan = 12 }: { colSpan?: number }) {
  return (
    <TableRow>
      <TableCell className="table-not-found-td" colSpan={colSpan} sx={{ border: 'none', py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <CommonLoader />
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default React.memo(Loader);
