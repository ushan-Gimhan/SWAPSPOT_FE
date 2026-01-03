import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  User,
  PlusCircle,
  ShoppingBag,
  ArrowRightLeft, // Updated Icon
} from "lucide-react";
import { useAuth } from "../context/authContext";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  // Updated link styling for better interactivity
  const navLinkClass = (path: string) =>
    `flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg transition-all ${
      isActive(path)
        ? "text-indigo-600 bg-indigo-50"
        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
    }`;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* --- BRANDING / LOGO --- */}
        <Link to="/" className="flex items-center gap-2 group">
            {/* Logo Icon Container */}
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-md shadow-indigo-200">
              <ArrowRightLeft className="text-white" size={20} strokeWidth={2.5} />
            </div>
            
            {/* Logo Text */}
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              Trade<span className="text-indigo-600">Hub</span>
            </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/example" className={navLinkClass("/example")}>
            <ShoppingBag size={18} strokeWidth={2.5} /> Market
          </Link>

          <Link to="/post" className={navLinkClass("/post")}>
            <PlusCircle size={18} strokeWidth={2.5} /> Post Item
          </Link>

          <Link to="/profile" className={navLinkClass("/profile")}>
            <User size={18} strokeWidth={2.5} /> Profile
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
          >
            <LogOut size={18} strokeWidth={2.5} /> Log Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-indigo-50 py-4 px-4 flex flex-col gap-2 shadow-xl absolute w-full left-0 z-50">
          <Link 
            to="/example" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 font-bold"
          >
            <ShoppingBag size={20} className="text-indigo-500"/> Market
          </Link>

          <Link 
            to="/post" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 font-bold"
          >
            <PlusCircle size={20} className="text-indigo-500"/> Post Item
          </Link>

          <Link 
            to="/profile" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 font-bold"
          >
            <User size={20} className="text-indigo-500"/> Profile
          </Link>

          <hr className="border-slate-100 my-2" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-bold w-full text-left"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;