import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import store from "./store";
import AuthGate from "./components/AuthGate";
import { AuthContextProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthGate />
      <AuthContextProvider>
        <App />
        <Toaster position="top-right" />
      </AuthContextProvider>
    </Provider>
  </React.StrictMode>
);