import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { fetchProfile } from '../api/authApi';
import { clearSession, getToken } from '../auth/authManager';
import AppFooterNav from '../components/AppFooterNav';
import Feather from '@expo/vector-icons/Feather'

export default function ProfileScreen({ navigation }) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = getToken();
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }

      try {
        const profileData = await fetchProfile(token);
        setProfile(profileData);
      } catch (error) {
        Alert.alert('Error', error.message || 'No se pudo cargar el perfil.');
      } finally {
        setIsLoading(false);
      }
    }

    const unsubscribe = navigation.addListener('focus', loadProfile);
    loadProfile();
    return unsubscribe;
  }, [navigation]);

  function handleConfirmLogout() {
    clearSession();
    setLogoutModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  const user = profile
    ? {
        nombre: profile.nombre,
        pais: profile.pais || '-',
        estado: profile.estado || '-',
        direccion: profile.direccion || '-',
        membresia: profile.categoria ? `Miembro ${profile.categoria}` : 'Miembro',
        foto: profile.foto ? `data:image/jpeg;base64,${profile.foto}` : null,
      }
    : {
        nombre: 'Cargando...',
        pais: '-',
        estado: '-',
        direccion: '-',
        membresia: 'Miembro',
        foto: null,
      };

  const menuItems = [
    {
      title: 'Métodos de Pago',
      icon: 'card-outline',
      onPress: () => navigation.navigate('MetodosDePago'),
    },
    {
      title: 'Métricas y Actividad',
      icon: 'stats-chart-outline',
      onPress: () => navigation.navigate('Metrics'),
    },
    {
      title: 'Artículos Propuestos',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('MisPropuestas'),
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ color: colors.text, fontSize: 16 }}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.layout}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon
                name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.headerTitle,
                { color: colors.text },
              ]}
            >
              Perfil
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EditProfile', { profile })
              }
            >
              <Icon
                name="settings-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user.foto ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              }}
              style={styles.avatar}
            />

            <Text
              style={[
                styles.name,
                { color: colors.text },
              ]}
            >
              {user.nombre}
            </Text>

            <View
              style={[
                styles.badge,
                { backgroundColor: '#DCE8FF' },
              ]}
            >
              <Text style={styles.badgeText}>
                {user.membresia.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View
              style={[
                styles.infoCard,
                { borderColor: colors.border },
              ]}
            >
              <Text style={styles.infoLabel}>PAÍS</Text>
              <Text>{user.pais}</Text>
            </View>

            <View
              style={[
                styles.infoCard,
                { borderColor: colors.border },
              ]}
            >
              <Text style={styles.infoLabel}>ESTADO</Text>

              <View style={styles.statusRow}>
                <View style={styles.greenDot} />
                <Text>{user.estado}</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.addressCard,
              { borderColor: colors.border },
            ]}
          >
            <Text style={styles.infoLabel}>DIRECCIÓN</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => {}} style={{ marginRight: 12 }}>
                <Feather name="map-pin" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ flex: 1 }}>{user.direccion}</Text>
            </View>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            CUENTA Y USO
          </Text>

          {menuItems.map(item => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={colors.text}
                />
                <Text
                  style={{
                    marginLeft: 12,
                    color: colors.text,
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

            <TouchableOpacity
              style={[
                styles.logoutBtn,
                { backgroundColor: '#E8C6CC' },
              ]}
              onPress={() => setLogoutModalVisible(true)}
            >
              <Text style={styles.logoutText}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

<View style={{ backgroundColor: colors.surface}}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Profile" />
      </View>
      </View>

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalIconWrap}>
              <Icon name="log-out-outline" size={24} color="#7A1D2F" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>¿Cerrar sesión?</Text>
            <Text style={[styles.modalText, { color: colors.muted }]}>Si confirmas, volverás al inicio y se cerrará la sesión actual.</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancelar</Text>
              </Pressable>

              <Pressable style={[styles.modalBtn, styles.modalBtnDanger]} onPress={handleConfirmLogout}>
                <Text style={styles.modalBtnTextDanger}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  layout: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    padding: 20,
    marginTop: 40,
    paddingBottom: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  name: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 12,
  },

  badge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2449B8',
  },

  row: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'space-between',
  },

  infoCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },

  addressCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },

  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'green',
    marginRight: 6,
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontWeight: '700',
    fontSize: 13,
  },

  menuItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  numberBadge: {
    backgroundColor: '#2449B8',
    borderRadius: 20,
    paddingHorizontal: 8,
    marginRight: 10,
  },

  numberBadgeText: {
    color: '#FFF',
    fontSize: 11,
  },

  logoutBtn: {
    marginTop: 24,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },

  logoutText: {
    color: '#7A1D2F',
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4D9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  modalText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },

  modalBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  modalBtnDanger: {
    backgroundColor: '#E8C6CC',
    borderColor: '#E8C6CC',
  },

  modalBtnText: {
    fontWeight: '600',
  },

  modalBtnTextDanger: {
    color: '#7A1D2F',
    fontWeight: '700',
  },
});