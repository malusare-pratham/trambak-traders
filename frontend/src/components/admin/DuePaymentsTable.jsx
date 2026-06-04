import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, getAuthHeaders } from "../../config/api";

const DuePaymentsTable = ({ onEditClick }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // डेटा लोड करणे
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl("/api/records"), {
          headers: getAuthHeaders()
        });
        setRecords(Array.isArray(response.data) ? response.data : response.data.records || []);
        setLoading(false);
      } catch (error) {
        console.error("डेटा एरर:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // बाकी असलेले रेकॉर्ड्स फिल्टर करणे
  const dueRecordsOnly = records.filter((rec) => {
    const isDue = (Number(rec.totalAmount) - Number(rec.paidAmount)) > 0;
    const matchName = rec.farmerName?.toLowerCase().includes(searchName.toLowerCase());
    const matchCrop = filterCrop ? rec.crop === filterCrop : true;
    const matchDate = filterDate ? rec.date === filterDate : true;
    return isDue && matchName && matchCrop && matchDate;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = dueRecordsOnly.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(dueRecordsOnly.length / recordsPerPage);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>🔄 डेटा लोड होत आहे...</div>;

  return (
    <div className="card payment-report-card">
      {/* 🟢 मागे जाण्याचे बटन आणि टायटल */}
      <div className="report-header payment-report-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          className="back-btn"
          onClick={() => window.history.back()} 
          style={{ padding: '8px 15px', backgroundColor: '#607d8b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ◀ मागे
        </button>
        <h2 className="report-title" style={{ color: '#d32f2f', margin: 0 }}>बाकी पेमेंट रिपोर्ट (एकूण: {dueRecordsOnly.length})</h2>
      </div>

      <div className="filters">
        <input className="filter-input" placeholder="नाव शोधा" value={searchName} onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }} />
        <select className="filter-input" value={filterCrop} onChange={(e) => { setFilterCrop(e.target.value); setCurrentPage(1); }}>
          <option value="">सर्व पिके</option>
          <option value="मका">मका</option>
          <option value="गहू">गहू</option>
          <option value="कांदा">कांदा</option>
        </select>
        <input type="date" className="filter-input" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} />
      </div>

      <div className="table-responsive">
        <table className="records-table" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>तारीख</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>शेतकरी</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>मोबाइल</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>पिक</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>एकूण</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>दिलेली</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>बाकी</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? currentRecords.map((rec) => {
              const dueAmt = rec.totalAmount - rec.paidAmount;
              return (
                <tr key={rec._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{rec.date}</td>
                  <td style={{ textAlign: 'left', fontWeight: 'bold', padding: '10px' }}>
                    <button 
                      onClick={() => onEditClick(rec)} 
                      style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: '14px', fontWeight: 'bold' }}
                    >
                      {rec.farmerName}
                    </button>
                  </td>
                  <td>{rec.mobile}</td>
                  <td>{rec.crop}</td>
                  <td>₹{rec.totalAmount}</td>
                  <td>₹{rec.paidAmount}</td>
                  <td style={{ color: "red", fontWeight: "bold" }}>₹{dueAmt.toFixed(2)}</td>
                </tr>
              );
            }) : (
              <tr><td colSpan="7" style={{ padding: '20px' }}>कोणतीही बाकी रक्कम सापडली नाही.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🟢 पेज नेव्हिगेशन (◀ पाने 1 / 2 ▶)Prathmesh Malusare  */}
      <div className="pagination-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '20px', fontSize: '18px' }}>
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)}
          style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '20px', color: currentPage === 1 ? '#ccc' : '#2196F3' }}
        >
          ◀
        </button>
        <span style={{ fontWeight: 'bold' }}>
          पाने {currentPage} / {totalPages || 1}
        </span>
        <button 
          disabled={currentPage >= totalPages} 
          onClick={() => setCurrentPage(prev => prev + 1)}
          style={{ background: 'none', border: 'none', cursor: currentPage >= totalPages ? 'default' : 'pointer', fontSize: '20px', color: currentPage >= totalPages ? '#ccc' : '#2196F3' }}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default DuePaymentsTable;
