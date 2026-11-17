// webMenu/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCompany, fetchMenu } from "../api";

const CartContext = createContext();

const CART_STORAGE_KEY = "lavino_cart";
const CUSTOMER_STORAGE_KEY = "lavino_customer";

export const CartProvider = ({ children }) => {
  // Load persisted cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load persisted customer details (name, phone, etc.) from localStorage
  const [customerDetails, setCustomerDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : { name: "", phone: "", table: "Takeaway", notes: "" };
    } catch {
      return { name: "", phone: "", table: "Takeaway", notes: "" };
    }
  });

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn("Error saving cart to localStorage:", err);
    }
  }, [cart]);

  // Sync customer details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerDetails));
    } catch (err) {
      console.warn("Error saving customer details to localStorage:", err);
    }
  }, [customerDetails]);

  // Fetch company & menu from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const comp = await fetchCompany();
        if (comp && isMounted) {
          setCompany(comp);
          const menuData = await fetchMenu(comp._id);
          if (menuData && isMounted) {
            if (Array.isArray(menuData.categories)) {
              setCategories(
                menuData.categories.map((c) => ({
                  id: c._id,
                  name: c.name,
                  position: c.position || 0,
                }))
              );
            }
            if (Array.isArray(menuData.allItems)) {
              setMenuItems(
                menuData.allItems.map((i) => ({
                  id: i._id,
                  categoryId: String(i.categoryId),
                  name: i.name,
                  description: i.description,
                  price: i.offer && i.offerPrice ? i.offerPrice : i.price,
                  originalPrice: i.offer && i.offerPrice ? i.price : null,
                  image: i.image,
                  available: i.available !== undefined ? i.available : true,
                  isBestseller: i.offer || false,
                  variants: Array.isArray(i.variants) ? i.variants : [],
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Error loading menu data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    // Re-sync menu data periodically every 15s and on window focus so any updates from staff app sync immediately
    const interval = setInterval(loadData, 15000);
    window.addEventListener("focus", loadData);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  const addToCart = (item, selectedVariant = null, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    const variantWeight = selectedVariant ? selectedVariant.weight : "";
    const variantPrice = selectedVariant
      ? (selectedVariant.offerPrice || selectedVariant.price)
      : item.price;
    const cartItemId = selectedVariant
      ? `${item.id}_${selectedVariant.weight}`
      : item.id;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        const newQty = Math.min(5, existing.quantity + qty);
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          id: cartItemId,
          originalItemId: item.id,
          selectedVariant: selectedVariant || null,
          variant: variantWeight,
          price: variantPrice,
          quantity: Math.min(5, qty),
        },
      ];
    });
  };

  const setItemQuantity = (item, selectedVariant = null, exactQty = 1) => {
    const variantWeight = selectedVariant ? selectedVariant.weight : "";
    const variantPrice = selectedVariant
      ? (selectedVariant.offerPrice || selectedVariant.price)
      : item.price;
    const cartItemId = selectedVariant
      ? `${item.id}_${selectedVariant.weight}`
      : item.id;

    setCart((prev) => {
      if (exactQty <= 0) {
        return prev.filter((i) => i.id !== cartItemId);
      }
      const clampedQty = Math.min(5, exactQty);
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: clampedQty } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          id: cartItemId,
          originalItemId: item.id,
          selectedVariant: selectedVariant || null,
          variant: variantWeight,
          price: variantPrice,
          quantity: clampedQty,
        },
      ];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null; // Deselected/removed from cart
            return { ...item, quantity: Math.min(5, newQty) }; // Max 5
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        company,
        categories,
        menuItems,
        loading,
        refreshMenu: loadData,
        cart,
        addToCart,
        setItemQuantity,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        customerDetails,
        setCustomerDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
