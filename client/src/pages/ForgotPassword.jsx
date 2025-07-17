import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/otp/send-otp", { email });
      setStep(2);
      setMessage("📩 OTP sent to email.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Error sending OTP");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/otp/verify-otp", { email, otp });
      setStep(3);
      setMessage("✅ OTP verified. Set your new password.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { email, newPassword });
      setMessage("✅ Password reset successfully");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6d28d9] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>
        <p className="text-center text-sm text-white/80">Get back access to your account</p>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-300"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition duration-300"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:from-purple-600 hover:to-pink-700 transition duration-300"
            >
              Reset Password
            </button>
          </form>
        )}

        {message && <p className="text-center text-sm text-red-300">{message}</p>}
      </div>
    </div>
  );
}
