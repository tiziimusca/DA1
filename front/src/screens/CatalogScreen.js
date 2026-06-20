import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { getToken, getUser, isAuthenticated } from '../auth/authManager';
import { fetchCatalogo } from '../api/auctionApi';
import { SERVER_BASE_URL } from '../config/apiConfig';
import { Ionicons as Icon } from '@expo/vector-icons';
import PhotoCarousel from '../components/PhotoCarousel';
import { decodeImageUri } from '../utils/imageUtils';

const HOST_URL = SERVER_BASE_URL;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_IMAGE_WIDTH = SCREEN_WIDTH - 32; // 16px padding a cada lado

// ─── Carrusel de fotos por ítem ──────────────────────────────────────────────

const carouselStyles = StyleSheet.create({
  wrap: { height: 220, position: 'relative', backgroundColor: '#ddd' },
  image: { width: CARD_IMAGE_WIDTH, height: 220 },
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
    bottom: 10,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    transition: 'width 0.2s',
  },
});

// ─── Card individual ─────────────────────────────────────────────────────────
function CatalogCard({ item, loggedIn, catalogoData, colors, radius }) {
  const imageUris = (item.fotos || []).map(decodeImageUri).filter(Boolean);
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
        },
      ]}
    >
      {/* Carrusel de fotos */}
      <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
        <PhotoCarousel uris={imageUris} height={220} tag={item.categoria} />

        {/* Tag categoría */}
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.categoria || 'PLATINO'}</Text>
        </View>
      </View>

      {/* Cuerpo */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.titulo}
          </Text>
          {loggedIn && item.precioBase != null && (
            <View style={styles.priceContainer}> 
              <Text style={[styles.price, { color: colors.primary }]}>
                {item.moneda || 'USD'} {item.precioBase.toFixed(2)}
              </Text>
              <Text style={{ color: colors.textMuted }}>
                Precio Inicial
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.startDate, { color: colors.muted }]}>
          Empieza: {catalogoData?.fecha || 'hoy, 20:00'}
        </Text>

        <Text
          style={[styles.description, { color: colors.text }]}
          numberOfLines={3}
        >
          {item.descripcion}
        </Text>

      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function CatalogScreen({ route, navigation }) {
  const { colors, radius } = useAppTheme();
  const subasta = route?.params?.product;
  const loggedIn = isAuthenticated();

  const subastaId = subasta?.id || subasta?.identificador;

  const [catalogoData, setCatalogoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getToken();

  useEffect(() => {
    const loadCatalogo = async () => {
      if (!subastaId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const authHeader = token ? `Bearer ${token}` : null;
        const data = await fetchCatalogo(subastaId, authHeader);
        setCatalogoData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogo();
  }, [subastaId, token]);

  if (!subasta) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Catálogo no encontrado
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              { backgroundColor: colors.primary, borderRadius: radius.round },
            ]}
          >
            <Text style={{ color: '#fff' }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const items = catalogoData?.items || [];
  const actionLabel = loggedIn
    ? 'Volver a la subasta'
    : 'Inicie sesión para acceder a todas las funcionalidades';

  const handleAction = () => {
    if (loggedIn) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={{ flex: 1 }}>
        {/* Botón atrás */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerWrap}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Error: {error}
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centerWrap}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No hay artículos en este catálogo
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.content}
            renderItem={({ item }) => (
              <CatalogCard
                item={item}
                loggedIn={loggedIn}
                catalogoData={catalogoData}
                colors={colors}
                radius={radius}
              />
            )}
            ListFooterComponent={
              <View>
                  <TouchableOpacity
                    style={[
                      styles.guestBannerBtn,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radius.round,
                      },
                    ]}
                    onPress={handleAction}
                  >
                    <Text style={styles.guestBannerBtnText}>{actionLabel}</Text>
                  </TouchableOpacity>
                <View style={{ height: 16 }} />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, marginTop: 60 },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  // Card
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 18,
  },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
  },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 18, fontWeight: '600', flex: 1, marginRight: 10 },
  subTitle: { fontSize: 13, marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  startDate: { fontSize: 12, marginBottom: 10, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '700' },

  // Footer banner
  guestBannerBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBannerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Empty / error
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, marginBottom: 12 },
  backBtn: { paddingHorizontal: 18, paddingVertical: 10 },
});
