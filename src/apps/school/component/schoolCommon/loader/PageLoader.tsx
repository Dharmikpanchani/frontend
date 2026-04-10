
import React from 'react';
import { Box } from '@mui/material';
function PageLoader() {
    return (
        <Box className="loader-main">
            <Box className="loader">
                <span></span>
                <span></span>
            </Box>
        </Box>
    )
}

export default React.memo(PageLoader);
