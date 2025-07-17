import { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/user/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      toast.success("🗑️ Order deleted!");
    } catch (err) {
      toast.error("Failed to delete order.");
      console.error(err);
    }
  };

  const clearOrders = async () => {
    try {
      await Promise.all(
        orders.map((order) =>
          axios.delete(`http://localhost:5000/api/user/order/${order._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setOrders([]);
      toast.success("🧹 All orders cleared!");
    } catch (err) {
      toast.error("Failed to clear orders.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#e1f5fe] to-[#f3e5f5] p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto mt-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🧾 My Orders</h2>
          {orders.length > 0 && (
            <button
              onClick={clearOrders}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
            >
              🗑️ Clear All Orders
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-500">🔄 Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-600">No orders yet.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-4 border border-gray-200 rounded-lg shadow-md relative bg-white/80 backdrop-blur-sm"
              >
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
                >
                  ❌
                </button>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Pickup: {order.pickupTime}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <ul className="mt-2 space-y-1 text-gray-800 text-sm">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      • {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <div className="text-right mt-2 font-semibold text-gray-700">
                  ₹{" "}
                  {order.items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
