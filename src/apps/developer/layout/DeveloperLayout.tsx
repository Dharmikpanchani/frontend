import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../component/defaulLayout/Header';
import Sidebar from '../component/defaulLayout/Sidebar';
import Png from '@/assets/Png';


export default function DeveloperLayout() {

  const [open, setOpen] = useState(true);

  useEffect(() => {
    const setRoundedFavicon = (url: string) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, size, size); // Clear for transparency
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const radius = 32; // Increased to 25% rounding for visibility
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(size - radius, 0);
          ctx.quadraticCurveTo(size, 0, size, radius);
          ctx.lineTo(size, size - radius);
          ctx.quadraticCurveTo(size, size, size - radius, size);
          ctx.lineTo(radius, size);
          ctx.quadraticCurveTo(0, size, 0, size - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.clip();

          const scale = Math.min(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          try {
            const dataUrl = canvas.toDataURL("image/png");
            const faviconLinks = document.querySelectorAll("link[rel*='icon']");
            faviconLinks.forEach((link: any) => {
              link.href = dataUrl;
            });
          } catch (err) {
            console.error("Favicon generation failed (likely CORS):", err);
            // Fallback to original URL if canvas fails (CORS)
            const faviconLinks = document.querySelectorAll("link[rel*='icon']");
            faviconLinks.forEach((link: any) => {
              link.href = url;
            });
          }
        }
      };
    };

    setRoundedFavicon(Png.logoImg);
  }, []);

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
