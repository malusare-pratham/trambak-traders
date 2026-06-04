import React, { useState, useEffect } from "react";
// तुमच्या फोल्डर स्ट्रक्चरनुसार पाथ (Path) तपासा
import AdminHeader from "../components/admin/AdminHeader";
import StatsCards from "../components/admin/StatsCards";
import DayStatsCards from "../components/admin/DayStatsCards";
import AddRecordForm from "../components/admin/AddRecordForm";
import RecordsTable from "../components/admin/RecordsTable";
import { apiUrl, getAuthHeaders } from "../config/api";

const AdminPage = () => {
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchRecords = async () => {
    try {
      const res = await fetch(apiUrl("/api/records"), {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRecordAdded = () => {
    fetchRecords();
    setEditingRecord(null); 
  };

  const handleEditClick = (rec) => {
    setEditingRecord(rec);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // क्लिक केल्यावर वरती फॉर्मकडे नेण्यासाठी
  };

  return (
    <div className="admin-container">
      <AdminHeader />
      <StatsCards records={records} />
      <DayStatsCards records={records} />
      
      <AddRecordForm 
        onRecordAdded={handleRecordAdded} 
        editingRecord={editingRecord} 
        setEditingRecord={setEditingRecord} 
      />
      
      <RecordsTable 
        records={records} 
        onEditClick={handleEditClick} 
      />
    </div>
  );
};

export default AdminPage;//new
