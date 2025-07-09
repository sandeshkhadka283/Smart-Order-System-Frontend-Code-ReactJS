import React, { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";


// 🧾 Static Menu Data

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

// 📦 Main Component


const TableOrder = ({ tableId }) => {
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState({});
  const [location, setLocation] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [pendingOrder, setPendingOrder] = useState(null);
  const [placedOrders, setPlacedOrders] = useState([]);
  const [timerCount, setTimerCount] = useState(15);
  const [confirming, setConfirming] = useState(false);


    // 🌐 Get user location and setup menu/categories

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        Swal.fire({
          icon: "error",
          title: "Location Required",
          text: "Location access is required to place an order!",
        });
      }
    );

    setMenu(menuData);


        // 📂 Expand all categories by default

    const initExpand = {};
    Object.keys(menuData).forEach((cat) => {
      initExpand[cat] = false;
    });
    setExpandedCategories(initExpand);
  }, []);


    // ⏳ Auto-confirm timer logic

  useEffect(() => {
    if (!pendingOrder) {
      setTimerCount(120); // Reset timer if no pending order
      return;
    }
    if (timerCount === 0) {
      confirmPendingOrder(); // Auto-confirm when timer hits 0
      return;
    }

    const timer = setInterval(() => {
      setTimerCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);  // Cleanup
  }, [pendingOrder, timerCount]);


    // ➕ Add item to cart

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


    // ➖ Remove item from cart

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


    // 🔽 Toggle expand/collapse of categories

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Add a helper function to get badge color and label based on status
const getStatusBadge = (status) => {
  const statusMap = {
    Received: { label: "Received", color: "#6b7280", bg: "#f3f4f6" }, // gray
    Preparing: { label: "Preparing", color: "#d97706", bg: "#ffedd5" }, // amber
    Ready: { label: "Ready", color: "#2563eb", bg: "#dbeafe" }, // blue
    Serving: { label: "Serving", color: "#7c3aed", bg: "#ede9fe" }, // purple
    Completed: { label: "Completed", color: "#16a34a", bg: "#dcfce7" }, // green
    Cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" }, // red
  };
  return statusMap[status] || { label: status, color: "#6b7280", bg: "#f3f4f6" };
};


  // Calculate total price from cart
  const calculateCartTotal = (cartObj) =>
    Object.values(cartObj).reduce((sum, item) => sum + item.price * item.qty, 0);

  // Merge existing order items with new order items
  const mergeOrderItems = (existingItems, newItems) => {
    const itemsMap = new Map();

    existingItems.forEach((item) => {
      itemsMap.set(item.name, { ...item });
    });

    newItems.forEach((item) => {
      if (itemsMap.has(item.name)) {
        const existing = itemsMap.get(item.name);
        const quantity = existing.quantity + item.quantity;
        itemsMap.set(item.name, {
          ...existing,
          quantity,
          subtotal: existing.price * quantity,
        });
      } else {
        itemsMap.set(item.name, { ...item });
      }
    });

    return Array.from(itemsMap.values());
  };

  // Confirm pending order (called automatically by timer or manually)
  const confirmPendingOrder = async () => {
    if (!pendingOrder || confirming) return; // prevent double call
    setConfirming(true);

    try {
      console.log("Confirming pending order:", pendingOrder);

      // Simulate API call (you can replace with real API call)
      await api.post("/orders", {
        tableId: pendingOrder.tableId,
        items: pendingOrder.items,
        location: pendingOrder.location,
      });

      setPlacedOrders((prevOrders) => {
        if (prevOrders.length === 0) {
          return [
            {
              ...pendingOrder,
              total: pendingOrder.items.reduce(
                (sum, item) => sum + item.subtotal,
                0
              ),
            },
          ];
        }

        const ordersCopy = [...prevOrders];
        let merged = false;

        for (let i = 0; i < ordersCopy.length; i++) {
          if (ordersCopy[i].tableId === pendingOrder.tableId) {
            const mergedItems = mergeOrderItems(
              ordersCopy[i].items,
              pendingOrder.items
            );
            const total = mergedItems.reduce(
              (sum, item) => sum + item.subtotal,
              0
            );
            ordersCopy[i] = { ...ordersCopy[i], items: mergedItems, total };
            merged = true;
            break;
          }
        }

        if (!merged) {
          return [
            ...ordersCopy,
            {
              ...pendingOrder,
              total: pendingOrder.items.reduce(
                (sum, item) => sum + item.subtotal,
                0
              ),
            },
          ];
        }
        return ordersCopy;
      });

      Swal.fire({
        icon: "success",
        title: "Order Confirmed!",
        text: "Your order has been placed successfully and can no longer be canceled.",
        timer: 3000,
        showConfirmButton: false,
      });

      setPendingOrder(null);
      setCart({});
      setTimerCount(120);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Something went wrong while placing your order.",
      });
    } finally {
      setConfirming(false);
    }
  };

  // Cancel placed order by order index (user can cancel only before auto confirm)
  const cancelOrder = (index) => {
    Swal.fire({
      title: "Cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        setPlacedOrders((prev) => {
          const updated = [...prev];
          updated.splice(index, 1);
          return updated;
        });
        Swal.fire("Cancelled!", "Your order has been cancelled.", "success");
      }
    });
  };

  // Called when user clicks Place Order button
  const handlePlaceOrder = () => {
    if (!location) {
      Swal.fire({
        icon: "error",
        title: "Location Missing",
        text: "Please enable location to place an order!",
      });
      return;
    }
    if (Object.keys(cart).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Empty Cart",
        text: "Your cart is empty!",
      });
      return;
    }

    // Prepare pending order data
    const items = Object.entries(cart).map(([name, { price, qty }]) => ({
      name,
      price,
      quantity: qty,
      subtotal: price * qty,
    }));

    setPendingOrder({
      tableId,
      items,
      location,
    });

    setTimerCount(120);
  };

  const totalPrice = calculateCartTotal(cart);

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
              <span style={styles.arrow}>
                {expandedCategories[category] ? "▾" : "▸"}
              </span>
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
                      disabled={!!pendingOrder}
                         >
                        +
                      </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Enhanced Cart Section */}
        <div style={styles.cartContainer}>
          <h3 style={styles.cartTitle}>
            <i className="fas fa-shopping-cart" style={styles.cartIcon}></i>
            Your Order
          </h3>
          
          {Object.keys(cart).length === 0 ? (
            <div style={styles.emptyCartContainer}>
              <i className="fas fa-cart-plus" style={styles.emptyCartIcon}></i>
              <p style={styles.emptyCartText}>Your cart is empty</p>
              <p style={styles.emptyCartSubtext}>Add items to place an order</p>
            </div>
          ) : (
            <div style={styles.cartContent}>
              <ul style={styles.cartList}>
                {Object.entries(cart).map(([name, { price, qty }]) => (
                  <li key={name} style={styles.cartItem}>
                    <div style={styles.cartItemDetails}>
                      <span style={styles.cartItemName}>{name}</span>
                      <div style={styles.cartQtyControls}>
                        <button
                          onClick={() => removeFromCart(name)}
                          style={styles.qtyBtn}
                          disabled={!!pendingOrder}
                        >
                          −
                        </button>
                        <span style={styles.cartItemQty}>{qty}</span>
                        <button
                          onClick={() => addToCart({ name, price })}
                          style={styles.qtyBtn}
                          disabled={!!pendingOrder}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div style={styles.cartItemPrice}>Rs {price * qty}</div>
                  </li>
                ))}
              </ul>
              
              <div style={styles.totalContainer}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalPrice}>Rs {totalPrice}</span>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={Object.keys(cart).length === 0 || !location || !!pendingOrder}
                style={{
                  ...styles.placeOrderBtn,
                  ...(Object.keys(cart).length === 0 || !location || !!pendingOrder
                    ? styles.disabledBtn
                    : {}),
                }}
              >
                <i className="fas fa-paper-plane" style={styles.orderIcon}></i>
                Place Order
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Pending Order Timer */}
        {pendingOrder && (
          <div style={styles.pendingOrderContainer}>
            <div style={styles.timerCard}>
              <div style={styles.timerHeader}>
                <i className="fas fa-clock" style={styles.timerIcon}></i>
                <h3 style={styles.timerTitle}>Confirming Order</h3>
              </div>
              
              <div style={styles.timerVisual}>
                <div style={styles.timerCircle}>
                  <div style={styles.timerCount}>{timerCount}</div>
                  <div style={styles.timerLabel}>seconds</div>
                </div>
              </div>
              
              <p style={styles.timerText}>
                Your order will be automatically confirmed in {timerCount} seconds
              </p>
              
              <button 
                style={styles.confirmNowBtn}
                onClick={confirmPendingOrder}
                disabled={confirming}
              >
                {confirming ? 'Confirming...' : 'Confirm Now'}
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Placed Orders Section */}
        <div style={styles.placedOrdersSection}>
          <h3 style={styles.placedOrdersTitle}>
            <i className="fas fa-receipt" style={styles.ordersIcon}></i>
            Order History
          </h3>
          
          {placedOrders.length === 0 ? (
            <div style={styles.noOrdersContainer}>
              <i className="fas fa-inbox" style={styles.noOrdersIcon}></i>
              <p style={styles.noOrdersText}>No orders placed yet</p>
            </div>
          ) : (
            <div style={styles.ordersGrid}>
              {placedOrders.map((order, idx) => (
                <div key={idx} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div style={styles.orderTable}>Table {order.tableId}</div>
                    <div style={styles.orderTotal}>Rs {order.total}</div>
                  </div>
                  
                  <ul style={styles.orderItems}>
                    {order.items.map((item, i) => (
                      <li key={i} style={styles.orderItem}>
                        <span style={styles.itemName}>{item.name}</span>
                        <div style={styles.itemDetails}>
                          <span style={styles.itemQty}>×{item.quantity}</span>
                          <span style={styles.itemSubtotal}>Rs {item.subtotal}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div style={styles.orderFooter}>
                    <button
                      onClick={() => cancelOrder(idx)}
                      style={styles.cancelBtn}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  // Enhanced Cart Styles
  cartContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: "20px 25px",
    marginTop: 40,
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 20,
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cartIcon: {
    color: "#2563eb",
    fontSize: 24,
  },
  emptyCartContainer: {
    textAlign: "center",
    padding: "30px 20px",
  },
  emptyCartIcon: {
    fontSize: 48,
    color: "#cbd5e1",
    marginBottom: 15,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: 500,
    color: "#64748b",
    marginBottom: 5,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
  cartContent: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  
  
  cartItemName: {
    fontWeight: 600,
    fontSize: 16,
    color: "#1e293b",
  },
  cartQtyControls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#e2e8f0",
    color: "#334155",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  
  totalContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "white",
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  totalLabel: {
    fontWeight: 600,
    fontSize: 18,
    color: "#334155",
  },
 
 
  orderIcon: {
    fontSize: 18,
  },
  
  
  // Pending Order Timer
  pendingOrderContainer: {
    marginTop: 30,
  },
  timerCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 20,
    padding: 25,
    textAlign: "center",
    border: "2px dashed #f97316",
    boxShadow: "0 6px 20px rgba(249, 115, 22, 0.15)",
  },
  timerHeader: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  timerIcon: {
    fontSize: 28,
    color: "#f97316",
  },
  timerTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: "#ea580c",
    margin: 0,
  },
  timerVisual: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    backgroundColor: "#ffedd5",
    border: "5px solid #fdba74",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  timerCount: {
    fontSize: 42,
    fontWeight: 800,
    color: "#ea580c",
    lineHeight: 1,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#ea580c",
  },
  timerText: {
    fontSize: 16,
    color: "#ea580c",
    marginBottom: 20,
  },
  confirmNowBtn: {
    padding: "12px 30px",
    backgroundColor: "#ea580c",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
  },
  
  // Placed Orders Section
  placedOrdersSection: {
    marginTop: 50,
  },
  placedOrdersTitle: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 20,
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  ordersIcon: {
    color: "#2563eb",
    fontSize: 24,
  },
  noOrdersContainer: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
  },
  noOrdersIcon: {
    fontSize: 48,
    color: "#cbd5e1",
    marginBottom: 15,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: 500,
    color: "#64748b",
  },
  ordersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  orderCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    border: "1px solid #bbf7d0",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#dcfce7",
    borderBottom: "1px solid #bbf7d0",
  },
  orderTable: {
    fontWeight: 700,
    fontSize: 18,
    color: "#166534",
  },
  orderTotal: {
    fontWeight: 700,
    fontSize: 18,
    color: "#166534",
  },
  orderItems: {
    listStyle: "none",
    padding: "15px 20px",
    margin: 0,
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px dashed #bbf7d0",
  },
  
  itemDetails: {
    display: "flex",
    gap: 15,
  },
  itemQty: {
    color: "#64748b",
    minWidth: 30,
    textAlign: "right",
  },
  itemSubtotal: {
    fontWeight: 500,
    color: "#059669",
    minWidth: 70,
    textAlign: "right",
  },
  orderFooter: {
    padding: "15px 20px",
    display: "flex",
    justifyContent: "flex-end",
    backgroundColor: "#dcfce7",
  },
  cancelBtn: {
    padding: "8px 20px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s",
  },
};



export default TableOrder;
