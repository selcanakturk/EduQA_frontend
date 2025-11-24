import React from "react";
import { FiAlertCircle, FiRefreshCw, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Burada bir error logging servisine gönderebilirsin (örn: Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, errorInfo, onReset }) {
  const navigate = useNavigate();
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4">
            <FiAlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Bir şeyler ters gitti
          </h1>
          <p className="mb-6 text-gray-600">
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya
            ana sayfaya dönün.
          </p>

          {isDevelopment && error && (
            <details className="mb-6 w-full rounded-lg bg-gray-50 p-4 text-left">
              <summary className="cursor-pointer font-semibold text-gray-700">
                Hata Detayları (Geliştirme Modu)
              </summary>
              <div className="mt-4 space-y-2">
                <div>
                  <p className="font-semibold text-red-600">Hata:</p>
                  <pre className="mt-1 overflow-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
                    {error.toString()}
                  </pre>
                </div>
                {errorInfo && (
                  <div>
                    <p className="font-semibold text-red-600">Stack Trace:</p>
                    <pre className="mt-1 overflow-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <FiRefreshCw className="h-5 w-5" />
              Tekrar Dene
            </button>
            <button
              onClick={() => {
                onReset();
                navigate("/");
              }}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FiHome className="h-5 w-5" />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;

