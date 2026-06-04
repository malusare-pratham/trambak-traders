import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, getAuthHeaders } from "../../config/api";

const PaidPaymentsTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const [filterDate, setFilterDate] = useState(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // 🟢 १. डेटाबेस मधून सर्व रेकॉर्ड्स मिळवणे
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(apiUrl("/api/records"), {
          headers: getAuthHeaders(),
        });
        setRecords(response.data);
        setLoading(false);
      } catch (err) {
        console.error("डेटा लोड झाला नाही:", err);
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // 🟢 २. फिल्टर: फक्त पूर्ण झालेले (Paid) व्यवहार
  const paidRecordsOnly = (records || []).filter((rec) => {
    const isPaid = (Number(rec.totalAmount) - Number(rec.paidAmount)) === 0;
    const matchName = rec.farmerName.toLowerCase().includes(searchName.toLowerCase());
    const matchCrop = filterCrop ? rec.crop === filterCrop : true;
    const matchDate = filterDate ? rec.date === filterDate : true; 
    
    return isPaid && matchName && matchCrop && matchDate;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = paidRecordsOnly.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(paidRecordsOnly.length / recordsPerPage);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>🔄 डेटा लोड होत आहे...</div>;

  return (
    <div className="card">
      {/* 🟢 मागे जाण्याचे बटन आणि टायटल */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={() => window.history.back()} 
          style={{ padding: '8px 15px', backgroundColor: '#607d8b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ◀ मागे
        </button>
        <h2 style={{ color: '#2e7d32', margin: 0 }}>पूर्ण दिलेले पेमेंट रिपोर्ट (एकूण: {paidRecordsOnly.length})</h2>
      </div>

      <div className="filters">
        <input className="filter-input" placeholder="शेतकऱ्याचे नाव शोधा" value={searchName} onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }} />
        <select className="filter-input" value={filterCrop} onChange={(e) => { setFilterCrop(e.target.value); setCurrentPage(1); }}>
          <option value="">सर्व पिके</option>
          <option value="मका">मका</option>
          <option value="गहू">गहू</option>
          <option value="कांदा">कांदा</option>
        </select>
        <input type="date" className="filter-input" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} />
      </div>

      <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="records-table" style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#e8f5e9' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>तारीख</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>शेतकरी</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>मोबाइल</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>पिक</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>एकूण रक्कम</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>दिलेली रक्कम</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>स्थिती</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? currentRecords.map((rec) => {
              return (
                <tr key={rec._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{rec.date}</td>
                  <td style={{ textAlign: 'left', padding: '10px', fontWeight: 'bold' }}>
                    {rec.farmerName}
                  </td>
                  <td>{rec.mobile}</td>
                  <td>{rec.crop}</td>
                  <td>₹{rec.totalAmount}</td>
                  <td>₹{rec.paidAmount}</td>
                  <td style={{ color: "green", fontWeight: "bold" }}>● पूर्ण भरले</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" style={{ padding: '20px' }}>कोणतेही पूर्ण झालेले व्यवहार सापडले नाहीत.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🟢 पेज नेव्हिगेशन (◀ पाने 1 / 1 ▶) */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '20px', fontSize: '18px' }}>
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => prev - 1)}
          style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '20px', color: currentPage === 1 ? '#ccc' : '#2e7d32' }}
        >
          ◀
        </button>
        <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>
          पाने {currentPage} / {totalPages || 1}
        </span>
        <button 
          disabled={currentPage >= totalPages} 
          onClick={() => setCurrentPage(prev => prev + 1)}
          style={{ background: 'none', border: 'none', cursor: currentPage >= totalPages ? 'default' : 'pointer', fontSize: '20px', color: currentPage >= totalPages ? '#ccc' : '#2e7d32' }}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default PaidPaymentsTable;
