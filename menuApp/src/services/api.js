// src/services/api.js
import { Platform } from 'react-native';

// For web and iOS localhost works; Android emulator uses 10.0.2.2
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api';

/**
 * Fetch registered companies (or Cake Shop)
 */
export async function getCompany() {
  try {
    const res = await fetch(`${API_BASE_URL}/companies`);
    if (!res.ok) throw new Error('Failed to fetch companies');
    const companies = await res.json();
    return companies[0] || null;
  } catch (err) {
    console.warn('API getCompany error:', err.message);
    return null;
  }
}

/**
 * Fetch menu items and categories
 * all=true ensures staff receives all items including unavailable/sold-out
 */
export async function getMenu(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/menu?all=true`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    return await res.json();
  } catch (err) {
    console.warn('API getMenu error:', err.message);
    return null;
  }
}

/**
 * Fetch live orders for kitchen staff
 */
export async function getOrders(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.warn('API getOrders error:', err.message);
    return null;
  }
}

/**
 * Update order status (advance or revert)
 */
export async function updateOrderStatus(companyId, orderId, status) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/companies/${companyId}/orders/${orderId}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  } catch (err) {
    console.warn('API updateOrderStatus error:', err.message);
    return null;
  }
}

/**
 * Create a new cake item
 */
export async function createMenuItem(companyId, itemData) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/menu/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return await res.json();
  } catch (err) {
    console.warn('API createMenuItem error:', err.message);
    return null;
  }
}

/**
 * Update a cake item (e.g. stock toggle, price edit)
 */
export async function updateMenuItem(companyId, itemId, updates) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/companies/${companyId}/menu/items/${itemId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }
    );
    if (!res.ok) throw new Error('Failed to update menu item');
    return await res.json();
  } catch (err) {
    console.warn('API updateMenuItem error:', err.message);
    return null;
  }
}

/**
 * Delete a cake item
 */
export async function deleteMenuItem(companyId, itemId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/companies/${companyId}/menu/items/${itemId}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok) throw new Error('Failed to delete menu item');
    return await res.json();
  } catch (err) {
    console.warn('API deleteMenuItem error:', err.message);
    return null;
  }
}

/**
 * Create a new order (e.g. from app testing or staff manual entry)
 */
export async function createOrder(companyId, orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return await res.json();
  } catch (err) {
    console.warn('API createOrder error:', err.message);
    return null;
  }
}

/**
 * Create category
 */
export async function createCategory(companyId, name) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/companies/${companyId}/menu/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }
    );
    if (!res.ok) throw new Error('Failed to create category');
    return await res.json();
  } catch (err) {
    console.warn('API createCategory error:', err.message);
    return null;
  }
}

/**
 * Reorder categories by submitting updated array of category IDs
 */
export async function reorderCategories(companyId, orderedIds) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/companies/${companyId}/menu/categories/reorder`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      }
    );
    if (!res.ok) throw new Error('Failed to reorder categories');
    return await res.json();
  } catch (err) {
    console.warn('API reorderCategories error:', err.message);
    return null;
  }
}

/**
 * Upload an image file (e.g. from gallery or camera) to Cloudinary / cloud storage
 */
export async function uploadImage(fileUri, fileName = 'cake.jpg', mimeType = 'image/jpeg') {
  try {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      if (fileUri.startsWith('data:') || fileUri.startsWith('blob:')) {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('image', blob, fileName);
      } else {
        return fileUri;
      }
    } else {
      formData.append('image', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });
    }

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url || fileUri;
  } catch (err) {
    console.warn('API uploadImage error:', err.message);
    return fileUri;
  }
}
