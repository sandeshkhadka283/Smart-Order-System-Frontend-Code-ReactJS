import React, { useEffect, useState } from "react";
import api from "../api";

const TableOrder = ({ tableId }) => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => alert("Location access is required to place an order")
    );

    setMenu([
      { name: "Momo", price: 200 },
      { name: "Chowmein", price: 180 },
    ]);
  }, []);

  const addToCart = (item) => setCart([...cart, item]);

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const placeOrder = async () => {
    if (!location) {
      alert("Location required!");
      return;
    }
    try {
      await api.post("/orders", {
        tableId,
        items: cart,
        location,
      });
      alert("Order placed successfully!");
      setCart([]);
    } catch (err) {
      alert("Failed to place order.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Table {tableId} - Menu</h2>

      <div style={styles.menuList}>
        {menu.map((item, idx) => (
          <div key={idx} style={styles.menuItem}>
            <span>
              {item.name} - Rs {item.price}
            </span>
            <button
              onClick={() => addToCart(item)}
              style={styles.addButton}
              aria-label={`Add ${item.name} to cart`}
            >
              ➕ Add
            </button>
          </div>
        ))}
      </div>

      <h3 style={styles.subtitle}>Your Cart</h3>
      {cart.length === 0 ? (
        <p style={styles.emptyCart}>No items added</p>
      ) : (
        <ul style={styles.cartList}>
          {cart.map((item, idx) => (
            <li key={idx} style={styles.cartItem}>
              {item.name} - Rs {item.price}
              <button
                onClick={() => removeFromCart(idx)}
                style={styles.removeButton}
                aria-label={`Remove ${item.name} from cart`}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={placeOrder}
        disabled={cart.length === 0 || !location}
        style={{
          ...styles.placeOrderBtn,
          ...(cart.length === 0 || !location ? styles.disabledBtn : {}),
        }}
      >
        Place Order
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 480,
    margin: "auto",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 18,
    color: "#111827",
    textAlign: "center",
  },
  menuList: {
    marginBottom: 20,
  },
  menuItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center",
    fontSize: 17,
  },
  addButton: {
    padding: "6px 14px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.3s",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
    color: "#374151",
  },
  emptyCart: {
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  cartList: {
    listStyle: "none",
    paddingLeft: 0,
    marginBottom: 20,
  },
  cartItem: {
    fontSize: 16,
    padding: "8px 10px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeButton: {
    marginLeft: 12,
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 14,
  },
  placeOrderBtn: {
    width: "100%",
    padding: "14px 0",
    fontWeight: 700,
    fontSize: 18,
    borderRadius: 14,
    border: "none",
    backgroundColor: "#10b981",
    color: "white",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 6px 20px rgba(16,185,129,0.5)",
    transition: "background-color 0.3s",
  },
  disabledBtn: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};

export default TableOrder;
