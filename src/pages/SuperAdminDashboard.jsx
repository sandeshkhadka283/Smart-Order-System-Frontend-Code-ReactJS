import React, { useEffect, useState } from "react";
import api from "../api"; // Axios instance
import toast, { Toaster } from "react-hot-toast";

// ========================
// SuperAdmin Login
// ========================
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/superadmin/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
      toast.success("Login successful");
    } catch (err) {
      setError("Login failed. Check credentials.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">SuperAdmin Login</h2>
        {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className={`w-full py-3 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

// ========================
// Main SuperAdmin Dashboard
// ========================
const SuperAdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [businessForm, setBusinessForm] = useState({ name: "", ownerEmail: "", dbName: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // ========================
  // Fetch Businesses
  // ========================
  const fetchBusinesses = async () => {
    try {
      const res = await api.get("/superadmin/businesses", config);
      setBusinesses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch businesses");
    }
  };

  // ========================
  // Fetch Users
  // ========================
  const fetchUsers = async () => {
    try {
      const res = await api.get("/superadmin/users", config);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchBusinesses();
      fetchUsers();
    }
  }, [isLoggedIn]);

  // ========================
  // Business Handlers
  // ========================
  const handleBusinessChange = (e) => setBusinessForm({ ...businessForm, [e.target.name]: e.target.value });

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBusiness) {
        await api.put(`/superadmin/businesses/${editingBusiness}`, businessForm, config);
        toast.success("Business updated successfully!");
      } else {
        await api.post("/superadmin/businesses", businessForm, config);
        toast.success("Business created successfully!");
      }
      setBusinessForm({ name: "", ownerEmail: "", dbName: "" });
      setEditingBusiness(null);
      fetchBusinesses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save business");
    }
  };

  const handleBusinessEdit = (biz) => {
    setEditingBusiness(biz.businessId);
    setBusinessForm({ name: biz.name, ownerEmail: biz.ownerEmail, dbName: biz.dbName });
  };

  const handleBusinessDelete = async (id) => {
    try {
      await api.delete(`/superadmin/businesses/${id}`, config);
      toast.success("Business deleted successfully!");
      fetchBusinesses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete business");
    }
  };

  const toggleBusinessStatus = async (biz) => {
    try {
      const action = biz.status === "active" ? "suspend" : "resume";
      await api.put(`/superadmin/businesses/${biz.businessId}/${action}`, {}, config);
      toast.success(`Business ${action} successfully`);
      fetchBusinesses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // ========================
  // User Handlers
  // ========================
  const handleUserChange = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const handleUserSubmit = async () => {
    try {
      if (!userForm.name || !userForm.email || (!editingUser && !userForm.password)) {
        return toast.error("Fill all fields");
      }

      if (editingUser) {
        await api.put(`/superadmin/users/${editingUser}`, userForm, config);
        toast.success("User updated successfully!");
      } else {
        await api.post("/superadmin/users", userForm, config);
        toast.success("User created successfully!");
      }

      setUserForm({ name: "", email: "", password: "", role: "staff" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save user");
    }
  };

  const handleUserEdit = (user) => {
    setEditingUser(user._id);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: "" });
  };

  const handleUserDelete = async (userId) => {
    try {
      await api.delete(`/superadmin/users/${userId}`, config);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">SuperAdmin Dashboard</h1>

      {/* ======================== */}
      {/* Business Form */}
      {/* ======================== */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{editingBusiness ? "Edit Business" : "Add Business"}</h2>
        <form onSubmit={handleBusinessSubmit} className="grid gap-4 md:grid-cols-3">
          <input type="text" name="name" placeholder="Business Name" value={businessForm.name} onChange={handleBusinessChange} required className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          <input type="email" name="ownerEmail" placeholder="Owner Email" value={businessForm.ownerEmail} onChange={handleBusinessChange} required className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          <input type="text" name="dbName" placeholder="Database Name" value={businessForm.dbName} onChange={handleBusinessChange} required className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          <div className="md:col-span-3 flex space-x-2 mt-2">
            <button type="submit" className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded shadow">{editingBusiness ? "Update" : "Create"}</button>
            {editingBusiness && <button type="button" onClick={() => { setEditingBusiness(null); setBusinessForm({ name: "", ownerEmail: "", dbName: "" }); }} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded shadow">Cancel</button>}
          </div>
        </form>
      </div>

      {/* ======================== */}
      {/* Businesses Table */}
      {/* ======================== */}
      <div className="overflow-x-auto mb-8">
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
            {businesses.length === 0 ? (
              <tr><td colSpan="5" className="p-3 text-center text-gray-500">No businesses found.</td></tr>
            ) : businesses.map((biz) => (
              <tr key={biz.businessId} className="hover:bg-gray-100">
                <td className="p-3">{biz.name}</td>
                <td className="p-3">{biz.ownerEmail}</td>
                <td className="p-3">{biz.dbName}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${biz.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{biz.status}</span>
                </td>
                <td className="p-3 flex space-x-2">
                  <button onClick={() => handleBusinessEdit(biz)} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded">Edit</button>
                  <button onClick={() => handleBusinessDelete(biz.businessId)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                  <button onClick={() => toggleBusinessStatus(biz)} className={`px-3 py-1 rounded text-white ${biz.status === "active" ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-700 hover:bg-blue-800"}`}>{biz.status === "active" ? "Suspend" : "Resume"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================== */}
      {/* User Form */}
      {/* ======================== */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{editingUser ? "Edit User" : "Register New User"}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <input type="text" name="name" placeholder="Full Name" value={userForm.name} onChange={handleUserChange} className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          <input type="email" name="email" placeholder="Email" value={userForm.email} onChange={handleUserChange} className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"/>
          {!editingUser && <input type="password" name="password" placeholder="Password" value={userForm.password} onChange={handleUserChange} className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500"/>}
          <select name="role" value={userForm.role} onChange={handleUserChange} className="p-3 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="superadmin">SuperAdmin</option>
          </select>
        </div>
        <button onClick={handleUserSubmit} className={`mt-4 px-6 py-2 rounded text-white ${editingUser ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}`}>
          {editingUser ? "Update User" : "Register User"}
        </button>
      </div>

      {/* ======================== */}
      {/* Users Table */}
      {/* ======================== */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Users</h2>
        <table className="w-full bg-white shadow rounded border border-gray-200">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="4" className="p-3 text-center text-gray-500">No users found.</td></tr>
            ) : users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-100">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3 flex space-x-2">
                  <button onClick={() => handleUserEdit(user)} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded">Edit</button>
                  <button onClick={() => handleUserDelete(user._id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
