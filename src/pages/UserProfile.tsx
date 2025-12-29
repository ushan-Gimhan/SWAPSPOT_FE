import React, { useState } from 'react';
import { 
  User, Mail, MapPin, Camera, Shield, 
  Bell, Heart, Award, ArrowRight, Check,
  Lock, Globe, Trash2, Save
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ManageProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Mock initial state
  const [profile, setProfile] = useState({
    name: 'Shamodha Sahan',
    email: 'shamodha7@gmail.com',
    location: 'Colombo, Sri Lanka',
    bio: 'Tech enthusiast and community donor. Looking to swap vintage tech for school supplies.',
    isPublic: true
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500); // Simulate API call
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900">Account <span className="text-indigo-600">Settings</span></h1>
          <p className="text-gray-500 font-medium mt-2">Manage your public profile, security, and charity impact.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- LEFT SIDEBAR: NAV --- */}
          <aside className="w-full lg:w-80 space-y-4">
            <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              {[
                { id: 'personal', label: 'Personal Info', icon: <User size={20} /> },
                { id: 'security', label: 'Security & Password', icon: <Shield size={20} /> },
                { id: 'charity', label: 'Charity Impact', icon: <Heart size={20} /> },
                { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] font-bold text-sm transition-all ${
                    activeTab === tab.id 
                    ? 'bg-[#1e1b4b] text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Danger Zone Link */}
            <div className="p-6 bg-red-50 rounded-[2.5rem] border border-red-100">
               <p className="text-red-900 font-bold text-xs uppercase tracking-widest mb-2">Danger Zone</p>
               <button className="flex items-center gap-2 text-red-600 text-sm font-bold hover:underline">
                 <Trash2 size={16} /> Deactivate Account
               </button>
            </div>
          </aside>

          {/* --- RIGHT CONTENT: FORMS --- */}
          <div className="flex-1 bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-12">
            
            {activeTab === 'personal' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                {/* Avatar Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-gray-50">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-indigo-600 border-4 border-white shadow-xl overflow-hidden">
                      {profile.name.charAt(0)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 text-indigo-600 hover:scale-110 transition">
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-gray-900">Profile Photo</h3>
                    <p className="text-sm text-gray-400 font-medium">Update your photo to build trust in the community.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-300" size={20} />
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                      <input 
                        type="email" 
                        value={profile.email}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none transition font-bold text-gray-400 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-300" size={20} />
                      <input 
                        type="text" 
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Bio / About You</label>
                    <textarea 
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-gray-700 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'charity' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                <div className="bg-pink-50 p-8 rounded-[2rem] border border-pink-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-pink-900 mb-1">Impact Badge</h3>
                    <p className="text-pink-700 font-medium">You have achieved <span className="font-black underline">Gold Donor</span> status!</p>
                  </div>
                  <div className="p-4 bg-white rounded-3xl shadow-lg">
                    <Award size={48} className="text-yellow-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                      <Heart className="text-pink-500 mb-4" size={32} />
                      <p className="text-3xl font-black text-gray-900">14</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Donations Made</p>
                   </div>
                   <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
                      <Globe className="text-blue-500 mb-4" size={32} />
                      <p className="text-3xl font-black text-gray-900">82kg</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Waste Reduced</p>
                   </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl">
                   <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Check className="text-green-500" /> Verified Charities Supported
                   </h4>
                   <ul className="space-y-3">
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">UNICEF Education Fund</span>
                        <span className="text-indigo-600 font-bold">5 Items Swapped</span>
                      </li>
                      <li className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Local Youth Center</span>
                        <span className="text-indigo-600 font-bold">2 Items Donated</span>
                      </li>
                   </ul>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-gray-900">Change Password</h3>
                    <div className="space-y-4">
                      <input type="password" placeholder="Current Password" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="password" placeholder="New Password" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                     <div>
                       <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                       <p className="text-xs text-gray-400">Keep your trades secure with extra verification.</p>
                     </div>
                     <button className="px-6 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-black uppercase tracking-widest">Enable</button>
                  </div>
               </div>
            )}

            {/* Save Button (Sticky Footer for Content Area) */}
            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl ${
                  isSaving ? 'bg-green-500 text-white' : 'bg-[#1e1b4b] text-white hover:bg-black'
                }`}
              >
                {isSaving ? (
                  <><Check size={20} /> PROFILE UPDATED</>
                ) : (
                  <><Save size={20} /> SAVE CHANGES</>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManageProfile;