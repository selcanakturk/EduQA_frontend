/**
 * Global Error Handler Utility
 * Tüm uygulama genelinde hata yönetimi için yardımcı fonksiyonlar
 */

/**
 * API hatalarını parse eder ve kullanıcı dostu mesaj döndürür
 */
export const parseApiError = (error) => {
  if (!error) return "Bilinmeyen bir hata oluştu";

  // Network hatası
  if (error.status === "FETCH_ERROR" || error.error === "FETCH_ERROR") {
    return "Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.";
  }

  // Timeout hatası
  if (error.status === "TIMEOUT_ERROR" || error.error === "TIMEOUT_ERROR") {
    return "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
  }

  // Backend'den gelen hata mesajı
  if (error.data?.message) {
    return error.data.message;
  }

  // Status code'a göre mesajlar
  if (error.status) {
    switch (error.status) {
      case 400:
        return "Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.";
      case 401:
        return "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.";
      case 403:
        return "Bu işlem için yetkiniz bulunmuyor.";
      case 404:
        return "İstenen kaynak bulunamadı.";
      case 409:
        return "Bu işlem çakışma yaratıyor. Lütfen tekrar deneyin.";
      case 422:
        return "Gönderilen veriler geçersiz. Lütfen kontrol edin.";
      case 429:
        return "Çok fazla istek gönderdiniz. Lütfen bir süre sonra tekrar deneyin.";
      case 500:
        return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
      case 502:
        return "Sunucu geçici olarak kullanılamıyor.";
      case 503:
        return "Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
      default:
        return `Bir hata oluştu (${error.status}). Lütfen tekrar deneyin.`;
    }
  }

  // Genel hata mesajı
  if (error.message) {
    return error.message;
  }

  return "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.";
};

/**
 * Hataları loglar (gelecekte error tracking servisine gönderilebilir)
 */
export const logError = (error, errorInfo = null, context = {}) => {
  const errorLog = {
    message: error?.message || "Unknown error",
    stack: error?.stack,
    errorInfo,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : null,
    url: typeof window !== "undefined" ? window.location.href : null,
  };

  // Development modunda console'a yazdır
  if (process.env.NODE_ENV === "development") {
    console.error("Error Log:", errorLog);
  }

  // Production'da bir error tracking servisine gönderilebilir
  // Örnek: Sentry, LogRocket, vs.
  // if (process.env.NODE_ENV === "production") {
  //   Sentry.captureException(error, { extra: errorInfo, contexts: context });
  // }

  return errorLog;
};

/**
 * Async fonksiyonları error handling ile sarmalar
 */
export const withErrorHandling = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      logError(error, null, { function: asyncFn.name, args });
      throw error;
    }
  };
};

/**
 * Promise rejection'ları yakalar
 */
export const setupGlobalErrorHandlers = () => {
  if (typeof window === "undefined") return;

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    logError(event.reason, null, { type: "unhandledrejection" });
    
    // Production'da kullanıcıya bildirim gösterilebilir
    // toast.error("Beklenmeyen bir hata oluştu");
  });

  // Global error handler
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
    logError(event.error, null, { type: "global", filename: event.filename, lineno: event.lineno });
  });
};

