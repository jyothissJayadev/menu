// src/context/AppContext.js
import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
} from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');

  // --- ORDER ACTIONS ---

  /**
   * Updates order status to next stage:
   * pending -> cooking -> completed -> delivered (or explicit status)
   */
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;

        const updated = { ...order, status: newStatus };

        // If completed or delivered, mark endTime and duration
        if (newStatus === 'completed' || newStatus === 'delivered') {
          if (!updated.endTime) {
            updated.endTime = new Date().toISOString();
            const startMs = new Date(updated.startTime).getTime();
            const endMs = new Date(updated.endTime).getTime();
            updated.durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
          }
        }
        return updated;
      })
    );
  };

  /**
   * Cancel an order
   */
  const cancelOrder = (orderId, reason = 'Cancelled by shop') => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId
          ? { ...order, status: 'cancelled', cancelReason: reason }
          : order
      )
    );
  };

  /**
   * Simulate a new incoming customer order from the Web Menu
   * Useful for testing and interactive demo
   */
  const simulateIncomingOrder = () => {
    const randomItemsPool = [
      {
        itemId: 'item-101',
        name: 'Belgian Truffle Chocolate Cake (1kg)',
        qty: 1,
        price: 750,
        addons: ['Golden Birthday Candle'],
      },
      {
        itemId: 'item-103',
        name: 'New York Baked Blueberry Cheesecake',
        qty: 1,
        price: 280,
        addons: [],
      },
      {
        itemId: 'item-105',
        name: 'French Butter Croissant',
        qty: 2,
        price: 140,
        addons: ['Extra Butter'],
      },
      {
        itemId: 'item-107',
        name: 'Iced Hazelnut Mocha Latte',
        qty: 1,
        price: 210,
        addons: [],
      },
    ];

    const randomPick = randomItemsPool.slice(0, Math.floor(Math.random() * 2) + 1);
    const totalCalc = randomPick.reduce((sum, item) => sum + item.price * item.qty, 0);

    const names = ['Kavita Rao', 'Siddharth Sen', 'Divya Menon', 'Rahul Kapoor', 'Tanya Bansal'];
    const selectedName = names[Math.floor(Math.random() * names.length)];
    const randomNo = String(orders.length + 1).padStart(3, '0');

    const newOrder = {
      _id: `ord-${Date.now()}`,
      orderNo: `ORD-20261114-${randomNo}`,
      customerName: selectedName,
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      table: Math.random() > 0.5 ? `Table ${Math.floor(Math.random() * 6) + 1}` : 'Takeaway',
      status: 'pending',
      total: totalCalc,
      startTime: new Date().toISOString(),
      notes: 'New live web order! Please confirm quickly.',
      items: randomPick,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // --- MENU ITEM ACTIONS ---

  /**
   * Add a new cake/item to the menu
   */
  const addItem = (itemData) => {
    const newItem = {
      _id: `item-${Date.now()}`,
      categoryId: itemData.categoryId || categories[0]._id,
      name: itemData.name,
      description: itemData.description || '',
      price: Number(itemData.price) || 0,
      offer: Boolean(itemData.offer),
      offerPrice: itemData.offer ? Number(itemData.offerPrice) || null : null,
      veg: itemData.veg !== undefined ? Boolean(itemData.veg) : true,
      available: itemData.available !== undefined ? Boolean(itemData.available) : true,
      image: itemData.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
      timing: [],
    };
    setItems((prev) => [newItem, ...prev]);
  };

  /**
   * Update an existing menu item
   */
  const updateItem = (itemId, updatedFields) => {
    setItems((prev) =>
      prev.map((it) => (it._id === itemId ? { ...it, ...updatedFields } : it))
    );
  };

  /**
   * Delete an item from the menu
   */
  const deleteItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it._id !== itemId));
  };

  /**
   * Toggle availability (in stock vs out of stock)
   */
  const toggleItemAvailability = (itemId) => {
    setItems((prev) =>
      prev.map((it) =>
        it._id === itemId ? { ...it, available: !it.available } : it
      )
    );
  };

  /**
   * Add a new category
   */
  const addCategory = (name, icon = 'bookmark') => {
    const newCat = {
      _id: `cat-${Date.now()}`,
      name,
      icon,
      position: categories.length + 1,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // --- COMPUTED ANALYTICS ---
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRev = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const cookingCount = orders.filter((o) => o.status === 'cooking').length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

    const completedOrDelivered = orders.filter(
      (o) => (o.status === 'completed' || o.status === 'delivered') && o.durationMinutes
    );
    const avgDuration =
      completedOrDelivered.length > 0
        ? Math.round(
            completedOrDelivered.reduce((sum, o) => sum + o.durationMinutes, 0) /
              completedOrDelivered.length
          )
        : 22;

    const aov = activeOrders.length > 0 ? Math.round(totalRev / activeOrders.length) : 0;

    return {
      todayRevenue: totalRev,
      totalOrdersToday: orders.length,
      pendingCount,
      cookingCount,
      completedCount,
      deliveredCount,
      cancelledCount,
      averageOrderValue: aov,
      avgPrepTimeMinutes: avgDuration,
    };
  }, [orders]);

  const value = {
    categories,
    items,
    orders,
    customers,
    isShopOpen,
    setIsShopOpen,
    activeStatusFilter,
    setActiveStatusFilter,
    updateOrderStatus,
    cancelOrder,
    simulateIncomingOrder,
    addItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    addCategory,
    stats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
