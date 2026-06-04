import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../config/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiUrl("/api/admin/forgot-password"), { email });
      setMessage("Reset link sent to your email!");
    } catch (err) {
      setMessage("Error sending reset link. Please try again.");
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
        <div className="brand">
          <h2>Trambakraj Traders</h2>
        </div>
        <form className="login-form" onSubmit={handleForgotPassword}>
          <div className="input-group">
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="login-btn">
            Send Reset Link
          </button>
          {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
          <p style={{ textAlign: "center", cursor: "pointer" }} onClick={() => navigate("/login")}>
            Back to Login
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
