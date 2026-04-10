export interface RouteConfig {
  path?: string;
  element?: React.ReactNode;
  errorElement?: React.ReactNode;
  children?: RouteConfig[];
}
