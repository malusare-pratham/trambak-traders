import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, CheckCircle, FileText } from "lucide-react";

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* ❌ वरचा header untouched */}
      <div style={{ textAlign: "center", padding: "30px 10px 15px 10px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "42px",
            fontWeight: "900",
            textAlign: "center",
            background: "linear-gradient(to bottom, #1a4a8e, #0d2d5e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))",
            letterSpacing: "1.5px",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          त्र्यंबकराज ट्रेडर्स
        </h1>
      </div>

      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          padding: "10px",
          background: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="डॅशबोर्ड"
          active={location.pathname === "/dashboard"}
          onClick={() => navigate("/dashboard")}
        />

        <NavItem
          icon={<Wallet size={20} />}
          label="बाकी रक्कम"
          active={location.pathname === "/pending"}
          onClick={() => navigate("/pending")}
        />

        <NavItem
          icon={<CheckCircle size={20} />}
          label="पूर्ण रक्कम"
          active={location.pathname === "/completed"}
          onClick={() => navigate("/completed")}
        />

        {/* ✅ ONLY THIS PART FIXED */}
        <NavItem
          icon={<FileText size={20} />}
          label="रिपोर्ट"
          active={location.pathname === "/report"}
          onClick={() => navigate("/report")}
        />
      </nav>
    </>
  );
};

// ❌ NavItem untouched
const NavItem = ({ icon, label, active, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        borderRadius: "12px",
        cursor: "pointer",
        backgroundColor: active || isHovered ? "#2196F3" : "white",
        color: active || isHovered ? "white" : "#333",
        fontWeight: "600",
        fontSize: "14px",
        transition: "all 0.3s ease",
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default AdminHeader;
