// src/components/PhoneNotch.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

export const PhoneNotch = () => {
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'web' ? 10 : 8;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Left: Time */}
      <View style={styles.sideBlockLeft}>
        <Text style={styles.timeText}>{currentTime || '9:41'}</Text>
      </View>

      {/* Center: Dynamic Island Notch Cutout */}
      <View style={styles.notchWrapper}>
        <View style={styles.notchPill}>
          <View style={styles.cameraCutout} />
          <View style={styles.sensorDot} />
        </View>
      </View>

      {/* Right: System Icons (Cellular, Wifi, Battery) */}
      <View style={styles.sideBlockRight}>
        <Ionicons name="cellular" size={13} color={COLORS.textPrimary} style={styles.sysIcon} />
        <Ionicons name="wifi" size={13} color={COLORS.textPrimary} style={styles.sysIcon} />
        <View style={styles.batteryWrapper}>
          <View style={styles.batteryBody}>
            <View style={styles.batteryFill} />
          </View>
          <View style={styles.batteryTip} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 6,
    zIndex: 100,
  },
  sideBlockLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  notchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchPill: {
    width: 110,
    height: 26,
    backgroundColor: '#0F0E0D',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraCutout: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E1C1A',
    borderWidth: 1.5,
    borderColor: '#2A2724',
  },
  sensorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669', // Subtle active camera/status indicator
    opacity: 0.8,
  },
  sideBlockRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  sysIcon: {
    marginRight: 2,
  },
  batteryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 20,
    height: 10,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: COLORS.textPrimary,
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    width: '75%',
    height: '100%',
    backgroundColor: COLORS.textPrimary,
    borderRadius: 1,
  },
  batteryTip: {
    width: 1.5,
    height: 4,
    backgroundColor: COLORS.textPrimary,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
});
