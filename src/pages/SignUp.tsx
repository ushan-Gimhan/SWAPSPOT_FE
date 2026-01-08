import React, { useState } from "react";
import Footer from "../components/Footer"; 
import { register } from "../services/auth";  
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2"; // Import SweetAlert2

interface SignUpProps {
  setView?: (view: string) => void;
}

const SignUp = ({ setView }: SignUpProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Helper for Success Toast
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Show loading alert
    Swal.fire({
      title: 'Creating Account...',
      text: 'Please wait while we set up your profile.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await register(fullName, email, password, "USER");
      
      Swal.close();

      // Show Success Modal
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: response.message || 'Welcome to TradeHub!',
        confirmButtonColor: '#4f46e5',
      });

      // Clear inputs
      setFullName("");
      setEmail("");
      setPassword("");

      // Redirect
      if (typeof setView === "function") {
        setView("login");
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      Swal.close();
      
      // Show Error Modal
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err?.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: '#4f46e5',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1b4b] relative overflow-hidden font-sans">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold group"
      >
        <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all">
            <ArrowLeft size={20} />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
            <p className="text-gray-500 mt-2 font-medium">Join the TradeHub community today</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">Or join with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign up with Google
          </button>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600 font-medium">Already have an account? </span>
            <button
               onClick={() => navigate("/login")}
               className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all"
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