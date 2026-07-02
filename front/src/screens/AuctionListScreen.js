import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useAppTheme } from '../theme/AppTheme';
import { fetchHomeDashboard, fetchCatalogo } from '../api/auctionApi';
import { fetchMetodosPago } from '../api/paymentApi';
import { getToken, getUser } from '../auth/authManager';
import { Ionicons as Icon } from '@expo/vector-icons';
import AppFooterNav from '../components/AppFooterNav';
import PhotoCarousel from '../components/PhotoCarousel';
import { decodeImageUri } from '../utils/imageUtils';
import { fetchProfile } from '../api/authApi';

const MAX_SLIDER_WIDTH = 280;

const PRICE_CEIL_BY_CURRENCY = {
  ARS: 200000,
  USD: 100000,
};
const DEFAULT_PRICE_CEIL = 200000;

export default function AuctionListScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const [subastas, setSubastas] = useState([]);
  const [profileFoto, setProfileFoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedCurrency, setSelectedCurrency] = useState('Todas');

  const token = getToken();
  const authUser = getUser();
  const isGuest = !token;
  const userName = authUser?.nombre || route?.params?.userName || 'Usuario';
  const [checkingAccessId, setCheckingAccessId] = useState(null);

  const handleIngresarSubasta = async (item) => {
    if (isGuest) {
      Alert.alert(
        'Acceso Denegado',
        'Debes iniciar sesión para ingresar a la subasta.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      setCheckingAccessId(item.identificador || item.id);

      const categoryRank = {
        'comun': 1,
        'especial': 2,
        'plata': 3,
        'oro': 4,
        'platino': 5
      };
      const userCategory = (authUser?.categoria || 'comun').toLowerCase();
      const auctionCategory = (item.categoria || 'comun').toLowerCase();
      const userCategoryRank = categoryRank[userCategory] || 1;
      const auctionCategoryRank = categoryRank[auctionCategory] || 1;

      const isCategoryAllowed = userCategoryRank >= auctionCategoryRank;

      const paymentMethods = await fetchMetodosPago();
      const hasPaymentMethod = paymentMethods && paymentMethods.length > 0;

      if (!isCategoryAllowed && !hasPaymentMethod) {
        Alert.alert(
          'Acceso Denegado',
          'No puedes ingresar a esta subasta por los siguientes motivos:\n• La subasta pertenece a una categoria mayor a la tuya.\n• No tienes ningun metodo de pago registrado.'
        );
      } else if (!isCategoryAllowed) {
        Alert.alert(
          'Acceso Denegado',
          'No puedes ingresar a esta subasta porque pertenece a una categoria mayor a la tuya.'
        );
      } else if (!hasPaymentMethod) {
        Alert.alert(
          'Acceso Denegado',
          'No puedes ingresar a esta subasta porque no tienes ningun metodo de pago registrado.'
        );
      } else {
        navigation.navigate('Bid', { product: item });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo verificar el acceso a la subasta. Intente nuevamente.');
    } finally {
      setCheckingAccessId(null);
    }
  };

  const priceCeil = PRICE_CEIL_BY_CURRENCY[selectedCurrency] || DEFAULT_PRICE_CEIL;
  const [priceRange, setPriceRange] = useState([0, DEFAULT_PRICE_CEIL]);
  const [minInput, setMinInput] = useState('0');
  const [maxInput, setMaxInput] = useState(String(DEFAULT_PRICE_CEIL));

  useEffect(() => {
    setPriceRange([0, priceCeil]);
    setMinInput('0');
    setMaxInput(String(priceCeil));
  }, [selectedCurrency]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        const authHeader = token ? `Bearer ${token}` : null;
        const data = await fetchHomeDashboard(authHeader);
        setSubastas(data?.subastasActivas || []);

        if (token) {
          try {
            const profileData = await fetchProfile(token);
            if (profileData?.foto) {
              setProfileFoto(`data:image/jpeg;base64,${profileData.foto}`);
            }
          } catch (profileErr) {
          }
        }
      } catch (err) {
        setError(err.message || 'Error al cargar subastas');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const categories = useMemo(() => {
    const unique = new Set(subastas.map((item) => (item.categoria || 'GENERAL').toString().toUpperCase()));
    return ['Todas', ...Array.from(unique)];
  }, [subastas]);

  const filteredSubastas = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return subastas.filter((item) => {
      const searchSource = [item.titulo, item.descripcion]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesText = !text || searchSource.includes(text);

      const matchesCategory =
        selectedCategory === 'Todas' || (item.categoria || '').toString().toUpperCase() === selectedCategory;

      const moneda = (item.moneda || 'ARS').toUpperCase();
      const matchesCurrency = selectedCurrency === 'Todas' || moneda === selectedCurrency;

      const precio = Number(item.precioBase ?? 0);
      const matchesRange =
        selectedCurrency === 'Todas' || (precio >= priceRange[0] && precio <= priceRange[1]);

      return matchesText && matchesCategory && matchesCurrency && matchesRange;
    });
  }, [subastas, searchText, selectedCategory, selectedCurrency, priceRange]);

  const formatPrice = (value, moneda = 'ARS') => {
    if (value == null || Number.isNaN(Number(value))) return '---';
    return `${moneda} ${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
  };

  const applyMinInput = () => {
    const val = Math.max(0, Math.min(Number(minInput) || 0, priceRange[1]));
    setPriceRange([val, priceRange[1]]);
    setMinInput(String(val));
  };

  const applyMaxInput = () => {
    const val = Math.min(priceCeil, Math.max(Number(maxInput) || 0, priceRange[0]));
    setPriceRange([priceRange[0], val]);
    setMaxInput(String(val));
  };

  const renderSubasta = ({ item }) => (
    <AuctionCard 
      item={item} 
      colors={colors} 
      radius={radius} 
      onPress={() => handleIngresarSubasta(item)}
      loadingAccess={checkingAccessId === (item.identificador || item.id)}
    />
  );

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
      <View style={[styles.profileHeaderRow, { paddingHorizontal: 16, marginTop: 12 }]}>
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

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Subastas activas</Text>
      </View>

      <FlatList
        data={filteredSubastas}
        keyExtractor={(item) => String(item.identificador || item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.filtersContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filtros</Text>

            <TextInput
              placeholder="Filtre por nombre"
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              style={[
                styles.searchInput,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
              ]}
            />

            <View style={styles.categoryRow}>
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: active ? colors.primary : colors.background, borderColor: colors.border },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={{ color: active ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.currencyRow}>
              {['Todas', 'ARS', 'USD'].map((currency) => {
                const active = selectedCurrency === currency;
                return (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyChip,
                      { backgroundColor: active ? colors.text : colors.background, borderColor: colors.border },
                    ]}
                    onPress={() => setSelectedCurrency(currency)}
                  >
                    <Text style={{ color: active ? '#fff' : colors.text, fontSize: 12, fontWeight: '700' }}>
                      {currency}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedCurrency === 'Todas' ? (
              <Text style={[styles.hintText, { color: colors.muted }]}>
                Elegí ARS o USD para filtrar por rango de precio
              </Text>
            ) : (
              <View style={styles.priceSliderWrap}>
                <View style={styles.priceInputsRow}>
                  <View style={styles.priceInputBox}>
                    <Text style={[styles.priceInputLabel, { color: colors.muted }]}>Mínimo</Text>
                    <TextInput
                      value={minInput}
                      onChangeText={setMinInput}
                      onBlur={applyMinInput}
                      onSubmitEditing={applyMinInput}
                      keyboardType="numeric"
                      style={[styles.priceInput, { borderColor: colors.border, color: colors.text }]}
                    />
                  </View>
                  <View style={styles.priceInputBox}>
                    <Text style={[styles.priceInputLabel, { color: colors.muted }]}>Máximo</Text>
                    <TextInput
                      value={maxInput}
                      onChangeText={setMaxInput}
                      onBlur={applyMaxInput}
                      onSubmitEditing={applyMaxInput}
                      keyboardType="numeric"
                      style={[styles.priceInput, { borderColor: colors.border, color: colors.text }]}
                    />
                  </View>
                </View>

                <View style={[styles.priceLabelsRow, { width: MAX_SLIDER_WIDTH }]}>
                  <Text style={[styles.priceLabelText, { color: colors.primary }]}>
                    {formatPrice(priceRange[0], selectedCurrency)}
                  </Text>
                  <Text style={[styles.priceLabelText, { color: colors.primary }]}>
                    {formatPrice(priceRange[1], selectedCurrency)}
                  </Text>
                </View>
                <View style={styles.sliderCenterWrap}>
                  <MultiSlider
                    values={priceRange}
                    min={0}
                    max={priceCeil}
                    step={selectedCurrency === 'USD' ? 50 : 1000}
                    sliderLength={MAX_SLIDER_WIDTH}
                    onValuesChange={(values) => {
                      setPriceRange(values);
                      setMinInput(String(values[0]));
                      setMaxInput(String(values[1]));
                    }}
                    selectedStyle={{ backgroundColor: colors.text }}
                    unselectedStyle={{ backgroundColor: colors.border }}
                    containerStyle={{ height: 24 }}
                    trackStyle={{ height: 3, borderRadius: 2 }}
                    markerStyle={[styles.sliderMarker, { borderColor: colors.text }]}
                    pressedMarkerStyle={styles.sliderMarkerPressed}
                  />
                </View>
              </View>
            )}
          </View>
        }
        renderItem={renderSubasta}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No hay subastas registradas.</Text>
          </View>
        }
      />

      <View style={{ backgroundColor: colors.surface }}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Auctions" />
      </View>
    </View>
  );
}

function AuctionCard({ item, colors, radius, onPress, loadingAccess }) {
  const fallbackUris = ['https://images.unsplash.com/photo-1513602855647-7dbafac0f632?auto=format&fit=crop&w=900&q=80'];

  const homeFoto = item.fotos && item.fotos.length > 0 ? item.fotos : (item.foto ? [item.foto] : []);
  const homeDecoded = homeFoto.map(decodeImageUri).filter(Boolean);
  const initialUris = homeDecoded.length > 0 ? homeDecoded : fallbackUris;

  const [photoUris, setPhotoUris] = useState(initialUris);

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
  
  const itemId = item.identificador || item.id;

  useEffect(() => {
    let mounted = true;

    const loadFullCatalogPhotos = async () => {
      try {
        if (!itemId) return;
        const data = await fetchCatalogo(itemId, null);
        if (!mounted) return;

        const fotos = data?.items?.[0]?.fotos || [];
        const decoded = fotos.map(decodeImageUri).filter(Boolean);
        if (decoded.length > 0) {
          setPhotoUris(decoded);
        }
      } catch {
      }
    };

    loadFullCatalogPhotos();
    return () => { mounted = false; };
  }, [itemId]);

  const isActive = item.estado != null
    ? String(item.estado).toLowerCase() === 'abierta'
    : true;
  const title = item.titulo || item.descripcion || `Subasta #${item.identificador}`;
  const price = item.precioBase != null
    ? `${item.moneda || 'ARS'} ${Number(item.precioBase).toLocaleString('es-AR')}`
    : '---';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <PhotoCarousel uris={photoUris} height={180} tag={(item.categoria || 'GENERAL').toUpperCase()} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]} numberOfLines={1}>
              {item.fecha ? `Empieza ${formatDate(item.fecha)}` : 'Fecha pendiente'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.priceText, { color: colors.primary }]}>{price}</Text>
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Precio inicial</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: !isActive ? colors.border : (loadingAccess ? colors.muted : colors.primary), borderRadius: radius.round }]}
          onPress={onPress}
          disabled={!isActive || loadingAccess}
        >
          {loadingAccess ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: isActive ? '#fff' : colors.muted }]}>
              {isActive ? 'Ingresar' : 'Finalizada'}
            </Text>
          )}

        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 4, gap: 12 },
  backBtn: { padding: 4 },
  header: { fontSize: 26, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 24 },

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
  cardBody: { padding: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginRight: 12 },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  cardButton: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  priceText: { fontSize: 16, fontWeight: '800' },
  priceLabel: { fontSize: 11, marginTop: 2 },
  buttonText: { fontSize: 14, fontWeight: '700' },

  filtersContainer: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 16 },
  filterTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  searchInput: { height: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, marginBottom: 14 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  currencyRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  currencyChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  hintText: { fontSize: 12, fontStyle: 'italic', textAlign: 'center' },

  priceSliderWrap: { alignItems: 'center' },
  priceInputsRow: { flexDirection: 'row', gap: 10, marginBottom: 12, width: MAX_SLIDER_WIDTH },
  priceInputBox: { flex: 1 },
  priceInputLabel: { fontSize: 11, marginBottom: 4 },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  priceLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  priceLabelText: { fontSize: 13, fontWeight: '700' },
  sliderCenterWrap: { alignItems: 'center' },
  sliderMarker: {
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sliderMarkerPressed: { height: 26, width: 26, borderRadius: 13 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', margin: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16 },

  profileHeaderRow: { marginBottom: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 16, fontWeight: '500' },
});