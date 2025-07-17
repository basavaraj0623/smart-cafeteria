import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Loader2 } from "lucide-react";

export default function MenuBuilder() {
  const [cafeteriaId, setCafeteriaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    tags: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const BASE_URL = "http://localhost:5000";

  // ✅ Fetch cafeteria and its menu
  useEffect(() => {
    const fetchMyCafeteria = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/my-cafeteria`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cafeteria = res.data?.cafeteria;
        if (!cafeteria) throw new Error("Cafeteria not found");

        setCafeteriaId(cafeteria._id);

        const menuRes = await axios.get(`${BASE_URL}/api/admin/menu/${cafeteria._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(menuRes.data);
      } catch (err) {
        console.error("❌ Error fetching cafeteria/menu:", err);
        setMessage("Failed to load cafeteria or menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCafeteria();
  }, [token]);

  const fetchMenuItems = async () => {
    if (!cafeteriaId) return;
    const res = await axios.get(`${BASE_URL}/api/admin/menu/${cafeteriaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMenuItems(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      tags: form.tags.split(",").map((t) => t.trim()),
      cafeteriaId,
    };

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/admin/menu/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("✅ Item updated");
        setEditingId(null);
      } else {
        await axios.post(`${BASE_URL}/api/admin/menu`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("✅ Item added");
      }

      setForm({ name: "", price: "", image: "", tags: "" });
      fetchMenuItems();
    } catch (err) {
      console.error("❌ Error saving item:", err);
      setMessage("❌ Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      image: item.image,
      tags: item.tags.join(", "),
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🗑️ Item deleted");
      fetchMenuItems();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      setMessage("❌ Could not delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <Loader2 className="animate-spin h-6 w-6 mb-2" />
        Loading cafeteria...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 p-6">
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">🍽️ Menu Builder</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Item Name"
            className="input-field"
            required
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            type="number"
            className="input-field"
            required
          />
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Tags (comma-separated)"
            className="input-field"
          />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="input-field"
          />

          <button type="submit" className="btn-primary mt-2">
            {editingId ? "✏️ Update Item" : "➕ Add Item"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-1">
            🧾 Current Menu
          </h3>

          <div className="space-y-4">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white/70 rounded-lg p-4 shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || "/fallback-image.png"}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover border"
                    onError={(e) => (e.target.src = "/fallback-image.png")}
                  />
                  <div>
                    <p className="font-bold text-lg text-purple-900">
                      {item.name} - ₹{item.price}
                    </p>
                    <p className="text-sm text-gray-500">{item.tags?.join(", ")}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailwind helper styles */}
      <style>{`
        .input-field {
          padding: 0.6rem;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          font-size: 1rem;
          background-color: white;
        }
        .input-field:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3);
        }
        .btn-primary {
          background-color: #5b21b6;
          color: white;
          font-weight: 500;
          padding: 0.6rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background-color: #4c1d95;
        }
      `}</style>
    </div>
  );
}
