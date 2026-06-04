import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiUrl, getAuthHeaders } from "../config/api";

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const farmerName = queryParams.get("name")?.trim();
  const mobileNumber = queryParams.get("mobile")?.trim() || "";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(apiUrl("/api/records"), {
          headers: getAuthHeaders(),
        });
        const allRecords = await response.json();
        const filtered = allRecords.filter(
          (rec) => rec.farmerName?.trim().toLowerCase() === farmerName?.toLowerCase() ||
                   rec.farmerName?.trim() === farmerName?.trim()
        );
        setHistory(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history:", error);
        setLoading(false);
      }
    };
    if (farmerName) fetchHistory();
  }, [farmerName]);

  const handleDownload = () => window.print();

  const handleBackToAdmin = () => {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  };

  if (loading) {
    return (
      <div style={styles.centerWrapper}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  const displayBillNo =
    history.length > 0 ? history[history.length - 1].billNo || "---" : "---";

  return (
    <div style={styles.screenWrapper}>
      <div style={styles.container}>
        <div className="no-print" style={styles.actionButtons}>
          <button onClick={handleBackToAdmin} style={styles.backBtn}>⬅ मागे जा</button>
          <button onClick={handleDownload} style={styles.downloadBtn}>प्रिंट / PDF 📥</button>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.profileIcon}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.farmerTitle, fontSize: 14, color: "#64748b", fontWeight: 600 }}>
              बिल नं: {displayBillNo}
            </div>
            <h1 style={styles.farmerTitle}>{farmerName}</h1>
            <p style={{ margin: 0, color: "#64748b" }}>खातेदार पेमेंट इतिहास</p>
          </div>
          {mobileNumber && <div style={styles.contactBadge}>📞 {mobileNumber}</div>}
        </div>

        {history.length === 0 ? (
          <div style={styles.noDataCard}>रेकॉर्ड सापडले नाही.</div>
        ) : (
          history.map((rec, index) => {
            const currentRemaining = rec.totalAmount - rec.paidAmount;

            return (
              <div key={rec._id || index} style={styles.mainCard}>
                <div style={styles.cropInfoBar}>
                  <div style={styles.infoBox}>
                    <label style={styles.infoLabel}>पिक</label>
                    <span style={styles.infoValue}>{rec.crop || "-"}</span>
                  </div>
                  <div style={styles.infoBox}>
                    <label style={styles.infoLabel}>प्रमाण</label>
                    <span style={styles.infoValue}>{rec.quantity || "-"}</span>
                  </div>
                  <div style={styles.infoBox}>
                    <label style={styles.infoLabel}>दर</label>
                    <span style={styles.infoValue}>₹{rec.rate || "0"}</span>
                  </div>

                  {/* ✅ UPDATED TOTAL BILL BADGE Prathmesh Malusare */}
                  <div style={styles.totalBadge}>
                    <span style={styles.totalLabel}>एकूण बिल</span>
                    <span style={styles.totalAmount}>₹{rec.totalAmount}</span>
                  </div>
                </div>

                <div style={styles.tableWrapper}>
                  <div style={styles.tableHeaderGrid}>
                    <div style={styles.gridHeaderItem}>पेमेंट तारीख</div>
                    <div style={styles.gridHeaderItem}>जमा रक्कम</div>
                    <div style={{ ...styles.gridHeaderItem, textAlign: "right" }}>बाकी</div>
                  </div>

                  {rec.payments?.length > 0 ? (
                    rec.payments.map((p, i) => (
                      <div key={i} style={styles.tableRowGrid}>
                        <div style={styles.gridBodyItem}>{p.date}</div>
                        <div style={styles.gridBodyItemAmount}>+ ₹{p.amount}</div>
                        <div style={{ ...styles.gridBodyItem, textAlign: "right" }}>
                          {p.remaining <= 0
                            ? <span style={styles.successBadge}>पूर्ण</span>
                            : <span style={styles.dangerText}>₹{p.remaining}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.tableRowGrid}>
                      <div style={styles.gridBodyItem}>{rec.date}</div>
                      <div style={styles.gridBodyItemAmount}>+ ₹{rec.paidAmount}</div>
                      <div style={{ ...styles.gridBodyItem, textAlign: "right" }}>
                        {currentRemaining <= 0
                          ? <span style={styles.successBadge}>पूर्ण</span>
                          : <span style={styles.dangerText}>₹{currentRemaining}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.footerBar}>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    तारीख: {rec.date} | बिल: {rec.billNo}
                  </div>
                  <div style={currentRemaining <= 0 ? styles.statusPaid : styles.statusPending}>
                    {currentRemaining <= 0 ? "✅ हिशोब चुकता" : `बाकी: ₹${currentRemaining}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  screenWrapper: { display: "flex", justifyContent: "center", backgroundColor: "#f4f7f6", minHeight: "100vh", padding: "30px 10px" },
  centerWrapper: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  container: { width: "100%", maxWidth: "800px", fontFamily: "sans-serif" },
  spinner: { width: 40, height: 40, border: "4px solid #ddd", borderTop: "4px solid #10b981", borderRadius: "50%" },

  actionButtons: { display: "flex", justifyContent: "space-between", marginBottom: 20 },
  backBtn: { padding: "10px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 600 },
  downloadBtn: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#1e293b", color: "#fff", fontWeight: 600 },

  profileCard: { background: "#fff", padding: 20, borderRadius: 12, display: "flex", alignItems: "center", gap: 15, marginBottom: 20 },
  profileIcon: { width: 50, height: 50, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  farmerTitle: { margin: 0, fontSize: 24, color: "#1e293b" },
  contactBadge: { background: "#f1f5f9", padding: "8px 12px", borderRadius: 8, fontWeight: 600 },

  mainCard: { background: "#fff", borderRadius: 12, marginBottom: 30, overflow: "hidden", border: "1px solid #e2e8f0" },
  cropInfoBar: { display: "flex", padding: 20, justifyContent: "space-between", alignItems: "center" },
  infoBox: { display: "flex", flexDirection: "column" },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 700 },
  infoValue: { fontSize: 16, fontWeight: 700 },

  /* ✅ ONLY UPDATED STYLE */
  totalBadge: {
    background: "#10b981",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 10,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  totalLabel: { fontSize: 12, fontWeight: 600, opacity: 0.9 },
  totalAmount: { fontSize: 20, fontWeight: 800 },

  tableWrapper: { padding: "10px 0" },
  tableHeaderGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", padding: "12px 20px", background: "#f8fafc" },
  tableRowGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", padding: "15px 20px" },

  gridHeaderItem: { fontSize: 13, fontWeight: 700, color: "#64748b" },
  gridBodyItem: { fontSize: 15 },
  gridBodyItemAmount: { fontSize: 15, fontWeight: 700, color: "#059669" },

  successBadge: { background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: 5 },
  dangerText: { color: "#ef4444", fontWeight: 700 },

  footerBar: { padding: "15px 20px", display: "flex", justifyContent: "space-between", background: "#f8fafc" },
  statusPaid: { color: "#10b981", fontWeight: 700 },
  statusPending: { color: "#ef4444", fontWeight: 700 },
  noDataCard: { textAlign: "center", padding: 40 }
};

export default PaymentHistory;
