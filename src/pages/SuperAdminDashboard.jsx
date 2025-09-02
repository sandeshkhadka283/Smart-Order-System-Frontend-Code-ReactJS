import React, { useEffect, useState } from "react";
import api from "../api"; // axios instance
import toast, { Toaster } from "react-hot-toast";

const SuperAdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState({ name: "", ownerEmail: "", dbName: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await api.get("/superadmin/businesses");
      setBusinesses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch businesses");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/superadmin/businesses/${editing}`, form);
        toast.success("Business updated successfully!");
      } else {
        await api.post("/superadmin/businesses", form);
        toast.success("Business created successfully!");
      }
      setForm({ name: "", ownerEmail: "", dbName: "" });
      setEditing(null);
      fetchBusinesses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save business");
    }
  };

  const handleEdit = (biz) => {
    setForm({ name: biz.name, ownerEmail: biz.ownerEmail, dbName: biz.dbName });
    setEditing(biz.businessId);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/superadmin/businesses/${id}`);
      fetchBusinesses();
      toast.success("Business deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete business");
    }
  };

  const toggleStatus = async (biz) => {
    try {
      const action = biz.status === "active" ? "suspend" : "resume";
      await api.put(`/superadmin/businesses/${biz.businessId}/${action}`);
      fetchBusinesses();
      toast.success(
        `Business ${action === "suspend" ? "suspended" : "resumed"} successfully!`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Super Admin Dashboard</h1>

      {/* Business Form */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editing ? "Edit Business" : "Add Business"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            name="name"
            placeholder="Business Name"
            value={form.name}
            onChange={handleChange}
            className="p-3 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="ownerEmail"
            placeholder="Owner Email"
            value={form.ownerEmail}
            onChange={handleChange}
            className="p-3 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="dbName"
            placeholder="Database Name"
            value={form.dbName}
            onChange={handleChange}
            className="p-3 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="md:col-span-3 flex space-x-2 mt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded shadow"
            >
              {editing ? "Update" : "Create"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "", ownerEmail: "", dbName: "" });
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded shadow"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Businesses Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded border border-gray-200">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Database</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz) => (
              <tr key={biz.businessId} className="hover:bg-gray-100">
                <td className="p-3">{biz.name}</td>
                <td className="p-3">{biz.ownerEmail}</td>
                <td className="p-3">{biz.dbName}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      biz.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {biz.status}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  <button
                    onClick={() => handleEdit(biz)}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(biz.businessId)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleStatus(biz)}
                    className={`px-3 py-1 rounded text-white ${
                      biz.status === "active"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    {biz.status === "active" ? "Suspend" : "Resume"}
                  </button>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-500">
                  No businesses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
