import { FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import {
    closeAuthModal,
    selectAuthModalMode,
    selectAuthModalOpen,
    setAuthModalMode,
} from "../features/ui/uiSlice";
import { dismissAuthPrompt } from "../features/ui/uiSlice";

export default function AuthModal() {
    const dispatch = useDispatch();
    const location = useLocation();
    const isOpen = useSelector(selectAuthModalOpen);
    const mode = useSelector(selectAuthModalMode);

    const handleClose = () => {
        dispatch(closeAuthModal());
        dispatch(dismissAuthPrompt(location.pathname + location.search));
    };

    const handleAuthSuccess = () => {
        dispatch(closeAuthModal());
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-scale-in">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-blue-500">
                            EduQA Campus
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            Hesabınla devam et
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-800"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex rounded-full bg-gray-100 p-1 text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => dispatch(setAuthModalMode("login"))}
                        className={`flex-1 rounded-full px-4 py-2 transition ${mode === "login"
                            ? "bg-white text-blue-600 shadow"
                            : "text-gray-500"
                            }`}
                    >
                        Giriş Yap
                    </button>
                    <button
                        type="button"
                        onClick={() => dispatch(setAuthModalMode("register"))}
                        className={`flex-1 rounded-full px-4 py-2 transition ${mode === "register"
                            ? "bg-white text-blue-600 shadow"
                            : "text-gray-500"
                            }`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <div className="mt-6">
                    {mode === "login" ? (
                        <LoginForm showTitle={false} onSuccess={handleAuthSuccess} />
                    ) : (
                        <RegisterForm showTitle={false} onSuccess={handleAuthSuccess} />
                    )}
                </div>
            </div>
        </div>
    );
}

