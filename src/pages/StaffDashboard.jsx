import React, { useState, useEffect } from "react";
import api from "../api";
import Swal from "sweetalert2";




const StaffDashboard = () => {

  const orderStatuses = [
  "pending",
  "confirmed",
  "received",
  "preparing",
  "ready",
  "serving",
  "completed",
  "cancelled",
];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [regUsername, setRegUsername] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("staff");
  const [regStatus, setRegStatus] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedConfirmedOrderIds, setSelectedConfirmedOrderIds] = useState([]);
  const [pendingLocations, setPendingLocations] = useState({});
const [confirmedLocations, setConfirmedLocations] = useState({});

const [otherOrdersByStatus, setOtherOrdersByStatus] = useState({});
const [otherLocationsByStatus, setOtherLocationsByStatus] = useState({});





  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      const res = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "staff");
      setIsAuthenticated(true);
      setLoginEmail("");
      setLoginPassword("");
      fetchPendingOrders();
      fetchConfirmedOrders();
    } catch (err) {
      setLoginError("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setPendingOrders([]);
    setConfirmedOrders([]);
    setShowRegisterForm(false);
  };

  const handleRegister = async () => {
    setRegStatus(null);
    if (!regUsername || !regName || !regEmail || !regPassword) {
      setRegStatus("Please fill all fields");
      return;
    }
    try {
      await api.post(
        "/auth/register",
        {
          username: regUsername,
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
        },
        config
      );
      setRegStatus("✅ User registered successfully!");
      setRegUsername("");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      setRegStatus("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

 const fetchPendingOrders = async () => {
  try {
    const res = await api.get("/orders/pending", config);
    setPendingOrders(res.data);

    // Fetch location names for each order
    const locs = {};
    await Promise.all(
      res.data.map(async (order) => {
        if (order.location?.lat && order.location?.lng) {
          locs[order._id] = await fetchLocationName(order.location.lat, order.location.lng);
        } else {
          locs[order._id] = "N/A";
        }
      })
    );
    setPendingLocations(locs);
  } catch (err) {
    console.error("Failed to fetch pending orders", err);
  }
};

  const fetchConfirmedOrders = async () => {
  try {
    const res = await api.get("/orders/confirmed", config);
    setConfirmedOrders(res.data);

    const locs = {};
    await Promise.all(
      res.data.map(async (order) => {
        if (order.location?.lat && order.location?.lng) {
          locs[order._id] = await fetchLocationName(order.location.lat, order.location.lng);
        } else {
          locs[order._id] = "N/A";
        }
      })
    );
    setConfirmedLocations(locs);
  } catch (err) {
    console.error("Failed to fetch confirmed orders", err);
  }
};

const fetchOtherOrders = async () => {
  const otherStatuses = [
    "received",
    "preparing",
    "ready",
    "serving",
    "completed",
    "cancelled"
  ];
  const all = {};
  const locations = {};

  await Promise.all(
    otherStatuses.map(async (status) => {
      try {
        const res = await api.get(`/orders/status/${status}`, config);
        all[status] = res.data;

        const locs = {};
        await Promise.all(
          res.data.map(async (order) => {
            if (order.location?.lat && order.location?.lng) {
              locs[order._id] = await fetchLocationName(order.location.lat, order.location.lng);
            } else {
              locs[order._id] = "N/A";
            }
          })
        );
        locations[status] = locs;
      } catch (err) {
        all[status] = [];
        locations[status] = {};
      }
    })
  );

  console.log("Other Orders fetched:", all);
  setOtherOrdersByStatus(all);
  setOtherLocationsByStatus(locations);
};



  const confirmOrder = async (id) => {
    try {
      await api.post(`/orders/confirm/${id}`, {}, config);
      fetchPendingOrders();
      fetchConfirmedOrders();
      Swal.fire({
        icon: "success",
        title: "Order Confirmed",
        text: "The order has been confirmed.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to confirm order!",
      });
    }
  };

  const deleteOrder = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/orders/${id}`, config);
        fetchPendingOrders();
        fetchConfirmedOrders();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The order has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to delete the order!",
        });
      }
    }
  };
  const toggleSelectOrder = (id) => {
  setSelectedOrderIds((prev) =>
    prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
  );
};

const toggleSelectAllOrders = () => {
  if (selectedOrderIds.length === pendingOrders.length) {
    setSelectedOrderIds([]);
  } else {
    setSelectedOrderIds(pendingOrders.map((order) => order._id));
  }
};

const deleteSelectedOrders = async () => {
  const result = await Swal.fire({
    title: "Delete selected orders?",
    text: `You are about to delete ${selectedOrderIds.length} orders.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete all!",
  });

  if (result.isConfirmed) {
    try {
      await Promise.all(
        selectedOrderIds.map((id) => api.delete(`/orders/${id}`, config))
      );
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${selectedOrderIds.length} orders deleted.`,
        timer: 2000,
        showConfirmButton: false,
      });
      setSelectedOrderIds([]);
      fetchPendingOrders();
      fetchConfirmedOrders();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete selected orders.",
      });
    }
  }
};
const toggleSelectAllConfirmedOrders = () => {
  if (selectedConfirmedOrderIds.length === confirmedOrders.length) {
    setSelectedConfirmedOrderIds([]);
  } else {
    setSelectedConfirmedOrderIds(confirmedOrders.map((o) => o._id));
  }
};

const deleteSelectedConfirmedOrders = async () => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `Delete ${selectedConfirmedOrderIds.length} confirmed order(s)?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete them!",
  });

  if (result.isConfirmed) {
    try {
      for (const id of selectedConfirmedOrderIds) {
        await api.delete(`/orders/${id}`, config);
      }
      fetchConfirmedOrders();
      setSelectedConfirmedOrderIds([]);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Selected confirmed orders have been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete selected confirmed orders.",
      });
    }
  }
};

const fetchLocationName = async (lat, lng) => {
  console.log("📍 fetchLocationName called with:", lat, lng);
  
  if (!lat || !lng) return "Unknown location";

  const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY;
  console.log("🔑 OpenCage API Key:", apiKey);
  if (!apiKey) {
    console.error("❌ API Key is missing!");
    return "Unknown location";
  }

  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lng}&key=${apiKey}&no_annotations=1`;
    console.log("🌍 Fetching location data from URL:", url);

    const res = await fetch(url);
    const data = await res.json();

    console.log("📡 API response:", data);

    if (data.results && data.results.length > 0) {
      return data.results[0].formatted;
    } else {
      return "Unknown location";
    }
  } catch (error) {
    console.error("❌ Error fetching location:", error);
    return "Unknown location";
  }
};
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await api.patch(`/orders/${orderId}/status`, { status: newStatus }, config);
    Swal.fire({
      icon: "success",
      title: "Status Updated",
      text: `Order status updated to "${newStatus}".`,
      timer: 1500,
      showConfirmButton: false,
    });
    fetchPendingOrders();
    fetchConfirmedOrders();
    fetchOtherOrders();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: err.response?.data?.message || "Failed to update status.",
    });
  }
};




  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPendingOrders();
    fetchConfirmedOrders();
      fetchOtherOrders(); // 👈 added here

    const interval = setInterval(() => {
      fetchPendingOrders();
      fetchConfirmedOrders();
          fetchOtherOrders(); // 👈 added here

    }, 24000000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <h2 style={styles.title}>🔐 Staff Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.loginButton}>
          Login
        </button>
        {loginError && <p style={styles.errorText}>{loginError}</p>}

        <button
          onClick={() => setShowRegisterForm((prev) => !prev)}
          style={{
            ...styles.toggleRegisterBtn,
            backgroundColor: showRegisterForm ? "#ef4444" : "#10b981",
          }}
        >
          {showRegisterForm ? "❌ Cancel Register" : "➕ Register New Staff"}
        </button>

        {showRegisterForm && (
          <div style={styles.registerForm}>
            <h3 style={{ marginBottom: 12 }}>📝 Register Staff</h3>
            <input
              type="text"
              placeholder="Username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              style={styles.input}
            />
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value)}
              style={styles.input}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleRegister} style={styles.registerButton}>
              Register
            </button>
            {regStatus && (
              <p
                style={{
                  marginTop: 10,
                  color: regStatus.startsWith("Registration failed") ? "#dc2626" : "#059669",
                  fontWeight: "600",
                }}
              >
                {regStatus}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <button onClick={handleLogout} style={styles.logoutButton}>
        🚪 Logout
      </button>

      <h2 style={styles.sectionTitle}>📋 Pending Orders</h2>
      {/* ✅ Select All + Delete Selected Controls */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
  <div>
    <input
      type="checkbox"
      onChange={toggleSelectAllOrders}
      checked={selectedOrderIds.length === pendingOrders.length && pendingOrders.length > 0}
    /> Select All
  </div>
  <button
    onClick={deleteSelectedOrders}
    style={{ ...styles.deleteBtn, padding: "6px 12px", backgroundColor: "#dc2626", color: "#fff" }}
    disabled={selectedOrderIds.length === 0}
  >
    🗑️ Delete Selected ({selectedOrderIds.length})
  </button>
</div>

      {pendingOrders.length === 0 ? (
  <p style={styles.emptyText}>No pending orders.</p>
) : (
  pendingOrders.map((order) => (
    <div key={order._id} style={styles.orderCard}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={selectedOrderIds.includes(order._id)}
          onChange={() => toggleSelectOrder(order._id)}
          style={{ marginRight: 10 }}
        />
        <p><strong>Table:</strong> {order.tableId}</p>
      </div>
      <ul style={{ marginLeft: 20 }}>
        {order.items.map((item, idx) => (
          <li key={idx}>{item.name}</li>
        ))}
      </ul>
      <p><strong>IP:</strong> {order.ip || "N/A"}</p>
      <p><strong>Location:</strong> {pendingLocations[order._id] || "N/A"}</p>
      {order.createdAt && (
        <p><small>Ordered at: {new Date(order.createdAt).toLocaleString()}</small></p>
      )}
      <p>
        <strong>Status:</strong>{" "}
        <select
          value={order.status}
          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
          style={{ padding: "4px 8px", borderRadius: 6 }}
        >
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </p>
      <div style={styles.actionButtons}>
        <button onClick={() => confirmOrder(order._id)} style={styles.confirmBtn}>✅ Confirm</button>
        <button onClick={() => deleteOrder(order._id)} style={styles.deleteBtn}>🗑️ Delete</button>
      </div>
    </div>
  ))
)}

      <h2 style={styles.sectionTitle}>✅ Confirmed Orders</h2>
      {/* ✅ Select All + Delete Selected Controls for Confirmed */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
  <div>
    <input
      type="checkbox"
      onChange={toggleSelectAllConfirmedOrders}
      checked={selectedConfirmedOrderIds.length === confirmedOrders.length && confirmedOrders.length > 0}
    /> Select All
  </div>
  <button
    onClick={deleteSelectedConfirmedOrders}
    style={{ ...styles.deleteBtn, padding: "6px 12px", backgroundColor: "#dc2626", color: "#fff" }}
    disabled={selectedConfirmedOrderIds.length === 0}
  >
    🗑️ Delete Selected ({selectedConfirmedOrderIds.length})
  </button>
</div>

      {confirmedOrders.length === 0 ? (
        <p style={styles.emptyText}>No confirmed orders.</p>
      ) : (
        confirmedOrders.map((order) => (
         <div key={order._id} style={{ ...styles.orderCard, ...styles.confirmedOrderCard }}>
  <input
    type="checkbox"
    checked={selectedConfirmedOrderIds.includes(order._id)}
    onChange={() => {
      setSelectedConfirmedOrderIds((prev) =>
        prev.includes(order._id)
          ? prev.filter((id) => id !== order._id)
          : [...prev, order._id]
      );
    }}
    style={{ marginRight: 8 }}
  />
  <p><strong>Table:</strong> {order.tableId}</p>
            <ul style={{ marginLeft: 20 }}>
              {order.items.map((item, idx) => (
                <li key={idx}>{item.name}</li>
              ))}
            </ul>
            <p><strong>IP:</strong> {order.ip || "N/A"}</p>
<p>
  <strong>Location:</strong>{" "}
  {confirmedLocations[order._id] || "N/A"}
</p>

            {order.createdAt && <p><small>Ordered at: {new Date(order.createdAt).toLocaleString()}</small></p>}
            <button onClick={() => deleteOrder(order._id)} style={styles.deleteBtn}>🗑️ Delete</button>
          </div>
        ))
      )}

    {["received", "preparing", "ready", "serving", "completed", "cancelled"].map((status) => (
  <div key={status}>
    <h2 style={styles.sectionTitle}>
      {status === "received" && "📥 Received Orders"}
      {status === "preparing" && "🍳 Preparing Orders"}
      {status === "ready" && "🛎️ Ready Orders"}
      {status === "serving" && "🍽️ Serving Orders"}
      {status === "completed" && "🏁 Completed Orders"}
      {status === "cancelled" && "❌ Cancelled Orders"}
    </h2>

    {(otherOrdersByStatus[status] || []).length === 0 ? (
      <p style={styles.emptyText}>No {status} orders.</p>
    ) : (
      (otherOrdersByStatus[status] || []).map((order) => (
        <div key={order._id} style={styles.orderCard}>
          <p><strong>Table:</strong> {order.tableId}</p>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>{item.name} × {item.quantity}</li>
            ))}
          </ul>
          <p><strong>IP:</strong> {order.ip || "N/A"}</p>
          <p>
            <strong>Location:</strong>{" "}
            {otherLocationsByStatus[status]?.[order._id] || "N/A"}
          </p>
          {order.createdAt && (
            <p><small>Ordered at: {new Date(order.createdAt).toLocaleString()}</small></p>
          )}
          <p>
            <strong>Status:</strong>{" "}
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 6 }}
            >
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </p>
          <div style={styles.actionButtons}>
            <button onClick={() => deleteOrder(order._id)} style={styles.deleteBtn}>🗑️ Delete</button>
          </div>
        </div>
      ))
    )}
  </div>
))}

    </div>
  );
};

const styles = {
  loginContainer: {
    maxWidth: 420,
    margin: "3rem auto",
    padding: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontWeight: 800,
    fontSize: 28,
    marginBottom: 28,
    textAlign: "center",
    color: "#1f2937",
    letterSpacing: "1.5px",
  },
  input: {
    marginBottom: 18,
    padding: "14px 18px",
    fontSize: 16,
    borderRadius: 12,
    border: "1.8px solid #d1d5db",
    outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
    fontWeight: 500,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  inputFocus: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 6px #3b82f6",
  },
  loginButton: {
    backgroundColor: "#2563eb", // Slightly deeper blue
    color: "white",
    padding: "14px",
    borderRadius: 14,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    marginTop: 12,
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.5)",
    fontSize: 16,
    letterSpacing: "0.7px",
    transition: "background-color 0.3s ease",
  },
  loginButtonHover: {
    backgroundColor: "#1e40af",
  },
  errorText: {
    color: "#dc2626",
    marginTop: 14,
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
  toggleRegisterBtn: {
    marginTop: 28,
    padding: "14px 0",
    borderRadius: 14,
    border: "none",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 8px 24px rgba(16,185,129,0.7)",
    fontSize: 16,
    letterSpacing: "0.7px",
    transition: "background-color 0.3s ease",
  },
  registerForm: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9fafb",
    padding: 28,
    borderRadius: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.07)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  registerButton: {
    marginTop: 14,
    padding: "14px",
    backgroundColor: "#059669",
    color: "white",
    borderRadius: 14,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(5, 150, 105, 0.7)",
    fontSize: 16,
    letterSpacing: "0.7px",
  },
  dashboardContainer: {
    maxWidth: 760,
    margin: "2.5rem auto 3rem",
    paddingBottom: 36,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#111827",
  },
  logoutButton: {
    marginBottom: 36,
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: 18,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: "0.8px",
    boxShadow: "0 10px 28px rgba(220, 38, 38, 0.6)",
    transition: "background-color 0.3s ease",
  },
  logoutButtonHover: {
    backgroundColor: "#991b1b",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 24,
    color: "#1f2937",
    letterSpacing: "1px",
  },
  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 24,
    fontSize: 15,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    border: "1.5px solid #e5e7eb",
    color: "#111827",
    transition: "box-shadow 0.3s ease",
  },
  orderCardHover: {
    boxShadow: "0 18px 42px rgba(0,0,0,0.14)",
  },
  confirmedOrderCard: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  actionButtons: {
    marginTop: 20,
    display: "flex",
    gap: 16,
  },
  confirmBtn: {
    padding: "10px 24px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 15,
    boxShadow: "0 6px 18px rgba(16,185,129,0.85)",
    transition: "background-color 0.3s ease",
  },
  confirmBtnHover: {
    backgroundColor: "#047857",
  },
  deleteBtn: {
    padding: "10px 24px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 15,
    boxShadow: "0 6px 18px rgba(239,68,68,0.85)",
    transition: "background-color 0.3s ease",
  },
  deleteBtnHover: {
    backgroundColor: "#b91c1c",
  },
};


export default StaffDashboard;
