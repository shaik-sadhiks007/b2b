import {
  ShoppingCart,
  CreditCard,
  Package,
  UserCircle,
  LogOut,
  MessageSquare,
  Bell,
  User,
  X,
} from "lucide-react";
import { useState, useEffect, useContext, useRef } from "react";
import { HotelContext } from "../contextApi/HotelContextProvider";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { API_URL } from "../api/api";
import io from "socket.io-client";
import logo from "../assets/b2bupdate.png";
import { getSubdomain } from "../utils/getSubdomain";

function Pnavbar() {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, logout, hotel } = useContext(HotelContext); // ← hotel assumed here
  const { cartCount, fetchCart } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchCart();
      setupSocketConnection();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, fetchCart]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setupSocketConnection = () => {
    if (!user) return;
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("orderStatusUpdate", (updatedOrder) => {
      const isCancelled = updatedOrder.status.toLowerCase().includes("cancel");
      const message =
        isCancelled && updatedOrder.cancelledBy === "restaurant"
          ? `Order #${updatedOrder._id.slice(-6)} has been cancelled by the restaurant`
          : `Order #${updatedOrder._id.slice(-6)} status updated to: ${updatedOrder.status.replace(
              /_/g,
              " "
            )}`;
      addNotification({
        id: Date.now().toString(),
        text: message,
        time: new Date().toLocaleTimeString(),
        read: false,
        orderId: updatedOrder._id,
        isCancelled: isCancelled,
      });
    });
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Order Update", {
          body: notification.text,
          tag: "order-update",
        });
      } catch (error) {
        console.error("Notification error:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLoginOptions(false);
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.location.href = "https://www.shopatb2b.com";
  };

  const handleHotelNameClick = () => {
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/order-status/${notification.orderId}`);
    }
    setShowNotifications(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleLogoClick} className="cursor-pointer">
              <img src={logo} loading="lazy" alt="logo" width="40px" />
            </button>
            <button
              onClick={handleHotelNameClick}
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              {restaurant?.name || "pantulu gari mess"}
            </button>
          </div>

          <button
            className="lg:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* ... Unchanged existing code for Cart, Orders, Checkout, Notifications, Login/Profile ... */}
            {/* Keep all the previous button and dropdown code intact here */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-lg">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {/* ... Mobile menu items ... */}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Pnavbar;
