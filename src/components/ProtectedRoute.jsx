import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import {
  selectAuthStatus,
  selectCurrentUser,
  setPostAuthRedirect,
} from "../features/auth/authSlice";
import {
  openAuthModal,
  selectAuthModalOpen,
  selectAuthPromptDismissedPath,
} from "../features/ui/uiSlice";

export default function ProtectedRoute() {
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const isModalOpen = useSelector(selectAuthModalOpen);
  const dismissedPath = useSelector(selectAuthPromptDismissedPath);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user && status !== "checking") {
      const currentPath = location.pathname + location.search;

      dispatch(setPostAuthRedirect(currentPath));

      const alreadyDismissed = dismissedPath === currentPath;

      if (!isModalOpen && !alreadyDismissed) {
        dispatch(openAuthModal("login"));
      }
    }
  }, [user, status, location, isModalOpen, dismissedPath, dispatch]);


  if (status === "checking") {
    return (
      <div className="py-20 text-center text-gray-500">
        Hesap bilgilerin kontrol ediliyor...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-dashed border-blue-200 bg-white/60 p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-800">
          Bu alana erişmek için giriş yapmalısın.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Hesabın yoksa saniyeler içinde oluşturabilirsin.
        </p>
        <button
          type="button"
          onClick={() => dispatch(openAuthModal("login"))}
          className="mt-4 rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          Hesabımla devam et
        </button>
      </div>
    );
  }

  return <Outlet />;
}