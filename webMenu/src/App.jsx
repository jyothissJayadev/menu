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
} from "lucide-react";

// --- MOCK DATA ---

const RESTAURANT_INFO = {
  id: "demo-restaurant",
  name: "Smoke House Deli",
  rating: 4.6,
  ratingCount: "19K+",
  time: "40-50 mins",
  location: "Central Bangalore",
  discount: "Flat ₹125 off",
  discountSub: "USE FLAVORFUL | ABOVE ₹249",
};

const CATEGORIES = [
  { id: "bestseller", name: "Bestseller", gridCols: 2 },
  { id: "pizza", name: "Pizza", gridCols: 1 },
  { id: "pasta", name: "Pasta & Risotto", gridCols: 2 },
  { id: "sides", name: "Sides & Appetizers", gridCols: 2 },
  { id: "beverages", name: "Beverages", gridCols: 1 },
];

const MENU_ITEMS = [
  {
    id: 1,
    categoryId: "pizza",
    name: "Pulled Roast Chicken & Pesto Pocket Pizza",
    price: 498,
    discountPrice: 199,
    description:
      "Hand-stretched pocket pizza filled with juicy roast chicken and basil pesto.",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60",
    isVeg: false,
    rating: 4.8,
    votes: 10,
    isBestseller: true,
  },
  {
    id: 2,
    categoryId: "pizza",
    name: "Spicy Cottage Cheese & Peppers Pocket Pizza",
    price: 498,
    discountPrice: 199,
    description:
      "Spicy marinated paneer with roasted peppers in a crispy pocket crust.",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.5,
    votes: 5,
    isBestseller: false,
  },
  {
    id: 3,
    categoryId: "pasta",
    name: "Penne Pink Sauce Pasta Feast Box",
    price: 425,
    description:
      "Penne curried pink sauce pasta + cottage cheese skewer + caesar salad.",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.7,
    votes: 158,
    isBestseller: true,
  },
  {
    id: 4,
    categoryId: "pasta",
    name: "Boss Style Aglio Olio Peperoncino",
    price: 525,
    description:
      "Classic spaghetti tossed in garlic, olive oil, and chili flakes.",
    image:
      "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.7,
    votes: 124,
    isBestseller: false,
  },
  {
    id: 5,
    categoryId: "sides",
    name: "Roasted Mushrooms",
    price: 250,
    description: "Button mushrooms roasted with thyme and garlic butter.",
    image:
      "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 5.0,
    votes: 17,
    isBestseller: false,
  },
  {
    id: 6,
    categoryId: "sides",
    name: "Peri Peri French Fries",
    price: 240,
    description: "Crispy fries dusted with spicy peri peri seasoning.",
    image:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.6,
    votes: 89,
    isBestseller: true,
  },
  {
    id: 7,
    categoryId: "beverages",
    name: "Peach Iced Tea",
    price: 180,
    description: "Refreshing homemade iced tea with peach flavor.",
    image:
      "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.9,
    votes: 210,
    isBestseller: true,
  },
  {
    id: 8,
    categoryId: "pasta",
    name: "Creamy Mushroom Risotto",
    price: 545,
    description: "Arborio rice cooked with wild mushrooms and parmesan.",
    image:
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=500&q=60",
    isVeg: true,
    rating: 4.8,
    votes: 92,
    isBestseller: false,
  },
];

const ADD_ON_ITEMS = [
  // Popular (Mixed)
  {
    id: "ao1",
    name: "Choco Lava Cake",
    price: 119,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Desserts",
    isPopular: true,
  },
  {
    id: "ao2",
    name: "Mint Lemonade",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Beverages",
    isPopular: true,
  },
  {
    id: "ao3",
    name: "Garlic Bread",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1573140247632-f84660f67627?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Sides",
    isPopular: true,
  },
  {
    id: "ao4",
    name: "Brownie",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Desserts",
    isPopular: true,
  },
  // Beverages
  {
    id: "ao5",
    name: "Iced Coffee",
    price: 139,
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Beverages",
    isPopular: false,
  },
  {
    id: "ao6",
    name: "Berry Smoothie",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1623592534882-9694db091c53?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Beverages",
    isPopular: false,
  },
  // Sides
  {
    id: "ao7",
    name: "Cheesy Nachos",
    price: 169,
    image:
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Sides",
    isPopular: false,
  },
  {
    id: "ao8",
    name: "Potato Wedges",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1605634685165-2bc36b449aa8?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Sides",
    isPopular: false,
  },
  // Desserts
  {
    id: "ao9",
    name: "Tiramisu",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=300&q=60",
    isVeg: true,
    category: "Desserts",
    isPopular: false,
  },
];

const ADD_ON_CATEGORIES = ["Popular", "Beverages", "Desserts", "Sides"];

// --- COMPONENTS ---

// 1. Veg/Non-Veg Icon
const VegIcon = ({ isVeg, className = "w-4 h-4" }) => (
  <div
    className={`border-[1.5px] p-[2px] flex items-center justify-center shrink-0 ${
      isVeg ? "border-green-600" : "border-red-600"
    } ${className}`}
  >
    <div
      className={`w-full h-full rounded-full ${
        isVeg ? "bg-green-600" : "bg-red-600"
      }`}
    ></div>
  </div>
);

// 2. Reusable Menu Item Component
const MenuItem = ({
  item,
  cart,
  onAddToCart,
  updateQuantity,
  setSelectedItem,
  gridCols = 1,
}) => {
  const cartItem = cart.find((c) => c.id === item.id);
  const isGrid = gridCols === 2;

  return (
    <div
      onClick={() => setSelectedItem(item)}
      className={`
        relative group cursor-pointer rounded-xl transition-all duration-200 h-full
        ${
          isGrid
            ? "flex flex-col gap-2 pb-3 hover:shadow-md border border-gray-100 bg-white p-2 md:p-0 md:bg-transparent md:border-0 md:hover:shadow-none"
            : "flex flex-row justify-between gap-4 pb-8 border-b border-gray-100 last:border-0 lg:border-0 hover:bg-gray-50/50 -mx-2 px-2"
        }
        md:flex-row md:gap-4 md:pb-8 md:border-b md:border-gray-100 md:last:border-0 md:hover:bg-gray-50/50 md:-mx-2 md:px-2 md:justify-between
      `}
    >
      <div
        className={`
        relative shrink-0 overflow-hidden
        ${
          isGrid
            ? "order-1 w-full aspect-[4/3] rounded-lg"
            : "order-2 w-32 h-28 rounded-xl"
        }
        md:order-2 md:w-32 md:h-28 md:rounded-xl
      `}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-opacity md:group-hover:opacity-95"
        />

        <div
          className={`
            absolute left-1/2 -translate-x-1/2 z-10 shadow-lg rounded-lg bg-white w-24
            ${isGrid ? "-bottom-3" : "-bottom-3"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {cartItem ? (
            <div className="flex items-center justify-between border border-green-500 rounded-lg bg-green-50 h-9">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-8 flex justify-center text-gray-600 hover:bg-green-100 h-full items-center rounded-l-lg"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-green-700">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-8 flex justify-center text-green-700 hover:bg-green-100 h-full items-center rounded-r-lg"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              className="w-full h-9 bg-white text-green-600 font-bold text-sm rounded-lg border border-gray-200 shadow-sm hover:bg-green-50 uppercase"
            >
              Add
            </button>
          )}
        </div>

        <div
          className={`absolute bottom-[-28px] w-full text-center ${
            isGrid ? "hidden md:block" : "block"
          }`}
        >
          <span className="text-[10px] text-gray-400 font-medium">
            Customisable
          </span>
        </div>
      </div>

      <div
        className={`
        flex-1 flex flex-col pt-2
        ${isGrid ? "order-2 justify-between" : "order-1"}
        md:order-1 md:justify-start md:pt-0
      `}
      >
        <div>
          <div className="mb-1 flex items-center">
            <VegIcon isVeg={item.isVeg} />
            {item.isBestseller && (
              <span className="ml-2 text-[10px] font-bold text-orange-500 bg-orange-50 px-1 rounded">
                Bestseller
              </span>
            )}
          </div>

          <h4
            className={`font-bold text-gray-800 leading-tight mb-1 ${
              isGrid ? "text-sm line-clamp-2 min-h-[2.5em]" : "text-base"
            }`}
          >
            {item.name}
          </h4>

          <div className="flex items-center gap-1 mb-2 bg-green-50 w-fit px-1 rounded border border-green-100">
            <Star className="w-3 h-3 fill-green-700 text-green-700" />
            <span className="text-[10px] font-bold text-green-700">
              {item.rating}
            </span>
            <span className="text-[10px] text-gray-400">({item.votes})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <span className="font-bold text-sm text-gray-800">
            ₹{item.discountPrice || item.price}
          </span>
          {item.discountPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{item.price}
            </span>
          )}
        </div>

        <p
          className={`text-gray-500 text-sm line-clamp-2 leading-tight mt-2 ${
            isGrid ? "hidden md:block" : "block"
          }`}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
};

// 3. Simple Button Component
const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  size = "md",
  disabled = false,
}) => {
  const baseStyle =
    "font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#10b981] text-white hover:bg-[#059669]",
    outline: "border border-gray-300 text-[#10b981] bg-white hover:bg-gray-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    secondary: "bg-gray-800 text-white hover:bg-gray-900",
  };
  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base w-full",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// 4. Top Picks Carousel (UPDATED: Added Cart/Quantity Support)
const TopPicks = ({ items, onAdd, cart, updateQuantity }) => {
  return (
    <div className="mb-8 pl-4">
      <h3 className="font-extrabold text-lg text-gray-900 mb-4">Top Picks</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide md:scrollbar-default pb-4 pr-4 snap-x">
        {items.map((item) => {
          const cartItem = cart?.find((c) => c.id === item.id);
          return (
            <div
              key={item.id}
              className="snap-start relative min-w-[280px] h-[200px] rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              <div className="absolute top-3 left-3">
                <VegIcon
                  isVeg={item.isVeg}
                  className="bg-white/90 backdrop-blur-sm rounded-sm"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <div className="flex justify-between items-end">
                  <span className="text-white font-bold text-base">
                    ₹{item.discountPrice || item.price}
                  </span>

                  {/* Quantity Control or Add Button */}
                  {cartItem ? (
                    <div
                      className="flex items-center bg-white rounded-lg h-9 shadow-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, -1);
                        }}
                        className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-green-700">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, 1);
                        }}
                        className="w-8 h-full flex items-center justify-center text-green-700 hover:bg-green-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd(item);
                      }}
                      className="bg-white text-green-700 px-6 py-1.5 rounded text-sm font-extrabold uppercase hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      ADD
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Item Modal
const ItemModal = ({ item, isOpen, onClose, onAdd }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
      <div
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        <div className="relative h-56 sm:h-64 w-full shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            {item.isBestseller && (
              <span className="bg-yellow-500 text-xs font-bold px-2 py-0.5 rounded text-white mb-1 inline-block">
                Bestseller
              </span>
            )}
          </div>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <VegIcon isVeg={item.isVeg} className="w-5 h-5 mt-1" />
            <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded text-green-700 font-bold text-xs border border-green-200">
              <Star className="w-3 h-3 fill-green-700" />
              {item.rating}{" "}
              <span className="text-gray-400 font-normal">({item.votes})</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1 leading-tight">
            {item.name}
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold text-gray-900">
              ₹{item.discountPrice || item.price}
            </span>
            {item.discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{item.price}
              </span>
            )}
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {item.description}
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Customisable</p>
              <p className="text-[10px] text-gray-500">
                Choose sauce, toppings & more
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-white mt-auto">
          <Button size="lg" onClick={() => onAdd(item)}>
            ADD TO ORDER
          </Button>
        </div>
      </div>
    </div>
  );
};

// 6. Cart Drawer
const CartDrawer = ({
  cart,
  isOpen,
  onClose,
  updateQuantity,
  total,
  onAddToCart,
}) => {
  const [couponApplied, setCouponApplied] = useState(false);
  const [addOnCategory, setAddOnCategory] = useState("Popular"); // State for tabs

  const COUPON_THRESHOLD = 500;
  const COUPON_VALUE = 50;

  // Auto-remove coupon if total drops below threshold
  useEffect(() => {
    if (total < COUPON_THRESHOLD && couponApplied) {
      setCouponApplied(false);
    }
  }, [total, couponApplied]);

  const finalAmount = total + 45 - (couponApplied ? COUPON_VALUE : 0);

  // Filter add-ons based on selected category
  const filteredAddOns = useMemo(() => {
    if (addOnCategory === "Popular") {
      return ADD_ON_ITEMS.filter((item) => item.isPopular);
    }
    return ADD_ON_ITEMS.filter((item) => item.category === addOnCategory);
  }, [addOnCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-gray-50 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose}>
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="font-bold text-lg">Your Cart</h2>
          </div>
          <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
            Table #1
          </span>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Browse Menu
              </Button>
            </div>
          ) : (
            <>
              {/* Order For */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800 text-sm">
                    Ordering for someone else?
                  </span>
                  <span className="text-[#d84e55] font-bold text-sm cursor-pointer">
                    Add Details
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 border-b last:border-0"
                  >
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <VegIcon isVeg={item.isVeg} className="w-3 h-3" />
                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-gray-500 text-xs">₹{item.price}</p>
                        </div>
                        <span className="font-bold text-sm text-gray-800">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, -item.quantity)
                          }
                          className="text-xs text-red-500 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>

                        <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-2 py-0.5 bg-white shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-gray-500 hover:text-green-600 p-1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-3 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-green-600 p-1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- COMPLETE YOUR MEAL (ADD ONS) --- */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Complete Your Meal
                </h3>

                {/* Sliders / Categories Tabs */}
                <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
                  {ADD_ON_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAddOnCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        addOnCategory === cat
                          ? "bg-black text-white border-black"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Scrollable Items */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 min-h-[140px]">
                  {filteredAddOns.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[130px] w-[130px] bg-white rounded-xl p-2 border border-gray-100 shadow-sm flex flex-col gap-2 relative animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div className="relative h-24 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onAddToCart(item)}
                          className="absolute top-1 right-1 bg-white shadow-md text-green-600 p-1 rounded-md active:scale-95 transition-transform"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <VegIcon isVeg={item.isVeg} className="w-3 h-3" />
                          <span className="text-xs font-semibold text-gray-700 line-clamp-1">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredAddOns.length === 0 && (
                    <div className="w-full text-center py-4 text-xs text-gray-400 italic">
                      No items in this category
                    </div>
                  )}
                </div>
              </div>

              {/* --- COUPON / SAVINGS CORNER --- */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Savings Corner
                </h3>
                <div
                  className={`bg-white p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    total >= COUPON_THRESHOLD
                      ? "border-orange-200 bg-orange-50/50"
                      : "border-gray-200 opacity-70 grayscale"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        total >= COUPON_THRESHOLD
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <TicketPercent className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          total >= COUPON_THRESHOLD
                            ? "text-gray-800"
                            : "text-gray-500"
                        }`}
                      >
                        {couponApplied
                          ? "Coupon Applied!"
                          : `Save ₹${COUPON_VALUE}`}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {total >= COUPON_THRESHOLD
                          ? "Flat discount on orders above ₹500"
                          : `Add items worth ₹${COUPON_THRESHOLD - total} more`}
                      </p>
                    </div>
                  </div>
                  {total >= COUPON_THRESHOLD && (
                    <button
                      onClick={() => setCouponApplied(!couponApplied)}
                      className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      {couponApplied ? "REMOVE" : "APPLY"}
                    </button>
                  )}
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Bill Details
                </h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Item Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxes & Charges</span>
                  <span>₹45</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Coupon Discount</span>
                    </div>
                    <span>-₹{COUPON_VALUE}</span>
                  </div>
                )}

                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>To Pay</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <Button
              size="lg"
              onClick={() =>
                alert("Order Placed Successfully! Kitchen notified.")
              }
            >
              <div className="flex justify-between w-full items-center">
                <span className="font-normal text-white/90">
                  ₹{finalAmount}
                </span>
                <span className="font-bold">Place Order</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. Sticky Header
const StickyHeader = ({
  isVisible,
  searchTerm,
  setSearchTerm,
  filterType,
  handleFilterClick,
}) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3">
        {/* Row 1: Back + Search */}
        <div className="flex items-center gap-3">
          <button className="p-1 rounded-full hover:bg-gray-100 shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 rounded-lg py-2 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleFilterClick("VEG")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap select-none ${
              filterType === "VEG"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            <div
              className={`w-3 h-3 border ${
                filterType === "VEG"
                  ? "border-green-600 bg-green-600"
                  : "border-green-600"
              } flex items-center justify-center rounded-[2px]`}
            >
              {filterType === "VEG" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>
            <span>Veg</span>
          </button>
          <button
            onClick={() => handleFilterClick("NON_VEG")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap select-none ${
              filterType === "NON_VEG"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            <div
              className={`w-3 h-3 border ${
                filterType === "NON_VEG"
                  ? "border-red-600 bg-red-600"
                  : "border-red-600"
              } flex items-center justify-center rounded-[2px]`}
            >
              {filterType === "NON_VEG" && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 8. Search Results Overlay
const SearchResultsOverlay = ({
  items,
  cart,
  onAddToCart,
  updateQuantity,
  setSelectedItem,
  onClose,
  searchTerm,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-white pt-24 pb-32 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-lg text-gray-900">
            Search Results ({items.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-8">
          {items.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              cart={cart}
              onAddToCart={onAddToCart}
              updateQuantity={updateQuantity}
              setSelectedItem={setSelectedItem}
              gridCols={1}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Search className="w-12 h-12 mb-4 text-gray-300" />
            <p>No dishes found matching "{searchTerm}"</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PAGES ---

const MenuPage = ({
  cart,
  onAddToCart,
  updateQuantity,
  cartTotal,
  openCart,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("bestseller");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [collapsedCategories, setCollapsedCategories] = useState([]);

  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollPosition = scrollY + 200;

      setShowStickyHeader(scrollY > 150);

      for (const cat of CATEGORIES) {
        const element = document.getElementById(`cat-${cat.id}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    setShowCategories(false);
    const element = document.getElementById(`cat-${catId}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleCategory = (categoryId) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFilterClick = (type) => {
    setFilterType((prev) => (prev === type ? "ALL" : type));
  };

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesType = true;
      if (filterType === "VEG") matchesType = item.isVeg;
      if (filterType === "NON_VEG") matchesType = !item.isVeg;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  const topPicks = useMemo(() => {
    return filteredItems.filter((i) => i.isBestseller).slice(0, 4);
  }, [filteredItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium text-sm animate-pulse">
            Loading Menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f9] md:py-8">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media (min-width: 768px) {
            .md\\:scrollbar-default::-webkit-scrollbar { display: block; height: 8px; }
            .md\\:scrollbar-default::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .md\\:scrollbar-default::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
            .md\\:scrollbar-default::-webkit-scrollbar-thumb:hover { background: #bbb; }
            .md\\:scrollbar-default { -ms-overflow-style: auto; scrollbar-width: auto; }
        }
      `}</style>

      <StickyHeader
        isVisible={showStickyHeader || searchTerm}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        handleFilterClick={handleFilterClick}
      />

      {searchTerm && (
        <SearchResultsOverlay
          items={filteredItems}
          cart={cart}
          onAddToCart={onAddToCart}
          updateQuantity={updateQuantity}
          setSelectedItem={setSelectedItem}
          onClose={() => setSearchTerm("")}
          searchTerm={searchTerm}
        />
      )}

      <div className="max-w-md md:max-w-2xl lg:max-w-5xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-3xl shadow-xl overflow-hidden relative border border-gray-100">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          {/* Info Card */}
          <div className="p-4 mx-4 mt-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 mb-4 text-center">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <h2 className="font-extrabold text-xl text-gray-800">
                  {RESTAURANT_INFO.name}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-green-700 text-green-700" />
                  <span className="font-bold text-sm text-gray-800">
                    {RESTAURANT_INFO.rating}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({RESTAURANT_INFO.ratingCount} ratings)
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                <CheckCircle2 className="text-green-600 w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-gray-400"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-3 w-4 h-4 text-gray-400 cursor-pointer p-0.5 hover:bg-gray-200 rounded-full"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => handleFilterClick("VEG")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap select-none ${
                  filterType === "VEG"
                    ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-3 h-3 border ${
                    filterType === "VEG"
                      ? "border-green-600 bg-green-600"
                      : "border-green-600"
                  } flex items-center justify-center rounded-[2px]`}
                >
                  {filterType === "VEG" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
                Veg
              </button>

              <button
                onClick={() => handleFilterClick("NON_VEG")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap select-none ${
                  filterType === "NON_VEG"
                    ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-3 h-3 border ${
                    filterType === "NON_VEG"
                      ? "border-red-600 bg-red-600"
                      : "border-red-600"
                  } flex items-center justify-center rounded-[2px]`}
                >
                  {filterType === "NON_VEG" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
                Non-Veg
              </button>
            </div>
          </div>
        </div>

        {topPicks.length > 0 && (
          <TopPicks
            items={topPicks}
            onAdd={onAddToCart}
            cart={cart}
            updateQuantity={updateQuantity}
          />
        )}

        <div className="pb-32 bg-[#f4f5f9] min-h-screen">
          {CATEGORIES.map((category) => {
            const categoryItems = filteredItems.filter((item) =>
              category.id === "bestseller"
                ? item.isBestseller
                : item.categoryId === category.id
            );

            if (categoryItems.length === 0) return null;

            const isCollapsed = collapsedCategories.includes(category.id);
            const gridCols = category.gridCols || 1;

            return (
              <div
                key={category.id}
                id={`cat-${category.id}`}
                className="mb-4 bg-white pb-2 shadow-sm border-t border-b border-gray-100"
              >
                <div
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between px-4 py-4 sticky top-[135px] bg-white z-30 border-b border-gray-50/50 cursor-pointer select-none"
                >
                  <h3 className="font-extrabold text-lg text-gray-900">
                    {category.name} ({categoryItems.length})
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-4 grid gap-3 mt-4 ${
                        gridCols === 2 ? "grid-cols-2" : "grid-cols-1"
                      } lg:grid-cols-2`}
                    >
                      {categoryItems.map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          cart={cart}
                          onAddToCart={onAddToCart}
                          updateQuantity={updateQuantity}
                          setSelectedItem={setSelectedItem}
                          gridCols={gridCols}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!searchTerm && (
          <div className="fixed bottom-24 right-6 z-30">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="bg-black text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-5 hover:bg-gray-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">MENU</span>
            </button>
          </div>
        )}

        {showCategories && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setShowCategories(false)}
            ></div>
            <div className="bg-white w-64 rounded-xl shadow-2xl relative z-10 max-h-[60vh] overflow-y-auto py-2 animate-in zoom-in-95 duration-200">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <span
                    className={`text-sm font-medium ${
                      activeCategory === cat.id
                        ? "text-black font-bold"
                        : "text-gray-600"
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">
                    {
                      filteredItems.filter((i) => i.categoryId === cat.id)
                        .length
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-40 w-full max-w-md md:max-w-2xl lg:max-w-5xl mx-auto pointer-events-none">
            <div
              onClick={openCart}
              className="bg-[#10b981] rounded-lg p-3 flex items-center justify-between shadow-lg shadow-green-200 cursor-pointer active:scale-[0.99] transition-transform pointer-events-auto"
            >
              <div className="flex flex-col text-white pl-2">
                <span className="text-xs font-medium uppercase opacity-90">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Items added
                </span>
                <span className="text-sm font-bold">
                  ₹{cartTotal + 45}{" "}
                  <span className="font-normal text-xs opacity-80">
                    (inc. taxes)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold text-sm pr-2">
                View Cart <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item) => {
            onAddToCart(item);
            setSelectedItem(null);
          }}
        />
      </div>
    </div>
  );
};

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="antialiased text-gray-900 bg-white">
      <MenuPage
        cart={cart}
        onAddToCart={addToCart}
        updateQuantity={updateQuantity}
        cartTotal={cartTotal}
        openCart={() => setIsCartOpen(true)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        total={cartTotal}
        onAddToCart={addToCart} // Passed addToCart to allow add-ons
      />
    </div>
  );
}

export default App;
