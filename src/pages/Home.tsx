import React, { useState } from "react"; // Added useState
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Search } from "lucide-react"; // Added Search icon
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to your market/home page with the search query
      navigate(`/home?search=${searchQuery}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <div className="relative flex-grow flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Layer */}
        <div 
          className="absolute inset-0 z-0"
          style={{ backgroundColor: '#1e1b4b' }} 
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl px-4 py-24 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Buy, Sell, and Trade <br />
              <span className="text-indigo-400">Anything, Anywhere.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              Join the world's fastest-growing marketplace.
            </p>
          </div>

          {/* --- SEARCH BAR ADDED HERE --- */}
          <div className="w-full max-w-2xl mx-auto">
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-white rounded-2xl shadow-2xl p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/30 transition-all"
            >
              <div className="pl-4 text-gray-400">
                <Search size={24} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for today? (e.g. iPhone, Guitar...)" 
                className="w-full px-4 py-4 text-gray-800 focus:outline-none text-lg placeholder:text-gray-400"
              />
              <button 
                type="submit"
                className="hidden sm:block bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
              >
                Search
              </button>
            </form>
            {/* Mobile-only search button */}
            <button 
                type="submit"
                onClick={handleSearch}
                className="sm:hidden w-full mt-3 bg-indigo-600 text-white py-4 rounded-xl font-bold"
              >
                Search
              </button>
          </div>
          {/* ------------------------------ */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => navigate("/login")} 
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/40 active:scale-95"
            >
              <LogIn size={22} /> Get Started
            </button>
            <button 
              onClick={() => navigate("/signup")} 
              className="px-8 py-4 bg-white/10 text-white border-2 border-white/30 backdrop-blur-md rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95"
            >
              <UserPlus size={22} /> Create Account
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;