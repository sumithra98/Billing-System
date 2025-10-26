import React, { useState, useEffect } from "react";
import "../styles/ProductGallery.css";

const categories = ["Fruits", "Dairy", "Snacks"];

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

function ProductGallery() {
  const [selectedCategory, setSelectedCategory] = useState("Fruits");
  const [customProducts, setCustomProducts] = useState([]);
  const [newProductName, setNewProductName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("customProducts");
    if (saved) setCustomProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("customProducts", JSON.stringify(customProducts));
  }, [customProducts]);

  const addCustomProduct = () => {
    const isDuplicate =
      customProducts.some((p) => p.name === newProductName) ||
      Object.values(productCatalog).flat().some((p) => p.name === newProductName);

    if (newProductName && !isDuplicate) {
      setCustomProducts([...customProducts, { name: newProductName }]);
      setNewProductName("");
    } else {
      alert("Product already exists or name is empty.");
    }
  };

  const deleteCustomProduct = (index) => {
    const updated = customProducts.filter((_, i) => i !== index);
    setCustomProducts(updated);
  };

  return (
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
          <div key={index} className="product-card">
            <img src={product.image} alt={product.name} />
            <p>{product.name}</p>
            <p>${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <h3>🆕 Add Custom Product</h3>
      <div className="input-section">
        <input
          type="text"
          placeholder="Custom Product Name"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
        />
        <button onClick={addCustomProduct}>Add to Custom List</button>
      </div>

      {customProducts.length > 0 && (
        <>
          <h3>Custom Products</h3>
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
  );
}

export default ProductGallery;