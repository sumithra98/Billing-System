import React, { useState, useEffect } from "react";
import "./App.css";

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
  setBillStatus("Pending");

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
  setBillStatus("Pending");

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
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>MRP</th>
                      <th className="hide-print">Buying Price</th>
                      <th className="hide-print">Profit</th>
                      <th>Total</th>
                      <th className="hide-print">Total Profit</th>
                      <th className="no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${item.mrp.toFixed(2)}</td>
                        <td className="hide-print">${item.buyprice.toFixed(2)}</td>
                        <td className="hide-print">${item.profit.toFixed(2)}</td>
                        <td>${item.total.toFixed(2)}</td>
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
    </div>
  );
}

export default App;