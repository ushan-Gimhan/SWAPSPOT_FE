import React from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Facebook, Twitter, Instagram, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
              <LayoutGrid /> TradeHub
            </div>
            <p className="text-gray-500 text-sm">
              The safest place to buy, sell, and trade your favorite items with a community you trust.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/home" className="hover:text-indigo-600">Browse Items</Link></li>
              <li><Link to="/post" className="hover:text-indigo-600">Sell an Item</Link></li>
              <li><Link to="/home" className="hover:text-indigo-600">Categories</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/profile" className="hover:text-indigo-600">My Profile</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-600">My Orders</Link></li>
              <li><Link to="/settings" className="hover:text-indigo-600">Settings</Link></li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-indigo-600"><Facebook size={20} /></a>
              <a href="#" className="hover:text-indigo-600"><Twitter size={20} /></a>
              <a href="#" className="hover:text-indigo-600"><Instagram size={20} /></a>
              <a href="#" className="hover:text-indigo-600"><Mail size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TradeHub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;