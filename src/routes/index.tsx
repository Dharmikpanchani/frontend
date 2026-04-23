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

  const router = useMemo(() => createBrowserRouter(appRoutes), [appRoutes]);

  return <RouterProvider router={router} />;
};

export default Router;
