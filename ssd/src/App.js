import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import QueryHistory from "./components/QueryHistory";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [historyUpdate, setHistoryUpdate] = useState(0);
  const fetchEmployeeDetails = async (email, token) => {
    if (email && token) {
      try {
        const response = await axios.get(
          `http://localhost:9000/employees/empDetailsByEmail?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmployeeDetails(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    }
  };

  // Check for JWT token on app initialization
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Optional: Check token expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          // Token has expired
          handleLogout();
        } else {
          setIsLoggedIn(true);
          fetchEmployeeDetails(decoded.email, token);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    }
  }, []);

  const generateTable = (results) => {
    if (!results || results.length === 0) return "No results found.";

    const headers = Object.keys(results[0]);

    const rows = results.map((result) => {
      const cells = headers.map((header) => `<td>${result[header]}</td>`).join("");
      return `<tr>${cells}</tr>`;
    });

    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.join("")}
        </tbody>
      </table>
    `;
    return table;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    try {
      const response = await axios.post("http://localhost:5000/textToQuery", { text: input });
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const query = response.data.query;
      const results = response.data.results;
      const table = generateTable(results);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Generated Query:\n${query}` },
        {
          sender: "bot",
          text: table,
          isTable: true,
          results,
        },
      ]);
      const id = employeeDetails?.id;
      const token = localStorage.getItem("jwtToken");
      const response2 = await axios.post(
        "http://localhost:9000/query",
        { id: id, query: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response2);
      setHistoryUpdate((prev) => prev + 1);
      setInput("");
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : error.message || "Something went wrong.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Error: ${errorMessage}` },
      ]);
      setInput("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    setIsLoggedIn(false);
    setEmployeeDetails(null);
    setMessages([]);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" />
              ) : (
                <Login
                  setIsLoggedIn={(status) => {
                    setIsLoggedIn(status);
                    if (status) {
                      const token = localStorage.getItem("jwtToken");
                      try {
                        const decoded = jwtDecode(token);
                        fetchEmployeeDetails(decoded.email, token);
                      } catch (error) {
                        console.error("Invalid token on login:", error);
                        handleLogout();
                      }
                    }
                  }}
                />
              )
            }
          />
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <>
                  <Navbar handleLogout={handleLogout} employeeDetails={employeeDetails} />
                  <div className="chat-container" style={{ display: "flex", height: "100vh" }}>
                    <div style={{ flex: "0.2", borderRight: "1px solid #ccc", overflowY: "scroll"}}>
                      {employeeDetails && <QueryHistory userId={employeeDetails.id} update={historyUpdate} />}
                    </div>
                    <div style={{ flex: "0.8", display: "flex", flexDirection: "column" }}>
                      <ChatBox messages={messages} />
                      <ChatInput input={input} setInput={setInput} handleSend={handleSend} />
                    </div>
                  </div>
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
