import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ Admin Pages
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CafeteriaForm from "./pages/admin/CafeteriaForm";
import MenuBuilder from "./pages/admin/MenuBuilder";
import OrdersPanel from "./pages/admin/OrdersPanel";

// ✅ User Pages
import UserDashboard from "./pages/user/Dashboard";
import Menu from "./pages/user/UserMenu";
import Orders from "./pages/user/Orders";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Auth + Landing */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 🛠️ Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cafeteria" element={<CafeteriaForm />} />
        <Route path="/menu" element={<MenuBuilder />} />
        <Route path="/orders" element={<OrdersPanel />} />

        {/* 👤 User Routes */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/menu" element={<Menu />} />
        <Route path="/user/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;
