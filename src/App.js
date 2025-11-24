import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import QuestionDetail from "./pages/QuestionDetail";
import AskQuestion from "./pages/AskQuestion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthModal from "./components/AuthModal";
import ErrorBoundary from "./components/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./utils/errorHandler";

function App() {
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          <AuthModal />
          <div className="container mx-auto px-4 py-6">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/questions/:id" element={<QuestionDetail />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/ask" element={<AskQuestion />} />
                  <Route path="/profile/:id" element={<Profile />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
