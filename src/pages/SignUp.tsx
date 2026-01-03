import React, { useState } from "react";
import Footer from "../components/Footer"; 
import { register } from "../services/auth";  
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react"; // Added Eye icons

interface SignUpProps {
  setView: (view: string) => void;
}

const SignUp = ({ setView }: SignUpProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 1. New State for toggling visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await register(fullName, email, password, "USER");
      console.log("Backend response:", response);

      setSuccess(response.message);

      // Clear fields
      setFullName("");
      setEmail("");
      setPassword("");

      // Redirect to login after 2s
      setTimeout(() => {
        if (typeof setView === "function") {
          setView("login");
        }
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1b4b] relative overflow-hidden">
      
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold group"
      >
        <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all">
            <ArrowLeft size={20} />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/50 border border-white/10 w-full max-w-md transform transition-all">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create an Account
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              Join the TradeHub community today
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            {error && <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded-lg">{success}</div>}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Full Name
              </label>
              <input
                type="text"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  // 2. Dynamic Type: Text or Password
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                {/* 3. The Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-lg">
              <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                By signing up, you agree to our{" "}
                <span className="text-indigo-600 font-bold cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-indigo-600 font-bold cursor-pointer hover:underline">
                  Privacy Policy
                </span>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] mt-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">
                Or join with
              </span>
            </div>
          </div>

          <div className="mt-2 text-center text-sm">
            <span className="text-gray-600 font-medium">
              Already have an account?{" "}
            </span>
            <button
               onClick={() => navigate("/login")}
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline underline-offset-4 transition-all"
            >
              Log in instead
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;