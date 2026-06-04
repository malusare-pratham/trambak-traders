import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl, jsonAuthHeaders } from "../../config/api";

const AddRecordForm = ({ onRecordAdded, editingRecord, setEditingRecord }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [remainingPayment, setRemainingPayment] = useState("");

  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date || "");
      setFarmerName(editingRecord.farmerName || "");
      setMobile(editingRecord.mobile || "");
      setCrop(editingRecord.crop || "");
      setQuantity(editingRecord.quantity || "");
      setRate(editingRecord.rate || "");
      setPaidAmount(editingRecord.paidAmount || 0);
      setRemainingPayment(""); 
    }
  }, [editingRecord]);

  const totalAmount = quantity && rate ? (Number(quantity) * Number(rate)).toFixed(2) : 0;
  const currentDue = editingRecord ? (Number(editingRecord.totalAmount) - Number(editingRecord.paidAmount)) : 0;

  const openHistory = () => {
    if (farmerName) {
      navigate(`/payment-history?name=${encodeURIComponent(farmerName)}`);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    
    if (Number(quantity) < 0 || Number(rate) < 0 || Number(paidAmount) < 0) {
      alert("कृपया वजा (-) रक्कम टाकू नका.");
      return;
    }

    const isEditing = editingRecord && editingRecord._id;

    if (isEditing && Number(remainingPayment) > currentDue) {
      alert(`चूक: तुम्ही बाकी रकमेपेक्षा (₹${currentDue.toFixed(2)}) जास्त रक्कम भरू शकत नाही.`);
      return;
    }
    
    const recordData = { 
      date, 
      farmerName, 
      mobile, 
      crop, 
      quantity: Number(quantity), 
      rate: Number(rate), 
      totalAmount: Number(totalAmount),
      remainingPayment: isEditing ? Number(remainingPayment || 0) : 0,
      paidAmount: Number(paidAmount) 
    };

    try {
      const url = isEditing ? apiUrl(`/update-record/${editingRecord._id}`) : apiUrl("/add-record");
      
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify(recordData),
      });

      if (res.ok) {
        alert(isEditing ? "रेकॉर्ड यशस्वीरित्या अपडेट झाला ✅" : "रेकॉर्ड यशस्वीरित्या जोडला ✅");
        resetForm();
        if (onRecordAdded) onRecordAdded(); 
      } else {
        alert("काहीतरी चूक झाली! सर्व्हर तपासा.");
      }
    } catch (err) { 
      console.error("Fetch Error:", err); 
      alert("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  const resetForm = () => {
    setDate(""); setFarmerName(""); setMobile(""); setCrop(""); 
    setQuantity(""); setRate(""); setPaidAmount(""); setRemainingPayment("");
    setEditingRecord(null);
  };

  return (
    <div className="card record-form-card" id="record-form">
      <h2 className="record-form-title">{editingRecord ? "रेकॉर्ड दुरुस्त करा (Edit Mode)" : "नवीन रेकॉर्ड जोडा"}</h2>
      <form onSubmit={handleAddRecord} className="form-grid">
        <div className="form-group"><label>तारीख</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
        <div className="form-group"><label>शेतकऱ्याचे नाव</label><input type="text" placeholder="नाव टाका" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} required /></div>
        <div className="form-group"><label>मोबाइल</label><input type="text" placeholder="10 अंकी नंबर" value={mobile} onChange={(e) => setMobile(e.target.value)} required /></div>
        <div className="form-group">
          <label>पिक निवडा</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} required>
            <option value="">पिक निवडा</option>
            <option>मका</option><option>गहू</option><option>कांदा</option><option>ज्वारी</option><option>बाजरी</option><option>ऊस</option>
          </select>
        </div>
        <div className="form-group"><label>प्रमाण (क्विंटल)</label><input type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
        <div className="form-group"><label>दर (₹)</label><input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} required /></div>
        <div className="form-group"><label>एकूण रक्कम (₹)</label><input type="number" value={totalAmount} readOnly style={{ background: "#f0f0f0" }} /></div>
        <div className="form-group">
          <label>{editingRecord ? "आधी भरलेली रक्कम (₹)" : "दिलेली रक्कम (₹)"}</label>
          <input 
            type="number" 
            min="0" 
            value={paidAmount} 
            onChange={(e) => setPaidAmount(e.target.value)} 
            readOnly={!!editingRecord} 
            style={editingRecord ? { background: "#f0f0f0" } : {}} 
            required 
          />
        </div>

        {editingRecord && (
          <div className="form-group edit-payment-group">
            <label style={{ fontWeight: 'bold', color: 'black' }}>
              आता जमा केलेली रक्कम (₹) - <span style={{ color: 'red' }}>बाकी: ₹{currentDue.toFixed(2)}</span>
            </label>
            <input 
              type="number" 
              min="0" 
              placeholder={`उदा. कमाल ₹${currentDue.toFixed(2)}`} 
              value={remainingPayment} 
              onChange={(e) => setRemainingPayment(e.target.value)} 
            />
          </div>
        )}

        <div className="button-container record-form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start', gap: '15px' }}>
          <button type="submit" className="primary-btn" style={{ padding: '10px 25px' }}>
            {editingRecord ? "रेकॉर्ड अपडेट करा" : "रेकॉर्ड जोडा"}
          </button>
          
          {editingRecord && (
            <>
              <button type="button" onClick={resetForm} className="primary-btn" style={{ padding: '10px 25px', background: '#3498db', color: '#fff', border: 'none' }}>रद्द करा</button>
              <button type="button" onClick={openHistory} className="primary-btn" style={{ padding: '10px 25px', background: '#3498db', color: '#fff', border: 'none' }}>पेमेंट हिस्ट्री 📜</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRecordForm;//old
