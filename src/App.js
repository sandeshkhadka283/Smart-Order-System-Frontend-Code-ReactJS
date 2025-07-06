import React, { useState, useEffect } from "react";
import TableOrder from "./pages/TableOrder";
import StaffDashboard from "./pages/StaffDashboard";

function App() {
  const [isStaff, setIsStaff] = useState(false);
  const [tableId, setTableId] = useState("12");

  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsStaff(role === "staff" || role === "admin");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsStaff(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => setIsStaff(false)}
            disabled={!isStaff}
            style={{
              ...styles.toggleButton,
              ...( !isStaff ? styles.activeButton : {}),
            }}
          >
            Table Order View
          </button>
          <button
            onClick={() => setIsStaff(true)}
            disabled={isStaff}
            style={{
              ...styles.toggleButton,
              ...( isStaff ? styles.activeButton : {}),
              marginLeft: 12,
            }}
          >
            Staff Dashboard
          </button>
        </div>

        {localStorage.getItem("token") && (
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        )}
      </header>

      <main style={styles.main}>
        {isStaff ? <StaffDashboard /> : <TableOrder tableId={tableId} />}
      </main>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 960,
    margin: "40px auto",
    padding: "0 20px 40px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#fefefe",
    borderRadius: 14,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    flexGrow: 1,
  },
  toggleButton: {
    flex: "1 1 auto",
    minWidth: 140,
    padding: "12px 24px",
    border: "2px solid #3b82f6",
    borderRadius: 12,
    backgroundColor: "transparent",
    color: "#3b82f6",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.3s ease",
    userSelect: "none",
  },
  activeButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    boxShadow: "0 4px 12px rgba(59,130,246,0.5)",
  },
  logoutButton: {
    marginLeft: "auto",
    padding: "12px 28px",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(239,68,68,0.6)",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  main: {
    flexGrow: 1,
  },
};

export default App;
