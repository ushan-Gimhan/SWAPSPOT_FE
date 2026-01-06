import { useState } from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { login, getMyDetails } from "../services/auth";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  setView?: (view: string) => void;
}

const LoginPage = ({ setView }: LoginProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  try {
    const res = await login(email, password);
    const userData = res?.data; // Based on your JSON: res.data.roles exists

    if (!userData?.accessToken) throw new Error("Invalid response");

    // 1. Save tokens immediately
    localStorage.setItem("accessToken", userData.accessToken);
    localStorage.setItem("refreshToken", userData.refreshToken);

    // 2. IMPORTANT: Get the roles from the response directly
    const rawRoles = userData.roles; 
    const rolesArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

    // 3. Update the global state
    setUser({
      email: userData.email,
      fullName: userData.fullName || "User",
      role: rolesArray, // Ensure your Context uses 'role' (singular) as the key
    });

    // 4. LOG FOR DEBUGGING - Check your browser console!
    console.log("Roles found:", rolesArray);

    // 5. REDIRECT - Use the local rolesArray variable, not the state
    if (rolesArray.includes("ADMIN")) {
      console.log("Redirecting to Admin...");
      navigate("/admin/dashboard");
    } else {
      console.log("Redirecting to User...");
      navigate("/dashboard");
    }

  } catch (err: any) {
    setError("Invalid email or password");
  }
};

  // ✅ GOOGLE LOGIN
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1b4b] relative overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold group"
      >
        <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all">
          <ArrowLeft size={20} />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <main className="relative z-10 flex-grow flex items-center justify-center p-4 py-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Please sign in to your TradeHub account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border">
                {error}
              </div>
            )}

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
                  onClick={() => setShowPassword((prev) => !prev)}
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

          {/* Google Login */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Google
          </button>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600 font-medium">New to TradeHub? </span>
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
