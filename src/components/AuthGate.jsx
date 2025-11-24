import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    useGetProfileQuery,
    useLazyGetProfileQuery,
} from "../features/auth/authApi";
import {
    clearCredentials,
    setAuthError,
    setAuthStatus,
    setCredentials,
} from "../features/auth/authSlice";
import { selectCurrentUser } from "../features/auth/authSlice";

const ACCESS_TOKEN_KEY = "access_token";
const USER_DATA_KEY = "auth_user";
const LEGACY_TOKEN_KEY = "token";

export default function AuthGate() {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const [isHydrated, setIsHydrated] = useState(false);
    const hasToken = Boolean(currentUser?.access_token);
    const { data, error, isError, isFetching } = useGetProfileQuery(
        undefined,
        {
            refetchOnMountOrArgChange: true,
            skip: !isHydrated || !hasToken,
        }
    );
    const [trigger] = useLazyGetProfileQuery();

    useEffect(() => {
        if (typeof window === "undefined") {
            setIsHydrated(true);
            return;
        }
        window.localStorage.removeItem(LEGACY_TOKEN_KEY);
        const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedUser = window.localStorage.getItem(USER_DATA_KEY);

        if (storedToken) {
            let parsedUser = null;
            try {
                parsedUser = storedUser ? JSON.parse(storedUser) : null;
            } catch (err) {
                console.warn("Stored user verisi parse edilemedi:", err);
            }

            dispatch(
                setCredentials({
                    ...(parsedUser || {}),
                    access_token: storedToken,
                })
            );
            dispatch(setAuthStatus("checking"));
        } else {
            dispatch(clearCredentials());
        }
        window.localStorage.removeItem(LEGACY_TOKEN_KEY);
        setIsHydrated(true);
    }, [dispatch]);

    useEffect(() => {
        if (isFetching) {
            dispatch(setAuthStatus("checking"));
        }
    }, [isFetching, dispatch]);

    useEffect(() => {
        if (data?.data) {
            const userData = {
                ...data.data,
                access_token: currentUser?.access_token || window.localStorage.getItem(ACCESS_TOKEN_KEY),
            };
            dispatch(setCredentials(userData));
            if (typeof window !== "undefined") {
                window.localStorage.setItem(
                    USER_DATA_KEY,
                    JSON.stringify(data.data || {})
                );
            }
            dispatch(setAuthStatus("authenticated"));
        } else if (!isFetching && !data && !isError && hasToken) {
            dispatch(setAuthStatus("authenticated"));
        } else if (!isFetching && !data && !isError && !hasToken) {
            dispatch(setAuthStatus("anonymous"));
        }
    }, [data, isFetching, isError, dispatch, currentUser?.access_token, hasToken]);

    useEffect(() => {
        if (isError && !currentUser) {
            dispatch(clearCredentials());
            dispatch(
                setAuthError(error?.data?.message || "Authentication required")
            );
            dispatch(setAuthStatus("anonymous"));
        }
        if (isError && typeof window !== "undefined") {
            window.localStorage.removeItem(ACCESS_TOKEN_KEY);
            window.localStorage.removeItem(USER_DATA_KEY);
        }
    }, [isError, error, dispatch, currentUser]);

    useEffect(() => {
        if (!isHydrated || !hasToken) return undefined;
        const interval = setInterval(() => {
            trigger();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [trigger, isHydrated, hasToken]);

    return null;
}

