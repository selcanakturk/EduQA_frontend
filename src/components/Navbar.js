import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiUser, FiBell } from "react-icons/fi";
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
  const notificationRef = useRef(null);
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
    <nav className="relative z-40 bg-white/90 backdrop-blur shadow p-4 flex flex-wrap gap-4 justify-between items-center">
      <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight">
        EduQA<span className="text-slate-900"> Campus</span>
      </Link>
      <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
        <LanguageSwitcher />
        <Link
          to="/"
          className="font-semibold text-gray-600 transition hover:text-blue-600"
        >
          {t("nav.discover")}
        </Link>
        <Link
          to="/ask"
          className="rounded-full border border-blue-200 px-4 py-2 font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
        >
          {t("nav.askQuestion")}
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
              >
                <FiBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-[9999] w-80 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
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
              className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
            >
              <FiUser />
              {user.name}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {t("nav.logout")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => dispatch(openAuthModal("login"))}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiUser className="text-white" />
            {t("nav.myAccount")}
          </button>
        )}
      </div>
    </nav>
  );
}
