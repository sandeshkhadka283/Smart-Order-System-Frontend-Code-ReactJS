import React from "react";

const MenuCategory = ({ category, items, expanded, toggleCategory, addToCart, pendingOrder }) => {
  return (
    <div style={{ marginBottom: 30, borderRadius: 16, border: "1.5px solid #d1d5db", backgroundColor: "#fafafa", overflow: "hidden" }}>
      <button
        onClick={() => toggleCategory(category)}
        style={{ width: "100%", padding: "16px 24px", display: "flex", alignItems: "center", cursor: "pointer", backgroundColor: "transparent", border: "none", fontSize: 22, fontWeight: "700", color: "#334155" }}
      >
        <span style={{ fontSize: 22, marginRight: 16 }}>{expanded ? "▾" : "▸"}</span>
        <span style={{ flexGrow: 1 }}>{category}</span>
        <span style={{ fontSize: 16, fontWeight: "600", color: "#64748b" }}>({items.length})</span>
      </button>
      {expanded && (
        <div style={{ backgroundColor: "#fff", borderTop: "1.5px solid #d1d5db", padding: "16px 24px" }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #e5e7eb", fontSize: 18 }}>
              <div>
                <div style={{ fontWeight: "600" }}>{item.name}</div>
                <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Rs {item.price}</div>
              </div>
              <button
                onClick={() => addToCart(item)}
                style={{ width: 38, height: 38, borderRadius: "50%", border: "none", backgroundColor: "#2563eb", color: "#fff", fontSize: 26, fontWeight: "700", cursor: "pointer" }}
                disabled={!!pendingOrder}
              >
                +
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuCategory;
