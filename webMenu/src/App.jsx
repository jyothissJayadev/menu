// webMenu/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { MenuPage } from "./pages/MenuPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderTrackingPage } from "./pages/OrderTrackingPage";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Menu Page with Sectioned Categories & Floating Cart Bar */}
          <Route path="/" element={<MenuPage />} />

          {/* Dedicated Cart Review Page */}
          <Route path="/cart" element={<CartPage />} />

          {/* Dedicated Customer Checkout Details Page */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Dedicated Live Order Tracking Page (Persists Across Page Reloads) */}
          <Route path="/order/:orderId" element={<OrderTrackingPage />} />

          {/* Fallback to Menu */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
