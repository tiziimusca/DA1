import React, { useState, useEffect } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { getUser, getToken } from '../auth/authManager';
import { fetchHomeDashboard } from '../api/auctionApi';
import AppFooterNav from '../components/AppFooterNav';

const quickActions = [
  { id: 'metrics', title: 'Métricas', direccion: 'metricas', icon: '◔' },
  { id: 'item', title: 'Proponer Item', direccion: 'MisPropuestas', icon: '+' },
  { id: 'payments', title: 'Métodos de pago', direccion: 'MetodosDePago', icon: '▤' },
  { id: 'profile', title: 'Perfil', direccion: 'Profile', icon: '◉' },
];

export default function HomeScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const accessMode = route?.params?.accessMode || 'authenticated';
  const isGuest = accessMode === 'guest';
  
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authUser = getUser();
  const token = getToken();
  const userName = authUser?.nombre || route?.params?.userName || 'Usuario';

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const authHeader = isGuest ? null : (token ? `Bearer ${token}` : null);
        const data = await fetchHomeDashboard(authHeader);
        
        console.log('[HomeScreen] homeData fetched:', data);
        setHomeData(data);
      } catch (err) {
        console.error('[HomeScreen] Error fetching home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [isGuest, token]);

  const auctions = homeData?.subastasActivas || []; 
  const metricas = homeData?.metricas;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1 }}>
      {loading ? (
        <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
          <Text style={{ color: colors.text, textAlign: 'center', fontSize: 16 }}>Error al cargar datos: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={auctions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <View style={styles.topRow}>
                <TouchableOpacity
                  style={styles.profileRow}
                  activeOpacity={0.8}
                  disabled={!isGuest}
                  onPress={() => {
                    if (isGuest) {
                      navigation.navigate('Login');
                    }
                  }}
                >
                  <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>{isGuest ? 'i' : 'LG'}</Text>
                  </View>
                  <Text style={[styles.userName, { color: colors.text }]}>{isGuest ? 'Inicie Sesión' : userName}</Text>
                </TouchableOpacity>
              </View>

              {!isGuest && metricas ? (
                <>
                  <View style={styles.statsRow}>
                    <StatCard title="Subastas Activas" value={metricas.subastasActivas || '0'} colors={colors} radius={radius} />
                    <StatCard title="Subastas Ganadas" value={metricas.subastasGanadas || '0'} colors={colors} radius={radius} />
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceso rápido</Text>
                  <View style={styles.quickGrid}>
                    {quickActions.map((action) => (
                      <TouchableOpacity
                        key={action.id}
                        style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}
                        onPress={() => {
                          if (action.id === 'metrics') {
                            navigation.navigate('Metrics');
                            return;
                          }
                          navigation.navigate(action.direccion);
                        }}
                      >
                        <Text style={styles.quickIcon}>{action.icon}</Text>
                        <Text style={[styles.quickText, { color: colors.text }]}>{action.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}

              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Subastas activas</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Auctions')}>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>Ver todas</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <AuctionCard
              item={item}
              colors={colors}
              radius={radius}
            onPress={() => navigation.navigate('Catalog', { product: item })}
              isGuest={isGuest}
            />
          )}
          ListFooterComponent={
            isGuest ? (
              <View>
                <View style={[styles.guestBanner, { borderColor: colors.border }]}> 
                  <TouchableOpacity style={[styles.guestBannerBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.guestBannerBtnText}>Inicie sesión para acceder{`\n`}a todas las funcionalidades</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 16 }} />
              </View>
            ) : (
              <View style={{ height: 16 }} />
            )
          }
        />
      )}
      </View>
      <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Home" />
    </SafeAreaView>
  );
}

function StatCard({ title, value, colors, radius }) {
  return (
    <View style={[styles.statCard, { backgroundColor: '#9FC7EB', borderColor: colors.text, borderRadius: radius.md }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function AuctionCard({ item, colors, radius, onPress, isGuest }) {
  const defaultImages = [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80',
  ];
  
  // Use a consistent image based on item id for each auction
  const imageIndex = (item.identificador?.charCodeAt(0) || 0) % defaultImages.length;
  const image = defaultImages[imageIndex];
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Próximamente';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const price = !isGuest && item.precioBase ? `${item.moneda || 'USD'} ${item.precioBase.toFixed(2)}` : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.categoria || 'GENERAL'}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTextRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.titulo}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{formatDate(item.fecha)}</Text>
          </View>
          {price ? <Text style={[styles.cardPrice, { color: colors.primary }]}>{price}</Text> : null}
        </View>

        <TouchableOpacity style={[styles.cardBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]} onPress={onPress}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{isGuest ? 'Ver catálogo' : 'Ingresar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 18 },
  headerWrap: { marginBottom: 8 },
  topRow: { marginBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 16, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '400', marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  quickCard: { width: '48.5%', minHeight: 74, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  guestBanner: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginHorizontal: -14,
    marginBottom: 14,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  guestBannerBtn: { paddingHorizontal: 22, paddingVertical: 8, minWidth: 175, alignItems: 'center' },
  guestBannerBtnText: { color: '#fff', fontWeight: '600', fontSize: 11, textAlign: 'center', lineHeight: 14 },
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  imageWrap: { height: 128, position: 'relative', backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18, backgroundColor: '#111' },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  cardBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
  cardTextRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500' },
  cardSubtitle: { fontSize: 11, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  cardBtn: { alignSelf: 'center', minWidth: 140, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, paddingHorizontal: 18 },
});
