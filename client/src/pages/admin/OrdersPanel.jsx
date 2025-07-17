import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FileText,
  Clock,
  Truck,
  Trash2,
  User2,
  Calendar,
  Utensils,
} from "lucide-react";

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update Status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/order-status/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Order status updated!");
      fetchOrders();
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      toast.error("❌ Failed to update order status");
    }
  };

  // ✅ Delete Order
  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ Order deleted successfully!");
      fetchOrders();
    } catch (err) {
      console.error("❌ Failed to delete order:", err);
      toast.error("❌ Failed to delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-50 dark:from-zinc-800 dark:via-zinc-900 dark:to-black p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-8 text-indigo-700 dark:text-indigo-300 text-center">
        📦 Orders Dashboard
      </h2>

      {loading && <p className="text-blue-600 text-center">Loading orders...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="text-gray-500 text-center">No orders found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 p-5 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-md text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <FileText size={16} /> Order #{order._id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => deleteOrder(order._id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 bg-red-100 dark:bg-red-900 px-2 py-1 rounded-md"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

            <p className="text-sm mb-1 flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Token:
              </span>{" "}
              {order.token || "—"}
            </p>

            <p className="text-sm mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User2 size={14} />
              <strong>{order.userId?.name}</strong>{" "}
              <span className="text-gray-500 text-xs">({order.userId?.email})</span>
            </p>

            <p className="text-sm mb-1 text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Calendar size={14} />
              {new Date(order.createdAt).toLocaleString()}
            </p>

            <p className="text-sm mb-3 text-purple-600 dark:text-purple-300 flex items-center gap-1">
              <Clock size={14} />
              Pickup Time: <strong>{order.pickupTime}</strong>
            </p>

            <div className="mb-3">
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm mb-1 flex items-center gap-1">
                <Utensils size={14} /> Items:
              </h4>
              <ul className="ml-4 list-disc text-sm text-gray-800 dark:text-gray-200">
                {order.items.map((item) => (
                  <li key={item.itemId?._id}>
                    {item.itemId?.name} — ₹{item.itemId?.price} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Truck size={16} /> Status:
              </span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="border px-2 py-1 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
