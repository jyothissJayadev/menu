// src/components/ItemFormModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const ItemFormModal = ({ visible, onClose, initialItem = null }) => {
  const { categories, items, addItem, updateItem, reorderCategories } = useApp();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [hasOffer, setHasOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState('');

  // Dropdown & New Category State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [assignedNewCategoryName, setAssignedNewCategoryName] = useState(null);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setCategoryId(initialItem.categoryId || (categories[0] ? categories[0]._id : ''));
      setDescription(initialItem.description || '');
      setPrice(String(initialItem.price || ''));
      setHasOffer(Boolean(initialItem.offer));
      setOfferPrice(initialItem.offerPrice ? String(initialItem.offerPrice) : '');
      setAvailable(initialItem.available !== undefined ? initialItem.available : true);
      setImage(initialItem.image || '');
    } else {
      // Reset for new item
      setName('');
      setCategoryId(categories[0] ? categories[0]._id : '');
      setDescription('');
      setPrice('');
      setHasOffer(false);
      setOfferPrice('');
      setAvailable(true);
      setImage('');
    }
    setIsDropdownOpen(false);
    setIsAddingNewCat(false);
    setNewCatNameInput('');
    setAssignedNewCategoryName(null);
  }, [initialItem, visible, categories]);

  // Sort categories by sequential position
  const sortedCategories = React.useMemo(() => {
    return [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [categories]);

  // Reorder categories up or down
  const handleMoveCategory = (index, delta) => {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= sortedCategories.length) return;

    const reordered = [...sortedCategories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    reorderCategories(reordered);
  };

  // Handle image picking from phone storage
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Permission to access your photo library is required to select a cake image.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Permission Needed', msg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  // Handle taking photo with phone camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const msg = 'Camera permission is required to photograph your baked cake.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Camera Permission Needed', msg);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  // Assign a newly created category name to this item
  // Only officially created if the user completes saving the item!
  const handleAssignNewCategory = () => {
    const trimmed = newCatNameInput.trim();
    if (!trimmed) {
      const msg = 'Please enter a category name.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    setAssignedNewCategoryName(trimmed);
    setCategoryId(''); // Handled via newCategoryName on save
    setIsAddingNewCat(false);
    setIsDropdownOpen(false);
    setNewCatNameInput('');
  };

  const handleClose = () => {
    setAssignedNewCategoryName(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      const msg = 'Please enter the cake / item name';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Missing Field', msg);
      return;
    }
    if (!price || isNaN(Number(price))) {
      const msg = 'Please enter a valid price';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Invalid Price', msg);
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId: categoryId || (categories[0] ? categories[0]._id : 'cat-1'),
      description: description.trim(),
      price: Number(price),
      offer: hasOffer,
      offerPrice: hasOffer && offerPrice ? Number(offerPrice) : null,
      available,
      image: image.trim() || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
    };

    if (initialItem) {
      updateItem(initialItem._id, payload, assignedNewCategoryName);
    } else {
      addItem(payload, assignedNewCategoryName);
    }

    handleClose();
  };

  const selectedCategoryObj = categories.find((c) => c._id === categoryId);
  const displayCategoryLabel = assignedNewCategoryName
    ? `${assignedNewCategoryName} (New)`
    : selectedCategoryObj
    ? selectedCategoryObj.name
    : 'Select a Category';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>
                {initialItem ? 'Edit Cake / Item' : 'Add New Cake'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Syncs instantly with customer web menu
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Cake Name */}
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Belgian Truffle Chocolate Cake"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
            />

            {/* Category Dropdown */}
            <Text style={styles.inputLabel}>Category *</Text>
            <TouchableOpacity
              style={styles.dropdownHeader}
              activeOpacity={0.8}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <View style={styles.dropdownSelectedRow}>
                <Ionicons name="pricetag-outline" size={16} color={COLORS.primaryDark} />
                <Text style={styles.dropdownSelectedText}>{displayCategoryLabel}</Text>
              </View>
              <Ionicons
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            {/* Dropdown Options Menu */}
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                  {sortedCategories.map((cat, idx) => {
                    const isSelected = !assignedNewCategoryName && categoryId === cat._id;
                    return (
                      <TouchableOpacity
                        key={cat._id}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setCategoryId(cat._id);
                          setAssignedNewCategoryName(null);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.dropdownItemPos}>#{idx + 1}</Text>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              isSelected && styles.dropdownItemTextActive,
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Inline Add New Category Option */}
                {!isAddingNewCat ? (
                  <TouchableOpacity
                    style={styles.addCatRow}
                    onPress={() => setIsAddingNewCat(true)}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.addCatRowText}>+ Add New Category</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.newCatInputBox}>
                    <TextInput
                      style={styles.newCatInput}
                      placeholder="Enter new category name..."
                      placeholderTextColor={COLORS.textLight}
                      value={newCatNameInput}
                      onChangeText={setNewCatNameInput}
                      autoFocus
                    />
                    <View style={styles.newCatActions}>
                      <TouchableOpacity
                        style={styles.newCatCancelBtn}
                        onPress={() => {
                          setIsAddingNewCat(false);
                          setNewCatNameInput('');
                        }}
                      >
                        <Text style={styles.newCatCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.newCatConfirmBtn}
                        onPress={handleAssignNewCategory}
                      >
                        <Text style={styles.newCatConfirmText}>Assign to Item</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Category Display Order & Reordering Section */}
            <View style={styles.catOrderCard}>
              <View style={styles.catOrderCardHeader}>
                <View style={styles.catOrderTitleRow}>
                  <Ionicons name="swap-vertical" size={15} color={COLORS.primaryDark} />
                  <Text style={styles.catOrderCardTitle}>Category Display Order</Text>
                </View>
                <Text style={styles.catOrderCardSubtitle}>
                  Order determines appearance in All section & web menu. Use ▲ and ▼ to reorder.
                </Text>
              </View>

              <View style={styles.catOrderList}>
                {sortedCategories.map((cat, idx) => {
                  const isSelected = !assignedNewCategoryName && categoryId === cat._id;
                  const count = items ? items.filter((i) => i.categoryId === cat._id).length : 0;
                  const isFirst = idx === 0;
                  const isLast = idx === sortedCategories.length - 1;

                  return (
                    <View
                      key={cat._id}
                      style={[
                        styles.catOrderRow,
                        isSelected && styles.catOrderRowSelected,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.catOrderSelectArea}
                        activeOpacity={0.7}
                        onPress={() => {
                          setCategoryId(cat._id);
                          setAssignedNewCategoryName(null);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <View
                          style={[
                            styles.catOrderPosBadge,
                            isSelected && styles.catOrderPosBadgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.catOrderPosText,
                              isSelected && styles.catOrderPosTextSelected,
                            ]}
                          >
                            #{idx + 1}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.catOrderName,
                                isSelected && styles.catOrderNameSelected,
                              ]}
                            >
                              {cat.name}
                            </Text>
                            {isSelected && (
                              <View style={styles.catOrderActiveTag}>
                                <Ionicons name="checkmark" size={11} color={COLORS.primary} />
                                <Text style={styles.catOrderActiveTagText}>Selected</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.catOrderItemCount}>
                            {count} {count === 1 ? 'cake' : 'cakes'}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.catOrderBtnGroup}>
                        <TouchableOpacity
                          style={[styles.catArrowBtn, isFirst && styles.catArrowBtnDisabled]}
                          disabled={isFirst}
                          onPress={() => handleMoveCategory(idx, -1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons
                            name="chevron-up"
                            size={16}
                            color={isFirst ? COLORS.border : COLORS.primaryDark}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.catArrowBtn, isLast && styles.catArrowBtnDisabled]}
                          disabled={isLast}
                          onPress={() => handleMoveCategory(idx, 1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons
                            name="chevron-down"
                            size={16}
                            color={isLast ? COLORS.border : COLORS.primaryDark}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Price & Offer Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Price (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 650"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Offer Price (₹)</Text>
                <TextInput
                  style={[styles.textInput, !hasOffer && styles.inputDisabled]}
                  placeholder="e.g. 550"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  editable={hasOffer}
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                />
              </View>
            </View>

            {/* Offer Toggle Switch */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Promotional Offer Active</Text>
                <Text style={styles.switchSubtitle}>Show discounted price on web menu</Text>
              </View>
              <Switch
                value={hasOffer}
                onValueChange={setHasOffer}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={hasOffer ? COLORS.primary : '#ccc'}
              />
            </View>

            {/* Availability Toggle */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>In Stock / Available</Text>
                <Text style={styles.switchSubtitle}>Toggle off when sold out</Text>
              </View>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: COLORS.border, true: '#D1FAE5' }}
                thumbColor={available ? COLORS.success : '#ccc'}
              />
            </View>

            {/* Description */}
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Flavor notes, sponge type, custom frosting info..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Upload Directly From Phone */}
            <Text style={styles.inputLabel}>Cake Image (Upload from Phone)</Text>
            <View style={styles.uploadSection}>
              {image ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImage('')}
                  >
                    <Ionicons name="trash" size={14} color={COLORS.textWhite} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadEmptyState}>
                  <Ionicons name="images-outline" size={36} color={COLORS.textLight} />
                  <Text style={styles.uploadPrompt}>No image selected yet</Text>
                  <Text style={styles.uploadSubPrompt}>
                    Upload directly from your phone gallery or snap a photo
                  </Text>
                </View>
              )}

              {/* Upload Buttons */}
              <View style={styles.uploadBtnRow}>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                >
                  <Ionicons name="albums-outline" size={16} color={COLORS.primaryDark} />
                  <Text style={styles.uploadBtnText}>Choose from Phone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={16} color={COLORS.primaryDark} />
                  <Text style={styles.uploadBtnText}>Take Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Optional URL input fallback */}
              <TextInput
                style={[styles.textInput, { marginTop: 8, fontSize: 11, paddingVertical: 6 }]}
                placeholder="Or paste online image URL"
                placeholderTextColor={COLORS.textLight}
                value={image}
                onChangeText={setImage}
              />
            </View>
          </ScrollView>

          {/* Footer Save & Cancel Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.textWhite} />
              <Text style={styles.saveBtnText}>
                {initialItem ? 'Update Item' : 'Add to Menu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownMenu: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dropdownItemPos: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownItemText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  addCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFDF9',
    gap: 8,
  },
  addCatRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  newCatInputBox: {
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  newCatInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  newCatActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  newCatCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceAlt,
  },
  newCatCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  newCatConfirmBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  newCatConfirmText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  catOrderCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  catOrderCardHeader: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
    backgroundColor: '#FEF9EE',
  },
  catOrderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catOrderCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  catOrderCardSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  catOrderList: {
    padding: 6,
    gap: 4,
  },
  catOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  catOrderRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  catOrderSelectArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catOrderPosBadge: {
    width: 26,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catOrderPosBadgeSelected: {
    backgroundColor: COLORS.primaryDark,
  },
  catOrderPosText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  catOrderPosTextSelected: {
    color: COLORS.textWhite,
  },
  catOrderName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catOrderNameSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  catOrderActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  catOrderActiveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  catOrderItemCount: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 1,
  },
  catOrderBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catArrowBtnDisabled: {
    opacity: 0.35,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  uploadSection: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  previewContainer: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  uploadPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  uploadSubPrompt: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  uploadBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 12,
  },
  cancelBtn: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 6,
    ...SHADOWS.sm,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
});
