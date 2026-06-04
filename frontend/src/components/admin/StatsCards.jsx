import React, { useEffect, useState } from "react";

const StatsCards = ({ records = [] }) => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
  });

  useEffect(() => {
    const totalRecords = records.length;

    const totalAmount = records.reduce(
      (sum, r) => sum + Number(r.totalAmount || 0),
      0
    );

    const totalPaid = records.reduce(
      (sum, r) => sum + Number(r.paidAmount || 0),
      0
    );

    const totalDue = totalAmount - totalPaid;

    setStats({
      totalRecords,
      totalAmount,
      totalPaid,
      totalDue,
    });
  }, [records]);

  const cards = [
    { title: "एकूण रेकॉर्ड्स", value: stats.totalRecords },
    { title: "एकूण रक्कम", value: `₹${stats.totalAmount}` },
    { title: "एकूण दिलेली रक्कम", value: `₹${stats.totalPaid}` },
    { title: "एकूण बाकी रक्कम", value: `₹${stats.totalDue}` },
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

export default StatsCards;//old
