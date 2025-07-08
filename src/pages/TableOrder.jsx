import React, { useEffect, useState } from "react";
import api from "../api";

const menuData = {
  Breakfast: [
    { name: "Pancakes", price: 150 },
    { name: "Omelette", price: 120 },
    { name: "French Toast", price: 180 },
    { name: "Paratha", price: 100 },
    { name: "Idli Sambar", price: 130 },
    { name: "Poha", price: 110 },
  ],
  Drinks: [
    { name: "Tea", price: 50 },
    { name: "Coffee", price: 70 },
    { name: "Orange Juice", price: 90 },
    { name: "Lassi", price: 80 },
    { name: "Cold Drink", price: 60 },
    { name: "Mineral Water", price: 40 },
  ],
  "Veg Main Course": [
    { name: "Paneer Butter Masala", price: 250 },
    { name: "Vegetable Biryani", price: 220 },
    { name: "Dal Tadka", price: 150 },
    { name: "Chole Bhature", price: 180 },
    { name: "Mixed Veg Curry", price: 200 },
    { name: "Aloo Gobi", price: 170 },
  ],
  "Non-Veg Main Course": [
    { name: "Chicken Curry", price: 280 },
    { name: "Mutton Curry", price: 320 },
    { name: "Fish Fry", price: 270 },
    { name: "Egg Curry", price: 150 },
    { name: "Chicken Biryani", price: 300 },
    { name: "Butter Chicken", price: 350 },
  ],
  Snacks: [
    { name: "Samosa", price: 50 },
    { name: "Pakora", price: 60 },
    { name: "French Fries", price: 100 },
    { name: "Spring Roll", price: 120 },
    { name: "Momo (Veg)", price: 200 },
    { name: "Momo (Chicken)", price: 230 },
  ],
};

const TableOrder = ({ tableId }) => {
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState({});
  const [location, setLocation] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Location access is required to place an order")
    );

    setMenu(menuData);

    const initExpand = {};
    Object.keys(menuData).forEach((cat) => {
      initExpand[cat] = true;
    });
    setExpandedCategories(initExpand);
  }, []);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const prevItem = prevCart[item.name];
      return {
        ...prevCart,
        [item.name]: {
          price: item.price,
          qty: prevItem ? prevItem.qty + 1 : 1,
        },
      };
    });
  };

  const removeFromCart = (itemName) => {
    setCart((prevCart) => {
      const prevItem = prevCart[itemName];
      if (!prevItem) return prevCart;
      if (prevItem.qty === 1) {
        const { [itemName]: _, ...rest } = prevCart;
        return rest;
      } else {
        return {
          ...prevCart,
          [itemName]: {
            ...prevItem,
            qty: prevItem.qty - 1,
          },
        };
      }
    });
  };

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const placeOrder = async () => {
    if (!location) {
      alert("Location required!");
      return;
    }
    if (Object.keys(cart).length === 0) {
      alert("Cart is empty!");
      return;
    }
    try {
      const items = Object.entries(cart).map(([name, { price, qty }]) => ({
        name,
        price,
        quantity: qty,
      }));
      await api.post("/orders", { tableId, items, location });
      alert("Order placed successfully!");
      setCart({});
    } catch {
      alert("Failed to place order.");
    }
  };

  const totalPrice = Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h2 style={styles.title}>Table {tableId} - Menu</h2>

        {Object.entries(menu).map(([category, items]) => (
          <div key={category} style={styles.categoryContainer}>
            <button
              onClick={() => toggleCategory(category)}
              style={styles.categoryButton}
              aria-expanded={expandedCategories[category]}
              aria-controls={`${category}-list`}
            >
              <span style={styles.arrow}>{expandedCategories[category] ? "▾" : "▸"}</span>
              <span style={styles.categoryName}>{category}</span>
              <span style={styles.itemCount}>({items.length})</span>
            </button>
            {expandedCategories[category] && (
              <div id={`${category}-list`} style={styles.menuList}>
                {items.map((item, idx) => (
                  <div key={idx} style={styles.menuItem}>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemPrice}>Rs {item.price}</div>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      style={styles.addButton}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <h3 style={styles.cartTitle}>Your Cart</h3>
        {Object.keys(cart).length === 0 ? (
          <p style={styles.emptyCart}>No items added</p>
        ) : (
          <ul style={styles.cartList}>
            {Object.entries(cart).map(([name, { price, qty }]) => (
              <li key={name} style={styles.cartItem}>
                <div style={styles.cartItemDetails}>
                  <span style={styles.cartItemName}>{name}</span>
                  <span style={styles.cartItemQty}>× {qty}</span>
                </div>
                <div style={styles.cartItemActions}>
                  <span style={styles.cartItemPrice}>Rs {price * qty}</span>
                  <div>
                    <button
                      onClick={() => removeFromCart(name)}
                      style={styles.cartBtn}
                      aria-label={`Remove one ${name} from cart`}
                    >
                      −
                    </button>
                    <button
                      onClick={() => addToCart({ name, price })}
                      style={styles.cartBtn}
                      aria-label={`Add one more ${name} to cart`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div style={styles.footer}>
          <div style={styles.totalPrice}>Total: Rs {totalPrice}</div>
          <button
            onClick={placeOrder}
            disabled={Object.keys(cart).length === 0 || !location}
            style={{
              ...styles.placeOrderBtn,
              ...(Object.keys(cart).length === 0 || !location ? styles.disabledBtn : {}),
            }}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    minHeight: "100vh",
    backgroundColor: "#f7fafc",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: 600,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
    padding: "36px 48px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#2e3440",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 36,
    textAlign: "center",
    letterSpacing: "0.06em",
  },
  categoryContainer: {
    marginBottom: 30,
    borderRadius: 16,
    border: "1.5px solid #d1d5db",
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  categoryButton: {
    width: "100%",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "transparent",
    border: "none",
    fontSize: 22,
    fontWeight: "700",
    color: "#334155",
    userSelect: "none",
    transition: "background-color 0.25s ease",
  },
  categoryButtonHover: {
    backgroundColor: "#e0e7ff",
  },
  arrow: {
    fontSize: 22,
    marginRight: 16,
    color: "#2563eb",
    flexShrink: 0,
    transition: "transform 0.25s ease",
  },
  categoryName: {
    flexGrow: 1,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    minWidth: 48,
    textAlign: "right",
  },
  menuList: {
    backgroundColor: "#ffffff",
    borderTop: "1.5px solid #d1d5db",
    padding: "16px 24px",
  },
  menuItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 18,
    color: "#1e293b",
    userSelect: "none",
  },
  itemName: {
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.6)",
    transition: "background-color 0.3s ease",
  },
  addButtonHover: {
    backgroundColor: "#1e40af",
  },
  cartTitle: {
    fontSize: 26,
    fontWeight: "700",
    borderBottom: "3px solid #d1d5db",
    paddingBottom: 10,
    marginBottom: 28,
    color: "#334155",
  },
  emptyCart: {
    textAlign: "center",
    color: "#94a3b8",
    fontStyle: "italic",
    fontSize: 16,
    marginBottom: 44,
  },
  cartList: {
    listStyle: "none",
    padding: 0,
    marginBottom: 44,
  },
  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderRadius: 14,
    backgroundColor: "#f0f4f8",
    marginBottom: 16,
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
    fontSize: 18,
  },
  cartItemDetails: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  cartItemName: {},
  cartItemQty: {
    fontWeight: "400",
    color: "#64748b",
  },
  cartItemActions: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  cartItemPrice: {
    fontWeight: "700",
    color: "#059669",
    minWidth: 90,
    textAlign: "right",
  },
  cartBtn: {
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: 10,
    padding: "6px 14px",
    color: "white",
    fontWeight: "700",
    fontSize: 18,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 5px 15px rgba(37, 99, 235, 0.5)",
    transition: "background-color 0.3s ease",
  },
  cartBtnHover: {
    backgroundColor: "#1e40af",
  },
  totalPrice: {
    fontWeight: "700",
    fontSize: 24,
    color: "#111827",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 28,
  },
  placeOrderBtn: {
    flex: 1,
    padding: "18px 0",
    fontWeight: "700",
    fontSize: 22,
    borderRadius: 20,
    border: "none",
    backgroundColor: "#059669",
    color: "white",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 10px 30px rgba(5, 150, 105, 0.55)",
    transition: "background-color 0.3s ease",
  },
  disabledBtn: {
    backgroundColor: "#a1a9b8",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};

export default TableOrder;
