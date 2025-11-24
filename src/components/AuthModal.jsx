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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-3 md:px-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm uppercase tracking-wide text-blue-500">
                            EduQA Campus
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                            Hesabınla devam et
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-gray-200 p-1.5 md:p-2 text-gray-500 transition hover:text-gray-800 flex-shrink-0"
                    >
                        <FiX className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                </div>

                <div className="mt-4 md:mt-6 flex rounded-full bg-gray-100 p-1 text-xs md:text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => dispatch(setAuthModalMode("login"))}
                        className={`flex-1 rounded-full px-3 py-1.5 md:px-4 md:py-2 transition ${mode === "login"
                            ? "bg-white text-blue-600 shadow"
                            : "text-gray-500"
                            }`}
                    >
                        Giriş Yap
                    </button>
                    <button
                        type="button"
                        onClick={() => dispatch(setAuthModalMode("register"))}
                        className={`flex-1 rounded-full px-3 py-1.5 md:px-4 md:py-2 transition ${mode === "register"
                            ? "bg-white text-blue-600 shadow"
                            : "text-gray-500"
                            }`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <div className="mt-4 md:mt-6">
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

