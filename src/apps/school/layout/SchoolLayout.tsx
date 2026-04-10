import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../component/defaulLayout/Header';
import Sidebar from '../component/defaulLayout/Sidebar';


import { useThemeManager } from '../hooks/useThemeManager';

export default function SchoolLayout() {
  const [open, setOpen] = useState(true);
  const { themeStyle, themeClasses } = useThemeManager();

  return (
    <div style={themeStyle} className={themeClasses}>
      <Box className="admin-dashboard-main">
        <Box className={`admin-dashboard-left-main ${open ? "active" : "admin-sidebar-deactive"}`}>
          <Sidebar open={open} setOpen={setOpen} />
        </Box>
        <Box className="admin-dashboard-right-main">
          <Header setOpen={setOpen} open={open} />
          <Box className="admin-dashboard-containt-main">
            <Outlet />
          </Box>
        </Box>
      </Box>
    </div>
  )
}
