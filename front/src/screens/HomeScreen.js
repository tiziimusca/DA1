import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform, ScrollView, Dimensions } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { getUser, getToken } from '../auth/authManager';
import { fetchHomeDashboard, fetchCatalogo } from '../api/auctionApi';
import { SERVER_BASE_URL } from '../config/apiConfig';
import AppFooterNav from '../components/AppFooterNav';
import PhotoCarousel from '../components/PhotoCarousel';
import { decodeImageUri } from '../utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { fetchProfile } from '../api/authApi';

const HOST_URL = SERVER_BASE_URL;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_IMAGE_WIDTH = SCREEN_WIDTH - 28; // 14px padding cada lado

const quickActions = [
  { id: 'metrics', title: 'Métricas', direccion: 'Metrics', iconName: 'pie-chart-outline' },
  { id: 'item', title: 'Proponer item', direccion: 'MisPropuestas', iconName: 'add-circle-outline' },
  { id: 'payments', title: 'Métodos de pago', direccion: 'MetodosDePago', iconName: 'card-outline' },
  { id: 'profile', title: 'Perfil', direccion: 'Profile', iconName: 'person-outline' },
];

const defaultImages = [
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80',
];


const carouselStyles = StyleSheet.create({
  wrap: { position: 'relative', backgroundColor: '#ddd', overflow: 'hidden' },
  image: {},
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
    backgroundColor: '#111',
  },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  counter: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  counterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  dotsWrap: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: { height: 7, borderRadius: 4 },
});

// ─── AuctionCard ─────────────────────────────────────────────────────────────
function AuctionCard({ item, colors, radius, onPress, isGuest }) {
  const [photoUris, setPhotoUris] = useState(null); // null = cargando

  const itemId = item.identificador || item.id;
  const fallbackIndex = (String(itemId || '').charCodeAt(0) || 0) % defaultImages.length;
  const fallbackUris = [defaultImages[fallbackIndex]];

  const imageUris = (item.fotos || []).map(decodeImageUri).filter(Boolean);

  useEffect(() => {
    let mounted = true;
    const loadPhotos = async () => {
      try {
        if (!itemId) return;
        const data = await fetchCatalogo(itemId, null);
        if (!mounted) return;

        if (data?.items?.length > 0) {
          const fotos = data.items[0].fotos || [];
          const decoded = fotos
            .map(decodeImageUri)
            .filter(Boolean);
          if (decoded.length > 0) {
            setPhotoUris(decoded);
            return;
          }
        }
        setPhotoUris(fallbackUris);
      } catch {
        if (mounted) setPhotoUris(fallbackUris);
      }
    };
    loadPhotos();
    return () => { mounted = false; };
  }, [itemId]);

  const uris = photoUris || fallbackUris;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Próximamente';
    let parsedStr = dateStr;
    if (parsedStr.length === 10) {
      parsedStr = `${parsedStr}T00:00:00`;
    }
    if (parsedStr.includes('T') && !parsedStr.includes('-03:00') && !parsedStr.endsWith('Z')) {
      parsedStr = `${parsedStr}-03:00`;
    }
    return new Date(parsedStr).toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires',
    });
  };

  const price = !isGuest && item.precioBase
    ? `${item.moneda || 'USD'} ${item.precioBase.toFixed(2)}`
    : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <PhotoCarousel uris={uris} height={128} tag={item.categoria} />

      <View style={styles.cardBody}>
        <View style={styles.cardTextRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.titulo}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{formatDate(item.fecha)}</Text>
          </View>
          {price ? <Text style={[styles.cardPrice, { color: colors.primary }]}>{price}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.cardBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]}
          onPress={onPress}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {isGuest ? 'Ver catálogo' : 'Ingresar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── HomeScreen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const accessMode = route?.params?.accessMode || 'authenticated';
  const isGuest = accessMode === 'guest';

  const [homeData, setHomeData] = useState(null);
  const [profileFoto, setProfileFoto] = useState(null);
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

        if (token) {
          try {
            const profileData = await fetchProfile(token);
            if (profileData?.foto) {
              setProfileFoto(`data:image/jpeg;base64,${profileData.foto}`);
            }
          } catch (profileErr) {
            console.log('[HomeScreen] Error fetching profile:', profileErr);
          }
        }
      } catch (err) {
        console.log('[HomeScreen] Error fetching home data:', err);
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
            <Text style={{ color: colors.text, textAlign: 'center', fontSize: 16 }}>
              Error al cargar datos: {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={auctions}
            keyExtractor={(item) => String(item.identificador || item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerWrap}>
                <View style={styles.topRow}>
                  <TouchableOpacity
                    style={styles.profileRow}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isGuest) {
                        navigation.navigate('Login');
                      } else {
                        navigation.navigate('Profile');
                      }
                    }}
                  >
                    <View style={[styles.avatar]}>
                      <Image
                        source={{
                          uri:
                            profileFoto ||
                            'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                          }}
                          style={styles.avatar}
                      />
                    </View>
                    <Text style={[styles.userName, { color: colors.text }]}>
                      {isGuest ? 'Inicie Sesión' : userName}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isGuest && metricas ? (
                  <>
                    <View style={styles.statsRow}>
                      <StatCard title="Subastas Activas" value={metricas.subastasActivas || '0'} colors={colors} radius={radius} />
                      <StatCard title="Subastas Ganadas" value={metricas.subastasGanadas || '0'} colors={colors} radius={radius} />
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text, fontWeight: '700', fontSize: 24, marginTop: 10 }]}>Acceso rápido</Text>
                    <View style={styles.quickGrid}>
                      {quickActions.map((action) => (
                        <TouchableOpacity
                          key={action.id}
                          style={[
                            styles.quickCard,
                            {
                              backgroundColor: colors.metricsBackground,
                              borderColor: colors.text,
                              borderRadius: 22,
                              shadowColor: '#000',
                              shadowOpacity: 0.08,
                              shadowRadius: 4,
                              shadowOffset: { width: 0, height: 2 },
                              elevation: 2,
                            }
                          ]}
                          onPress={() => {
                            navigation.navigate(action.direccion);
                          }}
                        >
                          {action.id === 'payments' ? (
                            <View style={{ width: 36, height: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                              <Ionicons name="card-outline" size={28} color="#8E94A0" style={{ position: 'absolute', left: 0, top: 4 }} />
                              <Ionicons name="card-outline" size={28} color={colors.text} style={{ position: 'absolute', left: 6, top: 0 }} />
                            </View>
                          ) : (
                            <Ionicons name={action.iconName} size={30} color={colors.text} style={{ marginBottom: 6 }} />
                          )}
                          <Text style={[styles.quickText, { color: colors.text }]}>{action.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : null}

                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Subastas activas</Text>
                  {!isGuest && (
                    <TouchableOpacity onPress={() => navigation.navigate('Auctions')}>
                      <Text style={{ color: colors.primary, fontSize: 12 }}>Ver todas</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <AuctionCard
                item={item}
                colors={colors}
                radius={radius}
                onPress={() => navigation.navigate(isGuest ? 'Catalog' : 'Bid', { product: item })}
                isGuest={isGuest}
              />
            )}
            ListFooterComponent={
              isGuest ? (
                <View>
                  <View style={[styles.guestBanner, { borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.guestBannerBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]}
                      onPress={() => navigation.navigate('Login')}
                    >
                      <Text style={styles.guestBannerBtnText}>
                        Inicie sesión para acceder{`\n`}a todas las funcionalidades
                      </Text>
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
      <View style={{ backgroundColor: colors.surface}}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Home" />
      </View>
    </SafeAreaView>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ title, value, colors, radius }) {
  return (
    <View style={[styles.statCard, { backgroundColor: '#9FC7EB', borderColor: colors.text, borderRadius: radius.md }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, marginTop: 40 },
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
  quickCard: { width: '48.5%', minHeight: 106, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickText: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  guestBanner: { borderTopWidth: 1, borderBottomWidth: 1, marginHorizontal: -14, marginBottom: 14, paddingVertical: 6, alignItems: 'center', backgroundColor: '#E5E5E5' },
  guestBannerBtn: { paddingHorizontal: 22, paddingVertical: 8, minWidth: 350, alignItems: 'center' },
  guestBannerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center', lineHeight: 14 },
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  cardBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
  cardTextRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500' },
  cardSubtitle: { fontSize: 11, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  cardBtn: { alignSelf: 'center', minWidth: 350, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, paddingHorizontal: 18 },
});
