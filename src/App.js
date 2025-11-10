import React, { useState, useEffect, useRef } from "react";
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



  const [billDates, setBillDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [billsForDate, setBillsForDate] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  
  const [groupedBills, setGroupedBills] = useState({});
  const [showBillList, setShowBillList] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});

  const [calendarPage, setCalendarPage] = useState(1);
  
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [calendarBills, setCalendarBills] = useState([]);

const [summaryDate, setSummaryDate] = useState("");
const [summaryData, setSummaryData] = useState(null);


const [showCalendarSection, setShowCalendarSection] = useState(true);
const [showSummarySection, setShowSummarySection] = useState(true);

const [gstRate, setGstRate] = useState();

const [showSuggestions, setShowSuggestions] = useState(false);

const [editGlobalIndex, setEditGlobalIndex] = useState(null);
const globalInputRef = useRef(null);
const [highlightedIndex, setHighlightedIndex] = useState(-1);

// Left panel (billing)
const [billingProductName, setBillingProductName] = useState("");
const [showBillingSuggestions, setShowBillingSuggestions] = useState(false);

// Right panel (global product form)
const [globalProductName, setGlobalProductName] = useState("");
const [showGlobalSuggestions, setShowGlobalSuggestions] = useState(false);
const[globalPrice,setGlobalPrice] = useState("");
const[globalMrp,setGlobalMrp] = useState("");
const[globalBuyingPrice,setGlobalBuyingPrice] = useState("");

const [globalProducts, setGlobalProducts] = useState(() => {
  const saved = localStorage.getItem("globalProducts");
  return saved ? JSON.parse(saved) : [];
});

const handleSummaryDateChange = (e) => {
  const date = e.target.value;
  setSummaryDate(date);

  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");
  const filtered = savedBills.filter(
    (bill) => new Date(bill.billDate).toISOString().split("T")[0] === date
  );

  let totalSelling = 0;
  let totalBuying = 0;
  let totalProfit = 0;

  filtered.forEach((bill) => {
    bill.items.forEach((item) => {
      totalSelling += item.total;
      totalBuying += item.buyprice * item.quantity;
      totalProfit += item.totalProfit;
    });
  });

  setSummaryData({
    totalSelling,
    totalBuying,
    totalProfit,
    billCount: filtered.length,
  });
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

const handleUpdateGlobalProduct = () => {
  if (
    editGlobalIndex === null ||
    !globalProductName ||
    globalPrice <= 0 ||
    globalMrp <= 0 ||
    globalBuyingPrice <= 0
  ) {
    alert("Enter valid product name, price, buying price and MRP.");
    return;
  }

  const updated = [...globalProducts];
  updated[editGlobalIndex] = {
    name: globalProductName,
    price: Number(globalPrice),
    mrp: Number(globalMrp),
    buyprice: Number(globalBuyingPrice),
  };

  setGlobalProducts(updated);
  localStorage.setItem("globalProducts", JSON.stringify(updated));

  // Clear form
  setGlobalProductName("");
  setGlobalPrice("");
  setGlobalMrp("");
  setGlobalBuyingPrice("");
  setEditGlobalIndex(null);
};

const handleClearGlobalProduct = () => {
  setGlobalProductName("");
  setGlobalPrice("");
  setGlobalMrp("");
  setGlobalBuyingPrice("");
  setEditGlobalIndex(null);
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


useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      globalInputRef.current &&
      !globalInputRef.current.contains(event.target)
    ) {
      setShowGlobalSuggestions(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // Add item to bill
  const addItem = () => {
    if (productName && quantity > 0 && price > 0 && mrp > 0 && buyprice > 0) {
      const profit = price - buyprice;
      const total = quantity * price;
      const totalProfit = profit * quantity;
      const gstAmount = (total * gstRate) / 100;
      const mrpWithQuantity = mrp * quantity;

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
          gstRate,
          gstAmount,
          mrpWithQuantity,
        },
      ]);
      setProductName("");
      setQuantity("");
      setPrice("");
      setMrp("");
      setBuyprice("");
      setGstRate(5);
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

  const handleAddGlobalProduct = () => {
  if (!globalProductName  || globalPrice  <= 0 || globalMrp  <= 0 || globalBuyingPrice <=0) {
    alert("Enter valid product name, price, buying price and MRP.");
    return;
  }

  const alreadyExists = globalProducts.some(
    (p) => p.name.toLowerCase() === globalProductName.toLowerCase()
  );

  if (alreadyExists) {
    alert(`❗ Product "${globalProductName}" is already included in Global Product Master.`);
    return;
  }

  const updated = [...globalProducts, { name: globalProductName, price: Number(globalPrice ), mrp: Number(globalMrp ), buyprice : Number(globalBuyingPrice)}];
  setGlobalProducts(updated);
  localStorage.setItem("globalProducts", JSON.stringify(updated));
  setGlobalProductName("");
  setGlobalPrice("");
  setGlobalMrp("");
  setGlobalBuyingPrice("");
};

const handleEditProduct = (index) => {
  const product = globalProducts[index];
  setGlobalProductName(product.name);
  setGlobalPrice(product.price.toString());
  setGlobalMrp(product.mrp.toString());
  setGlobalBuyingPrice(product.buyprice.toString());
  setEditGlobalIndex(index);
};

const handleDeleteProduct = (index) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  const updated = globalProducts.filter((_, i) => i !== index);
  setGlobalProducts(updated);
  localStorage.setItem("globalProducts", JSON.stringify(updated));
};

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const totalItems = items.length;
  const totalQuantity = Math.round(items.reduce((sum, item) => sum + item.quantity, 0));

  const totalTax5 = items
  .filter((item) => item.gstRate === 5)
  .reduce((sum, item) => sum + item.gstAmount, 0);

  const totalTax18 = items
  .filter((item) => item.gstRate === 18)
  .reduce((sum, item) => sum + item.gstAmount, 0);

  const totalMrpwithQuantity = items.reduce((sum, item) => sum + item.mrpWithQuantity, 0);

  const savings = totalMrpwithQuantity - grandTotal;

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


const exportSummaryForDateToExcel = (date) => {
  const savedBills = JSON.parse(localStorage.getItem("savedBills") || "[]");
  const filtered = savedBills.filter(
    (bill) => new Date(bill.billDate).toISOString().split("T")[0] === date
  );

  if (filtered.length === 0) {
    alert("No bills found for this date.");
    return;
  }

  const summaryRows = [];
  let totalSelling = 0;
  let totalBuying = 0;
  let totalProfit = 0;

  filtered.forEach((bill) => {
    const billSelling = bill.items.reduce((sum, item) => sum + item.total, 0);
    const billBuying = bill.items.reduce((sum, item) => sum + item.buyprice * item.quantity, 0);
    const billProfit = bill.items.reduce((sum, item) => sum + item.totalProfit, 0);

    summaryRows.push({
      "Bill Number": bill.billNumber,
      "Total Selling Price": `$${billSelling.toFixed(2)}`,
      "Total Profit": `$${billProfit.toFixed(2)}`
    });

    totalSelling += billSelling;
    totalBuying += billBuying;
    totalProfit += billProfit;
  });

  // Add 3 blank rows and a summary row
  summaryRows.push({});
  summaryRows.push({});
  summaryRows.push({
    "Bill Number": "📊 Date Summary",
    "Total Selling Price": `$${totalSelling.toFixed(2)}`,
    "Total Profit": `$${totalProfit.toFixed(2)}`
  });

  const worksheet = XLSX.utils.json_to_sheet(summaryRows);

  // Auto-size columns
  const columnWidths = Object.keys(summaryRows[0]).map((key) => ({
    wch: Math.max(
      key.length,
      ...summaryRows.map((row) => (row[key] ? row[key].toString().length : 0))
    ) + 2,
  }));
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

  XLSX.writeFile(workbook, `Bill_Summary_${date}.xlsx`);
};


  return (
    <div className="App">
     <h1>🛒 Grocery Bill </h1>

      

      <div className="split-layout">
        {/* Left Side: Billing Section */}
        <div className="billing-section">
          {/* Customer Info */}
          <div className="input-section">
            <div className="input-section" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Customer ID</label>
              <input
                type="text"
                value={custId}
                onChange={(e) => setCustId(e.target.value)}
                style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "100%",
                    fontSize: "14px",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                  }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Customer Name</label>
              <input
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
               style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "100%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Address</label>
              <input
                type="text"
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "100%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Phone Number</label>
              <input
                type="text"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "100%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>
        </div>

          {/* Product Entry */}
          <div className="input-section">
             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Item Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => { setProductName(e.target.value);
                  setShowSuggestions(true);
                }}
                style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
                fontSize: "14px",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
              }}
              />

              {productName && showSuggestions &&(
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #ccc",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 10,
                    margin: 0,
                    padding: "5px",
                    listStyle: "none",
                  }}
                >
                  {globalProducts
                    .filter((p) =>
                      p.name.toLowerCase().startsWith(globalProductName.toLowerCase())
                    )
                    .map((p, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "5px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                        onClick={() => {
                          setProductName(p.name);
                          setPrice(p.price);
                          setMrp(p.mrp);
                          setShowSuggestions(false);
                        }}
                      >
                        {p.name} — ${p.price} / MRP ${p.mrp}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Quantity</label>

            <input type="number" value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              fontSize: "14px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
            />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Rate</label>
              <input type="number" value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              fontSize: "14px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
              />
            </div>
             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>MRP</label>
              <input type="number" value={mrp} 
              onChange={(e) => setMrp(e.target.value)} 
              style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              fontSize: "14px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>Buying Price</label>
              <input type="number" value={buyprice} 
              onChange={(e) => setBuyprice(e.target.value)} 
              style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              fontSize: "14px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ minWidth: "100px", fontWeight: "bold" }}>GST %</label>
              <select value={gstRate} 
              onChange={(e) => setGstRate(Number(e.target.value))} 
              style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              fontSize: "14px",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
              >
                <option>Select GST</option>
                <option value={5}>5% GST</option>
                <option value={18}>18% GST</option>
              </select>
            </div>
            <button onClick={addItem}
            style={{
              backgroundColor: "#28a745",      
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}

            >Add Item</button>
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
                      <th>GST %</th>
                      <th>Tax Amount</th>
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
                        <td>{item.gstRate}%</td>
                        <td>${item.gstAmount.toFixed(2)}</td>
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>

                <p><strong>Total Items:</strong> {totalItems}</p>
                <p><strong>Total Quantity:</strong> {totalQuantity}</p>
                <p><strong>5% GST Total:</strong> ${totalTax5.toFixed(2)}</p>
                <p><strong>18% GST Total:</strong> ${totalTax18.toFixed(2)}</p>
                <p><strong>Savings :</strong>${savings.toFixed(2)}</p>
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

                <p><strong>Payment Mode:</strong> {paymentMode}</p>
                {paymentMode === "Cash" && (
                  <p><strong>Cash Given:</strong> ${Number(cashGiven).toFixed(2)}</p>
                )}
                {paymentMode === "Cash" && cashGiven > 0 && (
                  <p><strong>Balance Returned:</strong> ${(cashGiven - grandTotal).toFixed(2)}</p>
                )}

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
          <div className="no-print" style={{ marginBottom: "1rem", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}>
          <h3>🛠️ Add New Items</h3>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "1rem" }}>            <div style={{ flex: "1 1 150px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Item Name</label>
              <div ref={globalInputRef} style={{ position: "relative" }}>
              <input
                type="text"
                value={globalProductName}
                onChange={(e) => {setGlobalProductName(e.target.value);
                  setShowGlobalSuggestions(true);
                  setHighlightedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    const filtered = globalProducts.filter((p) =>
                      p.name.toLowerCase().startsWith(globalProductName.toLowerCase())
                    );

                    if (e.key === "ArrowDown") {
                      setHighlightedIndex((prev) =>
                        prev < filtered.length - 1 ? prev + 1 : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      setHighlightedIndex((prev) =>
                        prev > 0 ? prev - 1 : filtered.length - 1
                      );
                    } else if (e.key === "Enter" && highlightedIndex >= 0) {
                      const selected = filtered[highlightedIndex];
                      setGlobalProductName(selected.name);
                      setGlobalPrice(selected.price);
                      setGlobalMrp(selected.mrp);
                      setShowGlobalSuggestions(false);
                      setHighlightedIndex(-1);
                    }
                  }}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "100%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />

              {globalProductName && showGlobalSuggestions && globalProducts.some((p) =>
                p.name.toLowerCase().startsWith(globalProductName.toLowerCase())
                ) &&(
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #ccc",
                    maxHeight: "150px",
                    overflowY: "auto",
                    zIndex: 10,
                    margin: 0,
                    padding: "5px",
                    listStyle: "none",
                  }}
                >
                  {globalProducts
                    .filter((p) =>
                      p.name.toLowerCase().startsWith(globalProductName.toLowerCase())
                    )
                    .map((p, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "5px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          backgroundColor: i === highlightedIndex ? "#e9ecef" : "transparent",
                        }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onClick={() => {
                          setGlobalProductName(p.name);
                          setGlobalPrice(p.price);
                          setGlobalMrp(p.mrp);
                          setShowGlobalSuggestions(false);
                          setHighlightedIndex(-1);
                        }}
                      >
                        {p.name} - price ₹{p.price} / MRP ₹{p.mrp}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            </div>

            <div style={{ flex: "1 1 100px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Rate</label>
              <input
                type="number"
                value={globalPrice}
                onChange={(e) => setGlobalPrice(e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "80%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div style={{ flex: "1 1 100px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Buying Price</label>
              <input
                type="number"
                value={globalBuyingPrice}
                onChange={(e) => setGlobalBuyingPrice(e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "100%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div style={{ flex: "1 1 100px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>MRP</label>
              <input
                type="number"
                value={globalMrp}
                onChange={(e) => setGlobalMrp(e.target.value)}
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "80%",
                  fontSize: "14px",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", alignSelf: "flex-end" }}>
            <button
              onClick={editGlobalIndex !== null ? handleUpdateGlobalProduct : handleAddGlobalProduct}
              style={{
                backgroundColor: editGlobalIndex !== null ? "#17a2b8" : "#28a745", // teal for update, green for add
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = editGlobalIndex !== null ? "#138496" : "#218838")
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = editGlobalIndex !== null ? "#17a2b8" : "#28a745")
              }
            >
              {editGlobalIndex !== null ? "✅ Update Product" : "➕ Add Product"}
            </button>

              <button onClick={handleClearGlobalProduct}
              style={{
                backgroundColor: "#fd7e14", // warning orange
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                marginLeft: "1rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transition: "background-color 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#e96b0c")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#fd7e14")}
              >🧹 Clear Product</button>
            </div>
          </div>
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

            {/* 🛠️ Global Product List */}
            {globalProducts.length > 0 && (
  <>
    <h3>📦 See List of added Items</h3>
    <ul style={{
      listStyle: "none",
      padding: 0,
      margin: 0,
      border: "1px solid #ccc",
      borderRadius: "6px",
      maxHeight: "250px",
      overflowY: "auto",
    }}>
      {[...globalProducts]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p, i) => (
          <li key={i} style={{
            padding: "8px 12px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>{p.name}</strong> MRP ₹{p.mrp}/Buy Price ₹{p.buyprice}/Rate ₹{p.price}
            </div>
            <div>
              <button
                onClick={() => handleEditProduct(i)}
                style={{
                  marginRight: "6px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDeleteProduct(i)}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                ❌ Delete
              </button>
            </div>
          </li>
        ))}
    </ul>
  </>
)}

{/* 📆 Calendar Date Picker */}
<div className="no-print" style={{ marginBottom: "1rem" }}>
  <h3>📆 Pick a Specific Date to view bills</h3>
  <input
    type="date"
    value={selectedCalendarDate}
    onChange={handleCalendarDateChange}
    style={{ padding: "5px", marginBottom: "10px" }}
  />
<br></br>
<div className="no-print" style={{ marginBottom: "1rem" }}>
  <button onClick={() => setShowCalendarSection((prev) => !prev)}>
    {showCalendarSection ? "🙈 Hide Bills" : "📆 Show Bills"}
  </button>
</div>

  {showCalendarSection && selectedCalendarDate && calendarBills.length > 0 && (
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

{/* 📅 Summary Calendar */}

<div className="no-print" style={{ marginTop: "2rem", padding: "10px", borderTop: "1px solid #ccc" }}>
  <h3>📅 Select Date for viewing Summary</h3>
  <input
    type="date"
    value={summaryDate}
    onChange={handleSummaryDateChange}
    style={{ padding: "5px", marginBottom: "10px" }}
  />
  <br></br>
<div className="no-print" style={{ marginBottom: "1rem" }}>
  <button onClick={() => setShowSummarySection((prev) => !prev)}>
    {showSummarySection ? "🙈 Hide Summary Panel" : "📊 Show Summary Panel"}
  </button>
</div>
  {showSummarySection && summaryData && summaryDate && (
  <div style={{ background: "#f9f9f9", padding: "10px", border: "1px solid #ccc", marginTop: "1rem" }}>
    <h4>📊 Summary for {summaryDate}</h4>
    <p><strong>Number of Bills:</strong> {summaryData.billCount}</p>
    <p><strong>Total Selling Price:</strong> ${summaryData.totalSelling.toFixed(2)}</p>
    <p><strong>Total Profit:</strong> ${summaryData.totalProfit.toFixed(2)}</p>
    <button onClick={() => exportSummaryForDateToExcel(summaryDate)} style={{ marginTop: "10px" }}>
      📤 Export Summary to Excel
    </button>
  </div>
)}
</div>

{summaryData && summaryDate && (
  <button
    onClick={() => exportSummaryForDateToExcel(summaryDate)}
    style={{ marginTop: "10px" }}
  >
    📤 Export Summary to Excel
  </button>
)}
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