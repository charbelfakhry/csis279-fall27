import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import { getToken, setToken, SESSION_EXPIRED_EVENT } from "../services/apiFetch";
import * as authService from "../services/authService";

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    // only wait for the API when there is a saved token to check
    const [loading, setLoading] = useState(() => Boolean(getToken()));

    // restore the session after a page refresh
    useEffect(() => {
        if (!getToken()) {
            return;
        }

        let cancelled = false;

        const loadUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (!cancelled) {
                    setUser(currentUser);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            cancelled = true;
        }
    }, [])

    useEffect(() => {
        const handleExpired = () => setUser(null);

        window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    }, [])

    const login = useCallback(async (email, password) => {
        const result = await authService.login(email, password);
        console.log(result.token);
        setToken(result.token);
        setUser(result.user);
    }, []);

    const register = useCallback(async (data) => {
        const result = await authService.register(data);
        setToken(result.token);
        setUser(result.user);
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
    }, []);

    // reloads the user's roles and permissions, e.g. after editing a role they have
    const refreshUser = useCallback(async () => {
        setUser(await authService.getCurrentUser());
    }, []);

    // only used to hide what the user can't do; the API checks every request itself
    const can = useCallback((permission) => Boolean(user?.permissions?.includes(permission)), [user]);

    const value = useMemo(
        () => ({ user, loading, login, register, logout, refreshUser, can }),
        [user, loading, login, register, logout, refreshUser, can]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
