import { useCallback, useMemo } from "react";
import { bindActionCreators } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
    login,
    logout,
    refreshUser,
    register,
    selectAuthLoading,
    selectUser
} from "../store/authSlice";

const useAuth = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const loading = useSelector(selectAuthLoading);

    // wraps each one in dispatch, so components can keep calling login(email, password)
    const actions = useMemo(
        () => bindActionCreators({ login, register, logout, refreshUser }, dispatch),
        [dispatch]
    );

    // only used to hide what the user can't do; the API checks every request itself
    const can = useCallback((permission) => Boolean(user?.permissions?.includes(permission)), [user]);

    return { user, loading, can, ...actions };
}

export default useAuth;
