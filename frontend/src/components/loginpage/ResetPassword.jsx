import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../../config/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    try {
      await axios.post(apiUrl(`/api/admin/reset-password/${token}`), { password });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("Error resetting password. Token may be invalid or expired.");
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
        <form className="login-form" onSubmit={handleResetPassword}>
          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-btn">
            Reset Password
          </button>
          {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
