import React, { useState, useEffect } from 'react';
import { 
  User, Mail, MapPin, Camera, Shield, 
  Bell, Heart, Award, Check, Eye,
  Globe, Trash2, Save, ShoppingBag, Loader2, AlertCircle,
  Package
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/authContext';
import { getAllItems, deleteItem } from '../services/item';

// Interface matching your UI needs
interface MyItem {
  id: string;
  title: string;
  price: number;
  image: string;
  mode: string;
  isActive: boolean;
  createdAt: string;
  category: string;
}

const ManageProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);

  // --- Listings State ---
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemError, setItemError] = useState("");

  const [profile, setProfile] = useState({
    name: user?.fullName || 'User Name',
    email: user?.email || 'email@example.com',
    location: 'Colombo, Sri Lanka',
    bio: 'Tech enthusiast and community donor.',
  });

  // --- Fetch Logic ---
  useEffect(() => {
    if (activeTab === 'listings') {
      fetchUserListings();
    }
  }, [activeTab]);

  const fetchUserListings = async () => {
    setLoadingItems(true);
    setItemError("");
    try {
      const response = await getAllItems();
      const currentUserId = user?._id; // Robust ID check

      const userItems = response.data
        .filter((item: any) => {
          // Check both: if userId is populated object OR just a string ID
          const itemUserId = item.userId?._id || item.userId;
          return itemUserId === currentUserId;
        })
        .map((item: any) => ({
          id: item._id || item.id, // Handle backend _id vs id
          title: item.title,
          price: item.price,
          mode: item.mode,
          isActive: item.isActive ?? true, // Default to true if missing
          category: item.category || 'General',
          // Format Date safely
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recently',
          // Handle Images array safely
          image: (item.images && item.images.length > 0) ? item.images[0] : ''
        }));

      setMyItems(userItems);
    } catch (err) {
      console.error(err);
      setItemError("Failed to sync your history. Please try again.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure? This listing will be gone forever.")) return;
    
    try {
      await deleteItem(id);
      // Optimistically remove from UI
      setMyItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting item. Please try again.");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call for profile update (replace with updateProfile service later)
    setTimeout(() => setIsSaving(false), 1200); 
  };

  const getStatusBadge = (isActive: boolean, mode: string) => {
    if (!isActive) return "bg-gray-100 text-gray-400 border-gray-200";
    switch(mode?.toUpperCase()) {
      case 'SELL': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'EXCHANGE': return "bg-purple-50 text-purple-600 border-purple-100";
      default: return "bg-pink-50 text-pink-600 border-pink-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Account <span className="text-indigo-600">Settings</span></h1>
          <p className="text-gray-400 font-bold mt-2">Personalize your profile and manage your contributions.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:w-72 space-y-4">
            <div className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-gray-100">
              {[
                { id: 'personal', label: 'Identity', icon: <User size={18} /> },
                { id: 'listings', label: 'My Listings', icon: <ShoppingBag size={18} /> }, 
                { id: 'charity', label: 'Impact', icon: <Heart size={18} /> },
                { id: 'notifications', label: 'Alerts', icon: <Bell size={18} /> },
                { id: 'security', label: 'Security', icon: <Shield size={18} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                    ? 'bg-[#1e1b4b] text-white shadow-xl translate-x-2' 
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100">
               <p className="text-red-900 font-black text-[10px] uppercase tracking-widest mb-3">System</p>
               <button className="flex items-center gap-2 text-red-600 text-xs font-black hover:underline uppercase tracking-tighter">
                 <Trash2 size={14} /> Deactivate Account
               </button>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <div className="flex-1 bg-white rounded-[3.5rem] shadow-xl border border-gray-100 p-8 md:p-14 min-h-[600px]">
            
            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-50">
                  <div className="relative">
                    <div className="w-32 h-32 bg-indigo-50 rounded-[2.8rem] flex items-center justify-center text-4xl font-black text-indigo-600 border-4 border-white shadow-xl">
                      {profile.name.charAt(0)}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-3 bg-[#1e1b4b] text-white rounded-2xl shadow-lg border-4 border-white hover:scale-110 transition">
                      <Camera size={18} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-black text-gray-900">Your Identity</h3>
                    <p className="text-sm text-gray-400 font-bold">Recommended: Use a clear photo for better trust.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" value={profile.email} disabled className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-300 cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bio</label>
                    <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-600 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* LISTINGS TAB (Updated Logic) */}
            {activeTab === 'listings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                        <h3 className="text-xl font-black text-gray-900">Active Listings</h3>
                        <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{myItems.length} Total</span>
                    </div>

                    {loadingItems ? (
                        <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
                    ) : itemError ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 font-bold text-sm border-2 border-red-100">
                            <AlertCircle size={18}/> {itemError}
                        </div>
                    ) : myItems.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                            <Package size={48} className="mx-auto mb-4 text-gray-200"/>
                            <p className="font-black text-gray-400 uppercase text-xs tracking-widest">No listings found</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {myItems.map((item) => (
                                <div key={item.id} className="group flex items-center gap-6 p-5 rounded-[2rem] border border-gray-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/20 transition-all bg-white">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-indigo-200"><Package size={24}/></div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-gray-900 truncate text-lg">{item.title}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${getStatusBadge(item.isActive, item.mode)}`}>
                                                {item.isActive ? item.mode : 'ARCHIVED'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                <Check size={10} strokeWidth={3} /> {item.createdAt}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete listing"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button className="p-3 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <h3 className="text-xl font-black text-gray-900 mb-8">Recent Notifications</h3>
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-4 p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Your item "Mechanical Keyboard" has a new exchange offer!</p>
                                <p className="text-[10px] font-black text-indigo-400 uppercase mt-1">2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <h3 className="text-xl font-black text-gray-900">Security</h3>
                    <div className="p-6 bg-gray-50 rounded-3xl text-center">
                        <Shield size={48} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-500 font-bold text-sm">Security settings are coming soon.</p>
                    </div>
                </div>
            )}

            {/* CHARITY TAB */}
            {activeTab === 'charity' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <h3 className="text-xl font-black text-gray-900">Impact</h3>
                    <div className="p-6 bg-pink-50 rounded-3xl border border-pink-100 flex items-center gap-4">
                        <Heart className="text-pink-500" size={32} fill="currentColor"/>
                        <div>
                            <p className="text-pink-900 font-black text-lg">Community Star</p>
                            <p className="text-pink-700 text-xs font-bold">You have made 0 donations so far.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION BUTTONS (Only for Personal Tab) */}
            {activeTab === 'personal' && (
                <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-3 px-12 py-4 rounded-[1.5rem] font-black text-xs tracking-[0.2em] transition-all shadow-xl ${
                    isSaving ? 'bg-green-500 text-white' : 'bg-[#1e1b4b] text-white hover:bg-black active:scale-95'
                    }`}
                >
                    {isSaving ? <><Check size={18} /> UPDATED</> : <><Save size={18} /> SAVE CHANGES</>}
                </button>
                </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManageProfile;