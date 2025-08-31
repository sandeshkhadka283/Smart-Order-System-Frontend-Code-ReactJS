import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const res = await axios.get("http://localhost:5000/api/superadmin/businesses");
    setBusinesses(res.data);
  };

  const fetchOrders = async (businessId) => {
    const res = await axios.get(`/api/superadmin/businesses/${businessId}/orders`);
    setOrders(res.data);
    setSelectedBusiness(businessId);
  };

  const toggleStatus = async (businessId, action) => {
    await axios.put(`/api/superadmin/businesses/${businessId}/${action}`);
    fetchBusinesses();
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
                Table {order.table} - {order.status} - Items: {order.items.map(i => i.name).join(", ")}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
