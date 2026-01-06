import React from "react";
import { 
  BarChart3, Users, Package, Flag, Layers, LogOut, ArrowRightLeft 
} from "lucide-react";

// Using a Union type for better tab safety
type TabType = 'analytics' | 'users' | 'items' | 'reports' | 'categories';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  logout: () => void;
}

const TradeHubLogo = () => (
  <div className="flex items-center gap-3 group px-2">
    <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
      <ArrowRightLeft className="text-white" size={24} strokeWidth={2.5} />
    </div>
    <span className="text-2xl font-black text-white tracking-tight hidden lg:block">
      Trade<span className="text-indigo-400">Hub</span>
    </span>
  </div>
);

const AdminSidebar = ({ activeTab, setActiveTab, logout }: SidebarProps) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20}/> },
    { id: 'users', label: 'Manage Users', icon: <Users size={20}/> },
    { id: 'items', label: 'Market Control', icon: <Package size={20}/> },
    { id: 'reports', label: 'System Reports', icon: <Flag size={20}/> },
    { id: 'categories', label: 'Categories', icon: <Layers size={20}/> },
  ];

  return (
    <aside className="w-20 lg:w-72 bg-[#0F172A] h-screen flex flex-col z-50 transition-all duration-300">
      <div className="p-6">
        <TradeHubLogo />
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon} <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 text-rose-400 font-bold text-sm hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} /> <span className="hidden lg:block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;