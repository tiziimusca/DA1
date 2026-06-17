import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput, Platform } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { fetchSubastas, fetchCatalogo } from '../api/auctionApi';
import { SERVER_BASE_URL } from '../config/apiConfig';
import AppFooterNav from '../components/AppFooterNav';
import { Ionicons as Icon } from '@expo/vector-icons';

const HOST_URL = SERVER_BASE_URL;

export default function AuctionListScreen({ navigation }) {
  const { colors, radius } = useAppTheme();
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [priceRange, setPriceRange] = useState({ min: 0, max: null });

  useEffect(() => {
    const loadSubastas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSubastas();
        setSubastas(data);
      } catch (err) {
        setError(err.message || 'Error al cargar subastas');
      } finally {
        setLoading(false);
      }
    };

    loadSubastas();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(subastas.map((item) => (item.categoria || 'GENERAL').toString().toUpperCase()));
    return ['Todas', ...Array.from(unique)];
  }, [subastas]);

  const filteredSubastas = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return subastas.filter((item) => {
      const searchSource = [item.titulo, item.nombre, item.descripcion, item.descripcion_catalogo]
        .filter(Boolean)
        .join(' ')
        .toString()
        .toLowerCase();
      const matchesText = !text || searchSource.includes(text);
      const matchesCategory = selectedCategory === 'Todas' || (item.categoria || '').toString().toUpperCase() === selectedCategory;
      const price = Number((item.precioBase ?? item.precio) || 0);
      const matchesMin = price >= priceRange.min;
      const matchesMax = priceRange.max == null || price <= priceRange.max;
      return matchesText && matchesCategory && matchesMin && matchesMax;
    });
  }, [subastas, searchText, selectedCategory, priceRange]);

  const formatPrice = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '---';
    const number = Number(value);
    return number.toLocaleString('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const renderSubasta = ({ item }) => {
    return <AuctionCard item={item} navigation={navigation} colors={colors} radius={radius} />;
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.errorText, { color: colors.primary }]}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon
          name="arrow-back"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
      <Text style={[styles.header, { color: colors.text }]}>Subastas</Text>
      <FlatList
        data={filteredSubastas}
        keyExtractor={(item) => String(item.identificador)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.filtersContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filtros</Text>
            <TextInput
              placeholder="Filtre por nombre"
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            />
            <View style={styles.categoryRow}>
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.border }]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={{ color: active ? '#fff' : colors.text, fontSize: 12 }}>{category}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
              <View style={styles.rangeRow}>
              <View style={[styles.rangeBox, styles.rangeGroup, { borderColor: colors.border }]}> 
                <Text style={[styles.rangeLabel, { color: colors.muted }]}>Mínimo</Text>
                <Text style={[styles.rangeValue, { color: colors.text }]}>{formatPrice(priceRange.min)}</Text>
                <View style={styles.rangeControls}>
                  <TouchableOpacity
                    style={[styles.rangeControlButton, { borderColor: colors.border }]}
                    onPress={() => setPriceRange((prev) => ({ ...prev, min: Math.max(0, prev.min - 1000) }))}
                  >
                    <Text style={{ color: colors.text }}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rangeControlButton, { borderColor: colors.border }]}
                    onPress={() => setPriceRange((prev) => ({ ...prev, min: prev.min + 1000 }))}
                  >
                    <Text style={{ color: colors.text }}>+ Min</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.rangeBox, styles.rangeGroup, { borderColor: colors.border }]}> 
                <Text style={[styles.rangeLabel, { color: colors.muted }]}>Máximo</Text>
                <Text style={[styles.rangeValue, { color: colors.text }]}>{priceRange.max ? formatPrice(priceRange.max) : 'Sin tope'}</Text>
                <View style={styles.rangeControls}>
                  <TouchableOpacity
                    style={[styles.rangeControlButton, { borderColor: colors.border }]}
                    onPress={() => setPriceRange((prev) => ({ ...prev, max: Math.max(0, (prev.max || 0) - 1000) }))}
                  >
                    <Text style={{ color: colors.text }}>- Max</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rangeControlButton, { borderColor: colors.border }]}
                    onPress={() => setPriceRange((prev) => ({ ...prev, max: (prev.max || 0) + 1000 }))}
                  >
                    <Text style={{ color: colors.text }}>+ Max</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        }
        renderItem={renderSubasta}
        
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No hay subastas registradas.</Text>
          </View>
        }
      />
      <View style={{ backgroundColor: colors.surface, paddingBottom: Platform.OS === 'android' ? 28 : 20 }}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Home" />
      </View>
    </View>
  );
}

function AuctionCard({ item, navigation, colors, radius }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [title, setTitle] = useState(item.titulo || item.descripcion || `Subasta #${item.identificador}`);
  const [description, setDescription] = useState(item.descripcion || item.descripcion_catalogo || 'Sin descripción disponible');

  useEffect(() => {
    let mounted = true;

    const resolveImageUri = (foto) => {
      if (!foto) return null;
      if (foto.startsWith('http')) return foto;
      if (foto.startsWith('/api/')) return `${HOST_URL}${foto}`;
      const cleaned = foto.replace(/[^0-9a-fA-F]/g, '');
      if (/^[0-9a-fA-F]+$/.test(cleaned) && cleaned.length >= 8) {
        const even = cleaned.length % 2 === 1 ? cleaned + '0' : cleaned;
        let out = '';
        for (let i = 0; i < even.length; i += 2) {
          out += String.fromCharCode(parseInt(even.substr(i, 2), 16));
        }
        if (out.startsWith('http')) return out;
      }
      return `data:image/jpeg;base64,${foto}`;
    };

    const loadCatalogPhoto = async () => {
      try {
        const subastaId = item.identificador || item.id;
        if (!subastaId) return;

        const data = await fetchCatalogo(subastaId, null);
        if (!mounted || !data?.items?.length) return;

        const firstItem = data.items[0];
        if (firstItem.titulo) {
          setTitle(firstItem.titulo);
        }
        if (firstItem.descripcion) {
          setDescription(firstItem.descripcion);
        }
        if (firstItem.fotos && firstItem.fotos.length > 0) {
          setPhotoUri(resolveImageUri(firstItem.fotos[0]));
        }
      } catch (err) {
        // ignore failed image fetches
      }
    };

    loadCatalogPhoto();
    return () => { mounted = false; };
  }, [item]);

  const isActive = String(item.estado || '').toLowerCase() === 'abierta';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}> 
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: photoUri || 'https://images.unsplash.com/photo-1513602855647-7dbafac0f632?auto=format&fit=crop&w=900&q=80' }} style={styles.cardImage} />
        <View style={[styles.tag, { backgroundColor: colors.primary }]}> 
          <Text style={styles.tagText}>{(item.categoria || 'GENERAL').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]} numberOfLines={1}>{item.fecha || 'Fecha pendiente'}</Text>
          </View>
          <Text style={[styles.priceText, { color: colors.primary }]}>{item.precioBase != null ? `${item.moneda || 'USD'} ${item.precioBase.toFixed(2)}` : item.precio != null ? `${item.moneda || 'USD'} ${Number(item.precio).toFixed(2)}` : '---'}</Text>
        </View>

        <Text style={[styles.cardDescription, { color: colors.text }]} numberOfLines={2}>{description}</Text>

        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: isActive ? colors.primary : colors.border, borderRadius: radius.round }]}
          onPress={() => isActive && navigation.navigate('Bid', { product: item })}
          disabled={!isActive}
        >
          <Text style={[styles.buttonText, { color: isActive ? '#fff' : colors.muted }]}>{isActive ? 'Ingresar' : 'Finalizada'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardImageWrap: {
    height: 180,
    position: 'relative',
    backgroundColor: '#eee',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tag: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rangeBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  rangeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  rangeGroup: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  rangeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rangeControlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rangeControlButton: {
    flex: 1,
    minWidth: 84,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginRight: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footer: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
  },
});
