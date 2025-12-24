import React from "react";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 

interface SignUpProps {
  setView: (view: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setView }) => {
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your registration logic here (e.g., Firebase/API)
    console.log("User registered");
    setView("market"); // Redirect to app on success
  };

  return (
    // 1. Updated Parent Background to the Deep Indigo Theme
    <div className="flex flex-col min-h-screen bg-[#1e1b4b] relative overflow-hidden">
      
      {/* 2. Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* 3. Shared Header */}
      <Header />

      {/* 4. Sign Up Form Section */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/50 border border-white/10 w-full max-w-md transform transition-all">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
            <p className="text-gray-500 mt-2 font-medium">Join the TradeHub community today</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400" 
                placeholder="John Doe" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400" 
                placeholder="you@example.com" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-lg">
              <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                By signing up, you agree to our <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] mt-2"
            >
              Create Account
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or join with</span></div>
          </div>

          <div className="mt-2 text-center text-sm">
            <span className="text-gray-600 font-medium">Already have an account? </span>
            <button 
              onClick={() => setView("login")} 
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline underline-offset-4 transition-all"
            >
              Log in instead
            </button>
          </div>
        </div>
      </main>

      {/* 5. Shared Footer */}
      <Footer />
    </div>
  );
};

export default SignUp;