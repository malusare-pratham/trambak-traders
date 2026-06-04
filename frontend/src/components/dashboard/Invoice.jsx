import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./dashbord.css";
import InvoiceRecordsTable from "./InvoiceRecordsTable"; 
import { apiUrl, getAuthHeaders, jsonAuthHeaders } from "../../config/api";

// --- DayStatsCards Component ---
const DayStatsCards = ({ records = [] }) => {
  const today = new Date().toISOString().slice(0, 10);

  const todayRecords = records.filter(
    (r) => r.date === today
  );

  const totalRecords = todayRecords.length;

  const totalAmount = todayRecords.reduce(
    (sum, r) => sum + Number(r.totalAmount || 0),
    0
  );

  const totalPaid = todayRecords.reduce(
    (sum, r) => sum + Number(r.paidAmount || 0),
    0
  );

  const totalDue = totalAmount - totalPaid;

  const cards = [
    { title: "आजचे रेकॉर्ड", value: totalRecords },
    { title: "आजची रक्कम", value: `₹${totalAmount}` },
    { title: "आजची दिलेली रक्कम", value: `₹${totalPaid}` },
    { title: "आजची बाकी रक्कम", value: `₹${totalDue}` },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div className="stat-card" key={i}>
          <h3>{card.title}</h3>
          <p>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

// --- Main Invoice Component ---
const Invoice = () => {
  const [date, setDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [farmerContact, setFarmerContact] = useState("");
  const [crop, setCrop] = useState("");
  const [rate, setRate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [previewData, setPreviewData] = useState({}); 

  const invoiceRef = useRef(); 
  const today = new Date().toISOString().split("T")[0];

  const fetchRecords = async () => {
    try {
      const response = await fetch(apiUrl("/api/records"), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error("डेटा लोड करताना एरर आली:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const updateTotal = (r, q) => {
    if (r && q) {
      const total = r * q;
      setTotalAmount(total);
      if (Number(paidAmount) > total) {
        setPaidAmount(total);
      }
    } else {
      setTotalAmount("");
    }
  };

  const handlePaidAmountChange = (val) => {
    const enteredAmount = Number(val);
    const total = Number(totalAmount);
    if (enteredAmount > total) {
      setPaidAmount(total);
    } else {
      setPaidAmount(val);
    }
  };

  const downloadPDF = async () => {
  const input = invoiceRef.current;

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  // ✅ Receipt / DL size (A5)
  const pdf = new jsPDF("p", "mm", "a5");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let finalWidth = imgWidth;
  let finalHeight = imgHeight;

  // ✅ Full invoice content fit logic
  if (imgHeight > pageHeight) {
    const scaleFactor = pageHeight / imgHeight;
    finalWidth = imgWidth * scaleFactor;
    finalHeight = imgHeight * scaleFactor;
  }

  const x = (pageWidth - finalWidth) / 2;
  const y = 5;

  pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
  pdf.save(`Invoice_Receipt_${previewData.customer || "Bill"}.pdf`);
};


  const handleBillCreate = async (e) => {
    e.preventDefault();
    if (farmerContact.length !== 10) {
      setError("⚠️ कृपया वैध १० अंकी मोबाईल नंबर टाका");
      return;
    }
    if (!date || !customer || !farmerContact || !crop || !rate || !quantity || !totalAmount || !paidAmount) {
      setError("⚠️ कृपया सर्व माहिती भरा");
      return;
    }

    const recordData = {
      date,
      farmerName: customer,
      mobile: farmerContact,
      crop,
      rate: Number(rate),
      quantity: Number(quantity),
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount),
    };

    try {
      const res = await fetch(apiUrl("/add-record"), {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify(recordData),
      });

     if (res.ok) {
        const savedData = await res.json(); // सर्व्हरकडून मिळालेला डेटा (ज्यात खरा बिल नंबर आहे)
        
        alert(`बिल तयार झाले आणि डेटाबेसमध्ये सेव्ह झाले! बिल नं: ${savedData.billNo} ✅`);

        // प्रिव्ह्यूमध्ये डेटा सेट करताना सर्व्हरचा डेटा वापरला
        setPreviewData({
          date: savedData.date,
          customer: savedData.farmerName,
          farmerContact: savedData.mobile,
          crop: savedData.crop,
          rate: savedData.rate,
          quantity: savedData.quantity,
          totalAmount: savedData.totalAmount,
          paidAmount: savedData.paidAmount,
          billNo: savedData.billNo // हा डेटाबेस मधून आलेला नंबर आहे
        });

        // फॉर्म रिकामा करणे
        setDate("");
        setCustomer("");
        setFarmerContact("");
        setCrop("");
        setRate("");
        setQuantity("");
        setTotalAmount("");
        setPaidAmount("");
        setError("");
        
        await fetchRecords(); 
      } else {
        alert("डेटा सेव्ह करताना त्रुटी आली.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("सर्व्हरशी संपर्क होऊ शकला नाही.");
    }
  };

  return (
    <div className="main-wrapper" style={{ padding: "20px" }}>
      <div className="invoice-container">
        <div className="invoice-left">
          <form className="bill-form">
            <div className="form-row">
              <div className="form-group">
                <label>तारीख:</label>
                <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>ग्राहकाचे नाव:</label>
                <input type="text" placeholder="उदा. रमेश पाटील" value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>शेतकऱ्याचा संपर्क (१० अंक):</label>
                <input 
                  type="text" 
                  placeholder="उदा. 9876543210" 
                  maxLength="10" 
                  value={farmerContact} 
                  onChange={(e) => setFarmerContact(e.target.value.replace(/\D/g, ""))} 
                />
              </div>
              <div className="form-group">
                <label>पिकाचे नाव:</label>
                <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                  <option value="">पिक निवडा</option>
                  <option>मका</option>
                  <option>गहू</option>
                  <option>ज्वारी</option>
                  <option>बाजरी</option>
                  <option>तांदूळ</option>
                  <option>तूरडाळ</option>
                  <option>मुगडाळ</option>
                  <option>कांदा</option>
                  <option>बटाटा</option>
                  <option>ऊस</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>आजचा दर (₹ / क्विंटल):</label>
                <input type="number" placeholder="उदा. 2300" value={rate} onChange={(e) => { setRate(e.target.value); updateTotal(e.target.value, quantity); }} />
              </div>
              <div className="form-group">
                <label>प्रमाण (क्विंटल):</label>
                <input type="number" placeholder="उदा. 12" value={quantity} onChange={(e) => { setQuantity(e.target.value); updateTotal(rate, e.target.value); }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>एकूण रक्कम (₹):</label>
                <input type="number" value={totalAmount} readOnly style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }} />
              </div>
              <div className="form-group">
                <label>दिलेली रक्कम (₹):</label>
                <input 
                  type="number" 
                  placeholder="उदा. 20000" 
                  value={paidAmount} 
                  onChange={(e) => handlePaidAmountChange(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-actions">
            <button type="button" onClick={handleBillCreate} className="submit-btn">
              बिल तयार करा
            </button>

            <button 
              type="button" 
              onClick={downloadPDF} 
              className="submit-btn pdf-btn" 
            >
              फक्त डाउनलोड करा (PDF)
            </button>
            </div>
          </form>
          {error && <p className="error-msg">{error}</p>}
        </div>

        <div className="invoice-right" ref={invoiceRef}>
          <div className="header">
            <h1>त्र्यंबकराज ट्रेडर्स</h1>
            <p>मका व्यापार व्यवसाय</p>
            <hr />
          </div>

          <div className="details">
            <div>
              <p><strong>बिल क्रमांक:</strong> {previewData.billNo || "---"}</p>
              <p><strong>तारीख:</strong> {previewData.date || date || ""}</p>
              <p><strong>शेतकऱ्याचे नाव:</strong> {previewData.customer || customer || ""}</p>
              <p><strong>मोबाईल:</strong> {previewData.farmerContact || farmerContact || ""}</p>
            </div>
            <div>
              <p><strong>व्यापाऱ्याचे नाव:</strong> त्र्यंबकराज ट्रेडर्स</p>
              <p><strong>मोबाईल:</strong> +91 9876543210</p>
              <p><strong>पत्ता:</strong> त्र्यंबकराज पेट्रोलियम निमगाव,<br/>नांदगाव रोड, ता.मालेगाव, जि. नाशिक.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
              <tr>
              <th style={{ textAlign: "center" }}>पीक</th>
              <th style={{ textAlign: "center" }}>प्रमाण</th>
              <th style={{ textAlign: "center" }}>दर</th>
              <th style={{ textAlign: "center" }}>एकूण रक्कम</th>
              <th style={{ textAlign: "center" }}>दिलेली रक्कम</th>
              </tr>
             </thead>

              <tbody>
                <tr>
                  <td>{previewData.crop || crop || ""}</td>
                  <td>{(previewData.quantity || quantity) ? `${previewData.quantity || quantity} क्विंटल` : ""}</td>
                  <td>{(previewData.rate || rate) ? `₹${previewData.rate || rate}` : ""}</td>
                  <td>{(previewData.totalAmount || totalAmount) ? `₹${previewData.totalAmount || totalAmount}` : ""}</td>
                  <td>{(previewData.paidAmount || paidAmount) ? `₹${previewData.paidAmount || paidAmount}` : ""}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="3">एकूण</td>
                  <td>{(previewData.totalAmount || totalAmount) ? `₹${previewData.totalAmount || totalAmount}` : ""}</td>
                  <td>{(previewData.paidAmount || paidAmount) ? `₹${previewData.paidAmount || paidAmount}` : ""}</td>
                </tr>
              </tfoot>
            </table>
          </div>

     <div
  className="summary"
  style={{
    textAlign: "left",
    marginTop: "20px",
    borderTop: "1px solid #eee",
    paddingTop: "10px"
  }}
>
  <p>
    <span style={{ display: "inline-block", width: "120px" }}>
      एकूण रक्कम:
    </span>
    {(previewData.totalAmount || totalAmount)
      ? `₹${previewData.totalAmount || totalAmount}`
      : ""}
  </p>

  <p>
    <span style={{ display: "inline-block", width: "120px" }}>
      दिलेली रक्कम:
    </span>
    {(previewData.paidAmount || paidAmount)
      ? `₹${previewData.paidAmount || paidAmount}`
      : ""}
  </p>

  <p className="balance">
    <span style={{ display: "inline-block", width: "120px" }}>
      बाकी रक्कम:
    </span>
    {(previewData.totalAmount && previewData.paidAmount)
      ? `₹${previewData.totalAmount - previewData.paidAmount}`
      : (totalAmount && paidAmount)
      ? `₹${totalAmount - paidAmount}`
      : ""}
  </p>
</div>

          <p className="thank-you">धन्यवाद</p>

          <div className="footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', alignItems: 'flex-end' }}>
            <div className="footer-left" style={{ fontWeight: 'bold' }}>व्यापारी</div>
            <div className="footer-right" style={{ textAlign: 'center' }}>
              <div className="signature-text">स्वाक्षरी</div>
              <div className="trader-name">त्र्यंबकराज ट्रेडर्स</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "0px", width: "100%", padding: "0 0px", boxSizing: "border-box" }}>
  <DayStatsCards records={records} />
  <div style={{ marginTop: "20px" }}>
    <InvoiceRecordsTable records={records} onRecordsChange={setRecords} />
  </div>
</div>
    </div>
  );
};

export default Invoice;//new
