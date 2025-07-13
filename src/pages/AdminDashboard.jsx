import React, { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTables: 0,
    totalUsers: 0,
    totalOrders: 0,
    byStatus: {},
    orders: [],
    users: [],
    tables: [],
  });
  const [newTableNumber, setNewTableNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats({
        totalTables: data.totalTables,
        totalUsers: data.totalUsers,
        totalOrders: data.totalOrders,
        byStatus: data.byStatus || {},
        orders: data.orders || [],
        users: data.users || [],
        tables: data.tables || [],
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch stats.", "error");
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTable = async () => {
    if (!newTableNumber || isNaN(newTableNumber) || Number(newTableNumber) <= 0) {
      Swal.fire("Invalid input", "Please enter a valid table number.", "warning");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/tables", { tableNumber: Number(newTableNumber) });
      if (data.success) {
        Swal.fire("Success", `Table ${newTableNumber} added!`, "success");
        setNewTableNumber("");
        fetchStats();
      } else {
        Swal.fire("Error", data.message || "Failed to add table.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add table. It might already exist.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#f97316"; // orange
    case "completed":
      return "#22c55e"; // green
    case "cancelled":
      return "#ef4444"; // red
    default:
      return "#64748b"; // gray
  }
};


  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Admin Dashboard</h1>

      {/* Add Table Section */}
      <div style={styles.addTableContainer}>
        <input
          type="number"
          placeholder="Enter Table Number"
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <button onClick={handleAddTable} style={styles.addBtn} disabled={loading}>
          {loading ? "Adding..." : "Add Table"}
        </button>
      </div>

      {/* Summary Stats */}
      {/* Summary Stats */}
<h2 style={styles.sectionTitle}>📈 Overview</h2>
<div style={styles.statsGrid}>
  <div style={{ ...styles.statCard, background: "#2563eb" }}>
    <h3 style={styles.statTitle}>Total Tables</h3>
    <p style={styles.statNumber}>{stats.totalTables}</p>
  </div>
  <div style={{ ...styles.statCard, background: "#059669" }}>
    <h3 style={styles.statTitle}>Total Users</h3>
    <p style={styles.statNumber}>{stats.totalUsers}</p>
  </div>
  <div style={{ ...styles.statCard, background: "#f59e0b" }}>
    <h3 style={styles.statTitle}>Total Orders</h3>
    <p style={styles.statNumber}>{stats.totalOrders}</p>
  </div>

  {Object.entries(stats.byStatus).map(([status, count]) => (
    <div key={status} style={{ ...styles.statCardSmall, background: "#f1f5f9" }}>
      <h4 style={{ ...styles.statStatusTitle, color: "#334155" }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </h4>
      <p style={{ fontSize: 22, fontWeight: 600, color: "#1e293b" }}>{count}</p>
    </div>
  ))}
</div>


      {/* Table List */}
      <h2 style={styles.sectionTitle}>🪑 Tables</h2>
<div style={styles.tableList}>
  {stats.tables.length === 0 ? (
    <p>No tables available.</p>
  ) : (
    stats.tables.map((table) => (
      <div key={table._id} style={styles.tableCard}>
        <div style={styles.tableInfo}>
          <h4 style={styles.tableNumber}>Table #{table.tableNumber}</h4>
          <span style={{ ...styles.statusBadge, ...styles[`status_${table.status}`] }}>
            {table.status}
          </span>
        </div>
        <p style={styles.tableMeta}>Created: {new Date(table.createdAt).toLocaleString()}</p>
      </div>
    ))
  )}
</div>

      {/* User List */}
     <h2 style={styles.sectionTitle}>👥 Users</h2>
<div style={styles.userList}>
  {stats.users.length === 0 ? (
    <p>No users available.</p>
  ) : (
    stats.users.map((user) => (
      <div key={user._id} style={styles.userCard}>
        <div style={styles.userHeader}>
          <h4 style={styles.userName}>{user.name || "Unnamed User"}</h4>
          <span style={styles.userRoleBadge}>{user.role || "customer"}</span>
        </div>
        <p style={styles.userEmail}>{user.email}</p>
        <p style={styles.userMeta}>
          Registered: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    ))
  )}
</div>

      {/* Order List */}
     <h2 style={styles.sectionTitle}>🧾 Orders</h2>
<div style={styles.ordersGrid}>
  {stats.orders.length === 0 ? (
    <p>No orders yet.</p>
  ) : (
    stats.orders.map((order) => (
      <div key={order._id} style={styles.orderCard}>
        <div style={styles.orderHeader}>
          <span style={styles.orderId}>#{order._id.slice(-6)}</span>
          <span style={{ ...styles.orderStatus, backgroundColor: getStatusColor(order.status) }}>
            {order.status}
          </span>
        </div>
        <div style={styles.orderMeta}>
          <p><strong>Table:</strong> {order.tableNumber || order.tableId}</p>
          <p><strong>Total Items:</strong> {order.items.length}</p>
        </div>
        <ul style={styles.orderItemList}>
          {order.items.map((item, idx) => (
            <li key={idx} style={styles.orderItem}>
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
              <span>Rs {item.price}</span>
            </li>
          ))}
        </ul>
      </div>
    ))
  )}
</div>

    </div>
  );
};

const styles = {
  container: {
    padding: 24,
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  title: {
    marginBottom: 20,
    fontSize: 36,
    fontWeight: 700,
    color: "#1e293b",
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: 40,
    fontSize: 26,
    color: "#0f172a",
    fontWeight: 600,
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: 6,
    marginBottom: 16,
  },

  tableList: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginBottom: 30,
},

tableCard: {
  backgroundColor: "#ffffff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  borderLeft: "5px solid #2563eb",
  transition: "all 0.2s ease-in-out",
},

tableInfo: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},

tableNumber: {
  fontSize: "18px",
  fontWeight: 600,
  color: "#1e293b",
},

tableMeta: {
  fontSize: "14px",
  color: "#64748b",
},

statusBadge: {
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "capitalize",
  color: "#fff",
},

status_available: {
  backgroundColor: "#22c55e", // green
},

status_occupied: {
  backgroundColor: "#ef4444", // red
},

status_reserved: {
  backgroundColor: "#facc15", // yellow
  color: "#1e293b",
},

  addTableContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 30,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: 16,
    borderRadius: 8,
    border: "1.5px solid #cbd5e1",
    outline: "none",
    backgroundColor: "#f8fafc",
  },
  addBtn: {
    padding: "11px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 16,
    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.4)",
    transition: "all 0.3s ease",
  },
  
  statsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginBottom: 40,
},

statCard: {
  color: "#fff",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.3s ease",
},

statTitle: {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 10,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#f8fafc",
},

statNumber: {
  fontSize: 36,
  fontWeight: 700,
  lineHeight: 1,
},

statCardSmall: {
  background: "#f3f4f6",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  textAlign: "center",
  transition: "all 0.2s ease",
},

statStatusTitle: {
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 6,
  textTransform: "capitalize",
},

  
 

  userList: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginBottom: 30,
},

userCard: {
  backgroundColor: "#ffffff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease-in-out",
},

userHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},

userName: {
  fontSize: "18px",
  fontWeight: 600,
  color: "#1e293b",
  margin: 0,
},

userRoleBadge: {
  padding: "4px 10px",
  borderRadius: "16px",
  fontSize: "13px",
  fontWeight: 600,
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  textTransform: "capitalize",
},

userEmail: {
  fontSize: "14px",
  color: "#334155",
  marginBottom: 6,
},

userMeta: {
  fontSize: "12px",
  color: "#64748b",
},

  
  ordersGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 30,
},

orderCard: {
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  transition: "all 0.2s ease",
},

orderHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
},

orderId: {
  fontWeight: 600,
  fontSize: 16,
  color: "#1e293b",
},

orderStatus: {
  padding: "4px 10px",
  borderRadius: 12,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  textTransform: "capitalize",
},

orderMeta: {
  fontSize: 14,
  color: "#475569",
  marginBottom: 10,
  display: "flex",
  flexDirection: "column",
  gap: 4,
},

orderItemList: {
  listStyle: "none",
  padding: 0,
  marginTop: 8,
},

orderItem: {
  background: "#f9fafb",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "8px 12px",
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14,
  color: "#334155",
  marginBottom: 6,
},

};


export default AdminDashboard;
