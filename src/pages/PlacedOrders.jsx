import React from "react";

const PlacedOrders = ({ placedOrders, cancelOrder, getStatusBadge }) => (
  <div style={{ marginTop: 50 }}>
    <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, color: "#334155", display: "flex", alignItems: "center", gap: 12 }}>
      <i className="fas fa-receipt" style={{ color: "#2563eb", fontSize: 24 }}></i> Order History
    </h3>

    {placedOrders.length === 0 ? (
      <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "#f8fafc", borderRadius: 18 }}>
        <i className="fas fa-inbox" style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 15 }}></i>
        <p style={{ fontSize: 18, fontWeight: 500, color: "#64748b" }}>No orders placed yet</p>
      </div>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {placedOrders.map((order, idx) => (
          <div key={idx} style={{ backgroundColor: "#f0fdf4", borderRadius: 18, overflow: "hidden", boxShadow: "0 6px 15px rgba(0,0,0,0.05)", border: "1px solid #bbf7d0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#dcfce7", borderBottom: "1px solid #bbf7d0" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#166534" }}>Table {order.tableId}</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#166534" }}>Rs {order.total}</div>
            </div>

            <div style={{ padding: "10px 20px" }}>
              <div style={{ padding: "6px 12px", borderRadius: "999px", fontSize: 14, fontWeight: 600, backgroundColor: getStatusBadge(order.status).bg, color: getStatusBadge(order.status).color, display: "inline-block", marginBottom: 10 }}>
                {getStatusBadge(order.status).label}
              </div>

              <ul style={{ listStyle: "none", padding: 0 }}>
                {order.items.map((item, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #bbf7d0" }}>
                    <span>{item.name}</span>
                    <div style={{ display: "flex", gap: 15 }}>
                      <span style={{ color: "#64748b" }}>×{item.quantity}</span>
                      <span style={{ fontWeight: 500, color: "#059669" }}>Rs {item.subtotal}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div style={{ padding: "15px 0 0 0", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => cancelOrder(idx)} style={{ padding: "8px 20px", backgroundColor: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PlacedOrders;
