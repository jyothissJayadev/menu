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
  const [items, setItems] = useState(INITIAL_ITEMS);

  // Only categories that currently have at least one item assigned exist in the app
  const [categories, setCategories] = useState(() => {
    const activeCatIds = new Set(INITIAL_ITEMS.map((i) => i.categoryId));
    return INITIAL_CATEGORIES.filter((c) => activeCatIds.has(c._id));
  });

  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');

  // --- ORDER ACTIONS ---

  /**
   * Advances order status to next stage:
   * pending -> cooking -> completed -> delivered
   */
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;

        const updated = { ...order, status: newStatus };

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
   * Reverts order status backwards:
   * cooking -> pending
   * completed -> cooking (clears completion timestamp & duration)
   * delivered -> completed
   * cancelled -> pending
   */
  const revertOrderStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;

        let prevStatus = order.status;
        const updated = { ...order };

        if (order.status === 'cooking') {
          prevStatus = 'pending';
        } else if (order.status === 'completed') {
          prevStatus = 'cooking';
          delete updated.endTime;
          delete updated.durationMinutes;
        } else if (order.status === 'delivered') {
          prevStatus = 'completed';
        } else if (order.status === 'cancelled') {
          prevStatus = 'pending';
          delete updated.cancelReason;
        }

        updated.status = prevStatus;
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
   * Strictly incremental order number (Order #1, #2, #3, #4...)
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

    // Strictly incremental order sequence
    const maxDailyNo = orders.reduce((max, o) => Math.max(max, o.dailyOrderNo || 0), 0);
    const nextDailyNo = maxDailyNo + 1;
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayKey = todayIso.replace(/-/g, '');
    const uniqueOrderNo = `ORD-${todayKey}-${nextDailyNo}`;

    const newOrder = {
      _id: `ord-${Date.now()}`,
      dailyOrderNo: nextDailyNo, // Strictly incremental order number
      orderDate: todayIso,
      orderNo: uniqueOrderNo,   // Unique date + incremental sequence
      customerName: selectedName,
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      table: Math.random() > 0.5 ? `Table ${Math.floor(Math.random() * 6) + 1}` : 'Takeaway',
      status: 'pending',
      total: totalCalc,
      startTime: new Date().toISOString(),
      notes: 'New live web order! Please confirm quickly.',
      items: randomPick.map((it) => ({
        ...it,
        orderIdRef: uniqueOrderNo,
        orderDate: todayIso,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // --- MENU ITEM & CATEGORY ACTIONS ---

  /**
   * Add a new cake/item to the menu.
   * If newCategoryName is provided, the category is created and linked to this item.
   * A category only exists if it has at least one item assigned; otherwise it is removed.
   */
  const addItem = (itemData, newCategoryName = null) => {
    let targetCatId = itemData.categoryId;
    let updatedCategories = [...categories];

    if (newCategoryName && newCategoryName.trim()) {
      const trimmed = newCategoryName.trim();
      let existing = updatedCategories.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (!existing) {
        existing = {
          _id: `cat-${Date.now()}`,
          name: trimmed,
          icon: 'gift',
          position: updatedCategories.length + 1,
        };
        updatedCategories.push(existing);
      }
      targetCatId = existing._id;
    }

    const newItem = {
      _id: `item-${Date.now()}`,
      categoryId: targetCatId,
      name: itemData.name,
      description: itemData.description || '',
      price: Number(itemData.price) || 0,
      offer: Boolean(itemData.offer),
      offerPrice: itemData.offer ? Number(itemData.offerPrice) || null : null,
      available: itemData.available !== undefined ? Boolean(itemData.available) : true,
      image: itemData.image || '',
      timing: [],
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);

    // Keep ONLY categories that have at least one item assigned
    const activeCatIds = new Set(updatedItems.map((i) => i.categoryId));
    setCategories(updatedCategories.filter((cat) => activeCatIds.has(cat._id)));
  };

  /**
   * Update an existing menu item.
   * If the item's category changes and its old category now has 0 items, that category is removed.
   */
  const updateItem = (itemId, updatedFields, newCategoryName = null) => {
    let targetCatId = updatedFields.categoryId;
    let updatedCategories = [...categories];

    if (newCategoryName && newCategoryName.trim()) {
      const trimmed = newCategoryName.trim();
      let existing = updatedCategories.find(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (!existing) {
        existing = {
          _id: `cat-${Date.now()}`,
          name: trimmed,
          icon: 'gift',
          position: updatedCategories.length + 1,
        };
        updatedCategories.push(existing);
      }
      targetCatId = existing._id;
    }

    const updatedItems = items.map((it) =>
      it._id === itemId ? { ...it, ...updatedFields, categoryId: targetCatId } : it
    );
    setItems(updatedItems);

    // Keep ONLY categories that have at least one item assigned
    const activeCatIds = new Set(updatedItems.map((i) => i.categoryId));
    setCategories(updatedCategories.filter((cat) => activeCatIds.has(cat._id)));
  };

  /**
   * Delete an item from the menu.
   * If its category now has 0 items linked, that category is automatically removed.
   */
  const deleteItem = (itemId) => {
    const updatedItems = items.filter((it) => it._id !== itemId);
    setItems(updatedItems);

    // Keep ONLY categories that have at least one item assigned
    const activeCatIds = new Set(updatedItems.map((i) => i.categoryId));
    setCategories((prevCats) => prevCats.filter((cat) => activeCatIds.has(cat._id)));
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
    revertOrderStatus,
    cancelOrder,
    simulateIncomingOrder,
    addItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
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
