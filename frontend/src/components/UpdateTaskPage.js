import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UpdateTaskPage = () => {
  const { id } = useParams(); // Task ID from the URL
  const [task, setTask] = useState({
    title: "",
    description: "",
    status: "yet-to-start",
    priority: "low",
    deadline: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_URL = `http://127.0.0.1:8000/api/tasks/${id}/`;
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // Fetch task details
  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch task details.");
      }

      const data = await response.json();
      setTask({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline,
      });
    } catch (err) {
      setError(err.message || "An error occurred while fetching task details.");
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error("Failed to update the task.");
      }

      setSuccessMessage("Task updated successfully!");
      setError(""); // Clear any previous errors
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      setError(err.message || "An error occurred while updating the task.");
    }
  };

  // If a success message is displayed, show only the success message
  if (successMessage) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-green-50 border-l-4 border-green-500 text-green-700">
        <p className="text-center">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Update Task
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="flex flex-col">
          <label
            htmlFor="title"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
            className="border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label
            htmlFor="description"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            rows="4"
            required
            className="border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label
            htmlFor="status"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={task.status}
            onChange={handleChange}
            className="border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="yet-to-start">Yet to Start</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="hold">Hold</option>
          </select>
        </div>

        {/* Priority */}
        <div className="flex flex-col">
          <label
            htmlFor="priority"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Deadline */}
        <div className="flex flex-col">
          <label
            htmlFor="deadline"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={task.deadline}
            onChange={handleChange}
            required
            className="border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Update Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTaskPage;
