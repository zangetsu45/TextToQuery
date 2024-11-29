import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import Logo from "../../assets/text-to-query-logo.png";

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9000/employees/login", {
        email,
        password,
      });
      const { token } = response.data;
      if (token) {
        localStorage.setItem("jwtToken", token);
        setIsLoggedIn(true);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={Logo} alt="Text to Query Logo" />
        <h2>Welcome Back</h2>
        <form onSubmit={onSubmit}>
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
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Log In</button>
        </form>
        <p>
          New here? <Link to="/signup">Sign Up</Link>
        </p>
      
      </div>
    </div>
  );
};

export default Login;
