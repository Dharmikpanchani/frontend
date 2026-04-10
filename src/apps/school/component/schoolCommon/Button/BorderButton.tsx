import { Box, Button } from "@mui/material";
import React from "react";

type BorderButtonProps = {
  btnLabel: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const BorderButton: React.FC<BorderButtonProps> = React.memo(
  ({ btnLabel, className, onClick, disabled = false }) => {
    return (
      <Box className="border-btn-main">
        <Button
          className={className}
          onClick={onClick}
          disabled={disabled}
        >
          {btnLabel}
        </Button>
      </Box>
    );
  }
);

export default BorderButton;
