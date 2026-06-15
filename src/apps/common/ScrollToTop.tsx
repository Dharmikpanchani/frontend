import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window
    window.scrollTo(0, 0);

    // Scroll layout containers
    const containers = [
      ".admin-dashboard-containt-main",
      ".admin-dashboard-right-main",
      ".admin-dashboard-main",
      "#root"
    ];
    
    containers.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.scrollTo(0, 0);
        el.scrollTop = 0; // Fallback
      });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
