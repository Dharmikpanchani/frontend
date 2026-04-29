import { lazy } from "react";
import type { RouteConfig } from "@/types/interfaces/routeInterface";
import PageNotFound from "../school/component/schoolCommon/pageNotFound/PageNotFound";

const Checkout = lazy(() => import("./pages/Checkout/Checkout"));

export const paymentRoutes: RouteConfig[] = [
  {
    path: "/checkout",
    children: [
      { path: "school-plan", element: <Checkout /> },
      { path: "", element: <Checkout /> },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];
