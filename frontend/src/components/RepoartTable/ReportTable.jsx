import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportTable.css";
import { apiUrl, getAuthHeaders } from "../../config/api";

const ReportTable = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [records, setRecords] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const onlyDue = false;
  const onlyPaid = false;

  const [activeRange, setActiveRange] = useState("1day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetch(apiUrl("/api/records"), {
      headers: getAuthHeaders(),
    })
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error(err));
  }, []);

  const handleRangeClick = (range) => {
    setActiveRange(range);
    const end = new Date();
    let start = new Date();

    if (range === "7day") start.setDate(end.getDate() - 7);
    else if (range === "1month") start.setMonth(end.getMonth() - 1);
    else if (range === "6month") start.setMonth(end.getMonth() - 6);

    if (range !== "custom") {
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    }
    setCurrentPage(1);
  };

  const filteredRecords = records.filter((rec) => {
    const matchName = rec.farmerName?.toLowerCase().includes(searchName.toLowerCase());
    const matchCrop = filterCrop ? rec.crop === filterCrop : true;

    const recordDate = new Date(rec.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const matchDate = recordDate >= start && recordDate <= end;
    const matchDue = onlyDue ? rec.totalAmount - rec.paidAmount > 0 : true;
    const matchPaid = onlyPaid ? rec.totalAmount - rec.paidAmount === 0 : true;

    return matchName && matchCrop && matchDate && matchDue && matchPaid;
  });

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div className="card report-page">

      {/* 🔙 Back */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 15px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          ◀ मागे जा
        </button>
        <h2 style={{ margin: "0 auto" }}>📊 रिपोर्ट</h2>
      </div>

      {/* 🔘 Date Filter */}
      <div className="range-filter-bar">
        {["1day", "7day", "1month", "6month", "custom"].map(r => (
          <button
            key={r}
            className={activeRange === r ? "active" : ""}
            onClick={() => handleRangeClick(r)}
          >
            {r === "1day" ? "आज" : r === "7day" ? "7 दिवस" : r === "1month" ? "1 महिना" : r === "6month" ? "6 महिने" : "Custom"}
          </button>
        ))}
      </div>

      {activeRange === "custom" && (
        <div className="custom-date-inputs">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span>ते</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      )}

      {/* 🔍 Filters */}
      <div className="filters">
        <input className="filter-input" placeholder="नाव शोधा" value={searchName} onChange={e => setSearchName(e.target.value)} />
        <select className="filter-input" value={filterCrop} onChange={e => setFilterCrop(e.target.value)}>
          <option value="">सर्व पिके</option>
          <option value="मका">मका</option>
          <option value="गहू">गहू</option>
          <option value="कांदा">कांदा</option>
        </select>
      </div>

      {/* 📋 Table */}
      <div className="table-responsive">
        <table className="records-table">
          <thead>
            <tr>
              <th>तारीख</th>
              <th>शेतकरी</th>
              <th>मोबाईल</th>
              <th>पीक</th>
              <th>प्रमाण</th>
              <th>दर</th>
              <th>एकूण ₹</th>
              <th>बाकी ₹</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length ? currentRecords.map((rec, i) => (
              <tr key={i}>
                <td>{rec.date}</td>
                <td>{rec.farmerName}</td>
                <td>{rec.mobile || "-"}</td>
                <td>{rec.crop}</td>
                <td>{rec.quantity}</td>
                <td>₹{rec.rate}</td>
                <td>₹{rec.totalAmount}</td>
                <td style={{ color: rec.totalAmount - rec.paidAmount > 0 ? "red" : "green", fontWeight: "bold" }}>
                  ₹{rec.totalAmount - rec.paidAmount}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8">रेकॉर्ड सापडले नाहीत</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination RIGHT side – Blue Pill */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "15px"
      }}>
        <div style={{
          background: "#E3F2FD",
          color: "#2196F3",
          padding: "6px 14px",
          borderRadius: "25px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontWeight: "bold",
          flexWrap: "nowrap"
        }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>◀</button>
          <span>पान {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>▶</button>
        </div>
      </div>

    </div>
  );
};

export default ReportTable;
