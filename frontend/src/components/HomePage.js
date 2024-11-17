import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center bg-white py-12 px-8 rounded-xl shadow-2xl max-w-3xl w-full">
        {/* Heading with proper line-height */}
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-10 leading-tight">
          Welcome to Task Management System
        </h1>
        <p className="text-lg text-gray-700 mb-10 leading-relaxed">
          Boost your productivity and stay organized with our simple yet
          powerful task management system. Create, track, and prioritize your
          tasks effortlessly.
        </p>

        {/* Decorative Icons */}
        <div className="flex justify-center space-x-8 mb-10">
          <div className="p-4 bg-blue-100 rounded-full">
            <i className="fas fa-tasks text-blue-500 text-4xl"></i>
          </div>
          <div className="p-4 bg-green-100 rounded-full">
            <i className="fas fa-calendar-check text-green-500 text-4xl"></i>
          </div>
          <div className="p-4 bg-purple-100 rounded-full">
            <i className="fas fa-chart-line text-purple-500 text-4xl"></i>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 space-x-6">
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white py-3 px-8 rounded-full shadow-md text-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-block bg-green-600 text-white py-3 px-8 rounded-full shadow-md text-lg font-semibold hover:bg-green-700 hover:shadow-lg transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
