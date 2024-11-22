import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlusCircle, HiLogout } from "react-icons/hi"; // Heroicons for Create and Logout buttons
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Font Awesome icons for edit and delete

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(null); // Track which task menu is open
  const [error, setError] = useState("");
  const API_URL = "http://127.0.0.1:8000/api/tasks/list/";
  const DELETE_URL = "http://127.0.0.1:8000/api/tasks/delete/";
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch tasks.");
      }

      const data = await response.json();
      setTasks(data.results);
      setFilteredTasks(data.results);
    } catch (err) {
      setError(err.message || "An error occurred while fetching tasks.");
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${DELETE_URL}${taskId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete the task.");
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      setMenuOpen(null); // Close the menu after deletion
    } catch (err) {
      setError(err.message || "An error occurred while deleting the task.");
    }
  };

  // Update a task
  const handleUpdateTask = (taskId) => {
    navigate(`/edit-task/${taskId}`);
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const pendingTasks = tasks.filter((task) => task.status === "yet-to-start" || task.status === "in-progress").length;
  const priorityCounts = {
    low: tasks.filter((task) => task.priority === "low").length,
    medium: tasks.filter((task) => task.priority === "medium").length,
    high: tasks.filter((task) => task.priority === "high").length,
  };

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (startDate) {
      filtered = filtered.filter(
        (task) => new Date(task.deadline) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (task) => new Date(task.deadline) <= new Date(endDate)
      );
    }

    setFilteredTasks(filtered);
  }, [statusFilter, priorityFilter, startDate, endDate, tasks]);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleCreateTask = () => {
    navigate("/create-task");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 drop-shadow-md font-serif">
        Dashboard
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-center">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800">Total Tasks</h3>
          <p className="text-2xl font-semibold text-indigo-600">{totalTasks}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800">Completed Tasks</h3>
          <p className="text-2xl font-semibold text-green-600">{completedTasks}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800">Pending Tasks</h3>
          <p className="text-2xl font-semibold text-red-600">{pendingTasks}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800">Tasks by Priority</h3>
          <p className="text-sm text-gray-600">Low: {priorityCounts.low}</p>
          <p className="text-sm text-gray-600">Medium: {priorityCounts.medium}</p>
          <p className="text-sm text-gray-600">High: {priorityCounts.high}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8 justify-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-2 px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 font-serif"
        >
          <option value="all">All Statuses</option>
          <option value="yet-to-start">Yet to Start</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="hold">Hold</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border-2 px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 font-serif"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-serif">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-2 px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 font-serif"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-serif">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-2 px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 font-serif"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mb-8">
        <button
          onClick={handleCreateTask}
          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl hover:bg-blue-700 transition-all duration-300 font-serif"
        >
          <HiPlusCircle className="mr-2" size={20} />
          Create Task
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl hover:bg-red-700 transition-all duration-300 font-serif"
        >
          <HiLogout className="mr-2" size={20} />
          Logout
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="relative border-2 rounded-lg p-6 shadow-md bg-white hover:shadow-xl transition-shadow duration-300 font-serif"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {task.title}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Description:</strong> {task.description}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Status:</strong> {task.status}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Priority:</strong> {task.priority}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Deadline:</strong> {task.deadline}
              </p>

              {/* Action Menu */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() =>
                    setMenuOpen((prev) => (prev === task.id ? null : task.id))
                  }
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FaEdit className="text-lg" />
                </button>
                {menuOpen === task.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md">
                    <button
                      onClick={() => handleUpdateTask(task.id)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaEdit className="mr-2" size={14} /> Update
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-100"
                    >
                      <FaTrashAlt className="mr-2" size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 font-serif">
            No tasks available.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
