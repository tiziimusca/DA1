import React, { useState, useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, FlatList } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { getToken } from '../auth/authManager';
import { fetchCatalogo } from '../api/auctionApi';
import AppFooterNav from '../components/AppFooterNav';

const HOST_URL = Platform.OS === 'web'
  ? 'http://localhost:8080'
  : 'http://192.168.0.181:8080';

export default function CatalogScreen({ route, navigation }) {
  const { colors, radius } = useAppTheme();
  const subasta = route?.params?.product;

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
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Catalog" />
      </SafeAreaView>
    );
  }

  const items = catalogoData?.items || [];


  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <View style={{ width: 40 }} />
        </View>
        
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
            renderItem={({ item }) => {
              let imageUri = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';
              if (item.fotos && item.fotos.length > 0) {
                const foto = item.fotos[0];
                if (foto.startsWith('http')) {
                  imageUri = foto;
                } else if (foto.startsWith('/api/')) {
                  imageUri = `${HOST_URL}${foto}`;
                } else {
                  imageUri = `data:image/jpeg;base64,${foto}`;
                }
              }

              return (
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 16 }]}>
                  <View style={styles.imageWrap}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.image} 
                    />
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.categoria || 'GENERAL'}</Text>
                    </View>
                  </View>

                  <View style={styles.body}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.titulo}</Text>
                    <Text style={[styles.description, { color: colors.text }]} numberOfLines={3}>{item.descripcion}</Text>
                    
                    <Text style={[styles.startDate, { color: colors.muted }]}>
                      Empieza: {catalogoData?.fecha || 'Próximamente'}
                    </Text>
                    
                    {item.precioBase !== null && item.precioBase !== undefined ? (
                      <Text style={[styles.price, { color: colors.primary }]}>{item.moneda || 'USD'} {item.precioBase.toFixed(2)}</Text>
                    ) : null}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
      <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Catalog" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { padding: 16, paddingBottom: 24 },
  header: { textAlign: 'center', fontSize: 18, fontWeight: '600' },
  card: { borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  imageWrap: { height: 220, position: 'relative', backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 10, right: 10, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  startDate: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '700', marginTop: 10 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 16, marginBottom: 12 },
  backBtn: { paddingHorizontal: 18, paddingVertical: 10 },
});
