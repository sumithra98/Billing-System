import React, { useState, useEffect } from "react";
import "./App.css";
import * as XLSX from "xlsx";

// Product categories
const categories = ["Fruits", "Dairy", "Snacks"];

// Product catalog
const productCatalog = {
  Fruits: [
    { name: "Apple", price: 1.2, image: "https://via.placeholder.com/80?text=Apple" },
    { name: "Banana", price: 0.8, image: "https://via.placeholder.com/80?text=Banana" },
  ],
  Dairy: [
    { name: "Milk", price: 2.5, image: "https://via.placeholder.com/80?text=Milk" },
    { name: "Cheese", price: 3.5, image: "https://via.placeholder.com/80?text=Cheese" },
  ],
  Snacks: [
    { name: "Chips", price: 1.5, image: "https://via.placeholder.com/80?text=Chips" },
    { name: "Cookies", price: 2.0, image: "https://via.placeholder.com/80?text=Cookies" },
  ],
};

function App() {
  // Form states
  const [selectedCategory, setSelectedCategory] = useState("Fruits");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [buyprice, setBuyprice] = useState("");

  // Billing and product states
  const [items, setItems] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);

  // Customer details
  const [custId, setCustId] = useState("");
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custPhone, setCustPhone] = useState("");

  const [billCounter, setBillCounter] = useState(() => {
  const saved = localStorage.getItem("billCounter");
  return saved ? Number(saved) : 1001;
  });
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [isBillingActive, setIsBillingActive] = useState(false);

  const [cashGiven, setCashGiven] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const [billStatus, setBillStatus] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);

  const [billDates, setBillDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [billsForDate, setBillsForDate] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  
  const [showBillDates, setShowBillDates] = useState(false);

  const [groupedBills, setGroupedBills] = useState({});
  const [showBillList, setShowBillList] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});

  const [calendarPage, setCalendarPage] = useState(1);
  
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [calendarBills, setCalendarBills] = useState([]);


  const handleShowAllBills = () => {
  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");

  

  const grouped = {};
  savedBills.forEach((bill) => {
    const dateKey = new Date(bill.billDate).toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(bill);
  });

  const sorted = Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a))
  );

  setGroupedBills(sorted);
  setExpandedDates({});
};

const fetchGroupedBills = () => {
  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");

  const grouped = {};
  savedBills.forEach((bill) => {
    const dateKey = new Date(bill.billDate).toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(bill);
  });

  const sorted = Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a))
  );

  setGroupedBills(sorted);
  setExpandedDates({});
};

const handleCalendarDateChange = (e) => {
  const date = e.target.value;
  setSelectedCalendarDate(date);
  setCalendarPage(1); // reset to first page

  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");
  const filtered = savedBills.filter((bill) =>
    new Date(bill.billDate).toISOString().split("T")[0] === date
  );

  setCalendarBills(filtered);
};

const toggleDateExpand = (date) => {
  setExpandedDates((prev) => ({
    ...prev,
    [date]: !prev[date],
  }));
};

const handleDateClick = (date) => {
  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");
  const filtered = savedBills.filter((bill) =>
    new Date(bill.billDate).toISOString().split("T")[0] === date
  );

  if (filtered.length === 0) {
    alert("No bills found for this date.");
    return;
  }

  const rows = [];

  filtered.forEach((bill) => {
    bill.items.forEach((item) => {
      rows.push({
        "Bill Number": bill.billNumber,
        Date: bill.billDate,
        "Customer ID": bill.custId,
        "Customer Name": bill.custName,
        Address: bill.custAddress,
        Phone: bill.custPhone,
        Product: item.productName,
        MRP: item.mrp,
        "Buying Price per item": item.buyprice,
        "Selling Price per item": item.price,
        "Profit Per Item": item.profit,
        Quantity: item.quantity,
        "Total Selling Price": item.total,
        "Total Profit": item.totalProfit,
        "Payment Mode": bill.paymentMode,
        "Cash Given": bill.cashGiven,
        "Bill Status": bill.billStatus,
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");

  XLSX.writeFile(workbook, `Bills_${date}.xlsx`);
};

const handleCollapseBills = () => {
  setGroupedBills({});
  setShowBillList(false);
};
  // Load custom products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customProducts");
    if (saved) setCustomProducts(JSON.parse(saved));
  }, []);

  // Save custom products to localStorage
  useEffect(() => {
    localStorage.setItem("customProducts", JSON.stringify(customProducts));
  }, [customProducts]);

  useEffect(() => {
  if (items.length === 0 && !isBillingActive) {
    const nextCounter = billCounter;
    setBillNumber(`BID-${nextCounter}`);
    setBillDate(new Date().toLocaleString());
    setBillCounter(nextCounter + 1);
    setIsBillingActive(true);
  }
  }, [items, isBillingActive, billCounter]);

  useEffect(() => {
  const savedCounter = localStorage.getItem("billCounter");
  if (savedCounter) {
    setBillCounter(Number(savedCounter));
  }
  }, []);

  useEffect(() => {
  localStorage.setItem("billCounter", billCounter);
}, [billCounter]);

  // Add item to bill
  const addItem = () => {
    if (productName && quantity > 0 && price > 0 && mrp > 0 && buyprice > 0) {
      const profit = price - buyprice;
      const total = quantity * price;
      const totalProfit = profit * quantity;
      setItems([
        ...items,
        {
          productName,
          quantity: Number(quantity),
          price: Number(price),
          mrp: Number(mrp),
          buyprice: Number(buyprice),
          profit,
          total,
          totalProfit,
        },
      ]);
      setProductName("");
      setQuantity("");
      setPrice("");
      setMrp("");
      setBuyprice("");
    } else {
      alert("Please enter valid product, quantity, price, and MRP.");
    }
  };

 

  // Add custom product
  const addCustomProduct = () => {
    const isDuplicate =
      customProducts.some((p) => p.name === productName) ||
      Object.values(productCatalog).flat().some((p) => p.name === productName);

    if (productName && !isDuplicate) {
      setCustomProducts([...customProducts, { name: productName }]);
    }
  };

  // Delete custom product
  const deleteCustomProduct = (index) => {
    const updated = customProducts.filter((_, i) => i !== index);
    setCustomProducts(updated);
  };

  // Select product from gallery
  const handleProductClick = (product) => {
    setProductName(product.name);
    setPrice(product.price || "");
    setQuantity(1);
  };

  // Delete item from bill
  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  // Generate bill number and timestamp
  // const billNumber = `BILL-${Date.now()}`;
  // const billDate = new Date().toLocaleString();

  // Print bill
  const printBill = () => {
    if (!billStatus) {
    alert("Please select the bill status before printing.");
    return;
  }

  window.print();

  // Save current bill to localStorage
  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");
  const newBill = {
    billNumber,
    billDate,
    custId,
    custName,
    custAddress,
    custPhone,
    items,
    grandTotal,
    paymentMode,
    cashGiven,
    billStatus,

  };
  localStorage.setItem("savedBills", JSON.stringify([...savedBills, newBill]));

  // Reset for next bill
  setItems([]);
  setCustId("");
  setCustName("");
  setCustAddress("");
  setCustPhone("");
  setIsBillingActive(false); // triggers auto-start
  setCashGiven("");
  setPaymentMode("Cash");
  setBillStatus("");

  };

  const clearBill = () => {
  setItems([]);
  setCustId("");
  setCustName("");
  setCustAddress("");
  setCustPhone("");
  setCashGiven("");
  setPaymentMode("Cash");
  setIsBillingActive(false); // triggers auto-start
  setBillStatus("");

};

const exportSingleBillToExcel = (bill) => {
  const rows = bill.items.map((item) => ({
    "Bill Number": bill.billNumber,
    Date: bill.billDate,
    "Customer ID": bill.custId,
    "Customer Name": bill.custName,
    Address: bill.custAddress,
    Phone: bill.custPhone,
    Product: item.productName,
    MRP: item.mrp,
    "Buying Price per item": item.buyprice, 
    "Selling Price per item": item.price,
    "Profit Per Item": item.profit,
    Quantity: item.quantity,
    "Total Selling Price": item.total,
    "Total Profit": item.totalProfit,
    "Payment Mode": bill.paymentMode,
    "Cash Given": bill.cashGiven,
    "Bill Status": bill.billStatus,
  }));

  const totalProfit = rows.reduce((sum, row) => sum + (row["Total Profit"] || 0), 0);

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Add 3 blank rows and a summary row
  const blankRows = [[""], [""], [""]];
  const summaryRow = [["Total Profit", `$${totalProfit.toFixed(2)}`]];
  XLSX.utils.sheet_add_aoa(worksheet, [...blankRows, ...summaryRow], {
    origin: -1, // append after last row
  });

  // Auto-size columns
  const columnWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((row) => (row[key] ? row[key].toString().length : 0))
    ) + 2,
  }));
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bill");

  XLSX.writeFile(workbook, `${bill.billNumber}_${bill.billStatus}.xlsx`);
};


const exportSelectedDateToExcel = () => {
  if (!selectedDate || billsForDate.length === 0) {
    alert("No bills to export for selected date.");
    return;
  }

  const rows = [];

  billsForDate.forEach((bill) => {
    bill.items.forEach((item) => {
      rows.push({
        "Bill Number": bill.billNumber,
        Date: bill.billDate,
        "Customer ID": bill.custId,
        "Customer Name": bill.custName,
        Address: bill.custAddress,
        Phone: bill.custPhone,
        Product: item.productName,
        MRP: item.mrp,
        "Buying Price per item": item.buyprice,
        "Selling Price per item": item.price,
        "Profit Per Item": item.profit,
        Quantity: item.quantity,
        "Total Selling Price": item.total,
        "Total Profit": item.totalProfit,
        "Payment Mode": bill.paymentMode,
        "Cash Given": bill.cashGiven,
        "Bill Status": bill.billStatus,
      });
    });
  });

  const totalProfit = rows.reduce((sum, row) => sum + (row["Total Profit"] || 0), 0);

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Add 3 blank rows and a summary row
  const blankRows = [[""], [""], [""]];
  const summaryRow = [["Total Profit", `$${totalProfit.toFixed(2)}`]];
  XLSX.utils.sheet_add_aoa(worksheet, [...blankRows, ...summaryRow], {
    origin: -1, // append after last row
  });

  // Auto-size columns
  const columnWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((row) => (row[key] ? row[key].toString().length : 0))
    ) + 2,
  }));
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");

  XLSX.writeFile(workbook, `Bills_${selectedDate}.xlsx`);
};




  return (
    <div className="App">
     <h1>🛒 Grocery Bill </h1>

      

      <div className="split-layout">
        {/* Left Side: Billing Section */}
        <div className="billing-section">
          {/* Customer Info */}
          <div className="input-section">
            <input type="text" placeholder="Customer ID" value={custId} onChange={(e) => setCustId(e.target.value)} />
            <input type="text" placeholder="Customer Name" value={custName} onChange={(e) => setCustName(e.target.value)} />
            <input type="text" placeholder="Address" value={custAddress} onChange={(e) => setCustAddress(e.target.value)} />
            <input type="text" placeholder="Phone Number" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
          </div>

          {/* Product Entry */}
          <div className="input-section">
            <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input type="number" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} />
            <input type="number" placeholder="Buying Price" value={buyprice} onChange={(e) => setBuyprice(e.target.value)} />
            <button onClick={addItem}>Add Item</button>
            <button onClick={addCustomProduct}>Add to Custom List</button>
          </div>

        <div className="input-section">
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>

          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Cash Given"
            value={cashGiven}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only valid decimal numbers
              if (/^\d*\.?\d*$/.test(value)) {
                setCashGiven(value);
              }
            }}
            disabled={paymentMode !== "Cash"}
          />
        </div>

        <div className="input-section">
          <label>
            Bill Status:
            <select value={billStatus} onChange={(e) => setBillStatus(e.target.value)}>
              <option value="">-- Select Bill Status --</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </label>
        </div>

          {/* Bill Table */}
          {items.length > 0 && (
            <>
              <div id="bill-section">
                <h1>🛒 New Meenakshi Stores</h1>
                <p><strong>Bill Number:</strong> {billNumber}</p>
                <p><strong>Date & Time:</strong> {billDate}</p>
                <p><strong>Customer ID:</strong> {custId}</p>
                <p><strong>Name:</strong> {custName}</p>
                <p><strong>Address:</strong> {custAddress}</p>
                <p><strong>Phone:</strong> {custPhone}</p>

                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>MRP</th>
                      <th className="hide-print">Buying Price</th>
                      <th>Price per Item</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th className="hide-print">Profit per Item</th>
                      <th className="hide-print">Total Profit</th>
                      <th className="no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>${item.mrp.toFixed(2)}</td>
                        <td className="hide-print">${item.buyprice.toFixed(2)}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${item.total.toFixed(2)}</td>
                        <td className="hide-print">${item.profit.toFixed(2)}</td>
                        <td className="hide-print">${item.totalProfit.toFixed(2)}</td>
                        <td className="no-print">
                          <button onClick={() => deleteItem(index)}>❌</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h2>Grand Total: ${grandTotal.toFixed(2)}</h2>
                <p><strong>Payment Mode:</strong> {paymentMode}</p>
                {paymentMode === "Cash" && (
                  <p><strong>Cash Given:</strong> ${Number(cashGiven).toFixed(2)}</p>
                )}
                {paymentMode === "Cash" && cashGiven > 0 && (
                  <p><strong>Balance Returned:</strong> ${(cashGiven - grandTotal).toFixed(2)}</p>
                )}
                <p><strong>Bill Status:</strong> {billStatus}</p>
              </div>
              <div className="no-print" style={{ marginTop: "1rem" }}>
                <button onClick={printBill}>🧾 Print Bill</button>
                <button onClick={clearBill}>🧹 Clear Bill</button>
                
              </div>
            </>
          )}
        </div>


        {/* Right Side: Product Gallery */}
        <div className="product-section">
{/* 📆 Calendar Date Picker */}
<div className="no-print" style={{ marginBottom: "1rem" }}>
  <h3>📆 Pick a Specific Date</h3>
  <input
    type="date"
    value={selectedCalendarDate}
    onChange={handleCalendarDateChange}
    style={{ padding: "5px", marginBottom: "10px" }}
  />

  {selectedCalendarDate && calendarBills.length > 0 && (
  <>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#f0f0f0" }}>
          <th style={{ border: "1px solid #ccc", padding: "5px" }}>Bill #</th>
          <th style={{ border: "1px solid #ccc", padding: "5px" }}>Customer</th>
          <th style={{ border: "1px solid #ccc", padding: "5px" }}>Status</th>
          <th style={{ border: "1px solid #ccc", padding: "5px" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {calendarBills
          .slice((calendarPage - 1) * 10, calendarPage * 10)
          .map((bill, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{bill.billNumber}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{bill.custName || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{bill.billStatus}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <button onClick={() => exportSingleBillToExcel(bill)}>📤 Export</button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>

    {/* Pagination Controls */}
    <div style={{ marginTop: "10px", textAlign: "center" }}>
      <button
        onClick={() => setCalendarPage((prev) => Math.max(prev - 1, 1))}
        disabled={calendarPage === 1}
        style={{ marginRight: "10px" }}
      >
        ◀️ Previous
      </button>
      <span>Page {calendarPage} of {Math.ceil(calendarBills.length / 10)}</span>
      <button
        onClick={() =>
          setCalendarPage((prev) =>
            prev < Math.ceil(calendarBills.length / 10) ? prev + 1 : prev
          )
        }
        disabled={calendarPage >= Math.ceil(calendarBills.length / 10)}
        style={{ marginLeft: "10px" }}
      >
        Next ▶️
      </button>
    </div>
  </>
)}

  {selectedCalendarDate && calendarBills.length === 0 && (
    <p>No bills found for {selectedCalendarDate}</p>
  )}
</div>
          <h3>Categories</h3>
          <div className="category-buttons">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <h3>{selectedCategory} Products</h3>
          <div className="scrollable-gallery">
            {productCatalog[selectedCategory].map((product, index) => (
              <div key={index} className="product-card" onClick={() => handleProductClick(product)}>
                <img src={product.image} alt={product.name} />
                <p>{product.name}</p>
              </div>
            ))}
          </div>

          {/* Custom Products */}
          {customProducts.length > 0 && (
            <>
              <h3>🆕 Custom Products</h3>
              <div className="scrollable-gallery">
                {customProducts.map((p, i) => (
                  <div key={i} className="product-card">
                    <img src="https://via.placeholder.com/80?text=Custom" alt={p.name} />
                    <p>{p.name}</p>
                    <button className="no-print" onClick={() => deleteCustomProduct(i)}>❌</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* 📁 All Bills Viewer */}
{billDates.length > 0 && (
  <div className="no-print" style={{ marginTop: "2rem" }}>
    <h3>📅 Select a Date to View Bills</h3>
    {billDates.map((date) => (
      <button key={date} onClick={() => handleDateClick(date)} style={{ margin: "5px" }}>
        {date}
      </button>
    ))}
  </div>
)}

{selectedDate && billsForDate.length > 0 && (
  <div style={{ marginTop: "1rem" }}>
    <h3>🧾 Bills for {selectedDate}</h3>
    <p><strong>Total Sales:</strong> ${dailyTotal.toFixed(2)}</p>
    <p><strong>Total Profit:</strong> ${dailyProfit.toFixed(2)}</p>
    <button onClick={exportSelectedDateToExcel}>📤 Export to Excel</button>

    <table>
      <thead>
        <tr>
          <th>Bill #</th>
          <th>Customer</th>
          <th>Phone</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {billsForDate.map((bill, i) =>
          bill.items.map((item, j) => (
            <tr key={`${i}-${j}`}>
              <td>{bill.billNumber}</td>
              <td>{bill.custName}</td>
              <td>{bill.custPhone}</td>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>${item.total.toFixed(2)}</td>
              <td>{bill.billStatus}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}
    </div>
  );
}

export default App;