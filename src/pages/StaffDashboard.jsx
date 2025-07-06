import React, { useState, useEffect } from "react";
import api from "../api";

const StaffDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  // Orders state
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);

  // Register form state - including new username
  const [regUsername, setRegUsername] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("staff");
  const [regStatus, setRegStatus] = useState(null);

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
    } catch (err) {
      console.error("Failed to fetch pending orders", err);
    }
  };

  const fetchConfirmedOrders = async () => {
    try {
      const res = await api.get("/orders/confirmed", config);
      setConfirmedOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch confirmed orders", err);
    }
  };

  const confirmOrder = async (id) => {
    try {
      await api.post(`/orders/confirm/${id}`, {}, config);
      fetchPendingOrders();
      fetchConfirmedOrders();
    } catch (err) {
      console.error("Failed to confirm order", err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`, config);
      fetchPendingOrders();
      fetchConfirmedOrders();
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPendingOrders();
    fetchConfirmedOrders();
    const interval = setInterval(() => {
      fetchPendingOrders();
      fetchConfirmedOrders();
    }, 10000);
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
      {pendingOrders.length === 0 ? (
        <p style={styles.emptyText}>No pending orders.</p>
      ) : (
        pendingOrders.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            <p><strong>Table:</strong> {order.tableId}</p>
            <p><strong>Items:</strong> {order.items.map((i) => i.name).join(", ")}</p>
            <p><strong>IP:</strong> {order.ip || "N/A"}</p>
            <p><strong>Location:</strong> {order.location ? `${order.location.lat}, ${order.location.lng}` : "N/A"}</p>
            <div style={styles.actionButtons}>
              <button onClick={() => confirmOrder(order._id)} style={styles.confirmBtn}>✅ Confirm</button>
              <button onClick={() => deleteOrder(order._id)} style={styles.deleteBtn}>🗑️ Delete</button>
            </div>
          </div>
        ))
      )}

      <h2 style={styles.sectionTitle}>✅ Confirmed Orders</h2>
      {confirmedOrders.length === 0 ? (
        <p style={styles.emptyText}>No confirmed orders.</p>
      ) : (
        confirmedOrders.map((order) => (
          <div key={order._id} style={{ ...styles.orderCard, ...styles.confirmedOrderCard }}>
            <p><strong>Table:</strong> {order.tableId}</p>
            <p><strong>Items:</strong> {order.items.map((i) => i.name).join(", ")}</p>
            <p><strong>IP:</strong> {order.ip || "N/A"}</p>
            <p><strong>Location:</strong> {order.location ? `${order.location.lat}, ${order.location.lng}` : "N/A"}</p>
            <button onClick={() => deleteOrder(order._id)} style={styles.deleteBtn}>
              🗑️ Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  loginContainer: {
    maxWidth: 400,
    margin: "auto",
    padding: 30,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontWeight: 700,
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
    color: "#111827",
  },
  input: {
    marginBottom: 14,
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 8,
    border: "1.5px solid #d1d5db",
    outline: "none",
    transition: "border-color 0.3s",
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "12px",
    borderRadius: 10,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    marginTop: 6,
    boxShadow: "0 6px 16px rgba(59,130,246,0.5)",
  },
  errorText: {
    color: "#dc2626",
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  toggleRegisterBtn: {
    marginTop: 24,
    padding: "10px 0",
    borderRadius: 10,
    border: "none",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 6px 16px rgba(16,185,129,0.6)",
    transition: "background-color 0.3s",
  },
  registerForm: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  registerButton: {
    marginTop: 10,
    padding: "12px",
    backgroundColor: "#10b981",
    color: "white",
    borderRadius: 10,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(16,185,129,0.6)",
  },
  dashboardContainer: {
    maxWidth: 720,
    margin: "auto",
    paddingBottom: 30,
  },
  logoutButton: {
    marginBottom: 30,
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 6px 16px rgba(239,68,68,0.6)",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 18,
    color: "#111827",
  },
  emptyText: {
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    color: "#111827",
  },
  confirmedOrderCard: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  actionButtons: {
    marginTop: 14,
    display: "flex",
    gap: 12,
  },
  confirmBtn: {
    padding: "8px 16px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(16,185,129,0.7)",
  },
  deleteBtn: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(239,68,68,0.7)",
  },
};

export default StaffDashboard;