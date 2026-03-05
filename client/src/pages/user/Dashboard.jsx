import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/11394987/pexels-photo-11394987.jpeg')`, // Replace with your own image if needed
      }}
    >
      {/* Dark glass overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md" />

      {/* Floating animation background elements */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 rounded-full bg-white opacity-10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + Math.random() * 200,
              scale: Math.random() * 1 + 0.5,
            }}
            animate={{
              y: -100,
              x: `+=${Math.random() * 20 - 10}`,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-white">
        {/* Animated Welcome Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: -40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.2 },
            },
          }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
            👋 Welcome to
          </h1>
          <h2 className="text-6xl md:text-7xl font-black text-purple-300 drop-shadow-xl mt-2">
            Smart Cafeteria 🍱
          </h2>
          <p className="text-gray-300 text-lg mt-4 font-light">
            Eat Smart, Live Smarter
          </p>
        </motion.div>

        {/* Glassmorphism Action Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-xl w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/user/menu")}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl shadow-md text-xl font-semibold transition-all"
          >
            🍽️ View Menu
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/user/orders")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl shadow-md text-xl font-semibold transition-all"
          >
            📋 My Orders
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-xl shadow-md text-xl font-semibold transition-all"
          >
            🚪 Logout
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-10 text-gray-300 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © {new Date().getFullYear()} Smart Cafeteria | Tastefully Engineered 🚀
        </motion.div>
      </div>
    </div>
  );
}
