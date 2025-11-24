import { FiAlertCircle, FiRefreshCw, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * RTK Query ve diğer async hatalar için fallback component
 */
export default function ErrorFallback({ error, resetErrorBoundary }) {
  const navigate = useNavigate();
  const isDevelopment = process.env.NODE_ENV === "development";

  const handleGoHome = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    navigate("/");
  };

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-white p-8 shadow">
      <div className="w-full max-w-lg text-center">
        <div className="mb-4 inline-flex rounded-full bg-red-100 p-4">
          <FiAlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Bir hata oluştu
        </h2>
        <p className="mb-6 text-gray-600">
          {error?.message || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."}
        </p>

        {isDevelopment && error?.stack && (
          <details className="mb-6 w-full rounded-lg bg-gray-50 p-4 text-left">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Hata Detayları (Geliştirme Modu)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiRefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <FiHome className="h-4 w-4" />
            Ana Sayfa
          </button>
        </div>
      </div>
    </div>
  );
}

