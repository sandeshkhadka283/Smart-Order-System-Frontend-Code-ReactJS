import React from "react";

const Cart = ({ cart, addToCart, removeFromCart, totalPrice, handlePlaceOrder, pendingOrder, location }) => {
  return (
    <div style={{ backgroundColor: "#f8fafc", borderRadius: 18, padding: "20px 25px", marginTop: 40 }}>
      <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20, color: "#334155" }}>
        <i className="fas fa-shopping-cart" style={{ color: "#2563eb", fontSize: 24 }}></i> Your Order
      </h3>

      {Object.keys(cart).length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px" }}>
          <i className="fas fa-cart-plus" style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 15 }}></i>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#64748b", marginBottom: 5 }}>Your cart is empty</p>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Add items to place an order</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 44 }}>
            {Object.entries(cart).map(([name, { price, qty }]) => (
              <li key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: 14, backgroundColor: "#f0f4f8", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: "600", color: "#1e293b" }}>
                  <span>{name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => removeFromCart(name)} disabled={!!pendingOrder}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => addToCart({ name, price })} disabled={!!pendingOrder}>+</button>
                  </div>
                </div>
                <div style={{ fontWeight: "700", color: "#059669", minWidth: 90, textAlign: "right" }}>Rs {price * qty}</div>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "white", borderRadius: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 18, color: "#334155" }}>Total:</span>
            <span style={{ fontWeight: "700", fontSize: 24, color: "#111827" }}>Rs {totalPrice}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={Object.keys(cart).length === 0 || !location || !!pendingOrder}
            style={{ padding: "18px 0", fontWeight: "700", fontSize: 22, borderRadius: 20, border: "none", backgroundColor: "#059669", color: "white", cursor: "pointer" }}
          >
            <i className="fas fa-paper-plane"></i> Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
