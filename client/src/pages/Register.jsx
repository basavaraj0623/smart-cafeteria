import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!formData.name || !formData.email || !formData.password) {
        setMessage("⚠️ Please fill all fields");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/otp/send-otp", {
        email: formData.email,
      });

      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP");
    }
  };

  const verifyOTPAndRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        email: formData.email,
        otp,
      });

      if (res.data.message === "OTP Verified") {
        await axios.post("http://localhost:5000/api/auth/register", formData);
        alert("✅ Registered successfully!");
        window.location.href = "/login";
      } else {
        setMessage("❌ OTP verification failed");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6d28d9] px-4">
      <div className="w-full max-w-md space-y-6 p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>
        <p className="text-sm text-center text-white/80">
          Register to access Smart Cafeteria
        </p>

        {step === 1 ? (
          <form onSubmit={sendOTP} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option className="text-black" value="user">User</option>
              <option className="text-black" value="admin">Admin</option>
            </select>

            <button
              type="submit"
              className="w-full py-2 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-700 hover:to-violet-700 transition duration-300"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTPAndRegister} className="space-y-4">
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
              Verify & Register
            </button>
          </form>
        )}

        {message && (
          <p className="text-sm text-center text-red-300 mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}
