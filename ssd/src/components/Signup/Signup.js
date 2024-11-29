import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";
import Logo from "../../assets/text-to-query-logo.png";

const Signup = ({ switchToLogin }) => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    return passwordRegex.test(password);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validatePassword(password)) {
      setError(
        "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    const payload = {
      username,
      age: parseInt(age, 10),
      designation,
      email,
      password,
    };

    try {
      const response = await axios.post("http://localhost:9000/employees/register", payload);
      console.log(response)
      setSuccessMessage("Account created successfully. Please log in.");
      setUsername("");
      setEmail("");
      setAge("");
      setDesignation("");
      setPassword("");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to create account. Please try again.";
      setError(errorMsg);
    }
  };
  const redirectToLogin = () => {
    navigate("/login"); 
  };
  return (
    <div className="signup-container">
      <div className="signup-card">
        <img src={Logo} alt="Text to Query Logo" />
        <h2>Create Account</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="designation">Designation:</label>
            <input
              type="text"
              id="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
          </div>
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account?{" "}
          <span className="link" onClick={redirectToLogin}>
            Log In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
