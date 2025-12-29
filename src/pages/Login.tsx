import React, { useState } from "react";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { login, getMyDetails } from "../services/auth";

interface LoginProps {
  setView?: (view: any) => void; // optional if you still want to use it
}

const LoginPage: React.FC<LoginProps> = ({ setView }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Step 1: login API
      const res = await login(email, password);

      // ✅ Step 2: validate response
      if (!res?.data?.accessToken) {
        throw new Error("Invalid login response");
      }

      // ✅ Step 3: save tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      // ✅ Step 4: get logged-in user
      const me = await getMyDetails();

      // ✅ Step 5: update auth context
      setUser({
        email: me.email,
        role: Array.isArray(me.role) ? me.role : [me.role],
      });

      // ✅ Step 6: navigate ONLY on success
      navigate("/dashboard");

      // Optional UI fallback
      setView?.("home");

    } catch (err: unknown) {
      // ❌ Login failed → stay on login page
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1b4b] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <Header />

      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/50 border border-white/10 w-full max-w-md transform transition-all">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Please sign in to your TradeHub account</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400" 
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] mt-2"
            >
              Log In
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span></div>
          </div>

          <div className="mt-2 text-center text-sm">
            <span className="text-gray-600 font-medium">New to TradeHub? </span>
            <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline underline-offset-4 transition-all"
            >
              Create an account
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
