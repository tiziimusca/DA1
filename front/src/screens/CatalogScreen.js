import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, FlatList } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { getToken, getUser, isAuthenticated } from '../auth/authManager';
import { fetchCatalogo } from '../api/auctionApi';

const HOST_URL = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'http://10.42.194.57:8080';

export default function CatalogScreen({ route, navigation }) {
  const { colors, radius } = useAppTheme();
  const subasta = route?.params?.product;
  const loggedIn = isAuthenticated();
  const user = getUser();

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
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Catálogo no encontrado</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]}>
            <Text style={{ color: '#fff' }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const items = catalogoData?.items || [];
  const actionLabel = loggedIn ? 'Volver a la subasta' : 'Inicie sesión para acceder a todas las funcionalidades';
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
        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerWrap}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Error: {error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centerWrap}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay artículos en este catálogo</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.content}
            ListFooterComponent={
              <View>
                <View style={[styles.guestBanner, { borderColor: colors.border }]}> 
                  <TouchableOpacity style={[styles.guestBannerBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]} onPress={handleAction}>
                    <Text style={styles.guestBannerBtnText}>{actionLabel}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 16 }} />
              </View>
            }
            renderItem={({ item }) => {
              let imageUri = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';
              if (item.fotos && item.fotos.length > 0) {
                const foto = item.fotos[0] || '';

                if (foto.startsWith('http')) {
                  imageUri = foto;
                } else if (foto.startsWith('/api/')) {
                  imageUri = `${HOST_URL}${foto}`;
                } else {
                  try {
                    const maybeUrl = decodeURIComponent(foto);
                    if (maybeUrl.startsWith('http')) {
                      imageUri = maybeUrl;
                    }
                  } catch (e) {
                  }

                  if (!imageUri || imageUri === 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80') {
                    const hexToAscii = (hex) => {
                      try {
                        const prefix = hex.match(/^[0-9a-fA-F]+/);
                        if (!prefix || !prefix[0] || prefix[0].length < 8) return null;
                        const cleaned = prefix[0];
                        const even = cleaned.length % 2 === 1 ? cleaned + '0' : cleaned;
                        let out = '';
                        for (let i = 0; i < even.length; i += 2) {
                          out += String.fromCharCode(parseInt(even.substr(i, 2), 16));
                        }
                        return out;
                      } catch (e) {
                        return null;
                      }
                    };

                    const decoded = hexToAscii(foto);
                    if (decoded && decoded.startsWith('http')) {
                      imageUri = decoded;
                    }
                  }

                  if (!imageUri || imageUri === 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80') {
                    const looksLikeBase64 = /^[A-Za-z0-9+/]+=*$/.test(foto.replace(/\s+/g, ''));
                    if (looksLikeBase64) {
                      imageUri = `data:image/jpeg;base64,${foto}`;
                    }
                  }
                }

                try {
                  console.log('Error con la imagen: ', { id: item.id, foto: foto.slice(0, 80) + (foto.length > 80 ? '...' : ''), imageUri });
                } catch (e) {}
              }

              return (
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
                  <View style={styles.imageWrap}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.image} 
                    />
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.categoria || 'PLATINO'}</Text>
                    </View>
                  </View>

                  <View style={styles.body}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.titulo}</Text>
                      {loggedIn && item.precioBase !== null && item.precioBase !== undefined ? (
                        <Text style={[styles.price, { color: colors.primary }]}>{item.moneda || 'USD'} {item.precioBase.toFixed(2)}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.subTitle, { color: colors.muted }]} numberOfLines={1}>{item.categoria ? item.categoria.toUpperCase() : 'Colección exclusiva'}</Text>
                    <Text style={[styles.description, { color: colors.text }]} numberOfLines={3}>{item.descripcion}</Text>
                    <Text style={[styles.startDate, { color: colors.muted }]}>Termina: {catalogoData?.fecha || 'hoy, 20:00'}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  guestBanner: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
  },
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
  header: { textAlign: 'center', fontSize: 18, fontWeight: '600' },
  card: { borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4, marginBottom: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardImage: { width: 120, height: 120, borderRadius: 16, backgroundColor: '#ddd' },
  cardDetails: { flex: 1, paddingLeft: 14, justifyContent: 'space-between' },
  imageWrap: { height: 220, position: 'relative', backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 10, right: 10, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600', flex: 1, marginRight: 10 },
  subTitle: { fontSize: 13, marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  startDate: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, marginBottom: 12 },
  backBtn: { paddingHorizontal: 18, paddingVertical: 10 },
});
