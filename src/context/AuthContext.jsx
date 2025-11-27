import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import PropTypes from "prop-types";

// ======================
// Auth Context
// ======================
const AuthContext = createContext(null);

// Simple helper to check expiration in future if you add exp to JWT
const isTokenExpired = (token) => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));

    if (!decoded.exp) return false;

    return decoded.exp * 1000 < Date.now();
  } catch {
    return false;
  }
};

// ======================
// Provider
// ======================
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load user + token on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return;
        }

        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to load auth from storage:", err);
    }
  }, []);

  // Login
  const login = (userData, jwtToken) => {
    try {
      setUser(userData);
      setToken(jwtToken);

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", jwtToken);
    } catch (err) {
      console.error("Login storage error:", err);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);

    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {}
  };

  // Get fresh user data from backend
  const refreshUser = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const freshUser = await res.json();
      setUser(freshUser);

      localStorage.setItem("user", JSON.stringify(freshUser));
    } catch (err) {
      console.error("refreshUser failed:", err);
    }
  };

  // Stable context value (prevents unnecessary re-renders)
  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      refreshUser,
      isAuthenticated: Boolean(token),
    }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook
export const useAuth = () => useContext(AuthContext);
