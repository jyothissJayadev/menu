// src/screens/MenuManagementScreen.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { ItemFormModal } from '../components/ItemFormModal';

export const MenuManagementScreen = () => {
  const { categories, items, deleteItem, toggleItemAvailability } = useApp();
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // If a category was deleted/pruned and was currently selected, reset filter to 'all'
  useEffect(() => {
    if (selectedCat !== 'all') {
      const exists = categories.some((c) => c._id === selectedCat);
      if (!exists) {
        setSelectedCat('all');
      }
    }
  }, [categories, selectedCat]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCat !== 'all' && item.categoryId !== selectedCat) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, selectedCat, searchQuery]);

  const handleDelete = (item) => {
    const doDelete = () => {
      deleteItem(item._id);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${item.name}"? If this is the only item in its category, the category will also be removed automatically.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Menu Item',
        `Are you sure you want to remove "${item.name}"? If this is the only item in its category, the category will also be removed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c._id === catId);
    return cat ? cat.name : 'Cake';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Menu & Cake Catalog"
        subtitle="Add, edit, or toggle availability for the web menu"
      />

      {/* Top Search & Add Button Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cakes, pastries, drinks..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={COLORS.textWhite} />
          <Text style={styles.addBtnText}>Add Cake</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Filter Carousel */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          <TouchableOpacity
            style={[styles.catPill, selectedCat === 'all' && styles.catPillActive]}
            onPress={() => setSelectedCat('all')}
          >
            <Text style={[styles.catPillText, selectedCat === 'all' && styles.catPillTextActive]}>
              All ({items.length})
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat._id).length;
            const isSelected = selectedCat === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[styles.catPill, isSelected && styles.catPillActive]}
                onPress={() => setSelectedCat(cat._id)}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {cat.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, !item.available && styles.itemCardDisabled]}>
            <View style={styles.cardMain}>
              {/* Image Thumbnail (100% veg option badge removed) */}
              <View style={styles.imageWrapper}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Ionicons name="gift-outline" size={30} color={COLORS.primary} />
                  </View>
                )}
              </View>

              {/* Item Details */}
              <View style={styles.itemInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.categoryBadge}>{getCategoryName(item.categoryId)}</Text>
                  {item.offer && (
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>OFFER</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>

                {item.description ? (
                  <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                {/* Pricing */}
                <View style={styles.pricingRow}>
                  {item.offer && item.offerPrice ? (
                    <>
                      <Text style={styles.activePrice}>₹{item.offerPrice}</Text>
                      <Text style={styles.originalPrice}>₹{item.price}</Text>
                    </>
                  ) : (
                    <Text style={styles.activePrice}>₹{item.price}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Bottom Controls Bar */}
            <View style={styles.cardControls}>
              {/* Quick Availability Switch */}
              <View style={styles.stockToggle}>
                <Switch
                  value={item.available}
                  onValueChange={() => toggleItemAvailability(item._id)}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                  thumbColor={item.available ? COLORS.primary : '#ccc'}
                  style={Platform.OS === 'web' ? { transform: [{ scale: 0.8 }] } : { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <Text
                  style={[
                    styles.stockStatusText,
                    { color: item.available ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {item.available ? 'In Stock (Live)' : 'Sold Out'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                >
                  <Ionicons name="create-outline" size={14} color={COLORS.primaryDark} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Menu Items Found</Text>
            <Text style={styles.emptySubtitle}>
              Try changing categories or adding a new cake to the menu.
            </Text>
          </View>
        }
      />

      {/* Add / Edit Cake Modal */}
      <ItemFormModal
        visible={isModalOpen}
        initialItem={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 8,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
    ...SHADOWS.sm,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  categoriesSection: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catPillTextActive: {
    color: COLORS.textWhite,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  itemCardDisabled: {
    opacity: 0.72,
    backgroundColor: '#FDFBF9',
  },
  cardMain: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  itemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  offerBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  itemDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  activePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  cardControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 10,
  },
  stockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerLight,
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
