import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { getMyDetails } from "../services/auth";

const LoginSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");

    if (!token || !refreshToken) {
      navigate("/login?error=google_auth_failed");
      return;
    }

    // Save tokens
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);

    // Load user profile
    const loadUser = async () => {
      try {
        const me = await getMyDetails();
        setUser({
          email: me.email,
          role: Array.isArray(me.role) ? me.role : [me.role],
        });

        navigate("/dashboard");
      } catch {
        navigate("/login?error=auth_failed");
      }
    };

    loadUser();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center text-gray-500">
      Signing you in with Google…
    </div>
  );
};

export default LoginSuccess;
