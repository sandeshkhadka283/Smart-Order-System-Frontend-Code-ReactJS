import React from "react";

const PendingOrderTimer = ({ pendingOrder, timerCount, confirmPendingOrder, confirming }) => {
  if (!pendingOrder) return null;

  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ backgroundColor: "#fff7ed", borderRadius: 20, padding: 25, textAlign: "center", border: "2px dashed #f97316" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <i className="fas fa-clock" style={{ fontSize: 28, color: "#f97316" }}></i>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: "#ea580c", margin: 0 }}>Confirming Order</h3>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: "#ffedd5", border: "5px solid #fdba74", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#ea580c" }}>{timerCount}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#ea580c" }}>seconds</div>
          </div>
        </div>

        <p style={{ fontSize: 16, color: "#ea580c", marginBottom: 20 }}>
          Your order will be automatically confirmed in {timerCount} seconds
        </p>

        <button onClick={confirmPendingOrder} disabled={confirming} style={{ padding: "12px 30px", backgroundColor: "#ea580c", color: "white", border: "none", borderRadius: 12, fontWeight: 600, fontSize: 16 }}>
          {confirming ? 'Confirming...' : 'Confirm Now'}
        </button>
      </div>
    </div>
  );
};

export default PendingOrderTimer;
