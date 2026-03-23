import { lazy } from "react";
import Register from "../pages/Register";
import PrivateRoute from "../pages/PrivateRoute";
import DisputeManagementPage from "../pages/DisputeManagementPage";
import BroadcastPage from "../pages/BroadcastPage";

const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const HomePage = lazy(() => import("../pages/HomePage"));
const OrderHistory = lazy(() => import("../pages/OrderHistory"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const ProductDisplay = lazy(() => import("../pages/ProductDisplay"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Login = lazy(() => import("../pages/Login"));
const ProductModerationPage = lazy(() => import("../pages/ProductModerationPage"));
const OrderManagementPage = lazy(() => import("../pages/OrderManagementPage"));
const AdminUserList = lazy(() => import("../pages/AdminUserList"));
const AdminReviewList = lazy(() => import("../pages/AdminReviewList"));
const ReturnsManagementPage = lazy(() => import("../pages/ReturnsManagementPage")); // Thêm trang mới
const SettingsPage = lazy(() => import("../pages/SettingsPage")); // Thêm trang mới
const Logs = lazy(() => import("../pages/Logs"));
const DashboardConfigPage = lazy(() => import("../pages/DashboardConfig"));

const routes = [
  {
    path: "/",
    name: "Home page",
    element: <HomePage />,
  },
  {
    path: "/cart",
    name: "Cart",
    element: <Cart />,
  },
  {
    path: "/checkout",
    name: "Checkout",
    element: <Checkout />,
  },
  {
    path: "/order-history",
    name: "Order History",
    element: <OrderHistory />,
  },
  {
    path: "/products",
    name: "Product Display",
    element: <ProductDisplay />,
  },
  {
    path: "/product/:id",
    name: "Product Detail",
    element: <ProductDetail />,
  },
  {
    path: "/admin/users",
    name: "Admin User List",
    element: <AdminUserList />,
  },
  {
    path: "/admin/reviews",
    name: "Admin Review List",
    element: <AdminReviewList />,
  },
  {
    path: "/admin/products",
    name: "ProductModerationPage",
    element: <ProductModerationPage />,
  },
  {
    path: "/admin/orders",
    name: "OrderManagementPage",
    element: <OrderManagementPage />,
  },
  {
    path: "/admin/disputes",
    name: "DisputeManagementPage",
    element: <DisputeManagementPage />,
  },
  {
    path: "/admin/broadcast",
    name: "BroadcastPage",
    element: <BroadcastPage />,
  },
  {
    path: "/admin/returns",
    name: "ReturnsManagementPage",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <ReturnsManagementPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/settings",
    name: "SettingsPage",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <SettingsPage />
      </PrivateRoute>
    ),
  },
  { path: "/login", name: "Login", element: <Login /> },
  {
    path: "/register",
    name: "Register",
    element: <Register />,
  },
  {
    path: "/admin/logs",
    name: "Logs",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <Logs />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/dashboard-config",
    name: "DashboardConfig",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <DashboardConfigPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    name: "Dashboard",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <Dashboard />
      </PrivateRoute>
    ),
  },
];

export default routes;