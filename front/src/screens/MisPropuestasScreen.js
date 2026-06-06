import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
 
// ─── Datos de ejemplo ──────────────────────────────────────────────────────────
const ARTICULOS = [
  {
    id: '1',
    titulo: 'Patek Philippe Nautilus 5711',
    fecha: 'Enviado Dic 12, 2024',
    estado: 'revision',
    imagen: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&q=80',
  },
  {
    id: '2',
    titulo: 'Pintura al óleo del siglo XIX',
    fecha: 'Enviado Sep 19, 2025',
    estado: 'rechazado',
    imagen: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=200&q=80',
  },
  {
    id: '3',
    titulo: 'Zapatillas de edición limitada',
    fecha: 'Enviado Oct 12, 2025',
    estado: 'aceptado',
    imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
  },
  {
    id: '4',
    titulo: 'Cámara Leica M3 Vintage',
    fecha: 'Enviado Ago 09, 2025',
    estado: 'revision',
    imagen: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&q=80',
  },
];
 
const TABS = [
  { key: 'todos',    label: 'Todos' },
  { key: 'revision', label: 'En revisión' },
  { key: 'aceptado', label: 'Aceptados' },
  { key: 'rechazado',label: 'Rechazados' },
];
 
// ─── Badge ─────────────────────────────────────────────────────────────────────
function EstadoBadge({ estado, theme }) {
  const { colors } = theme;
 
  const config = {
    revision: {
      label: 'En Revisión',
      bg: '#EBF2FC',
      text: colors.primary,       // #183B70
      border: colors.accent,      // #79AEEB
    },
    aceptado: {
      label: 'Aceptado',
      bg: '#E4F4EF',
      text: colors.success,       // #176F5B
      border: '#5BBD9F',
    },
    rechazado: {
      label: 'Rechazado',
      bg: '#FDECEA',
      text: '#C0392B',
      border: '#E8A09A',
    },
  };
 
  const c = config[estado];
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
              {item.titulo}
            </Text>
            <EstadoBadge estado={item.estado} theme={theme} />
          </View>
 
          {/* Fecha */}
          <Text style={[cardStyles.date, { color: colors.muted, marginTop: spacing.xs }]}>
            {item.fecha}
          </Text>
 
          {/* Ver progreso */}
          <TouchableOpacity style={[cardStyles.link, { marginTop: spacing.xs + 2 }]}>
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
export default function ArticulosPropuestos() {
  const theme = useAppTheme();
  const { colors, spacing, radius } = theme;
  const [tabActivo, setTabActivo] = useState('todos');
 
  const filtrados =
    tabActivo === 'todos' ? ARTICULOS : ARTICULOS.filter(a => a.estado === tabActivo);
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
 
      {/* ── Header ── */}
      <View style={[hStyles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, backgroundColor: colors.background }]}>
        <TouchableOpacity style={[hStyles.back, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        {filtrados.length === 0 ? (
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
      <View style={[fabStyles.wrap, { bottom: 72, left: spacing.md, right: spacing.md }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[fabStyles.btn, { backgroundColor: colors.primary, borderRadius: radius.lg }]}
        >
          <Text style={[fabStyles.icon, { color: colors.accent }]}>+</Text>
          <Text style={[fabStyles.label, { color: '#FFFFFF' }]}>Proponer Nuevo Artículo</Text>
        </TouchableOpacity>
      </View>
 
      {/* ── Bottom Nav ── */}
      <View style={[navStyles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {[
          { icon: '⌂', label: 'Inicio' },
          { icon: '◈', label: 'Subastas' },
          { icon: '◎', label: 'Vender', active: true },
          { icon: '◉', label: 'Perfil' },
        ].map(item => (
          <TouchableOpacity key={item.label} style={navStyles.item}>
            <Text style={[navStyles.icon, { color: item.active ? colors.primary : colors.muted }]}>{item.icon}</Text>
            <Text style={[navStyles.label, { color: item.active ? colors.primary : colors.muted, fontWeight: item.active ? '700' : '400' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
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