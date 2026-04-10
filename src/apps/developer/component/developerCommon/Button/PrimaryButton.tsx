import { Box, Button } from "@mui/material";
import React from "react";

const PrimaryButton = React.memo(function PrimaryButton(props: any) {
  return (
    <Box className="primary-btn-main">
      <Button className={props.className} onClick={props.onClick}>
        {props.btnLabel}
      </Button>
    </Box>
  );
});

export default PrimaryButton;
