import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { developerRoutes } from "../apps/developer/routes";
import { schoolRoutes } from "../apps/school/routes";
import { paymentRoutes } from "../apps/payment/routes";
import { getSubdomain } from "../apps/common/commonJsFunction";

const Router: React.FC = () => {
  const { isSubdomain } = getSubdomain();

  // Choose routes based on subdomain
  let appRoutes = isSubdomain ? schoolRoutes : developerRoutes;

  // If path starts with /checkout, always use payment routes
  if (window.location.pathname.startsWith("/checkout")) {
    appRoutes = paymentRoutes;
  }

  const router = useMemo(() => createBrowserRouter(appRoutes), [appRoutes]);

  return <RouterProvider router={router} />;
};

export default Router;
