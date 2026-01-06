import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/authContext";

interface AdminHeaderProps {
  activeTab?: string; // Optional: shows which admin tab is active
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out of the Admin Dashboard?")) {
      try {
        await logout?.();
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center justify-between px-8 shadow-sm">
      
      {/* Left: Dashboard Title */}
      <div>
        <h1 className="text-xl font-black text-slate-800">
          Admin Dashboard
        </h1>
        {activeTab && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
            Active Module: {activeTab}
          </p>
        )}
      </div>

      {/* Right: User & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
            {user?.fullName?.[0] || "A"}
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-sm font-bold text-slate-800">{user?.fullName || "Administrator"}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase">Admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
