import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isAuthenticated } from '../auth/authManager';

const defaultItems = [
  { key: 'Home', label: 'Inicio', icon: 'home-outline', routeName: 'Home' },
  { key: 'Auctions', label: 'Subastas', icon: 'hammer-outline', routeName: 'Auctions' },
  { key: 'MisPropuestas', label: 'Vender', icon: 'add-circle-outline', routeName: 'MisPropuestas' },
  { key: 'Profile', label: 'Perfil', icon: 'person-outline', routeName: 'Profile' },
];

export default function AppFooterNav({ navigation, colors, activeRouteName, items = defaultItems }) {
  if (!isAuthenticated()) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors?.surface ?? '#F5F5F5', borderTopColor: colors?.border ?? '#D1D5DB' }]}>
      {items.map((item) => {
        const isActive = activeRouteName === item.routeName;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.routeName)}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? (colors?.primary ?? '#2449B8') : (colors?.muted ?? '#4B5563')}
            />
            <Text style={[styles.label, { color: isActive ? (colors?.primary ?? '#2449B8') : (colors?.text ?? '#111827') }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});