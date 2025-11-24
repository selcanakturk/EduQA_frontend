import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiUser, FiBell, FiMenu, FiX } from "react-icons/fi";
import { useLogoutMutation } from "../features/auth/authApi";
import {
  clearCredentials,
  selectCurrentUser,
} from "../features/auth/authSlice";
import { openAuthModal } from "../features/ui/uiSlice";
import { apiSlice } from "../features/api/apiSlice";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../features/notifications/notificationApi";
import LanguageSwitcher from "./LanguageSwitcher";
export default function Navbar() {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const [logoutApi, { isLoading }] = useLogoutMutation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: notificationsData, refetch } = useGetNotificationsQuery(
    undefined,
    { skip: !user, pollingInterval: 30000 }
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("auth_user");
        window.localStorage.removeItem("token");
      }
      dispatch(clearCredentials());
      dispatch(apiSlice.util.resetApiState());
      toast.success(t("auth.logoutSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || t("auth.logoutFailed"));
    }
  };

  return (
    <nav className="relative z-40 bg-white/90 backdrop-blur shadow p-3 md:p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">
          EduQA<span className="text-slate-900"> Campus</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-sm lg:text-base">
          {/* Ana Navigasyon */}
          <Link
            to="/"
            className="font-semibold text-gray-600 transition hover:text-blue-600 whitespace-nowrap"
          >
            {t("nav.discover")}
          </Link>
          <Link
            to="/ask"
            className="rounded-full border border-blue-200 px-4 py-2 font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50 whitespace-nowrap"
          >
            {t("nav.askQuestion")}
          </Link>

          {/* Kullanıcı Bilgileri ve Ayarlar */}
          {user ? (
            <>
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-full bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
                  aria-label="Notifications"
                >
                  <FiBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-12 z-[9999] w-80 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl animate-slide-in-right">
                    <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
                      <h3 className="font-semibold text-gray-900">{t("notifications.title")}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              await markAllAsRead().unwrap();
                              refetch();
                            } catch (err) {
                              toast.error(t("notifications.markAllReadError"));
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          {t("notifications.markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          {t("notifications.noNotifications")}
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={async () => {
                              if (!notification.read) {
                                try {
                                  await markAsRead(notification._id).unwrap();
                                  refetch();
                                } catch (err) {
                                  // Silent fail
                                }
                              }
                              if (notification.question) {
                                navigate(`/questions/${notification.question._id || notification.question}`);
                                setShowNotifications(false);
                              }
                            }}
                            className={`cursor-pointer border-b border-gray-100 p-4 transition hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              {notification.fromUser?.profile_image && (
                                <img
                                  src={
                                    notification.fromUser.profile_image.startsWith("http")
                                      ? notification.fromUser.profile_image
                                      : `${process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5002"}/${notification.fromUser.profile_image.startsWith("uploads/") ? notification.fromUser.profile_image : `uploads/${notification.fromUser.profile_image}`}`
                                  }
                                  alt={notification.fromUser.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleDateString("tr-TR", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to={`/profile/${user.id || user._id}`}
                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 lg:px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 whitespace-nowrap"
              >
                <FiUser className="h-4 w-4" />
                <span className="hidden lg:inline">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
              >
                {t("nav.logout")}
              </button>
              {/* Dil değiştirici - kullanıcı bilgilerinin yanında */}
              <div className="ml-2 pl-3 border-l border-gray-200">
                <LanguageSwitcher />
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => dispatch(openAuthModal("login"))}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 lg:px-5 py-2 font-semibold text-white transition hover:bg-blue-700 whitespace-nowrap"
              >
                <FiUser className="h-4 w-4" />
                <span className="hidden lg:inline">{t("nav.myAccount")}</span>
                <span className="lg:hidden">{t("nav.login")}</span>
              </button>
              {/* Dil değiştirici - login butonunun yanında */}
              <div className="ml-2 pl-3 border-l border-gray-200">
                <LanguageSwitcher />
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition"
          aria-label="Menu"
        >
          {showMobileMenu ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-2 animate-fade-in"
        >
          {/* Ana Navigasyon */}
          <Link
            to="/"
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2.5 font-semibold text-gray-600 transition hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            {t("nav.discover")}
          </Link>
          <Link
            to="/ask"
            onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-2.5 rounded-lg border border-blue-200 font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
          >
            {t("nav.askQuestion")}
          </Link>

          {/* Kullanıcı Bilgileri ve Ayarlar */}
          {user ? (
            <>
              <div className="relative pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 text-gray-700 transition hover:bg-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <FiBell className="h-5 w-5" />
                    <span className="font-semibold">{t("notifications.title")}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-3">
                      <h3 className="text-sm font-semibold text-gray-900">{t("notifications.title")}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              await markAllAsRead().unwrap();
                              refetch();
                            } catch (err) {
                              toast.error(t("notifications.markAllReadError"));
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          {t("notifications.markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          {t("notifications.noNotifications")}
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={async () => {
                              if (!notification.read) {
                                try {
                                  await markAsRead(notification._id).unwrap();
                                  refetch();
                                } catch (err) {
                                  // Silent fail
                                }
                              }
                              if (notification.question) {
                                navigate(`/questions/${notification.question._id || notification.question}`);
                                setShowNotifications(false);
                                setShowMobileMenu(false);
                              }
                            }}
                            className={`cursor-pointer border-b border-gray-100 p-3 transition hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              {notification.fromUser?.profile_image && (
                                <img
                                  src={
                                    notification.fromUser.profile_image.startsWith("http")
                                      ? notification.fromUser.profile_image
                                      : `${process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5002"}/${notification.fromUser.profile_image.startsWith("uploads/") ? notification.fromUser.profile_image : `uploads/${notification.fromUser.profile_image}`}`
                                  }
                                  alt={notification.fromUser.name}
                                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 break-words">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleDateString("tr-TR", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to={`/profile/${user.id || user._id}`}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <FiUser />
                {user.name}
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                disabled={isLoading}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {t("nav.logout")}
              </button>
              {/* Dil değiştirici - mobil menüde en altta */}
              <div className="pt-2 border-t border-gray-200">
                <LanguageSwitcher />
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  dispatch(openAuthModal("login"));
                  setShowMobileMenu(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                <FiUser className="text-white" />
                {t("nav.myAccount")}
              </button>
              {/* Dil değiştirici - mobil menüde en altta */}
              <div className="pt-2 border-t border-gray-200">
                <LanguageSwitcher />
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
