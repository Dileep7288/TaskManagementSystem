import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateTaskPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [status, setStatus] = useState("yet-to-start");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const API_URL = "http://127.0.0.1:8000/api/tasks/"; // Replace with your actual API URL
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Access Token:", token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      priority,
      status,
      deadline,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task. Please try again.");
      }

      setSuccess("Task created successfully!");
      setError("");

      // Redirect to Dashboard after successful task creation
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 py-12">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center tracking-tight">
          Create Task
        </h1>

        {/* Success Message */}
        {success && (
          <p className="text-green-600 text-center mb-4 font-medium">
            {success}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              rows="4"
              placeholder="Enter task description"
              required
            />
          </div>

          {/* Priority Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
            >
              <option value="yet-to-start">Yet to Start</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="hold">Hold</option>
            </select>
          </div>

          {/* Deadline Field */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition duration-300"
          >
            Create Task
          </button>
        </form>

        {/* Link to Dashboard */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;
