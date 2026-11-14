// src/components/Header.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { PhoneNotch } from './PhoneNotch';

export const Header = ({ title = 'Cake Kitchen Hub', subtitle }) => {
  const { isShopOpen, setIsShopOpen, stats, simulateIncomingOrder } = useApp();

  return (
    <View style={styles.headerWrapper}>
      {/* Phone Notch & Status Bar */}
      <PhoneNotch />

      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="gift" size={20} color={COLORS.surface} />
            </View>
            <View>
              <Text style={styles.brandName}>Sweet Delights</Text>
              <Text style={styles.brandTagline}>Cake Studio & Kitchen</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            {/* Simulate Order Button for Quick Test */}
            <TouchableOpacity
              style={styles.testOrderButton}
              onPress={() => simulateIncomingOrder()}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={14} color={COLORS.primaryDark} />
              <Text style={styles.testOrderText}>+ Test Order</Text>
            </TouchableOpacity>

            {/* Shop Open / Closed Toggle */}
            <View style={styles.statusToggleContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isShopOpen ? COLORS.success : COLORS.danger },
                ]}
              />
              <Text style={styles.statusLabel}>{isShopOpen ? 'Open' : 'Paused'}</Text>
              <Switch
                value={isShopOpen}
                onValueChange={setIsShopOpen}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={isShopOpen ? COLORS.primary : '#ccc'}
                style={Platform.OS === 'web' ? { transform: [{ scale: 0.8 }] } : { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
        </View>

        {/* Screen Title Row */}
        {title && (
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>{title}</Text>
            {stats.pendingCount > 0 && (
              <View style={styles.pendingBadge}>
                <Ionicons name="notifications" size={12} color={COLORS.textWhite} />
                <Text style={styles.pendingBadgeText}>
                  {stats.pendingCount} New Pending
                </Text>
              </View>
            )}
          </View>
        )}
        {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOWS.sm,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  testOrderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
});
