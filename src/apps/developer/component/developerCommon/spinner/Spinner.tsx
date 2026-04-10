import { Box, CircularProgress, circularProgressClasses } from "@mui/material";

export default function Spinner(props: any) {
  return (
    <Box sx={{ position: "relative" , display: "flex"}}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme : any) =>
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
        }}
        size={20}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: (theme : any) =>
            theme.palette.mode === "light" ? "#fff" : "#308fe8",
          animationDuration: "550ms",
          position: "absolute",
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={20}
        thickness={4}
        {...props}
      />
    </Box>
  );
}
