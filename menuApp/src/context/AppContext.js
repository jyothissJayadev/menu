// src/context/AppContext.js
import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
} from '../data/initialData';
import * as api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const companyRef = useRef(null);

  // 1. Initial Load: Connect to backend and fetch company, menu & orders
  useEffect(() => {
    let isMounted = true;

    async function initBackend() {
      try {
        const comp = await api.getCompany();
        if (comp && isMounted) {
          setCompany(comp);
          companyRef.current = comp;
          setIsLiveConnected(true);

          // Fetch Menu
          const menuData = await api.getMenu(comp._id);
          if (menuData && isMounted) {
            if (menuData.categories && menuData.categories.length > 0) {
              setCategories(menuData.categories);
            }
            if (menuData.allItems && menuData.allItems.length > 0) {
              setItems(menuData.allItems);
            }
          }

          // Fetch Orders
          const liveOrders = await api.getOrders(comp._id);
          if (liveOrders && Array.isArray(liveOrders) && liveOrders.length > 0 && isMounted) {
            setOrders(liveOrders);
          }
        }
      } catch (err) {
        console.warn('Backend init fallback to local store:', err);
      }
    }

    initBackend();

    // 2. Real-time Polling: Check for new customer orders from web menu every 3 seconds
    const pollInterval = setInterval(async () => {
      const activeComp = companyRef.current;
      if (activeComp && activeComp._id) {
        try {
          const latestOrders = await api.getOrders(activeComp._id);
          if (latestOrders && Array.isArray(latestOrders) && isMounted) {
            setOrders(latestOrders);
          }
        } catch (_) {}
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // --- ORDER ACTIONS ---

  /**
   * Advances order status to next stage
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic local update
    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;

        const updated = { ...order, status: newStatus };

        if (newStatus === 'completed' || newStatus === 'delivered' || newStatus === 'served') {
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

    // Sync with backend API
    if (company && company._id) {
      await api.updateOrderStatus(company._id, orderId, newStatus);
    }
  };

  /**
   * Reverts order status backwards
   */
  const revertOrderStatus = async (orderId) => {
    let nextStatus = 'pending';

    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;

        let prevStatus = order.status;
        const updated = { ...order };

        if (order.status === 'cooking' || order.status === 'preparing') {
          prevStatus = 'pending';
        } else if (order.status === 'completed' || order.status === 'served') {
          prevStatus = 'cooking';
          delete updated.endTime;
          delete updated.durationMinutes;
        } else if (order.status === 'delivered') {
          prevStatus = 'completed';
        } else if (order.status === 'cancelled') {
          prevStatus = 'pending';
          delete updated.cancelReason;
        }

        nextStatus = prevStatus;
        updated.status = prevStatus;
        return updated;
      })
    );

    // Sync with backend API
    if (company && company._id) {
      await api.updateOrderStatus(company._id, orderId, nextStatus);
    }
  };

  /**
   * Cancel an order
   */
  const cancelOrder = async (orderId, reason = 'Cancelled by shop') => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId
          ? { ...order, status: 'cancelled', cancelReason: reason }
          : order
      )
    );

    if (company && company._id) {
      await api.updateOrderStatus(company._id, orderId, 'cancelled');
    }
  };

  /**
   * Simulate a new incoming customer order from the Web Menu
   */
  const simulateIncomingOrder = async () => {
    const randomItemsPool = items.length > 0 ? items : INITIAL_ITEMS;
    const randomPick = randomItemsPool.slice(0, Math.floor(Math.random() * 2) + 1);
    const totalCalc = randomPick.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

    const names = ['Kavita Rao', 'Siddharth Sen', 'Divya Menon', 'Rahul Kapoor', 'Tanya Bansal'];
    const selectedName = names[Math.floor(Math.random() * names.length)];

    const maxOrderNum = orders.reduce(
      (max, o) => Math.max(max, o.orderNumber || 100),
      100
    );
    const nextOrderNumber = maxOrderNum + 1;
    const uniqueOrderNo = `ORD-${nextOrderNumber}`;

    const orderPayload = {
      orderNumber: nextOrderNumber,
      orderNo: uniqueOrderNo,
      name: selectedName,
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      table: Math.random() > 0.5 ? `Table ${Math.floor(Math.random() * 6) + 1}` : 'Takeaway',
      notes: 'Test order generated from staff dashboard.',
      items: randomPick.map((it) => ({
        itemId: it._id,
        name: it.name,
        qty: 1,
        price: it.offer && it.offerPrice ? it.offerPrice : it.price,
        addons: [],
      })),
      total: totalCalc,
    };

    // If live connected, create in backend
    if (company && company._id) {
      try {
        const createdOrder = await api.createOrder(company._id, orderPayload);
        if (createdOrder) {
          setOrders((prev) => [createdOrder, ...prev]);
          return createdOrder;
        }
      } catch (_) {}
    }

    // Local fallback
    const localOrder = {
      _id: `ord-${Date.now()}`,
      ...orderPayload,
      status: 'pending',
      startTime: new Date().toISOString(),
    };
    setOrders((prev) => [localOrder, ...prev]);
    return localOrder;
  };

  /**
   * Create a new custom/manual order from staff dashboard
   */
  const createNewOrder = async (orderData) => {
    const totalCalc = (orderData.items || []).reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
      0
    );

    const maxOrderNum = orders.reduce(
      (max, o) => Math.max(max, o.orderNumber || 100),
      100
    );
    const nextOrderNumber = maxOrderNum + 1;
    const uniqueOrderNo = `ORD-${nextOrderNumber}`;

    const orderPayload = {
      orderNumber: nextOrderNumber,
      orderNo: uniqueOrderNo,
      name: orderData.name || orderData.customerName || 'In-Store Customer',
      customerName: orderData.name || orderData.customerName || 'In-Store Customer',
      phone: orderData.phone || '',
      table: orderData.table || 'Takeaway',
      notes: orderData.notes || '',
      items: orderData.items || [],
      total: totalCalc,
    };

    // If live connected, create in backend
    if (company && company._id) {
      try {
        const createdOrder = await api.createOrder(company._id, orderPayload);
        if (createdOrder) {
          setOrders((prev) => [createdOrder, ...prev]);
          return createdOrder;
        }
      } catch (err) {
        console.warn('Backend createOrder error:', err);
      }
    }

    // Local fallback
    const localOrder = {
      _id: `ord-${Date.now()}`,
      ...orderPayload,
      status: 'pending',
      startTime: new Date().toISOString(),
    };
    setOrders((prev) => [localOrder, ...prev]);
    return localOrder;
  };

  // --- MENU ITEM & CATEGORY ACTIONS ---

  /**
   * Add a new cake/item to the menu
   */
  const addItem = async (itemData, newCategoryName = null) => {
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
      variants: Array.isArray(itemData.variants) ? itemData.variants : [],
      available: itemData.available !== undefined ? Boolean(itemData.available) : true,
      image: itemData.image || '',
      timing: [],
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);

    const activeCatIds = new Set(updatedItems.map((i) => String(i.categoryId)));
    setCategories(updatedCategories.filter((cat) => activeCatIds.has(String(cat._id))));

    // Sync with backend API
    if (company && company._id) {
      const backendCreated = await api.createMenuItem(company._id, {
        ...itemData,
        categoryId: targetCatId,
        categoryName: newCategoryName,
      });
      if (backendCreated) {
        // Refresh live menu from backend
        const freshMenu = await api.getMenu(company._id);
        if (freshMenu) {
          if (freshMenu.categories) setCategories(freshMenu.categories);
          if (freshMenu.allItems) setItems(freshMenu.allItems);
        }
      }
    }
  };

  /**
   * Update an existing menu item
   */
  const updateItem = async (itemId, updatedFields, newCategoryName = null) => {
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

    const activeCatIds = new Set(updatedItems.map((i) => String(i.categoryId)));
    setCategories(updatedCategories.filter((cat) => activeCatIds.has(String(cat._id))));

    // Sync with backend API
    if (company && company._id) {
      await api.updateMenuItem(company._id, itemId, {
        ...updatedFields,
        categoryId: targetCatId,
        categoryName: newCategoryName,
      });
    }
  };

  /**
   * Delete an item from the menu
   */
  const deleteItem = async (itemId) => {
    const updatedItems = items.filter((it) => it._id !== itemId);
    setItems(updatedItems);

    const activeCatIds = new Set(updatedItems.map((i) => String(i.categoryId)));
    setCategories((prevCats) => prevCats.filter((cat) => activeCatIds.has(String(cat._id))));

    // Sync with backend API
    if (company && company._id) {
      await api.deleteMenuItem(company._id, itemId);
    }
  };

  /**
   * Toggle availability (in stock vs out of stock)
   */
  const toggleItemAvailability = async (itemId) => {
    const targetItem = items.find((i) => i._id === itemId);
    const newAvailable = targetItem ? !targetItem.available : true;

    setItems((prev) =>
      prev.map((it) =>
        it._id === itemId ? { ...it, available: newAvailable } : it
      )
    );

    // Sync with backend API
    if (company && company._id) {
      await api.updateMenuItem(company._id, itemId, { available: newAvailable });
    }
  };

  /**
   * Reorder categories
   */
  const reorderCategories = async (newOrderedCategories) => {
    const withPositions = newOrderedCategories.map((cat, idx) => ({
      ...cat,
      position: idx + 1,
    }));
    setCategories(withPositions);

    if (company && company._id) {
      const orderedIds = withPositions.map((c) => c._id);
      await api.reorderCategories(company._id, orderedIds);
    }
  };

  // --- COMPUTED ANALYTICS ---
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRev = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const cookingCount = orders.filter((o) => o.status === 'cooking' || o.status === 'preparing').length;
    const completedCount = orders.filter((o) => o.status === 'completed' || o.status === 'served').length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

    const completedOrDelivered = orders.filter(
      (o) => (o.status === 'completed' || o.status === 'delivered' || o.status === 'served') && o.durationMinutes
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
    company,
    isLiveConnected,
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
    createNewOrder,
    addItem,
    updateItem,
    deleteItem,
    reorderCategories,
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
