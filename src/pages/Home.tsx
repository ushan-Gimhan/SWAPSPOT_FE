import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import this
import { LogIn, UserPlus, LayoutGrid } from "lucide-react";


const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-indigo-50 to-white">
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <LayoutGrid /> TradeHub
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/login")} className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2">
              Log In
            </button>
            <button onClick={() => navigate("/signup")} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="grow flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-extrabold text-indigo-900 tracking-tight">
            Buy, Sell, and Trade <br />
            <span className="text-indigo-600">Anything, Anywhere.</span>
          </h1>
          <p className="text-xl text-gray-600">Join the world's fastest-growing marketplace.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button onClick={() => navigate("/login")} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
              <LogIn size={20} /> Get Started
            </button>
            <button onClick={() => navigate("/register")} className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold flex items-center justify-center gap-2">
              <UserPlus size={20} /> Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;