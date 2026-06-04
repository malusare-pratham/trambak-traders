import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf"; 

const InvoiceRecordsTable = ({ records, onEditClick, onRecordsChange }) => {
  const [searchName, setSearchName] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  
  // आजची तारीख डिफॉल्ट सेट केली (format: YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(today); 
  
  const [onlyDue, setOnlyDue] = useState(false);
  const [onlyPaid, setOnlyPaid] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoiceRef = useRef(null);
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // फिल्टर लॉजिक
  const filteredRecords = (records || []).filter((rec) => {
    const matchName = rec.farmerName?.toLowerCase().includes(searchName.toLowerCase());
    const matchCrop = filterCrop ? rec.crop === filterCrop : true;
    
    // फक्त निवडलेल्या तारखेचा डेटा मॅच करणे
    const matchDate = filterDate ? rec.date === filterDate : true;
    
    const matchDue = onlyDue ? (rec.totalAmount - rec.paidAmount > 0) : true;
    const matchPaid = onlyPaid ? (rec.totalAmount - rec.paidAmount === 0) : true;
    
    return matchName && matchCrop && matchDate && matchDue && matchPaid;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleExportCSV = () => {
    const csvContent = [
      ["Date", "Farmer Name", "Mobile", "Crop", "Quantity", "Rate", "Total Amount", "Paid Amount", "Due Amount"],
      ...filteredRecords.map((rec) => [
        rec.date, rec.farmerName, rec.mobile || "", rec.crop, rec.quantity, rec.rate, rec.totalAmount, rec.paidAmount, rec.totalAmount - rec.paidAmount,
      ]),
    ].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "mandi_records.csv");
    link.click();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").slice(1);
      const importedRecords = rows.filter((row) => row.trim() !== "").map((row) => {
        const [date, farmerName, mobile, crop, quantity, rate, totalAmount, paidAmount] = row.split(",");
        return {
          _id: Math.random().toString(36).substr(2, 9),
          date, farmerName, mobile, crop,
          quantity: Number(quantity), rate: Number(rate),
          totalAmount: Number(totalAmount), paidAmount: Number(paidAmount),
        };
      });
      if (onRecordsChange) onRecordsChange(importedRecords);
      alert("डेटा यशस्वीरित्या इंपोर्ट झाला! ✅");
    };
    reader.readAsText(file);
  };

  const handleDownloadInvoicePDF = () => {
    const element = invoiceRef.current;
    html2canvas(element, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${selectedInvoice.farmerName}.pdf`);
    });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ borderBottom: '2px solid #2196F3', display: 'inline-block', margin: 0 }}>रेकॉर्ड्स</h2>
        {filterDate === today && (
          <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
            ● आजचे रेकॉर्ड्स
          </span>
        )}
      </div>

      <div className="filters">
        <input className="filter-input" placeholder="नाव शोधा" value={searchName} onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }} />
        <select className="filter-input" value={filterCrop} onChange={(e) => { setFilterCrop(e.target.value); setCurrentPage(1); }}>
          <option value="">सर्व पिके</option>
          <option value="मका">मका</option><option value="गहू">गहू</option><option value="कांदा">कांदा</option><option value="ज्वारी">ज्वारी</option><option value="बाजरी">बाजरी</option><option value="ऊस">ऊस</option>
        </select>
        
        {/* तारीख फिल्टर - सुरुवातीला आजची तारीख असेल */}
        <input type="date" className="filter-input" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} />
        
        <label className="filter-checkbox">
          <input type="checkbox" checked={onlyDue} onChange={(e) => { setOnlyDue(e.target.checked); if (e.target.checked) setOnlyPaid(false); setCurrentPage(1); }} />फक्त बाकी
        </label>
        <label className="filter-checkbox">
          <input type="checkbox" checked={onlyPaid} onChange={(e) => { setOnlyPaid(e.target.checked); if (e.target.checked) setOnlyDue(false); setCurrentPage(1); }} />पूर्ण दिलेले
        </label>
      </div>

      <div className="table-responsive" style={{ width: '100%', overflowX: 'hidden' }}>
        <table className="records-table" style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ width: '12%', padding: '10px' }}>तारीख</th>
              <th style={{ width: '18%', padding: '10px' }}>शेतकरी</th>
              <th style={{ width: '12%', padding: '10px' }}>मोबाइल</th>
              <th style={{ width: '8%', padding: '10px' }}>पिक</th>
              <th style={{ width: '8%', padding: '10px' }}>प्रमाण</th>
              <th style={{ width: '8%', padding: '10px' }}>दर</th>
              <th style={{ width: '10%', padding: '10px' }}>एकूण</th>
              <th style={{ width: '10%', padding: '10px' }}>दिलेली</th>
              <th style={{ width: '10%', padding: '10px' }}>बाकी</th>
              <th style={{ width: '10%', padding: '10px' }}>इनव्हॉइस</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((rec, index) => {
                // ✅ डेटाबेस मधून बिल नंबर घेतला, नसेल तरच जुना फॉर्मेट वापरला
                const billNo = rec.billNo || String(indexOfFirstRecord + index + 1).padStart(4, '0');
                return (
                  <tr key={rec._id || index} style={{ borderBottom: '1px solid #eee' }}>
                    <td>{rec.date}</td>
                    <td style={{ textAlign: 'left', paddingLeft: '5px' }}>
                      <button onClick={() => onEditClick && onEditClick(rec)} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontWeight: "bold", textAlign: 'left', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rec.farmerName}
                      </button>
                    </td>
                    <td>{rec.mobile}</td>
                    <td>{rec.crop}</td>
                    <td>{rec.quantity}</td>
                    <td>₹{rec.rate}</td>
                    <td>₹{rec.totalAmount}</td>
                    <td>₹{rec.paidAmount}</td>
                    <td style={{ color: rec.totalAmount - rec.paidAmount > 0 ? "red" : "green", fontWeight: "bold" }}>
                      ₹{(rec.totalAmount - rec.paidAmount).toFixed(2)}
                    </td>
                    <td>
                      <button onClick={() => setSelectedInvoice({ ...rec, displayBillNo: billNo })} style={{ backgroundColor: "#2196F3", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: '12px' }}>PDF 📄</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ padding: '20px', color: '#888' }}>निवडलेल्या तारखेसाठी कोणतेही रेकॉर्ड सापडले नाहीत.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="invoice-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '15px' }}>
            <button onClick={handleDownloadInvoicePDF} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>PDF डाउनलोड 📥</button>
            <button onClick={() => setSelectedInvoice(null)} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>बंद करा ✖</button>
          </div>

          <div ref={invoiceRef} style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '35px', borderRadius: '15px', fontFamily: 'sans-serif', color: '#333' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>त्र्यंबकराज ट्रेडर्स</h1>
              <p style={{ margin: '5px 0' }}>मका व्यापार व्यवसाय</p>
              <hr style={{ border: 'none', borderTop: '1px solid #ccc', marginTop: '15px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
              <div>
                {/* ✅ डेटाबेसचा बिल नंबर इथे डिस्प्ले होईल */}
                <p><strong>बिल क्रमांक:</strong> {selectedInvoice.billNo || selectedInvoice.displayBillNo}</p>
                <p><strong>तारीख:</strong> {selectedInvoice.date}</p>
                <p><strong>शेतकऱ्याचे नाव:</strong> {selectedInvoice.farmerName}</p>
                <p><strong>मोबाईल:</strong> {selectedInvoice.mobile}</p>
              </div>
              <div>
                <p><strong>व्यापाऱ्याचे नाव:</strong> त्र्यंबकराज ट्रेडर्स</p>
                <p><strong>मोबाईल:</strong> +91 9876543210</p>
                <p><strong>पत्ता:</strong> त्र्यंबकराज पेट्रोलियम निमगाव,<br/>नांदगाव रोड, ता.मालेगाव,<br/> जि. नाशिक.</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#5DADE2', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>पीक</th>
                  <th style={{ padding: '12px' }}>प्रमाण</th>
                  <th style={{ padding: '12px' }}>दर</th>
                  <th style={{ padding: '12px' }}>एकूण रक्कम</th>
                  <th style={{ padding: '12px' }}>दिलेली रक्कम</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: 'center', fontSize: '14px' }}>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', textAlign: 'left' }}>{selectedInvoice.crop}</td>
                  <td>{selectedInvoice.quantity} क्विंटल</td>
                  <td>₹{selectedInvoice.rate}</td>
                  <td>₹{selectedInvoice.totalAmount}</td>
                  <td>₹{selectedInvoice.paidAmount}</td>
                </tr>
                <tr style={{ backgroundColor: '#F1C40F', fontWeight: 'bold' }}>
                  <td colSpan="3" style={{ padding: '10px', textAlign: 'left' }}>एकूण</td>
                  <td>₹{selectedInvoice.totalAmount}</td>
                  <td>₹{selectedInvoice.paidAmount}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ backgroundColor: '#f2f2f2', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
              <p style={{ margin: 0 }}>एकूण रक्कम: ₹{selectedInvoice.totalAmount}</p>
              <p style={{ margin: 0 }}>दिलेली रक्कम: ₹{selectedInvoice.paidAmount}</p>
              <p style={{ margin: 0, color: '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>बाकी रक्कम: ₹{selectedInvoice.totalAmount - selectedInvoice.paidAmount}</p>
            </div>

            <p style={{ textAlign: 'center', marginTop: '30px', fontStyle: 'italic' }}>धन्यवाद</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', alignItems: 'flex-end' }}>
              <div style={{ fontWeight: 'bold' }}>व्यापारी</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '5px' }}>स्वाक्षरी</div>
                <div style={{ fontWeight: 'bold' }}>त्र्यंबकराज ट्रेडर्स</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="csv-actions" style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="primary-btn" onClick={handleExportCSV} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>CSV एक्सपोर्ट 📤</button>
          <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportCSV} />
          <button className="primary-btn" onClick={() => fileInputRef.current.click()} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>CSV इंपोर्ट 📥</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#e3f2fd', padding: '5px 15px', borderRadius: '25px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2196F3', fontSize: '18px' }}>◀</button>
          <span style={{ fontWeight: 'bold', color: '#2196F3' }}>पाने {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2196F3', fontSize: '18px' }}>▶</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceRecordsTable;