import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { useGetUserQuery, api } from "../slices/apiSlice";
import { dispatch } from "../store/store";
import { resetCalendar } from "../slices/calendarSlice";

const AuthContext = createContext(null);

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

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const {
    data: fetchedUser,
    isLoading: isUserLoading,
    error: userErr,
    refetch,
  } = useGetUserQuery(undefined, {
    skip: !token,
  });

  // Load user + token on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return;
        }
        setToken(storedToken);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to load auth from storage:", err);
    }
  }, []);

  // When backend user arrives, sync it
  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));
    }
  }, [fetchedUser]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    // 1. Identify key before clearing user
    const keyToRemove = user ? `calendar_events_${user.id}` : null;

    // 2. Clear Context State
    setUser(null);
    setToken(null);

    // 3. Clear Storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (keyToRemove) {
      localStorage.removeItem(keyToRemove);
    }

    // 4. Reset Redux State
    dispatch(api.util.resetApiState());
    dispatch(resetCalendar());
  };

  const refreshUser = async () => {
    if (!token) return;

    const result = await refetch();
    if (result.data) {
      setUser(result.data);
      localStorage.setItem("user", JSON.stringify(result.data));
    }
  };

  // Derived storage key for user-specific data (e.g. calendar events)
  const userStorageKey = useMemo(() => {
    return user ? `calendar_events_${user.id}` : null;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      refreshUser,
      isAuthenticated: Boolean(token),
      isUserLoading,
      userErr,
      userStorageKey, // Exposed for components to use
    }),
    [user, token, isUserLoading, userErr, userStorageKey]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
