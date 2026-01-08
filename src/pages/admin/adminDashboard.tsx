import { useState, useEffect, Suspense, lazy } from "react";
import { Users, Package, Flag, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/authContext";
import AdminSidebar from "../../components/AdminSidebar";
import Header from "../../components/AdminHeader";
import { getAllUsers, deleteUser, updateUserStatus } from "../../services/auth";
import { getAllItemsForAdmin, deleteItem } from "../../services/item";
import type { UserManagementProps } from "../admin/UserManagement";
import type { ItemManagementProps } from "../admin/ItemManagement";

const UserManagement = lazy(() => import("../admin/UserManagement")) as React.LazyExoticComponent<
  React.FC<UserManagementProps>
>;
const ItemManagement = lazy(() => import("../admin/ItemManagement")) as React.LazyExoticComponent<
  React.FC<ItemManagementProps>
>;

type TabType = "analytics" | "users" | "items" | "reports" | "categories";

interface StatCardProps {
  label: string;
  value: string | number;
  trend: string;
  icon: any;
  color: string;
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState({ users: 0, items: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [uRes, iRes] = await Promise.all([getAllUsers(), getAllItemsForAdmin()]);
        const userData = Array.isArray(uRes.data ? uRes.data : uRes) ? (uRes.data || uRes) : [];
        const itemData = Array.isArray(iRes.data ? iRes.data : iRes) ? (iRes.data || iRes) : [];

        setUsers(userData);
        setItems(itemData);
        setCounts({ users: userData.length, items: itemData.length });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Permanently delete this user?")) {
      try {
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u._id !== id));
        setCounts(prev => ({ ...prev, users: prev.users - 1 }));
      } catch {
        alert("Failed to delete user");
      }
    }
  };

  const handleUpdateUserStatus = async (id: string, status: "APPROVED" | "PENDING" | "REJECTED") => {
    try {
      await updateUserStatus(id, status); // Call backend API
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, approved: status } : u)));
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Remove this item from the market?")) {
      try {
        await deleteItem(id);
        setItems(prev => prev.filter(i => i._id !== id));
        setCounts(prev => ({ ...prev, items: prev.items - 1 }));
      } catch {
        alert("Failed to delete item");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 mb-4"></div>
        <p className="text-indigo-400 font-black text-xs tracking-[0.3em] uppercase">
          Securing Admin Access...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header activeTab={activeTab} />

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard label="Total Traders" value={counts.users} trend="+12%" icon={Users} color="text-blue-600" />
                <StatCard label="Active Items" value={counts.items} trend="+5%" icon={Package} color="text-purple-600" />
                <StatCard label="Open Reports" value="08" trend="-2" icon={Flag} color="text-rose-600" />
                <StatCard label="Security" value="100%" trend="Safe" icon={ShieldCheck} color="text-emerald-600" />
              </div>
            </div>
          )}

          {/* Management Tabs */}
          {activeTab !== "analytics" && (
            <Suspense fallback={<ModuleSyncLoader />}>
              {activeTab === "users" && (
                <UserManagement users={users} onDelete={handleDeleteUser} onUpdateStatus={handleUpdateUserStatus} />
              )}
              {activeTab === "items" && (
            <ItemManagement
                items={items}
                onDeleteItem={handleDeleteItem}
                onUpdateItemStatus={(id, status) => {
      // update frontend state after status change
      setItems(prev => prev.map(i => (i._id === id ? { ...i, status } : i)));
    }}
  />
)}

            </Suspense>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

// StatCard
const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}>
        <Icon size={22} />
      </div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <div className="mt-4">
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  </div>
);

const ModuleSyncLoader = () => (
  <div className="h-full flex flex-col items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-12 h-12 bg-indigo-100 rounded-full mb-4" />
      <p className="text-slate-400 font-bold text-sm">Syncing Module Data...</p>
    </div>
  </div>
);

export default AdminDashboard;
