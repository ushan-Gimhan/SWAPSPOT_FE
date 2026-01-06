
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
      navigate("/login");
      return;
    }

    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);

    const loadUser = async () => {
      try {
        const me = await getMyDetails();
        setUser({
          email: me.email,
          role: Array.isArray(me.role) ? me.role : [me.role],
        });
        navigate("/dashboard");
      } catch {
        navigate("/login");
      }
    };

    loadUser();
  }, []);

  return <p className="text-center mt-10">Signing you in...</p>;
};

export default LoginSuccess;
