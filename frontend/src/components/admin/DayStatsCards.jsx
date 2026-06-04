import React from "react";

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

export default DayStatsCards;
