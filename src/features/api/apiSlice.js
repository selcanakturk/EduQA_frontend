import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { selectCurrentUser } from "../auth/authSlice";

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5002/api";

if (!process.env.REACT_APP_API_URL) {
  console.warn(
    "REACT_APP_API_URL tanımlı değil; varsayılan olarak http://localhost:5002/api kullanılıyor."
  );
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
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
  }),
  tagTypes: ["Auth", "Question", "Answer", "User", "Notification", "Bookmark"],
  endpoints: () => ({}),
});
