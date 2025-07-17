import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Pencil } from "lucide-react";

export default function CafeteriaForm() {
  const [form, setForm] = useState({
    name: "",
    openHours: "",
    logoUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [cafeteria, setCafeteria] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCafeteria();
  }, []);

  const fetchCafeteria = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/my-cafeteria", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.cafeteria) setCafeteria(res.data.cafeteria);
    } catch (err) {
      console.error("❌ Error fetching cafeteria:", err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.openHours.trim()) newErrors.openHours = "Open hours are required";
    if (!form.logoUrl.trim()) newErrors.logoUrl = "Logo URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isEditing && cafeteria) {
      setMessage("⚠️ You already have a cafeteria. Edit or delete it.");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const url = isEditing
        ? `http://localhost:5000/api/admin/cafeteria/${cafeteria._id}`
        : "http://localhost:5000/api/admin/cafeteria";
      const method = isEditing ? "put" : "post";

      const body = {
        name: form.name,
        openHours: form.openHours,
        logoUrl: form.logoUrl,
      };

      const res = await axios[method](url, body, config);

      setMessage(res.data.message);
      setForm({ name: "", openHours: "", logoUrl: "" });
      setIsEditing(false);
      fetchCafeteria();
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this cafeteria?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/cafeteria/${cafeteria._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Cafeteria deleted successfully");
      setCafeteria(null);
      setForm({ name: "", openHours: "", logoUrl: "" });
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Delete Error:", err);
      setMessage("Failed to delete cafeteria");
    }
  };

  const handleEdit = () => {
    if (cafeteria) {
      setForm({
        name: cafeteria.name || "",
        openHours: cafeteria.openHours || "",
        logoUrl: cafeteria.logo || "",
      });
      setIsEditing(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#edf2fb] via-[#e2eafc] to-[#d7e3fc] dark:from-zinc-800 dark:via-zinc-900 dark:to-black transition-colors duration-500 p-6">
      <div className="w-full max-w-3xl p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/30 dark:border-gray-800">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-indigo-600 dark:text-indigo-400">
          🏪 {isEditing ? "Edit Cafeteria" : "Your Cafeteria"}
        </h2>

        {!cafeteria || isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Cafeteria Name"
                className="w-full px-5 py-3 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600"
              />
              {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name}</p>}
            </div>

            <div>
              <input
                type="text"
                name="logoUrl"
                value={form.logoUrl}
                onChange={handleChange}
                placeholder="Logo URL (e.g. https://...)"
                className="w-full px-5 py-3 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600"
              />
              {errors.logoUrl && (
                <p className="text-red-500 mt-1 text-sm">{errors.logoUrl}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="openHours"
                value={form.openHours}
                onChange={handleChange}
                placeholder="Open Hours (e.g. 9am - 5pm)"
                className="w-full px-5 py-3 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600"
              />
              {errors.openHours && (
                <p className="text-red-500 mt-1 text-sm">{errors.openHours}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-xl transition duration-300 shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-400/50"
              }`}
            >
              {loading
                ? "⏳ Saving..."
                : isEditing
                ? "✏️ Update Cafeteria"
                : "➕ Create Cafeteria"}
            </button>
          </form>
        ) : (
          <div className="text-center text-indigo-600 dark:text-indigo-300 font-medium mb-6">
            ⚠️ You already have a cafeteria registered. You can only edit or delete it.
          </div>
        )}

        {message && (
          <div className="mt-5 text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium select-none">
            {message}
          </div>
        )}

        {cafeteria && (
          <section className="mt-10 bg-indigo-50 dark:bg-indigo-900 rounded-2xl p-6 shadow-inner border border-indigo-200 dark:border-indigo-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center gap-3">
              🏫 Registered Cafeteria
            </h3>
            <div className="flex items-center gap-6">
              <img
                src={cafeteria.logo}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback-logo.png";
                }}
                alt="Cafeteria Logo"
                className="w-20 h-20 rounded-xl border object-cover border-indigo-300 dark:border-indigo-700 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-indigo-800 dark:text-indigo-200 truncate">
                  {cafeteria.name}
                </p>
                <p className="text-md text-indigo-600 dark:text-indigo-400 mt-1">
                  {cafeteria.openHours}
                </p>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={handleEdit}
                  className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-300 transition"
                  title="Edit Cafeteria"
                >
                  <Pencil size={24} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition"
                  title="Delete Cafeteria"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
