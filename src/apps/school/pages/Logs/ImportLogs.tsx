import { Box, Typography } from "@mui/material";

export default function ImportLogs() {
  return (
    <Box p={3}>
      <Typography variant="h4">Import Logs</Typography>
      <Typography variant="body1" color="textSecondary" mt={2}>
        Import logs details will be displayed here.
      </Typography>
    </Box>
  );
}