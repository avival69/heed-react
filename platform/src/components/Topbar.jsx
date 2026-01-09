import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onToggle }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="h-14 bg-white flex items-center justify-between px-6 shadow">
      <button onClick={onToggle} className="text-xl">☰</button>

      <div className="relative group">
        <button className="flex items-center gap-2">
          <span className="font-medium">{user?.name}</span>
          <div className="w-8 h-8 rounded-full bg-slate-300" />
        </button>

        <div className="absolute right-0 mt-2 w-40 bg-white shadow rounded hidden group-hover:block">
          <button
            onClick={() => nav("/settings")}
            className="block w-full text-left px-4 py-2 hover:bg-slate-100"
          >
            View Profile
          </button>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
