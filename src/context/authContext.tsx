import { createContext, useContext, useEffect, useState } from 'react';
import { getMyDetails } from '../services/auth';

type AuthUser = {
  _id?: string;
  fullName?: string;
  email: string;
  role: string[];
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  //ADDED LOGOUT FUNCTION
  const logout = () => {
    // Clear Local Storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // Remove this if you don't use refresh tokens
    
    //Clear State
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    getMyDetails()
      .then((res) => {
        setUser({
          email: res.email,
          role: Array.isArray(res.roles) ? res.roles : [res.roles],
        });
      })
      .catch(() => {
        // If token is invalid, clear it
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    //PASSED LOGOUT TO VALUE
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within the AuthProvider');
  return context;
};