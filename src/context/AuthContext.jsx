import { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
    const user = useSelector(selectCurrentUser);
    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}
