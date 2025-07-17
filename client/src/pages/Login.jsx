import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, User } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, role: serverRole, user } = res.data;

      if (serverRole !== role) {
        return setErrorMsg(`❌ Role mismatch! You tried logging in as "${role}"`);
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", serverRole);
      localStorage.setItem("name", user.name);

      navigate(serverRole === "admin" ? "/admin" : "/user");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6d28d9] bg-[length:300%_300%] animate-gradient">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>
        <p className="text-center text-sm text-white/80">
          Sign in to your Smart Cafeteria account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option className="text-black" value="user">User</option>
              <option className="text-black" value="admin">Admin</option>
            </select>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-300 text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-700 hover:to-violet-700 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="text-center text-sm text-white mt-4 space-y-1">
          <p>
            <Link to="/forgot-password" className="hover:underline text-blue-200">
              Forgot password?
            </Link>
          </p>
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="hover:underline text-blue-200">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
