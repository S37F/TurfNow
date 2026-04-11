import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const userAuthContext = createContext();

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

const TOKEN_KEY = 'turfnow_token';

function mapUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    uid: u.id,
    email: u.email,
    displayName: u.displayName ?? null,
  };
}

async function authJson(path, options = {}) {
  const base = API_BASE.replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    throw err;
  }
  return data;
}

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const applySession = useCallback((token, apiUser) => {
    if (!token || !apiUser) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setIsAdmin(false);
      setIsOwner(false);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    setUser(mapUser(apiUser));
    setIsAdmin(!!apiUser.isAdmin);
    setIsOwner(!!apiUser.isOwner);
  }, []);

  async function signup(email, password) {
    const data = await authJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applySession(data.token, data.user);
    return { user: mapUser(data.user) };
  }

  async function login(email, password) {
    const data = await authJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    applySession(data.token, data.user);
  }

  async function logout() {
    applySession(null, null);
  }

  const refreshClaims = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const data = await authJson('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.user) {
        setUser(mapUser(data.user));
        setIsAdmin(!!data.user.isAdmin);
        setIsOwner(!!data.user.isOwner);
      }
    } catch {
      applySession(null, null);
    }
  }, [applySession]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authJson('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        if (data.user) {
          setUser(mapUser(data.user));
          setIsAdmin(!!data.user.isAdmin);
          setIsOwner(!!data.user.isOwner);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <userAuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isOwner,
        signup,
        login,
        logout,
        refreshClaims,
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
