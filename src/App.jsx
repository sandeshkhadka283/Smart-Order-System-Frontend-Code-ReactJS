import React from "react";
import { Routes, Route } from "react-router-dom";
import TableOrder from "./pages/TableOrder";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <div style={styles.container}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <TableOrder />
            </>
          }
        />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={1500} />
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
  },
};

export default App;
