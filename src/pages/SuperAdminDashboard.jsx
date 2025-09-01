import React, { useEffect, useState } from "react";
import api from "../api"; // ✅ use your axios instance

const SuperAdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await api.get("/superadmin/businesses"); // ✅ no hardcoded localhost
      setBusinesses(res.data);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    }
  };

  const fetchOrders = async (businessId) => {
    try {
      const res = await api.get(`/superadmin/businesses/${businessId}/orders`);
      setOrders(res.data);
      setSelectedBusiness(businessId);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const toggleStatus = async (businessId, action) => {
    try {
      await api.put(`/superadmin/businesses/${businessId}/${action}`);
      fetchBusinesses();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((biz) => (
            <tr key={biz.businessId}>
              <td>{biz.name}</td>
              <td>{biz.ownerEmail}</td>
              <td>{biz.status}</td>
              <td>
                <button onClick={() => fetchOrders(biz.businessId)}>View Orders</button>
                {biz.status === "active" ? (
                  <button onClick={() => toggleStatus(biz.businessId, "suspend")}>Suspend</button>
                ) : (
                  <button onClick={() => toggleStatus(biz.businessId, "resume")}>Resume</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBusiness && (
        <>
          <h2>Orders for {selectedBusiness}</h2>
          <ul>
            {orders.map((order) => (
              <li key={order._id}>
                Table {order.table} - {order.status} - Items:{" "}
                {order.items.map((i) => i.name).join(", ")}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
