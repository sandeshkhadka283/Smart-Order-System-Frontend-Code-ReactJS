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
  const [menuItems, setMenuItems] = useState([]);
const [editItem, setEditItem] = useState(null);
const [editModalOpen, setEditModalOpen] = useState(false);



  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
          const menuRes = await api.get("/menu-items"); // ✅ Fetch menu items too
          

      setStats({
        totalTables: data.totalTables,
        totalUsers: data.totalUsers,
        totalOrders: data.totalOrders,
        byStatus: data.byStatus || {},
        orders: data.orders || [],
        users: data.users || [],
        tables: data.tables || [],
              menuItems: menuRes.data || [], // ✅ Include menu items here

      });

          setMenuItems(menuRes.data); // ✅ Store menu items in state

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
 
const handleEditClick = (item) => {
  setEditItem({ ...item });
  setEditModalOpen(true);
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


const handleDeleteItem = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the menu item.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (confirm.isConfirmed) {
    try {
      await api.delete(`/menu-items/${id}`);
      Swal.fire("Deleted!", "Menu item has been deleted.", "success");
      fetchStats(); // refresh the menu list
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete item.", "error");
    }
  }
};
const handleEditSave = async () => {
  try {
    await api.put(`/menu-items/${editItem._id}`, editItem);
    Swal.fire("Updated!", "Menu item updated successfully.", "success");
    setEditModalOpen(false);
    fetchStats();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to update item.", "error");
  }
};


const [menuItem, setMenuItem] = useState({
  name: "",
  price: "",
  category: "",
});
const [addingItem, setAddingItem] = useState(false);
const handleMenuChange = (e) => {
  const { name, value } = e.target;
  setMenuItem((prev) => ({ ...prev, [name]: value }));
};
const handleAddMenuItem = async () => {
  if (!menuItem.name || !menuItem.price || !menuItem.category) {
    return Swal.fire("All fields required", "", "warning");
  }
  setAddingItem(true);
  try {
    await api.post("/menu-items", {
      name: menuItem.name,
      price: Number(menuItem.price),
      category: menuItem.category,
    });
    Swal.fire("Success", "Menu item added!", "success");
    setMenuItem({ name: "", price: "", category: "" });
    fetchStats(); // optional: re-fetch stats or update menu UI
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to add item", "error");
  } finally {
    setAddingItem(false);
  }
};



  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Admin Dashboard</h1>

    

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


{/* 🍽️ Menu Items */}
<h2 style={styles.sectionTitle}>🍽️ Menu Items</h2>
<div style={styles.menuList}>
  {stats.menuItems && stats.menuItems.length > 0 ? (
    stats.menuItems.map((item) => (
      <div key={item._id} style={styles.menuCard}>
        <h4 style={styles.menuTitle}>{item.name}</h4>
        <p style={styles.menuCategory}>Category: {item.category}</p>
        <p style={styles.menuPrice}>Rs {item.price}</p>
        <p style={styles.menuDesc}>{item.description}</p>
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: "100%", maxWidth: 150, borderRadius: 8, marginTop: 10 }}
          />
        )}
        <div style={{ marginTop: 10 }}>
          <button
            style={{ ...styles.editBtn, marginRight: 10 }}
            onClick={() => handleEditClick(item)}
          >
            Edit
          </button>
          <button
            style={styles.deleteBtn}
            onClick={() => handleDeleteItem(item._id)}
          >
            Delete
          </button>
        </div>
      </div>
    ))
  ) : (
    <p>No menu items available.</p>
  )}
</div>




{/* 🍽️ Add Menu Item Section */}
<h2 style={styles.sectionTitle}>🍽️ Add Menu Item</h2>
<div style={styles.addTableContainer}>
  <input
    name="name"
    placeholder="Item Name"
    value={menuItem.name}
    onChange={handleMenuChange}
    style={styles.input}
  />
  <input
    type="number"
    name="price"
    placeholder="Price"
    value={menuItem.price}
    onChange={handleMenuChange}
    style={styles.input}
  />
  <input
    name="category"
    placeholder="Category (e.g., Drinks)"
    value={menuItem.category}
    onChange={handleMenuChange}
    style={styles.input}
  />
  <button onClick={handleAddMenuItem} disabled={addingItem} style={styles.addBtn}>
    {addingItem ? "Adding..." : "Add Item"}
  </button>
</div>


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

{editModalOpen && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalBox}>
      <h3>Edit Menu Item</h3>
      <input
        style={styles.input}
        value={editItem.name}
        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
        placeholder="Item Name"
      />
      <input
        style={styles.input}
        type="number"
        value={editItem.price}
        onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })}
        placeholder="Price"
      />
      <input
        style={styles.input}
        value={editItem.category}
        onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
        placeholder="Category"
      />
      <textarea
        style={{ ...styles.input, height: 60 }}
        value={editItem.description}
        onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
        placeholder="Description"
      />
      <div style={{ marginTop: 10 }}>
        <button style={styles.addBtn} onClick={handleEditSave}>Save</button>
        <button style={styles.deleteBtn} onClick={() => setEditModalOpen(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}


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
menuList: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px",
},

menuCard: {
  background: "#f9fafb",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
},

menuTitle: {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1f2937",
},

menuCategory: {
  fontSize: "14px",
  color: "#6b7280",
},

menuPrice: {
  fontSize: "16px",
  fontWeight: "500",
  color: "#10b981",
},

menuDesc: {
  fontSize: "13px",
  color: "#4b5563",
},
menuList: {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
},

menuCard: {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
  width: "250px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
},

editBtn: {
  padding: "5px 10px",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
},

deleteBtn: {
  padding: "5px 10px",
  backgroundColor: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
},

modalOverlay: {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
},

modalBox: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 8,
  width: "300px",
  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
},



};


export default AdminDashboard;
