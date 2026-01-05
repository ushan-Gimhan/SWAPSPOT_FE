import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogIn, 
  UserPlus, 
  Search, 
  Menu, 
  X, 
  ArrowRightLeft, // Changed from ShoppingBag to ArrowRightLeft for "Trade"
  Sparkles,
  ChevronRight 
} from "lucide-react";
import Footer from "../components/Footer";

// --- NEW CREATIVE HEADER COMPONENT ---
const CreativeHeader = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled
          ? "bg-[#1e1b4b]/80 backdrop-blur-md shadow-lg border-white/10 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          
          {/* --- LOGO AREA UPDATED FOR TRADEHUB --- */}
          <div 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            {/* Logo Icon Container */}
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
              {/* ArrowRightLeft represents 'Trade' better than a shopping bag */}
              <ArrowRightLeft className="text-white" size={24} strokeWidth={2.5} />
            </div>
            
            {/* Logo Text */}
            <span className="text-2xl font-black text-white tracking-tight">
              Trade<span className="text-indigo-400">Hub</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Explore", "Community", "Safety", "Support"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="text-white font-bold text-sm hover:text-indigo-300 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/signup")}
              className="bg-white text-indigo-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              <Sparkles size={16} className="text-indigo-600" /> Sell Item
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1e1b4b] border-t border-white/10 shadow-2xl p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
           {["Explore", "Community", "Safety", "Support"].map((item) => (
              <a key={item} href="#" className="text-lg font-medium text-gray-200 py-2 border-b border-white/5">
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <button onClick={() => navigate("/login")} className="w-full py-3 rounded-xl bg-white/5 text-white font-bold">
                Log In
              </button>
              <button onClick={() => navigate("/signup")} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold">
                Start Selling
              </button>
            </div>
        </div>
      )}
    </nav>
  );
};


// --- MAIN LANDING PAGE ---
const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${searchQuery}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      
      {/* Implemented the new Header here */}
      <CreativeHeader />

      <div className="relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: "#1e1b4b" }}
        >
          {/* Added a few creative glowing orbs for depth */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]" />
          
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0  from-indigo-500/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl px-4 py-24 text-center space-y-8 mt-10">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">#1 Marketplace 2026</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
              Buy, Sell, Trade and Donate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              Anything, Anywhere.
            </span>
          </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Join the world's fastest-growing community. Safe payments, verified users, and instant chats.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-2 focus-within:ring-4 focus-within:ring-indigo-500/30 transition-all transform hover:scale-[1.01]"
            >
              <div className="pl-4 text-gray-400">
                <Search size={24} />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for iPhones, Guitars, Sneakers..."
                className="w-full px-4 py-4 text-gray-800 bg-transparent focus:outline-none text-lg placeholder:text-gray-400 font-medium"
              />

              <button
                type="submit"
                className="hidden sm:flex items-center gap-2 bg-[#1e1b4b] text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-900 transition-colors"
              >
                Search <ChevronRight size={18} />
              </button>
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={handleSearch}
              className="sm:hidden w-full mt-3 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg"
            >
              Search Now
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-500 hover:shadow-indigo-500/50 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <LogIn size={22} /> Get Started
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white/5 text-white border border-white/20 backdrop-blur-md rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/40 transition-all"
            >
              <UserPlus size={22} /> Create Account
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;