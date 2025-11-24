import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useLoginMutation } from "../../features/auth/authApi";
import {
    clearPostAuthRedirect,
    selectCurrentUser,
    selectPostAuthRedirect,
    setCredentials,
    setAuthError,
} from "../../features/auth/authSlice";

const loginSchema = z.object({
    email: z.string().email("Geçerli bir email girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export default function LoginForm({
    onSuccess,
    variant = "modal",
    showTitle = true,
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [login, { isLoading }] = useLoginMutation();
    const user = useSelector(selectCurrentUser);
    const redirectPath = useSelector(selectPostAuthRedirect);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user && variant === "page") {
            navigate("/");
        }
    }, [user, variant, navigate]);

    const handleSuccessFlow = () => {
        onSuccess?.();
        if (redirectPath) {
            navigate(redirectPath, { replace: true });
            dispatch(clearPostAuthRedirect());
            return;
        }
        const fromState = location.state?.from?.pathname;
        if (fromState) {
            navigate(fromState, { replace: true });
            return;
        }
        if (variant === "page") {
            navigate("/", { replace: true });
        }
    };

    const onSubmit = async (values) => {
        try {
            const response = await login(values).unwrap();
            if (typeof window !== "undefined" && response?.access_token) {
                window.localStorage.setItem("access_token", response.access_token);
                window.localStorage.setItem(
                    "auth_user",
                    JSON.stringify(response?.data || {})
                );
                window.localStorage.removeItem("token");
            }
            dispatch(
                setCredentials({
                    ...(response?.data || {}),
                    access_token: response?.access_token,
                })
            );
            toast.success("Hoş geldin!");
            handleSuccessFlow();
        } catch (error) {
            const message = error?.data?.message || "Giriş işlemi başarısız";
            dispatch(setAuthError(message));
            toast.error(message);
        }
    };

    return (
        <div>
            {showTitle && (
                <h2 className="mb-3 md:mb-4 text-xl md:text-2xl font-semibold text-gray-900">Giriş Yap</h2>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
                <div>
                    <label className="mb-1 block text-xs md:text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                        placeholder="ornek@mail.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs md:text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-xs md:text-sm font-medium">Şifre</label>
                    <input
                        type="password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                        placeholder="******"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs md:text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-2.5 md:py-2 text-sm md:text-base text-white font-semibold transition hover:bg-blue-700 disabled:opacity-50 active:scale-95"
                    disabled={isLoading}
                >
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
            </form>
        </div>
    );
}

