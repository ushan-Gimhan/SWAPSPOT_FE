import React, { useState, useEffect } from "react";
import {
  Users, Package, BarChart3, AlertTriangle, Layers, 
  ArrowRightLeft, Search, Filter, Trash2, ShieldCheck, 
  CheckCircle, XCircle, Loader2, MoreHorizontal, 
  Settings, Bell, LogOut, ChevronRight, Activity, 
  Plus, Eye, TrendingUp, Flag
} from "lucide-react";
import { useAuth } from "../context/authContext";

/* ================= CUSTOM TRADEHUB LOGO ================= */
const TradeHubLogo = () => (
  <div className="flex items-center gap-3 group">
    <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
      <ArrowRightLeft className="text-white" size={24} strokeWidth={2.5} />
    </div>
    <span className="text-2xl font-black text-white tracking-tight">
      Trade<span className="text-indigo-400">Hub</span>
    </span>
  </div>
);

/* ================= UI WIDGETS ================= */
const StatWidget = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-current`}>
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "items" | "reports" | "categories">("analytics");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">Authenticating TradeHub Root...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-20 lg:w-72 bg-[#0F172A] h-full flex flex-col z-50">
        <div className="p-6">
          <TradeHubLogo />
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {[
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20}/> },
            { id: 'users', label: 'Manage Users', icon: <Users size={20}/> },
            { id: 'items', label: 'Fake Item Control', icon: <Package size={20}/> },
            { id: 'reports', label: 'User Reports', icon: <Flag size={20}/> },
            { id: 'categories', label: 'Categories', icon: <Layers size={20}/> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon} <span className="hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-rose-400 font-bold text-sm hover:bg-rose-500/10 rounded-xl transition-all">
            <LogOut size={20} /> <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN WORKSPACE --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">
            System <span className="text-indigo-600">{activeTab}</span>
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search system..." className="bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold w-64" />
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-800">{user?.fullName || 'Admin'}</p>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase">Super Admin</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  {user?.fullName?.[0] || 'A'}
               </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {/* ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatWidget label="Active Traders" value="24,502" trend="+12%" icon={Users} color="text-blue-600" />
                <StatWidget label="Total Trades" value="1,209" trend="+8%" icon={ArrowRightLeft} color="text-purple-600" />
                <StatWidget label="Reports Pending" value="14" trend="-2" icon={Flag} color="text-rose-600" />
                <StatWidget label="Fraud Detected" value="03" trend="Safe" icon={ShieldCheck} color="text-emerald-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Platform Growth</h3>
                        <TrendingUp className="text-indigo-600" size={20} />
                    </div>
                    <div className="h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                        <p className="text-slate-400 font-bold text-sm italic">Interactive Chart: Activity over 30 days</p>
                    </div>
                 </div>
                 <div className="bg-[#1E1B4B] p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold">System Health</h3>
                        <p className="text-indigo-300 text-xs mt-1 font-medium">Server: Colombo-Main-01</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300">
                            <span>CPU LOAD</span>
                            <span>12%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 w-[12%]"></div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* USER & ITEM LIST VIEW */}
          {(activeTab === 'users' || activeTab === 'items' || activeTab === 'reports' || activeTab === 'categories') && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Management Console</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sorting by newest entry</p>
                  </div>
                  {activeTab === 'categories' && (
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        <Plus size={16} /> ADD CATEGORY
                    </button>
                  )}
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <th className="px-10 py-6">Reference</th>
                            <th className="px-10 py-6">Status</th>
                            <th className="px-10 py-6">Timeline</th>
                            <th className="px-10 py-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                            #{1024 + i}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm">Sample Entry Name {i}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase italic">Meta_ID: RX-900{i}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${i % 2 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {i % 2 === 0 ? 'Verified' : 'Pending Review'}
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-xs font-bold text-slate-500">Oct {10 + i}, 2023</td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2.5 bg-white border rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"><Eye size={16}/></button>
                                        <button className="p-2.5 bg-white border rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;