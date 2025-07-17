// Paste this entire file to replace your existing AdminDashboard.jsx
// ✅ Safe for direct use

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  Utensils,
  Moon,
  Sun,
  Edit2,
  Save,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [profilePic, setProfilePic] = useState("");
  const [previewPic, setPreviewPic] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [cafeteria, setCafeteria] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/login");
    else {
      fetchAdminProfile();
      fetchCafeteriaInfo();
    }
  }, [navigate]);

  useEffect(() => {
    if (cafeteria) {
      fetchOrderData();
    } else {
      setOrderCount(0);
      setChartData([]);
    }
  }, [cafeteria]);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { name, avatar } = res.data.user;
      setAdminName(name);
      setEditName(name);
      setProfilePic(avatar || "");
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchOrderData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orders = res.data || [];
      setOrderCount(orders.length);

      const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grouped = {};

      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const day = dayMap[date.getDay()];
        if (!grouped[day]) grouped[day] = { day, orders: 0, revenue: 0 };
        grouped[day].orders += 1;
        grouped[day].revenue += order.total || 0;
      });

      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const formatted = weekDays.map((d) => grouped[d] || { day: d, orders: 0, revenue: 0 });
      setChartData(formatted);
    } catch (err) {
      if (err.response?.data?.error === "Cafeteria not found") {
        console.warn("No cafeteria found for this admin.");
      } else {
        console.error("Failed to fetch orders", err);
      }
    }
  };

  const fetchCafeteriaInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/my-cafeteria", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCafeteria(res.data.cafeteria || null);
    } catch (err) {
      setCafeteria(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (editName.trim() !== adminName.trim()) formData.append("name", editName.trim());
      if (avatarFile) formData.append("avatar", avatarFile);
      if (formData.entries().next().done) {
        setIsEditing(false);
        setPreviewPic("");
        setAvatarFile(null);
        return;
      }
      const res = await axios.put(
        "http://localhost:5000/api/admin/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data.user) {
        const { name, avatar } = res.data.user;
        setAdminName(name);
        setProfilePic(avatar);
        setPreviewPic("");
        setIsEditing(false);
        setAvatarFile(null);
      }
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const imageURL = URL.createObjectURL(file);
      setPreviewPic(imageURL);
    }
  };

  const avatarToShow =
    previewPic ||
    (profilePic?.startsWith("/uploads")
      ? `http://localhost:5000${profilePic}`
      : profilePic) ||
    "https://i.pravatar.cc/100?u=admin";

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#eef3ff] via-[#e3ebff] to-[#dce5ff] dark:from-zinc-900 dark:via-zinc-800 dark:to-black transition-colors duration-500">
      <aside className="w-64 p-6 bg-white/60 dark:bg-gray-900 backdrop-blur-md shadow-xl border-r border-white/30 dark:border-zinc-800">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden shadow-lg mb-2 cursor-pointer">
            <img
              src={avatarToShow}
              alt="Admin Avatar"
              className="w-full h-full object-cover"
              onClick={() => !isEditing && setIsEditing(true)}
              title={isEditing ? "Upload avatar" : "Click to edit profile"}
            />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
            )}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit Avatar"
                className="absolute bottom-1 right-1 bg-indigo-600 text-white rounded-full p-1 shadow-md hover:bg-indigo-700 transition"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1 justify-center">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-center text-sm rounded px-2 py-1 bg-white dark:bg-zinc-800 border dark:border-zinc-600 text-gray-800 dark:text-white"
              />
              <button onClick={handleProfileUpdate}>
                <Save size={16} className="text-green-600 hover:text-green-700" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(adminName);
                  setPreviewPic("");
                  setAvatarFile(null);
                }}
                className="text-red-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <h2 className="font-semibold text-indigo-600 dark:text-indigo-300">{adminName}</h2>
              <button onClick={() => setIsEditing(true)}>
                <Edit2 size={14} className="text-gray-500 hover:text-indigo-500" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">SmartCafeteria Admin</p>
        </div>

        <nav className="space-y-3">
          <SidebarButton icon={<Utensils size={20} />} label="Manage Cafeteria" onClick={() => navigate("/cafeteria")} />
          <SidebarButton icon={<LayoutGrid size={20} />} label="Menu Builder" onClick={() => navigate("/menu")} />
          {cafeteria && (
            <SidebarButton
              icon={
                <div className="relative">
                  <Package size={20} />
                  {orderCount > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {orderCount}
                    </motion.span>
                  )}
                </div>
              }
              label="Live Orders"
              onClick={() => navigate("/orders")}
            />
          )}
        </nav>

        <div className="mt-10 space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 text-gray-600 dark:text-white hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            Toggle Theme
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md font-medium">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Welcome back, Admin 👋</h1>

        {cafeteria?.name ? (
          <div className="mb-8 p-4 shadow-md rounded-lg border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800 flex items-center gap-4 max-w-md">
            <img
              src={
                cafeteria.logo?.startsWith("/uploads")
                  ? `http://localhost:5000${cafeteria.logo}`
                  : cafeteria.logo
              }
              alt="Cafeteria Logo"
              className="w-12 h-12 object-cover rounded-md border"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{cafeteria.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{cafeteria.openHours}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
            You haven't registered a cafeteria yet. Please go to "Manage Cafeteria" to set one up.
          </p>
        )}

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <DashboardCard icon={<Utensils size={36} className="text-indigo-600 dark:text-indigo-300" />} label="Manage Cafeteria" onClick={() => navigate("/cafeteria")} bg="from-indigo-100/20 dark:from-indigo-900/10" />
          <DashboardCard icon={<LayoutGrid size={36} className="text-yellow-600 dark:text-yellow-400" />} label="Menu Builder" onClick={() => navigate("/menu")} bg="from-yellow-100/20 dark:from-yellow-900/10" />
          <DashboardCard icon={<Package size={36} className="text-green-600 dark:text-green-400" />} label="Live Orders" count={orderCount} onClick={() => navigate("/orders")} bg="from-green-100/20 dark:from-green-900/10" />
        </motion.div>

        {cafeteria && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/70 dark:bg-zinc-900 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Weekly Orders</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/70 dark:bg-zinc-900 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Weekly Revenue</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#34d399" barSize={40} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-gray-700 dark:text-white hover:text-indigo-600 font-medium px-3 py-2 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
    >
      {icon}
      {label}
    </button>
  );
}

function DashboardCard({ icon, label, count, onClick, bg }) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl rounded-2xl p-6 text-center transition-transform hover:scale-105 overflow-hidden"
    >
      <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${bg} to-transparent group-hover:blur-md transition-all duration-300`} />
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{label}</h3>
      {count !== undefined && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Total: <span className="font-bold animate-pulse text-indigo-600 dark:text-indigo-300">{count}</span>
        </p>
      )}
    </div>
  );
}
