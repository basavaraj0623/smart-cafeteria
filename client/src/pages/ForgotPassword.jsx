import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "https://smart-cafeteria-1.onrender.com/api/auth/reset-password",
        { email, newPassword }
      );

      setMessage("✅ Password reset successfully");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6d28d9] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/20 text-white"
            required
          />

          <button className="w-full py-2 bg-purple-600 text-white rounded">
            Reset Password
          </button>
        </form>

        {message && <p className="text-center text-red-300">{message}</p>}
      </div>
    </div>
  );
}