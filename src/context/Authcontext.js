import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth"
import { auth } from "../firebase-config/config";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function googleSignin() {
        const googleAuthProvider = new GoogleAuthProvider();
        return signInWithPopup(auth, googleAuthProvider);
    }

    // Force refresh token claims (call after backend sets custom claims)
    const refreshClaims = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        try {
            const tokenResult = await currentUser.getIdTokenResult(true);
            setIsAdmin(tokenResult.claims.admin === true);
            setIsOwner(tokenResult.claims.owner === true);
        } catch (err) {
            console.error("Failed to refresh claims:", err);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const tokenResult = await currentUser.getIdTokenResult();
                    setIsAdmin(tokenResult.claims.admin === true);
                    setIsOwner(tokenResult.claims.owner === true);
                } catch (err) {
                    console.error("Error getting token claims:", err);
                    setIsAdmin(false);
                    setIsOwner(false);
                }
            } else {
                setIsAdmin(false);
                setIsOwner(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <userAuthContext.Provider value={{
            user,
            loading,
            isAdmin,
            isOwner,
            signup,
            login,
            logout,
            googleSignin,
            refreshClaims
        }}>
            {children}
        </userAuthContext.Provider>
    );
}

export function useUserAuth() {
    return useContext(userAuthContext);
}