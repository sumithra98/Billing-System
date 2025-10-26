import React from "react";

function SidebarArchive({ verifiedBills }) {
  const today = new Date().toLocaleDateString();
  const todaysBills = verifiedBills.filter(bill => bill.timestamp.startsWith(today));

  return (
    <div className="sidebar">
      <h3>📂 Today's Verified Bills</h3>
      {todaysBills.length === 0 ? (
        <p>No bills printed today.</p>
      ) : (
        <ul>
          {todaysBills.map((bill, index) => (
            <li key={index}>
              <button className="bill-link">
                {bill.billId} - {bill.custName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SidebarArchive;