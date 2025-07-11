// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTables: 0,
    activeSessions: 0,
    totalOrders: 0,
    byStatus: {},
  });
  const [todayOrders, setTodayOrders] = useState([]);

  const fetchStats = async () => {
  try {
    const { data } = await api.get("/admin/stats");
    console.log("Stats data from API:", data);

    // Defensive fallback to keep structure
    if (
      !data ||
      typeof data !== "object" ||
      !data.byStatus ||
      typeof data.byStatus !== "object"
    ) {
      // If API response is malformed, reset to default
      setStats({
        totalTables: 0,
        activeSessions: 0,
        totalOrders: 0,
        byStatus: {},
      });
    } else {
      setStats(data);
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to fetch stats.", "error");
  }
};


  const fetchTodayOrders = async () => {
    try {
      const { data } = await api.get("/orders/today");
      setTodayOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTodayOrders();
    const interval = setInterval(() => {
      fetchStats();
      fetchTodayOrders();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Admin Dashboard</h1>
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <h3>Total Tables</h3>
          <p style={styles.statBig}>{stats.totalTables}</p>
        </div>
        <div style={styles.card}>
          <h3>Active Sessions</h3>
          <p style={styles.statBig}>{stats.activeSessions}</p>
        </div>
        <div style={styles.card}>
          <h3>Total Orders</h3>
          <p style={styles.statBig}>{stats.totalOrders}</p>
        </div>
        {stats.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
  <div key={status} style={styles.cardSmall}>
    <h5>{status.charAt(0).toUpperCase() + status.slice(1)}</h5>
    <p>{count}</p>
  </div>
))}

      </div>

      <h2 style={{ marginTop: 32 }}>Today’s Orders</h2>
<div style={styles.ordersList}>
  {todayOrders.length === 0 && <p>No orders today.</p>}
  {todayOrders.map(order => (
    <div key={order._id} style={styles.orderCard}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span><strong>Table:</strong> {order.tableId}</span>
        <span><strong>Status:</strong> {order.status}</span>
        <span><strong>Items:</strong> {order.items.length}</span>
        <button
          style={styles.smallBtn}
          onClick={() => navigator.clipboard.writeText(order._id).then(() => Swal.fire("Copied", "Order ID copied.", "success"))}
        >
          Copy ID
        </button>
      </div>
      <table style={styles.itemsTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>Rs {item.price.toFixed(2)}</td>
              <td>Rs {item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))}
</div>

    </div>
  );
};

const styles = {
  container: { padding: 24 },
  title: { marginBottom: 20, fontSize: 28, fontWeight: 600 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  cardSmall: {
    background: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    textAlign: "center",
  },
  statBig: { fontSize: 32, margin: 8, fontWeight: 700 },
  ordersList: { marginTop: 16 },
  orderRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr auto",
    alignItems: "center",
    gap: 12,
    padding: 12,
    background: "#ffffff",
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  smallBtn: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  }, orderCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  itemsTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  itemsTable_th_td: {
    border: "1px solid #ddd",
    padding: 8,
    textAlign: "left",
  }
};

export default AdminDashboard;
