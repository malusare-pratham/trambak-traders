import React, { useState } from "react";
import "./LoginPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api";

const LoginPage = () => {
  const navigate = useNavigate();

  // 🔹 NEW STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        apiUrl("/api/admin/login"),
        { email, password }
      );

      // token save
      localStorage.setItem("token", res.data.token);

      // admin page ला redirect
      navigate("/dashboard");
    } catch (err) {
      alert("❌ Invalid Email or Password");
    }
  };

  return (
    <div
      className="login-page"
      style={{
        background: `
          linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
          url(${process.env.PUBLIC_URL + "/maharashtra-corn-field.png"})
          center / cover no-repeat
        `,
      }}
    >
      <div className="login-card">
        {/* Logo + Title */}
        <div className="brand">
          <h2>Trambakraj Traders</h2>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <span className="icon">👤</span>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="forgot">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;//old 
