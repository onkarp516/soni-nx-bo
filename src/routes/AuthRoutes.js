import { lazy } from "react";
const Login = lazy(() => import("@/pages/authentication/Login"));

var authRoutes = [
  {
    path: "/authentication/login",
    name: "Login",
    icon: "mdi mdi-account-key",
    component: Login,
  },
];
export default authRoutes;
