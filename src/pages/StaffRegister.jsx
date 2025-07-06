import React, { useState } from "react";
import api from "../api";

const StaffRegister = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const handleRegister = async () => {
    setError(null);
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password, role }, config);
      alert("User registered successfully");
      setName("");
      setEmail("");
      setPassword("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Register New Staff User</h3>
      {error && <p style={styles.error}>{error}</p>}

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
        autoComplete="name"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
        autoComplete="new-password"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={styles.select}
      >
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : {}),
        }}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "auto",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
    textAlign: "center",
  },
  error: {
    color: "#dc2626",
    marginBottom: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 10,
    border: "1.5px solid #d1d5db",
    marginBottom: 16,
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 10,
    border: "1.5px solid #d1d5db",
    marginBottom: 20,
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: 14,
    fontSize: 17,
    fontWeight: 700,
    color: "white",
    backgroundColor: "#10b981",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(16,185,129,0.6)",
    transition: "background-color 0.3s ease",
    userSelect: "none",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};

export default StaffRegister;
