import { useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";

const API_BASE = "http://localhost:4000/api";

function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserId(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/session/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUserId(null);
          setUser(null);
          setLoading(false);
          return;
        }
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setUserId(data.user?._id || null);
      } catch {
        // Offline / server down: keep cached user if present
        setUserId(user?._id || null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signin = (newUserId, callback) => {
    setUserId(newUserId);
    const cached = JSON.parse(localStorage.getItem("user") || "null");
    setUser(cached);
    callback();
  };

  const signout = () => {
    setUserId(null);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = useMemo(() => ({ user: userId, userProfile: user, loading, signin, signout }), [userId, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

