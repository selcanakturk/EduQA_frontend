import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import store from "./store";
import AuthGate from "./components/AuthGate";
import { AuthContextProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./i18n/config";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ErrorBoundary>
          <AuthGate />
        </ErrorBoundary>
        <ErrorBoundary>
          <AuthContextProvider>
            <App />
            <Toaster position="top-right" />
          </AuthContextProvider>
        </ErrorBoundary>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);