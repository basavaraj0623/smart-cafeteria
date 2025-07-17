import { useEffect, useState, useRef } from "react";
import axios from "axios";
import TimePicker from "react-time-picker";
import { motion } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

export default function UserMenu() {
  const [cafeterias, setCafeterias] = useState([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState("");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [pickupTime, setPickupTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cafeteriaDetails, setCafeteriaDetails] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const receiptRef = useRef();

  useEffect(() => {
    const fetchCafeterias = async () => {
      const res = await axios.get("http://localhost:5000/api/user/cafeterias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCafeterias(res.data);
    };
    fetchCafeterias();

    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    now.setSeconds(0);
    now.setMilliseconds(0);
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
    setPickupTime(now.toTimeString().slice(0, 5));
  }, [token]);

  useEffect(() => {
    if (!selectedCafeteria) return;
    const fetchMenu = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/user/menu/${selectedCafeteria}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(res.data);
    };
    const details = cafeterias.find((c) => c._id === selectedCafeteria);
    setCafeteriaDetails(details);
    fetchMenu();
  }, [selectedCafeteria, token, cafeterias]);

  const addToCart = (item) => {
    const exists = cart.find((i) => i.itemId === item._id);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.itemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { itemId: item._id, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.itemId !== itemId));
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => {
      const product = menu.find((m) => m._id === item.itemId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);

  const handlePlaceOrder = () => {
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    const [h, m] = pickupTime.split(":").map(Number);
    const pickup = new Date();
    pickup.setHours(h, m, 0, 0);
    const diff = (pickup - new Date()) / 60000;

    if (!selectedCafeteria || !pickupTime || cart.length === 0) {
      toast.error("❌ Fill all fields and add items to cart.");
      return;
    }
    if (diff < 15) {
      toast.error("⏰ Pickup must be at least 15 mins ahead.");
      return;
    }

    toast.loading("Processing order...");
    setTimeout(async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/user/order",
          {
            items: cart,
            cafeteriaId: selectedCafeteria,
            pickupTime,
            total: calculateTotal(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.dismiss();
        toast.success("✅ Order placed!");
        setCart([]);
        setLastOrder({
          items: cart.map((c) => ({
            ...c,
            name: menu.find((m) => m._id === c.itemId)?.name || "Item",
            price: menu.find((m) => m._id === c.itemId)?.price || 0,
          })),
          pickupTime,
          total: calculateTotal(),
          orderId: res.data?.orderId || Math.floor(Math.random() * 1000000),
        });
        setShowReceipt(true);
        setShowConfirmation(false);
      } catch (err) {
        toast.dismiss();
        toast.error("❌ Failed to place order");
        console.error(err);
      }
    }, 1500);
  };

  const renderStars = (avgRating) => {
    const avg = parseFloat(avgRating || 0);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (avg >= i) stars.push(<FaStar key={i} className="text-yellow-400" />);
      else if (avg >= i - 0.5)
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      else stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Smart Cafeteria Receipt", 20, 20);
    doc.text(`Order ID: ${lastOrder.orderId}`, 20, 30);
    doc.text(`Pickup Time: ${lastOrder.pickupTime}`, 20, 40);
    doc.text("Items:", 20, 50);
    lastOrder.items.forEach((item, i) => {
      doc.text(
        `${item.name} × ${item.quantity} = ₹${item.price * item.quantity}`,
        25,
        60 + i * 10
      );
    });
    doc.text(`Total: ₹${lastOrder.total}`, 20, 70 + lastOrder.items.length * 10);
    doc.save(`Order_Receipt_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const shareReceipt = () => {
    const text = `🧾 Smart Cafeteria Order Receipt\nOrder ID: ${lastOrder.orderId}\nPickup: ${lastOrder.pickupTime}\nTotal: ₹${lastOrder.total}\nItems:\n${lastOrder.items
      .map((i) => `${i.name} × ${i.quantity}`)
      .join("\n")}`;
    if (navigator.share) {
      navigator
        .share({ title: "Order Receipt", text })
        .catch((err) => console.error("Share failed", err));
    } else {
      toast("Sharing not supported on this device.");
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-[#e0f2ff] via-[#dbeafe] to-[#f0f9ff] py-10">
  <div className="max-w-6xl mx-auto px-4">
     <Toaster />

        <div className="flex gap-4 mb-4 flex-wrap">
          <select
            value={selectedCafeteria}
            onChange={(e) => setSelectedCafeteria(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/3 shadow-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Cafeteria</option>
            {cafeterias.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/3 shadow-sm focus:ring-2 focus:ring-indigo-500"
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate("/user/orders")}
              className="bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600 transition text-sm"
            >
              📋 My Orders
            </button>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="text-xs font-medium block mb-1">
              Select Pickup Time
            </label>
            <TimePicker
              onChange={setPickupTime}
              value={pickupTime}
              disableClock
              className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm"
            /> 
  </div>
</div>

        {cafeteriaDetails && (
          <div className="mb-4 p-4 bg-gray-100 rounded shadow">
            <h2 className="font-bold text-lg mb-1">{cafeteriaDetails.name}</h2>
            <p className="text-gray-600 text-sm">
              Open Hours: {cafeteriaDetails.openHours || "N/A"}
            </p>
          </div>
        )}

        {/* Menu Items */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {menu
            .filter((i) =>
              i.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <motion.div
                key={item._id}
                animate={{
                  opacity: 1,
                  scale: item.isTopSelling ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  repeat: item.isTopSelling ? Infinity : 0,
                  duration: 1.5,
                }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded shadow flex flex-col justify-between"
              >
                <img
                  src={
                    item.image?.startsWith("http")
                      ? item.image
                      : `http://localhost:5000/${item.image}`
                  }
                  alt={item.name}
                  className="rounded object-cover aspect-[4/3]"
                />
                <h3 className="font-bold mt-2">{item.name}</h3>
                <p className="text-gray-600">₹{item.price}</p>
                {renderStars(item.averageRating)}
                <button
                  onClick={() => addToCart(item)}
                  className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                >
                  ➕ Add to Cart
                </button>
              </motion.div>
            ))}
        </div>

        {/* Cart */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded shadow">
          <h3 className="font-bold text-lg">🛒 Cart</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">No items added.</p>
          ) : (
            <>
              <ul className="mt-2">
                {cart.map((item) => {
                  const prod = menu.find((m) => m._id === item.itemId);
                  return (
                    <li key={item.itemId} className="flex justify-between">
                      <span>
                        {prod?.name} × {item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="text-red-500"
                      >
                        ❌
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 font-bold">Total: ₹{calculateTotal()}</p>
              <button
                onClick={handlePlaceOrder}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
              >
                ✅ Place Order
              </button>
            </>
          )}
        </div>

        {/* Confirmation & Receipt */}
        {/* No changes here */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-2">Confirm Your Order</h2>
              <ul className="text-sm text-gray-700 mb-4">
                {cart.map((item, idx) => {
                  const prod = menu.find((m) => m._id === item.itemId);
                  return (
                    <li key={idx}>
                      {prod?.name} × {item.quantity} = ₹
                      {prod?.price * item.quantity}
                    </li>
                  );
                })}
              </ul>
              <p className="font-bold text-right mb-4">
                Total: ₹{calculateTotal()}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayment}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        )}

        {showReceipt && lastOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              className="bg-white p-6 rounded shadow-lg max-w-sm w-full"
              ref={receiptRef}
            >
              <h2 className="text-xl font-bold mb-2">🎉 Order Confirmed</h2>
              <p className="text-sm text-gray-600 mb-2">
                Thank you for ordering from{" "}
                <strong>{cafeteriaDetails?.name}</strong>!<br />
                Order ID: <strong>{lastOrder.orderId}</strong>
                <br />
                Pickup at: {lastOrder.pickupTime}
              </p>
              <ul className="my-3">
                {lastOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.quantity} = ₹
                    {item.price * item.quantity}
                  </li>
                ))}
              </ul>
              <p className="font-bold text-right">
                Total: ₹{lastOrder.total}
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={downloadPDF}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  ⬇️ Download
                </button>
                <button
                  onClick={shareReceipt}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                >
                  📤 Share
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
