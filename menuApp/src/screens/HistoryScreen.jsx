// src/screens/HistoryScreen.jsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { OrderDetailModal } from '../components/OrderDetailModal';

export const HistoryScreen = () => {
  const { orders, customers } = useApp();
  const [activeSegment, setActiveSegment] = useState('orders'); // 'orders' | 'customers'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusSubFilter, setStatusSubFilter] = useState('all'); // 'all', 'delivered', 'cancelled'

  // Past orders (delivered or cancelled, or all with dates)
  const pastOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusSubFilter === 'delivered' && order.status !== 'delivered') return false;
      if (statusSubFilter === 'cancelled' && order.status !== 'cancelled') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.orderNo.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, statusSubFilter, searchQuery]);

  // Customers filtered
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, searchQuery]);

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        if (Platform.OS === 'web') {
          window.alert(`Customer phone: ${phone}`);
        } else {
          Alert.alert('Phone Number', phone);
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="History & Customers"
        subtitle="Search past order archives and recurring customer data"
      />

      {/* Segmented Controller */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'orders' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('orders')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="archive-outline"
            size={16}
            color={activeSegment === 'orders' ? COLORS.primaryDark : COLORS.textSecondary}
          />
          <Text
            style={[styles.segmentText, activeSegment === 'orders' && styles.segmentTextActive]}
          >
            Order Archives ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'customers' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('customers')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeSegment === 'customers' ? COLORS.primaryDark : COLORS.textSecondary}
          />
          <Text
            style={[styles.segmentText, activeSegment === 'customers' && styles.segmentTextActive]}
          >
            Customer Data ({customers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeSegment === 'orders'
                ? 'Search past order #, customer, phone...'
                : 'Search customer directory by name or phone...'
            }
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
      </View>

      {/* ORDERS ARCHIVE TAB */}
      {activeSegment === 'orders' ? (
        <>
          {/* Subfilter pills */}
          <View style={styles.filterPillsRow}>
            {['all', 'delivered', 'cancelled'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.filterPill,
                  statusSubFilter === st && styles.filterPillActive,
                ]}
                onPress={() => setStatusSubFilter(st)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    statusSubFilter === st && styles.filterPillTextActive,
                  ]}
                >
                  {st === 'all' ? 'All Completed / Records' : st.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={pastOrders}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyCard}
                activeOpacity={0.85}
                onPress={() => setSelectedOrder(item)}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <View style={styles.dailyBadge}>
                        <Text style={styles.dailyBadgeText}>Order #{item.dailyOrderNo || '1'}</Text>
                      </View>
                      <Text style={styles.orderNo}>{item.orderNo}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(item.startTime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      •{' '}
                      {new Date(item.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <StatusBadge status={item.status} size="small" />
                </View>

                <View style={styles.customerBrief}>
                  <Ionicons name="person" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.tableText}>{item.table || 'Takeaway'}</Text>
                </View>

                {/* Items summary */}
                <Text style={styles.itemsSummary} numberOfLines={1}>
                  {item.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.amountText}>₹{item.total}</Text>
                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>View Receipt</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="file-tray-outline" size={44} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>No Archives Found</Text>
                <Text style={styles.emptySubtitle}>No past orders match your search criteria.</Text>
              </View>
            }
          />
        </>
      ) : (
        /* CUSTOMERS DIRECTORY TAB */
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <View style={styles.customerCardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.custName}>{item.name}</Text>
                  <Text style={styles.custPhone}>{item.phone}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callIconBtn}
                  onPress={() => handleCall(item.phone)}
                >
                  <Ionicons name="call" size={16} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>

              <View style={styles.customerStatsRow}>
                <View style={styles.custStatItem}>
                  <Text style={styles.custStatLabel}>Orders</Text>
                  <Text style={styles.custStatValue}>{item.totalOrders}</Text>
                </View>
                <View style={styles.custStatDivider} />
                <View style={styles.custStatItem}>
                  <Text style={styles.custStatLabel}>Total Spent</Text>
                  <Text style={styles.custStatValue}>₹{item.totalSpend.toLocaleString()}</Text>
                </View>
                <View style={styles.custStatDivider} />
                <View style={styles.custStatItem}>
                  <Text style={styles.custStatLabel}>Last Order</Text>
                  <Text style={styles.custStatValueSmall}>{item.lastOrderDate}</Text>
                </View>
              </View>

              {item.favoriteItem && (
                <View style={styles.favoriteBadge}>
                  <Ionicons name="heart" size={12} color="#E11D48" />
                  <Text style={styles.favoriteText}>
                    Favorite: <Text style={{ fontWeight: '700' }}>{item.favoriteItem}</Text>
                  </Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Customers Found</Text>
              <Text style={styles.emptySubtitle}>No customer profiles match your search.</Text>
            </View>
          }
        />
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        visible={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchBar: {
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
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterPill: {
    backgroundColor: COLORS.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.primaryDark,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  dailyBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dailyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
  orderNo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
  },
  customerBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  bullet: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  tableText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  itemsSummary: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  customerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  custName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  custPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  callIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  custStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  custStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  custStatLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  custStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  custStatValueSmall: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  favoriteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
    backgroundColor: '#FFF1F2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  favoriteText: {
    fontSize: 11,
    color: '#BE123C',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
