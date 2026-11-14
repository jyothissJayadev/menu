import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Star,
  BookOpen,
  CheckCircle2,
  UtensilsCrossed,
  Trash2,
  ArrowLeft,
  Tag,
  TicketPercent,
  Clock,
  Sparkles,
} from "lucide-react";
import { fetchCompany, fetchMenu, createOrder } from "./api";
import { OrderTrackingModal } from "./OrderTrackingModal";

// --- FALLBACK MOCK DATA IF BACKEND UNREACHABLE ---
const DEFAULT_RESTAURANT = {
  id: "cake-studio",
  name: "Sweet Delights Cake Studio",
  rating: 4.9,
  ratingCount: "2.4K+",
  time: "20-30 mins",
  location: "Main Street, Baker District",
  discount: "Flat ₹100 off",
  discountSub: "USE DELIGHTS | ABOVE ₹500",
};

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Birthday & Celebration", gridCols: 2 },
  { id: "cat-2", name: "Cheesecakes & Mousse", gridCols: 1 },
  { id: "cat-3", name: "Pastries & Tarts", gridCols: 2 },
  { id: "cat-4", name: "Cupcakes & Brownies", gridCols: 2 },
  { id: "cat-5", name: "Beverages & Shakes", gridCols: 1 },
];

const DEFAULT_ITEMS = [
  {
    id: "item-101",
    categoryId: "cat-1",
    name: "Belgian Truffle Chocolate Cake (1kg)",
    price: 750,
    originalPrice: 850,
    description: "Layered rich dark Belgian chocolate ganache with moist sponge cake.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.9,
    votes: 48,
    isBestseller: true,
  },
  {
    id: "item-102",
    categoryId: "cat-1",
    name: "Red Velvet Cream Cheese Cake (500g)",
    price: 550,
    description: "Classic crimson cocoa sponge topped with luxurious whipped Philadelphia cheese.",
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=500&q=60",
    isVeg: false,
    rating: 4.7,
    votes: 32,
    isBestseller: true,
  },
  {
    id: "item-103",
    categoryId: "cat-2",
    name: "New York Baked Blueberry Cheesecake",
    price: 280,
    originalPrice: 320,
    description: "Rich velvety baked cream cheese base crowned with wild blueberry compote.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.8,
    votes: 27,
    isBestseller: false,
  },
  {
    id: "item-105",
    categoryId: "cat-3",
    name: "French Butter Croissant",
    price: 140,
    description: "Golden, flaky, 27-layer laminated puff pastry baked with pure European butter.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.6,
    votes: 18,
    isBestseller: false,
  },
  {
    id: "item-106",
    categoryId: "cat-4",
    name: "Salted Caramel Hazelnut Cupcake (Pack of 2)",
    price: 160,
    originalPrice: 190,
    description: "Moist vanilla bean sponge filled with molten salted caramel & toasted hazelnuts.",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.9,
    votes: 56,
    isBestseller: true,
  },
  {
    id: "item-107",
    categoryId: "cat-5",
    name: "Iced Hazelnut Mocha Latte",
    price: 210,
    description: "Double espresso pulled over Dutch dark chocolate, roasted hazelnut syrup & oat milk.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.7,
    votes: 14,
    isBestseller: false,
  },
];

// --- UI COMPONENTS ---

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyle =
    "font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-50",
    secondary: "bg-amber-50 text-amber-800 hover:bg-amber-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base w-full",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const MenuItem = ({ item, onAdd, cart = [], updateQuantity }) => {
  const cartItem = cart.find((c) => c.id === item.id);

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4">
      {/* Thumbnail */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
        <img
          src={item.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.originalPrice && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
            OFFER
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
          {item.description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base text-amber-700">₹{item.price}</span>
            {item.originalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
            )}
          </div>

          {/* Add / Qty Controls */}
          {cartItem ? (
            <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-l"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-black text-xs text-amber-900">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-7 h-7 flex items-center justify-center text-amber-800 hover:bg-amber-100 rounded-r"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CART DRAWER ---

const CartDrawer = ({
  cart,
  isOpen,
  onClose,
  updateQuantity,
  total,
  onPlaceOrder,
  isPlacing,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [table, setTable] = useState("Table 1");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter your mobile phone number.");
      return;
    }
    onPlaceOrder({
      name: customerName.trim(),
      phone: phone.trim(),
      table,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="font-extrabold text-lg text-gray-900">Your Cake Cart</h2>
          </div>
          <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">
            {cart.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>

        {/* Scrollable Form & Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-30 text-amber-600" />
              <p className="font-semibold text-gray-600">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Pick some delicious cakes & pastries!</p>
            </div>
          ) : (
            <>
              {/* Order Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Selected Bakes
                </h3>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5">₹{item.price}</p>
                    </div>

                    <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Checkout Details */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Customer & Table Details</span>
                </h3>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Dining / Pickup</label>
                    <select
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2 py-2 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Table 1">Table 1</option>
                      <option value="Table 2">Table 2</option>
                      <option value="Table 3">Table 3</option>
                      <option value="Table 4">Table 4</option>
                      <option value="Table 5">Table 5</option>
                      <option value="Table 6">Table 6</option>
                      <option value="Takeaway">Takeaway (Counter Pickup)</option>
                      <option value="Delivery">Pre-order Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Time</label>
                    <div className="w-full text-xs bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 font-medium">
                      ASAP (~20m)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Cake Inscription / Special Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please write 'Happy 21st Birthday Sneha' in chocolate frosting..."
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{total}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Bakery Packaging</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-base font-black text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-amber-700">₹{total}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white shadow-lg">
            <button
              onClick={handleSubmitOrder}
              disabled={isPlacing}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-base shadow-md transition-all active:scale-95 flex items-center justify-between px-4"
            >
              <span>Place Order • ₹{total}</span>
              <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
                {isPlacing ? "Sending to Kitchen..." : "Confirm & Send 🍰"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN WEB MENU APP ---

export default function App() {
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [menuItems, setMenuItems] = useState(DEFAULT_ITEMS);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  // Live order tracking state
  const [activeTrackedOrder, setActiveTrackedOrder] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Load live data from Backend API
  useEffect(() => {
    async function loadData() {
      try {
        const comp = await fetchCompany();
        if (comp) {
          setCompany(comp);
          const menuData = await fetchMenu(comp._id);
          if (menuData) {
            if (menuData.categories && menuData.categories.length > 0) {
              setCategories(
                menuData.categories.map((c) => ({
                  id: c._id,
                  name: c.name,
                }))
              );
            }
            if (menuData.allItems && menuData.allItems.length > 0) {
              setMenuItems(
                menuData.allItems.map((i) => ({
                  id: i._id,
                  categoryId: String(i.categoryId),
                  name: i.name,
                  description: i.description,
                  price: i.offer && i.offerPrice ? i.offerPrice : i.price,
                  originalPrice: i.offer && i.offerPrice ? i.price : null,
                  image: i.image,
                  available: i.available,
                  isBestseller: i.offer || false,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Using fallback menu data:", err);
      }
    }
    loadData();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Place order into live backend
  const handlePlaceOrder = async (customerDetails) => {
    setIsPlacing(true);
    try {
      const companyId = company ? company._id : "6af87f1f5dd19a518f35d6bb";

      const orderPayload = {
        name: customerDetails.name,
        phone: customerDetails.phone,
        table: customerDetails.table,
        notes: customerDetails.notes,
        items: cart.map((i) => ({
          itemId: i.id,
          name: i.name,
          qty: i.quantity,
          price: i.price,
          addons: [],
        })),
      };

      const createdOrder = await createOrder(companyId, orderPayload);
      if (createdOrder) {
        setCart([]);
        setIsCartOpen(false);
        setActiveTrackedOrder(createdOrder);
        setIsTrackingOpen(true);
      }
    } catch (err) {
      alert("Error placing order: " + err.message);
    } finally {
      setIsPlacing(false);
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCat !== "all" && item.categoryId !== selectedCat) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [menuItems, selectedCat, searchTerm]);

  return (
    <div className="min-h-screen bg-amber-50/30 text-gray-900 pb-24">
      {/* Top Banner / Restaurant Info */}
      <header className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              🍰
            </div>
            <div>
              <h1 className="font-black text-lg text-gray-900 leading-tight">
                {company ? company.name : DEFAULT_RESTAURANT.name}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {company ? company.location : DEFAULT_RESTAURANT.location} • Fresh Daily Bakes
              </p>
            </div>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cakes, pastries, cupcakes..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCat === "all"
                ? "bg-amber-600 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCat === cat.id
                  ? "bg-amber-600 text-white shadow"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onAdd={addToCart}
              cart={cart}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        total={cartTotal}
        onPlaceOrder={handlePlaceOrder}
        isPlacing={isPlacing}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        order={activeTrackedOrder}
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        companyId={company ? company._id : "6af87f1f5dd19a518f35d6bb"}
      />
    </div>
  );
}
