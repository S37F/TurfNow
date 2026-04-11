import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const userAuthContext = createContext();

function mapUser(u) {
  if (!u) return null;
  return { ...u, uid: u.id };
}

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const syncClaims = useCallback((sessionUser) => {
    if (!sessionUser) {
      setIsAdmin(false);
      setIsOwner(false);
      return;
    }
    setIsAdmin(sessionUser.app_metadata?.admin === true);
    setIsOwner(sessionUser.app_metadata?.owner === true);
  }, []);

  async function signup(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { user: data.user ? mapUser(data.user) : null };
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function googleSignin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/turf` },
    });
    if (error) throw error;
  }

  const refreshClaims = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session?.user) return;
    syncClaims(data.session.user);
  }, [syncClaims]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      syncClaims(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncClaims]);

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
        googleSignin,
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
