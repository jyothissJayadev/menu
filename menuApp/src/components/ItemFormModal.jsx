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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { useApp } from '../context/AppContext';

const PRESET_CAKE_IMAGES = [
  { label: 'Chocolate', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60' },
  { label: 'Red Velvet', url: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&auto=format&fit=crop&q=60' },
  { label: 'Cheesecake', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60' },
  { label: 'Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60' },
  { label: 'Cupcakes', url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60' },
  { label: 'Coffee', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60' },
];

export const ItemFormModal = ({ visible, onClose, initialItem = null }) => {
  const { categories, addItem, updateItem } = useApp();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [hasOffer, setHasOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [veg, setVeg] = useState(true);
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState(PRESET_CAKE_IMAGES[0].url);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setCategoryId(initialItem.categoryId || (categories[0] ? categories[0]._id : ''));
      setDescription(initialItem.description || '');
      setPrice(String(initialItem.price || ''));
      setHasOffer(Boolean(initialItem.offer));
      setOfferPrice(initialItem.offerPrice ? String(initialItem.offerPrice) : '');
      setVeg(initialItem.veg !== undefined ? initialItem.veg : true);
      setAvailable(initialItem.available !== undefined ? initialItem.available : true);
      setImage(initialItem.image || PRESET_CAKE_IMAGES[0].url);
    } else {
      // Reset for new item
      setName('');
      setCategoryId(categories[0] ? categories[0]._id : '');
      setDescription('');
      setPrice('');
      setHasOffer(false);
      setOfferPrice('');
      setVeg(true);
      setAvailable(true);
      setImage(PRESET_CAKE_IMAGES[0].url);
    }
  }, [initialItem, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter the cake / item name');
      return;
    }
    if (!price || isNaN(Number(price))) {
      alert('Please enter a valid price');
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId,
      description: description.trim(),
      price: Number(price),
      offer: hasOffer,
      offerPrice: hasOffer && offerPrice ? Number(offerPrice) : null,
      veg,
      available,
      image,
    };

    if (initialItem) {
      updateItem(initialItem._id, payload);
    } else {
      addItem(payload);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>
                {initialItem ? 'Edit Cake / Item' : 'Add New Cake'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Syncs instantly with customer web menu
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Belgian Truffle Chocolate Cake"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
            />

            {/* Category Chips */}
            <Text style={styles.inputLabel}>Select Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catChips}>
              {categories.map((cat) => {
                const isSelected = categoryId === cat._id;
                return (
                  <TouchableOpacity
                    key={cat._id}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    onPress={() => setCategoryId(cat._id)}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

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
                <Text style={styles.switchSubtitle}>Show discounted price badge on web menu</Text>
              </View>
              <Switch
                value={hasOffer}
                onValueChange={setHasOffer}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={hasOffer ? COLORS.primary : '#ccc'}
              />
            </View>

            {/* Veg / Eggless & Available Toggles */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>
                  {veg ? '🌱 100% Eggless / Veg' : '🥚 Contains Egg / Non-Veg'}
                </Text>
                <Text style={styles.switchSubtitle}>Display green or red dietary badge</Text>
              </View>
              <Switch
                value={veg}
                onValueChange={setVeg}
                trackColor={{ false: COLORS.border, true: '#D1FAE5' }}
                thumbColor={veg ? COLORS.veg : COLORS.nonVeg}
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>In Stock / Available</Text>
                <Text style={styles.switchSubtitle}>Toggle to show sold out on web menu</Text>
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
              placeholder="Flavor notes, sponge type, frosting, allergen info..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Preset Image Selector */}
            <Text style={styles.inputLabel}>Cake Image Preset</Text>
            <View style={styles.imagePresetsWrapper}>
              {PRESET_CAKE_IMAGES.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.imagePresetPill,
                    image === img.url && styles.imagePresetPillActive,
                  ]}
                  onPress={() => setImage(img.url)}
                >
                  <Text
                    style={[
                      styles.imagePresetText,
                      image === img.url && styles.imagePresetTextActive,
                    ]}
                  >
                    {img.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.textInput, { marginTop: 6, fontSize: 12 }]}
              placeholder="Or enter custom image URL"
              placeholderTextColor={COLORS.textLight}
              value={image}
              onChangeText={setImage}
            />
          </ScrollView>

          {/* Save Button Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
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
  catChips: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  catChip: {
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catChipTextActive: {
    color: COLORS.textWhite,
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
  imagePresetsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  imagePresetPill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePresetPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  imagePresetText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  imagePresetTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
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
