import React, { useState } from "react";

function BillingPanel({ billId, custId, isBillingActive, onVerify }) {
  const [custName, setCustName] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [items, setItems] = useState([]);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");

  const addItem = () => {
    if (productName && quantity > 0 && price > 0 && mrp > 0) {
      const profit = price - mrp;
      const total = quantity * price;
      const totalProfit = profit * quantity;
      setItems([
        ...items,
        {
          productName,
          quantity: Number(quantity),
          price: Number(price),
          mrp: Number(mrp),
          profit,
          total,
          totalProfit,
        },
      ]);
      setProductName("");
      setQuantity("");
      setPrice("");
      setMrp("");
    } else {
      alert("Please enter valid product, quantity, price, and MRP.");
    }
  };

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
  const billDate = new Date().toLocaleString();

  const verifyAndPrint = () => {
    const billData = {
      billId,
      custId,
      custName,
      custAddress,
      custPhone,
      items,
      grandTotal,
      timestamp: billDate,
    };
    onVerify(billData);
  };

  if (!isBillingActive) return <p>Start a new billing session to begin.</p>;

  return (
    <div className="billing-section">
      <div className="input-section">
        <input type="text" placeholder="Customer Name" value={custName} onChange={(e) => setCustName(e.target.value)} />
        <input type="text" placeholder="Address" value={custAddress} onChange={(e) => setCustAddress(e.target.value)} />
        <input type="text" placeholder="Phone Number" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
      </div>

      <div className="input-section">
        <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input type="number" placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} />
        <button onClick={addItem}>Add Item</button>
      </div>

      {items.length > 0 && (
        <div id="bill-section">
          <p><strong>Bill Number:</strong> {billId}</p>
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
                <th>Price</th>
                <th className="hide-print">MRP</th>
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
                  <td className="hide-print">${item.mrp.toFixed(2)}</td>
                  <td className="hide-print">${item.profit.toFixed(2)}</td>
                  <td>${item.total.toFixed(2)}</td>
                  <td className="hide-print">${item.totalProfit.toFixed(2)}</td>
                  <td className="no-print"><button onClick={() => deleteItem(index)}>❌</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Grand Total: ${grandTotal.toFixed(2)}</h2>
          <button onClick={verifyAndPrint}>✅ Verify & Print</button>
        </div>
      )}
    </div>
  );
}

export default BillingPanel;