import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TableOrder from "../pages/TableOrder";
import StaffDashboard from "../pages/StaffDashboard";
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Customer Table */}
      <Route path="/" element={<TableOrder />} />

      {/* Staff Dashboard */}
      <Route
        path="/staff"
        element={role === "staff" || role === "admin" ? <StaffDashboard /> : <Navigate to="/" />}
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
      />

      {/* 404 Fallback */}
      <Route path="*" element={<h2 style={{ padding: 40 }}>404 - Page not found</h2>} />
    </Routes>
  );
};

export default AppRoutes;
