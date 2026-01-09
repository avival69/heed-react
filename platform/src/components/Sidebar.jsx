import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded ${
      isActive ? "bg-slate-800 text-white" : "text-slate-300"
    } hover:bg-slate-800`;

  return (
    <aside
      className={`bg-slate-900 text-white transition-all ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 font-bold">
        {collapsed ? "H" : "Heed"}
      </div>

      <nav className="space-y-2">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/posts" className={linkClass}>Posts</NavLink>
        <NavLink to="/orders" className={linkClass}>Orders</NavLink>
        <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
        <NavLink to="/settings" className={linkClass}>Settings</NavLink>

        {user?.role === "admin" && (
          <NavLink to="/admin/users" className={linkClass}>
            Admin Users
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
