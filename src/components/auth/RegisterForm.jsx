import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useRegisterMutation } from "../../features/auth/authApi";
import {
    clearPostAuthRedirect,
    selectCurrentUser,
    selectPostAuthRedirect,
    setCredentials,
} from "../../features/auth/authSlice";

const registerSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir email girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    role: z.enum(["student", "teacher"], {
        required_error: "Lütfen bir rol seçin",
    }),
    department: z.string().optional(),
    branch: z.string().optional(),
}).refine((data) => {
    if (data.role === "student" && !data.department) {
        return false;
    }
    if (data.role === "teacher" && !data.branch) {
        return false;
    }
    return true;
}, {
    message: "Öğrenci isen bölüm, öğretmen isen branş girmelisin",
    path: ["department"],
});

export default function RegisterForm({
    onSuccess,
    variant = "modal",
    showTitle = true,
}) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "student",
            department: "",
            branch: "",
        },
    });

    const selectedRole = watch("role");

    const [registerUser, { isLoading }] = useRegisterMutation();
    const user = useSelector(selectCurrentUser);
    const redirectPath = useSelector(selectPostAuthRedirect);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
        if (variant === "page") {
            navigate("/", { replace: true });
        }
    };

    const onSubmit = async (values) => {
        try {
            const response = await registerUser(values).unwrap();
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
            toast.success("Hesap oluşturuldu, hoş geldin!");
            handleSuccessFlow();
        } catch (error) {
            toast.error(error?.data?.message || "Kayıt başarısız");
        }
    };

    return (
        <div>
            {showTitle && (
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">Kayıt Ol</h2>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">İsim</label>
                    <input
                        type="text"
                        className="w-full rounded border px-3 py-2"
                        placeholder="Selcan Aktürk"
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="w-full rounded border px-3 py-2"
                        placeholder="ornek@mail.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Şifre</label>
                    <input
                        type="password"
                        className="w-full rounded border px-3 py-2"
                        placeholder="******"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Rol</label>
                    <select
                        className="w-full rounded border px-3 py-2"
                        {...register("role")}
                    >
                        <option value="student">Öğrenci</option>
                        <option value="teacher">Öğretmen</option>
                    </select>
                    {errors.role && (
                        <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
                    )}
                </div>

                {selectedRole === "student" && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">Bölüm</label>
                        <input
                            type="text"
                            className="w-full rounded border px-3 py-2"
                            placeholder="Örn: Yazılım Mühendisliği"
                            {...register("department")}
                        />
                        {errors.department && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.department.message}
                            </p>
                        )}
                    </div>
                )}

                {selectedRole === "teacher" && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">Branş</label>
                        <input
                            type="text"
                            className="w-full rounded border px-3 py-2"
                            placeholder="Örn: Matematik, Fizik, Programlama"
                            {...register("branch")}
                        />
                        {errors.branch && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.branch.message}
                            </p>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full rounded bg-blue-600 py-2 text-white font-semibold transition hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
                </button>
            </form>
        </div>
    );
}

