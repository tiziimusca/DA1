import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { isAuthenticated } from '../auth/authManager';
 
const defaultItems = [
  { key: 'Home', label: 'Inicio', icon: 'home-outline', routeName: 'Home', provider: 'Ionicons' },
  { key: 'Auctions', label: 'Subastas', icon: 'gavel', routeName: 'Auctions', provider: 'MaterialCommunityIcons' },
  { key: 'MisPropuestas', label: 'Vender', icon: 'add-circle-outline', routeName: 'MisPropuestas', provider: 'Ionicons' },
  { key: 'Profile', label: 'Perfil', icon: 'person-outline', routeName: 'Profile', provider: 'Ionicons' },
];
 
export default function AppFooterNav({ navigation, colors, activeRouteName, items = defaultItems }) {
  if (!isAuthenticated()) return null;
 
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors?.surface ?? '#F5F5F5', borderTopColor: colors?.border ?? '#D1D5DB' },
      ]}
    >
      {items.map((item) => {
        const isActive = activeRouteName === item.routeName;
        const IconComponent = item.provider === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.routeName)}
          >
            <IconComponent
              name={item.icon}
              size={22}
              color={isActive ? (colors?.primary ?? '#2449B8') : (colors?.muted ?? '#4B5563')}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? (colors?.primary ?? '#2449B8') : (colors?.muted ?? '#6B7280') },
              ]}
            >
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
    paddingTop: 6,
    // antes: paddingBottom fijo de 20-28 generaba espacio muerto.
    // Ahora se ajusta al safe-area real del dispositivo.
    paddingBottom: Platform.OS === 'ios' ? 6 : 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
});