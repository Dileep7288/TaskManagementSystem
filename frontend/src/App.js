import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
import DashboardPage from "./components/DashboardPage";
import CreateTaskPage from "./components/CreateTaskPage";
import UpdateTaskPage from "./components/UpdateTaskPage";

// Function to check if the user is authenticated
const isAuthenticated = () => !!localStorage.getItem("accessToken");

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<DashboardPage />} />}
          />
          <Route
            path="/create-task"
            element={<ProtectedRoute element={<CreateTaskPage />} />}
          />
          {/* Route for updating a task with a dynamic :id parameter */}
          <Route
            path="/edit-task/:id"
            element={<ProtectedRoute element={<UpdateTaskPage />} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
