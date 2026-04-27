import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dharma_token'));
  const [loading, setLoading] = useState(true);

  // On mount: validate stored token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        } else {
          // Token invalid — clear it
          localStorage.removeItem('dharma_token');
          setToken(null);
        }
      } catch {
        // Server offline — keep token for when it comes back
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('dharma_token', jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dharma_token');
  };

  const authFetch = async (url, options = {}) => {
    return fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
