import React from "react";
import ReactDOM from "react-dom/client"; // For React 18 and higher
import "./index.css"; // Tailwind CSS file
import App from "./App";

// Create the root of the React application
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component inside the root element
root.render(<App />);
