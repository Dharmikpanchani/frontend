import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { developerRoutes } from "../apps/developer/routes";
import { schoolRoutes } from "../apps/school/routes";
import { paymentRoutes } from "../apps/payment/routes";
import { getSubdomain } from "../apps/common/commonJsFunction";

const Router: React.FC = () => {
  const { isSubdomain, name } = getSubdomain();

  // Choose routes based on subdomain
  let appRoutes = developerRoutes;
  if (isSubdomain) {
    if (name === "pay") {
      appRoutes = paymentRoutes;
    } else {
      appRoutes = schoolRoutes;
    }
  }

  // Force payment routes for local dev testing
  if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.pathname.startsWith("/checkout")) {
    appRoutes = paymentRoutes;
  }

  const router = useMemo(() => createBrowserRouter(appRoutes), [appRoutes]);

  return <RouterProvider router={router} />;
};

export default Router;
