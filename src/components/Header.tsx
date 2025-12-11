import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Menu, X, LogOut, User, PlusCircle, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/authContext"; // Adjust path if needed

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get logout from context (or use dummy if not ready)
  const { logout } = useAuth(); 

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const navLinkClass = (path: string) => 
    `flex items-center gap-2 text-sm font-medium transition-colors ${
      isActive(path) ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/home" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <LayoutGrid className="h-8 w-8" /> 
          <span className="hidden sm:inline">TradeHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/home" className={navLinkClass('/home')}>
            <ShoppingBag size={18} /> Buy/Trade
          </Link>
          <Link to="/post" className={navLinkClass('/post')}>
            <PlusCircle size={18} /> Post Item
          </Link>
          <Link to="/profile" className={navLinkClass('/profile')}>
            <User size={18} /> Profile
          </Link>
          
          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 flex flex-col gap-4 shadow-lg">
          <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass('/home')}>
            Buy/Trade
          </Link>
          <Link to="/post" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass('/post')}>
            Post Item
          </Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass('/profile')}>
            Profile
          </Link>
          <hr />
          <button onClick={handleLogout} className="text-left text-red-500 font-medium text-sm">
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;