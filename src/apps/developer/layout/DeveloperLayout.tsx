import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../component/defaulLayout/Header';
import Sidebar from '../component/defaulLayout/Sidebar';


export default function DeveloperLayout() {

  const [open, setOpen] = useState(true);

  return (
    <div>
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
