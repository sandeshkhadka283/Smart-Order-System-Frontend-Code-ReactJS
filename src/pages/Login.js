import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token);
      onLogin(); // callback to refresh auth state
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Staff Login</h2>
      {error && <p style={styles.error}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        autoComplete="username"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
        autoComplete="current-password"
      />

      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        style={{
          ...styles.button,
          ...(loading || !email || !password ? styles.buttonDisabled : {}),
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 360,
    margin: "auto",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 14,
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
    color: "#111827",
    textAlign: "center",
  },
  error: {
    color: "#dc2626",
    marginBottom: 16,
    fontWeight: 600,
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
  button: {
    width: "100%",
    padding: 14,
    fontSize: 17,
    fontWeight: 700,
    color: "white",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.6)",
    transition: "background-color 0.3s ease",
    userSelect: "none",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};

export default Login;
