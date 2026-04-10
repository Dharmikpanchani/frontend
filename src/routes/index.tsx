import { useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { developerRoutes } from "../apps/developer/routes";
import { schoolRoutes } from "../apps/school/routes";
import { getSubdomain } from "../apps/common/commonJsFunction";

const Router: React.FC = () => {
  const { isSubdomain } = getSubdomain();

  // Choose routes based on subdomain
  const appRoutes = isSubdomain ? schoolRoutes : developerRoutes;

  const router = useMemo(() => createBrowserRouter(appRoutes), [appRoutes]);

  return <RouterProvider router={router} />;
};

export default Router;
