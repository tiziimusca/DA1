import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import AppFooterNav from '../components/AppFooterNav';
import { getToken } from '../auth/authManager';
import { fetchMisPropuestos } from '../api/auctionApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
 
const TABS = [
  { key: 'todos',      label: 'Todos' },
  { key: 'enviado',    label: 'Enviados' },
  { key: 'revision',   label: 'En revisión' },
  { key: 'inspeccion', label: 'En inspección' },
  { key: 'aceptado',   label: 'Aceptados' },
  { key: 'rechazado',  label: 'Rechazados' },
  { key: 'finalizado', label: 'Finalizados' },
  { key: 'cancelado',  label: 'Cancelados' },
];
 
// ─── Badge ─────────────────────────────────────────────────────────────────────
function EstadoBadge({ estado, theme }) {
  const { colors } = theme;
 
  const normalizedState = (estado || '').replace('_', '').toLowerCase();
  const isEnviado = normalizedState === 'enviado';
  const isRevision = ['revision', 'enrevision'].includes(normalizedState);
  const isInspeccion = ['eninspeccion', 'inspecciontecnica'].includes(normalizedState);
  const isAceptado = ['aceptado', 'confirmado', 'publicado'].includes(normalizedState);
  const isRechazado = normalizedState === 'rechazado';
  const isFinalizado = normalizedState === 'finalizado';
  const isCancelado = normalizedState === 'cancelado';

  let c = { label: 'Desconocido', bg: '#EEE', text: '#555', border: '#CCC' };

  if (isEnviado) {
    c = { label: 'Enviado', bg: '#EBF2FC', text: colors.primary, border: colors.accent };
  } else if (isRevision) {
    c = { label: 'En Revisión', bg: '#E0E7FF', text: '#3730A3', border: '#818CF8' };
  } else if (isInspeccion) {
    c = { label: 'En Inspección', bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' };
  } else if (isAceptado) {
    c = { label: 'Aceptado', bg: '#E4F4EF', text: colors.success, border: '#5BBD9F' };
  } else if (isRechazado) {
    c = { label: 'Rechazado', bg: '#FDECEA', text: '#C0392B', border: '#E8A09A' };
  } else if (isFinalizado) {
    c = { label: 'Finalizado', bg: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' };
  } else if (isCancelado) {
    c = { label: 'Cancelado', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
  }

  return (
    <View style={[badgeStyles.wrap, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[badgeStyles.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}
 
const badgeStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
 
// ─── Card ──────────────────────────────────────────────────────────────────────
function ArticuloCard({ item, index, theme }) {
  const { colors, spacing, radius } = theme;
  const navigation = useNavigation();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 340, delay: index * 70, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay: index * 70, useNativeDriver: true, tension: 90, friction: 11 }),
    ]).start();
  }, []);
 
  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.972, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,     useNativeDriver: true, tension: 200, friction: 10 }).start();
 
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }], marginBottom: spacing.sm }}>
      <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut}
        style={[cardStyles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm }]}
      >
        {/* Imagen cuadrada */}
        <Image source={{ uri: item.imagen }} style={cardStyles.img} />
 
        {/* Contenido */}
        <View style={[cardStyles.body, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 }]}>
          {/* Fila título + badge */}
          <View style={cardStyles.row}>
            <Text style={[cardStyles.title, { color: colors.text, flex: 1 }]} numberOfLines={2}>
              {item.titulo || 'Sin título'}
            </Text>
            <EstadoBadge estado={item.estado} theme={theme} />
          </View>
 
          {/* Fecha */}
          <Text style={[cardStyles.date, { color: colors.muted, marginTop: spacing.xs }]}>
            {item.fecha}
          </Text>
 
          {/* Ver progreso */}
          <TouchableOpacity style={[cardStyles.link, { marginTop: spacing.xs + 2 }]}
          onPress={() => navigation.navigate('ProductDetails', { productoId: item.id, isPropuesto: true })}>
            <Text style={[cardStyles.linkText, { color: colors.primary }]}>VER PROGRESO</Text>
            <Text style={[cardStyles.linkArrow, { color: colors.primary }]}> ›</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
 
const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#1E2A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    top: 20,
  },
  img: {
    width: 90,
    height: 90,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  date: {
    fontSize: 11,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  linkArrow: {
    fontSize: 14,
    fontWeight: '700',
  },
});
 
// ─── Pantalla principal ────────────────────────────────────────────────────────
export default function ArticulosPropuestos({ navigation }) {
  const theme = useAppTheme();
  const { colors, spacing, radius } = theme;
  const [tabActivo, setTabActivo] = useState('todos');
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useFocusEffect(
    useCallback(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const token = getToken();
        const authHeader = token ? `Bearer ${token}` : null;
        const data = await fetchMisPropuestos(authHeader);
        
        if (mounted && data?.productos) {
          const mapped = data.productos.map(p => {
            let imgUri = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80';
            if (p.imagenUrl) {
              if (p.imagenUrl.startsWith('http') || p.imagenUrl.startsWith('data:')) {
                imgUri = p.imagenUrl;
              } else {
                  imgUri = `data:image/jpeg;base64,${p.imagenUrl}`;
              }
            }
            
            const dateObj = new Date(p.fechaEnvio);
            const dateStr = isNaN(dateObj.getTime()) ? p.fechaEnvio : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
            
            return {
              id: String(p.identificador),
              titulo: p.titulo || 'Sin título',
              fecha: `Enviado ${dateStr}`,
              estado: p.estado ? String(p.estado).toLowerCase() : 'enviado',
              imagen: imgUri,
            };
          });
          setArticulos(mapped);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Error al cargar mis propuestos');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadData();
    return () => { mounted = false; };
  }, [])
);
 
  const filtrados = tabActivo === 'todos' 
    ? articulos 
    : articulos.filter(a => {
        const st = (a.estado || '').replace('_', '').toLowerCase();
        if (tabActivo === 'enviado') return st === 'enviado';
        if (tabActivo === 'revision') return ['revision', 'enrevision'].includes(st);
        if (tabActivo === 'inspeccion') return ['eninspeccion', 'inspecciontecnica'].includes(st);
        if (tabActivo === 'aceptado') return ['aceptado', 'confirmado', 'publicado'].includes(st);
        if (tabActivo === 'rechazado') return st === 'rechazado';
        if (tabActivo === 'finalizado') return st === 'finalizado';
        if (tabActivo === 'cancelado') return st === 'cancelado';
        return false;
      });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, marginTop: 40 }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
 
      {/* ── Header ── */}
      <View style={[hStyles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, backgroundColor: colors.background }]}>
        <TouchableOpacity style={[hStyles.back, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Home')}>
          <Text style={[hStyles.backArrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[hStyles.title, { color: colors.text }]}>Artículos Propuestos</Text>
        <View style={{ width: 36 }} />
      </View>
 
      {/* ── Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[tStyles.container, { paddingHorizontal: spacing.md, gap: spacing.sm }]}
        style={{ flexGrow: 0, paddingBottom: spacing.sm }}
      >
        {TABS.map(tab => {
          const active = tabActivo === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setTabActivo(tab.key)}
              activeOpacity={0.75}
              style={[
                tStyles.tab,
                {
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 2,
                  borderRadius: radius.round,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[tStyles.label, { color: active ? '#FFFFFF' : colors.muted, fontWeight: active ? '700' : '500' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
 
      {/* ── Lista ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 14, color: '#C0392B', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : filtrados.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 13, color: colors.muted, fontStyle: 'italic' }}>
              Sin artículos en esta categoría
            </Text>
          </View>
        ) : (
          filtrados.map((item, i) => (
            <ArticuloCard key={item.id} item={item} index={i} theme={theme} />
          ))
        )}
        <View style={{ height: 96 }} />
      </ScrollView>
 
      {/* ── FAB ── */}
      <View style={[fabStyles.wrap, { bottom: Platform.OS === 'android' ? 110 : 100, left: spacing.md, right: spacing.md }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[fabStyles.btn, { backgroundColor: colors.primary, borderRadius: radius.lg }]}
          onPress={() => navigation.navigate('ProponerProducto')}
        >
          <Text style={[fabStyles.icon, { color: colors.accent }]}>+</Text>
          <Text style={[fabStyles.label, { color: '#FFFFFF' }]}>Proponer Nuevo Artículo</Text>
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: colors.surface}}>
        <AppFooterNav
          navigation={navigation}
          colors={colors}
          activeRouteName="Profile"
        />
      </View>
    </SafeAreaView>
  );
}
 
const hStyles = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center'},
  back:      { width: 36, height: 40, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 26, marginTop: -1 },
  title:     { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
});
 
const tStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', top: 4 },
  tab:       { borderWidth: 1 },
  label:     { fontSize: 13 },
});
 
const fabStyles = StyleSheet.create({
  wrap:  { position: 'absolute' },
  btn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10, shadowColor: '#183B70', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 8 },
  icon:  { fontSize: 20, fontWeight: '300', lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
});
 
const navStyles = StyleSheet.create({
  bar:   { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 8, paddingTop: 10 },
  item:  { flex: 1, alignItems: 'center', gap: 3 },
  icon:  { fontSize: 20 },
  label: { fontSize: 10, letterSpacing: 0.2 },
});