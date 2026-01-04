import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Bell, Heart, Shield, Camera, Trash2, Save, ShoppingBag, 
  Loader2, AlertCircle, Package, Check, Eye, EyeOff, Lock, Key // 👈 Added EyeOff
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/authContext';

// Services
import { getMyItems, deleteItem } from '../services/item';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../services/profile';
import { uploadToImgBB } from '../services/imgbb'; 

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

const ManageProfile = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Listings State
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemError, setItemError] = useState("");

  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    avatar: '',
  });

  // Password State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  
  // 👇 State for toggling password visibility
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // --- 1. Fetch Profile Data ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getUserProfile();
        const data = res.data || res;
        
        if (data) {
          setProfile({
            name: data.fullName || '',
            email: data.email || '',
            location: data.location || 'Colombo, Sri Lanka',
            bio: data.bio || '',
            avatar: data.avatar || '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfileData();
  }, [user]);

  // --- 2. Image Upload ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadToImgBB(file);
      setProfile(prev => ({ ...prev, avatar: imageUrl }));
      alert("Image uploaded! Click 'Save Changes' to make it permanent.");
    } catch (error) {
      console.error("Upload error", error);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  // --- 3. Save Profile ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        avatar: profile.avatar
      });
      setTimeout(() => setIsSaving(false), 1200); 
    } catch (error) {
      console.error("Update failed", error);
      setIsSaving(false);
      alert("Failed to update profile.");
    }
  };

  // --- 4. Password Change Handler ---
  const handlePasswordChange = async () => {
    setPasswordMsg({ type: '', text: '' });

    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (security.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSaving(true);
    try {
      await changeUserPassword(
        security.currentPassword,
        security.newPassword
      );

      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update password.';
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Listings Logic ---
  const fetchUserListings = async () => {
    setLoadingItems(true);
    try {
      const response = await getMyItems(); 
      const itemsArray = Array.isArray(response) ? response : (response.data || []);
      const userItems = itemsArray.map((item: any) => ({
          id: item._id || item.id, 
          title: item.title,
          price: item.price,
          mode: item.mode,
          isActive: item.isActive ?? true, 
          category: item.category || 'General',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Recently',
          image: (item.images && item.images.length > 0) ? item.images[0] : ''
      }));
      setMyItems(userItems);
    } catch (err) {
      console.error(err);
      setItemError("Failed to load your listings.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await deleteItem(id);
      setMyItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'listings') fetchUserListings();
  }, [activeTab]);

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
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 bg-indigo-50 rounded-[2.8rem] flex items-center justify-center text-4xl font-black text-indigo-600 border-4 border-white shadow-xl overflow-hidden relative">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-indigo-600" />
                      ) : profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Camera className="text-white" size={24} />
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                    <input type="text" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
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

            {/* LISTINGS TAB */}
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
                                    <div className="w-20 h-20 rounded-2xl bg-indigo-50 overflow-hidden flex-shrink-0">
                                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-200"><Package size={24}/></div>}
                                    </div>
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
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDelete(item.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                        <button className="p-3 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ✅ SECURITY TAB (With Eye Toggle) */}
            {activeTab === 'security' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="border-b border-gray-50 pb-6">
                        <h3 className="text-xl font-black text-gray-900">Security Settings</h3>
                        <p className="text-sm text-gray-400 font-bold mt-1">Manage your password and account security.</p>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        {/* Feedback Message */}
                        {passwordMsg.text && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border-2 ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {passwordMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                {passwordMsg.text}
                            </div>
                        )}

                        {/* Current Password */}
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Lock size={10} /> Current Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword.current ? "text" : "password"} 
                                    value={security.currentPassword}
                                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 pr-12"
                                    placeholder="Enter current password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition"
                                >
                                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Key size={10} /> New Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword.new ? "text" : "password"} 
                                    value={security.newPassword}
                                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 pr-12"
                                    placeholder="Enter new password (min 6 chars)"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition"
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Key size={10} /> Confirm New Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword.confirm ? "text" : "password"} 
                                    value={security.confirmPassword}
                                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 pr-12"
                                    placeholder="Confirm new password"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition"
                                >
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handlePasswordChange}
                                disabled={isSaving}
                                className={`w-full flex justify-center items-center gap-3 px-12 py-4 rounded-[1.5rem] font-black text-xs tracking-[0.2em] transition-all shadow-xl ${
                                isSaving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#1e1b4b] text-white hover:bg-black active:scale-95'
                                }`}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'UPDATE PASSWORD'}
                            </button>
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