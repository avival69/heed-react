import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

/* AUTH */
import Login from "./pages/auth/Login";

/* LAYOUTS */
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

/* SELLER */
import SellerDashboard from "./pages/seller/Dashboard";
import SellerPosts from "./pages/seller/Posts";
import SellerOrders from "./pages/seller/Orders";
import SellerAnalytics from "./pages/seller/Analytics";
import SellerChat from "./pages/seller/Chat";
import SellerSettings from "./pages/seller/Settings";

/* ADMIN */
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminApprovals from "./pages/admin/Approvals";
import PlatformStats from "./pages/admin/platformStats";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* SELLER */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute role="seller">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="posts" element={<SellerPosts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="chat" element={<SellerChat />} />
        <Route path="settings" element={<SellerSettings />} />
      </Route>

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="stats" element={<PlatformStats />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
