import React, { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";
import MenuCategory from "./MenuCategory";
import Cart from "./Cart";
import PendingOrderTimer from "./PendingOrderTimer";
import PlacedOrders from "./PlacedOrders";


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

  const [clientIp, setClientIp] = useState("");



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

  // Fetch IP
  fetch("https://api.ipify.org?format=json")
    .then((res) => res.json())
    .then((data) => {
      setClientIp(data.ip);
    });

  // Fetch menu from backend and group it
 api.get("/menu-items")
  .then(({ data }) => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const expandObj = {};
    Object.keys(grouped).forEach((cat) => (expandObj[cat] = false));
    setExpandedCategories(expandObj);
    setMenu(grouped);
  })
  .catch((err) => {
    console.error("Menu fetch error", err);
    Swal.fire("Error", "Failed to load menu items.", "error");
  });


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
      ip:clientIp
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
            status: "Received", // ✅ Add status
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
          ordersCopy[i] = {
            ...ordersCopy[i],
            items: mergedItems,
            total,
            status: "Received", // ✅ Optional: reset to 'Received' on merge
          };
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
            status: "Received", // ✅ Add status
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
    tableId: "40",
    items,
    location,
    ip: clientIp,  // Add IP here
  });

  setTimerCount(120);
};

  const totalPrice = calculateCartTotal(cart);

   return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7fafc", padding: "40px 20px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 600 }}>
        <h2>Table {tableId} - Menu</h2>
        {Object.entries(menu).map(([category, items]) => (
          <MenuCategory
            key={category}
            category={category}
            items={items}
            expanded={expandedCategories[category]}
            toggleCategory={toggleCategory}
            addToCart={addToCart}
            pendingOrder={pendingOrder}
          />
        ))}

        <Cart
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          totalPrice={calculateCartTotal(cart)}
          handlePlaceOrder={handlePlaceOrder}
          pendingOrder={pendingOrder}
          location={location}
        />

        <PendingOrderTimer pendingOrder={pendingOrder} timerCount={timerCount} confirmPendingOrder={confirmPendingOrder} confirming={confirming} />

        <PlacedOrders placedOrders={placedOrders} cancelOrder={cancelOrder} getStatusBadge={getStatusBadge} />
      </div>
    </div>
  );
};

export default TableOrder;