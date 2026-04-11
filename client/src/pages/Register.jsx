import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "https://smart-cafeteria-1.onrender.com/api/auth/register",
        formData
      );

      setMessage(res.data.message || "✅ Registered successfully");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6d28d9] px-4">
      <div className="w-full max-w-md space-y-6 p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 text-white rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 text-white rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 text-white rounded"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 text-white rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button className="w-full py-2 bg-blue-600 text-white rounded">
            Register
          </button>
        </form>

        {message && <p className="text-center text-red-300">{message}</p>}
      </div>
    </div>
  );
}