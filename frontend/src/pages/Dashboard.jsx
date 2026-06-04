import React, { useState, useEffect } from "react";
import Invoice from "../components/dashboard/Invoice";
import { UserCog, Zap, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [liveBhav, setLiveBhav] = useState("ताजे बाजारभाव लोड होत आहेत, कृपया प्रतीक्षा करा...");

  // --- API FETCH LOGIC START ---
  useEffect(() => {
    const getLiveMarketData = async () => {
      try {
        const apiKey = "579b464db66ec23bdd000001dc6ef7663e8746615667305510709d20"; 
        const url = `https://api.data.gov.in/resource/9ef27131-652a-4a3a-a3a3-705074e767c7?api-key=${apiKey}&format=json&limit=20`;

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.records && data.records.length > 0) {
          const formattedData = data.records.map(item => 
            `${item.commodity} (${item.market}): ₹${item.modal_price}`
          ).join("   |   ");
          
          setLiveBhav(formattedData + "   |   त्र्यंबकराज ट्रेडर्स Live Update   |   ");
        }
      } catch (error) {
        console.error("API Error:", error);
        setLiveBhav("मका ₹२,३५० | सोयाबीन ₹४,८०० | कापूस ₹७,५०० | तूर ₹९,६०० | गहू ₹२,९०० | त्र्यंबकराज ट्रेडर्स");
      }
    };

    getLiveMarketData();
    const interval = setInterval(getLiveMarketData, 900000); 
    return () => clearInterval(interval);
  }, []);
  // --- API FETCH LOGIC END ---

  return (
    <div className="bill-page" style={{ 
      backgroundColor: "#f4f6f8", 
      minHeight: "100vh",
      margin: 0,
      padding: 0 
    }}>
      
      {/* --- प्रीमियम हेडर --- */}
      <div style={{ textAlign: "center", padding: "20px 10px 5px 10px" }}>
        <h1 style={{
            margin: 0, fontSize: "clamp(28px, 8vw, 42px)", fontWeight: "900", textAlign: "center",
            background: "linear-gradient(to bottom, #1a4a8e, #0d2d5e)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}>
          त्र्यंबकराज ट्रेडर्स
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "5px" }}>
          <div style={{ height: "2px", width: "40px", background: "#2196F3" }}></div>
          <span style={{ margin: "0 10px", fontSize: "14px", color: "#555", fontWeight: "600" }}>चलन जनरेटर</span>
          <div style={{ height: "2px", width: "40px", background: "#2196F3" }}></div>
        </div>
      </div>

      {/* --- 1. Admin and Logout Buttons --- */}
      <div style={{
        maxWidth: "1150px",
        margin: "0 auto 10px auto",
        padding: "0 10px",
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
      }}>
        <div
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#333",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
            border: "1px solid #ddd",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#2196F3";
            e.currentTarget.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#333";
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </div>
        <div
          onClick={() => navigate("/admin")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#333",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
            border: "1px solid #ddd",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#2196F3";
            e.currentTarget.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#333";
          }}
        >
          <UserCog size={20} />
          <span>Admin Panel</span>
        </div>
      </div>

      {/* --- 2. Live Marquee Section (Full Width Screen) --- */}
      <div style={{
        width: "100%", // पूर्ण स्क्रीन रुंदी
        margin: "0 0 15px 0",
        padding: 0,
      }}>
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderTop: "2px solid #2196F3", // नवीन कलर
          borderBottom: "2px solid #2196F3", // नवीन कलर
          borderRadius: "0px",
          height: "65px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          {/* Label Section */}
          <div style={{
            backgroundColor: "#2196F3", // नवीन कलर
            color: "white",
            padding: "0 25px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "18px",
            whiteSpace: "nowrap",
            zIndex: 5
          }}>
            <Zap size={22} fill="yellow" style={{marginRight: "8px"}} />
            आजचे बाजारभाव
          </div>

          <div className="market-ticker">
            <div className="market-ticker-text">{liveBhav}</div>
          </div>
        </div>
      </div>

      {/* --- 3. Invoice Section --- */}
      <div className="bill-container" style={{ padding: "0px 10px 10px 10px" }}>
        <Invoice />
      </div>
    </div>
  );
};

export default Dashboard;
