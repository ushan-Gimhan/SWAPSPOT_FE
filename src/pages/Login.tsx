import { useState } from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { login, getMyDetails } from "../services/auth";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  setView?: (view: any) => void;
}

const LoginPage = ({ setView }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);

      if (!res?.data?.accessToken) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      const me = await getMyDetails();

      setUser({
        email: me.email,
        role: Array.isArray(me.role) ? me.role : [me.role],
      });

      navigate("/dashboard");
      setView?.("home");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1b4b] relative overflow-hidden">
      
      {/* Back to Home */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold group"
      >
        <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Please sign in to your TradeHub account
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border bg-gray-50 px-4 py-3.5 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border bg-gray-50 px-4 py-3.5 pr-12 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
            >
              Log In
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600 font-medium">
              New to TradeHub?{" "}
            </span>
            <button
              onClick={() => navigate("/signup")}
              className="text-indigo-600 font-bold hover:underline"
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
