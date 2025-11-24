import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { selectCurrentUser } from "../auth/authSlice";
import { parseApiError, logError } from "../../utils/errorHandler";

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5002/api";

if (!process.env.REACT_APP_API_URL) {
  console.warn(
    "REACT_APP_API_URL tanımlı değil; varsayılan olarak http://localhost:5002/api kullanılıyor."
  );
}

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint, type, forced }) => {
    // If the body is FormData, let the browser set the Content-Type header
    if (endpoint === 'askQuestion' || endpoint === 'addAnswer' || endpoint === 'uploadProfileImage' || endpoint === 'editQuestion') {
      headers.delete('Content-Type');
    } else {
      headers.set("Content-Type", "application/json");
    }
    const user = selectCurrentUser(getState());
    const token = user?.access_token || user?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Error handling ile baseQuery wrapper
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Hata durumunda loglama
  if (result.error) {
    const errorMessage = parseApiError(result.error);
    logError(result.error, null, {
      endpoint: args.url || args,
      method: args.method || "GET",
      status: result.error.status,
    });

    // 401 hatası durumunda kullanıcıyı logout et (opsiyonel)
    if (result.error.status === 401) {
      // Burada logout işlemi yapılabilir
      // dispatch(clearCredentials());
    }

    // Error objesine parse edilmiş mesajı ekle
    result.error = {
      ...result.error,
      parsedMessage: errorMessage,
    };
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Auth", "Question", "Answer", "User", "Notification", "Bookmark"],
  endpoints: () => ({}),
});
