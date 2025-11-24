import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Emin misin?",
  message = "Bu işlemi geri alamazsın.",
  confirmText = "Evet, Eminim",
  cancelText = "İptal",
  type = "danger", // "danger" | "warning" | "info"
  isLoading = false,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      button: "bg-red-600 hover:bg-red-700 text-white",
      icon: "text-red-600",
      bg: "bg-red-50",
    },
    warning: {
      button: "bg-orange-600 hover:bg-orange-700 text-white",
      icon: "text-orange-600",
      bg: "bg-orange-50",
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "text-blue-600",
      bg: "bg-blue-50",
    },
  };

  const styles = typeStyles[type] || typeStyles.danger;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-3 md:px-4 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl md:rounded-2xl bg-white shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center gap-2 md:gap-3 rounded-t-xl md:rounded-t-2xl ${styles.bg} p-3 md:p-4`}>
          <div className={`rounded-full ${styles.bg} p-1.5 md:p-2 flex-shrink-0`}>
            <FiAlertTriangle className={`h-5 w-5 md:h-6 md:w-6 ${styles.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 break-words">{title}</h3>
          </div>
          {!isLoading && (
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 flex-shrink-0"
              aria-label="Close"
            >
              <FiX className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <p className="text-sm md:text-base text-gray-700 break-words">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 md:gap-3 rounded-b-xl md:rounded-b-2xl border-t border-gray-200 bg-gray-50 p-3 md:p-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 md:px-4 text-xs md:text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`rounded-lg px-3 py-2 md:px-4 text-xs md:text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${styles.button}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                İşleniyor...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

