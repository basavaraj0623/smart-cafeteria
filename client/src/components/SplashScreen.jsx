import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#6d28d9] flex flex-col items-center justify-center text-white">
      <img
        src="/logo.png"
        alt="Smart Cafeteria"
        className="w-32 h-32 animate-splashBounce"
      />

      <h1 className="mt-4 text-2xl font-bold animate-fadeIn">Smart Cafeteria</h1>
      <p className="text-sm text-white/70 animate-fadeIn delay-200">
        Fuel your day, the smart way 🍽️
      </p>

      {/* Loader */}
      <div className="mt-6">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
