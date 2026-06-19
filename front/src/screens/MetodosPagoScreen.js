import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation} from '@react-navigation/native';
import { useAppTheme } from '../theme/AppTheme';
import { useMetodosPagoViewModel } from '../hooks/useMetodoPagoViewModel';
import { useRoute } from '@react-navigation/native';
import AppFooterNav from '../components/AppFooterNav';
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
function tipoLabel(tipo) {
  return { banco: 'Banco', tarjeta: 'Tarjeta', cheque: 'Cheque' }[tipo] ?? tipo;
}
 
// ─── Card de metodo ───────────────────────────────────────────────────────────
  function MetodoCard({ item, onEditar, onEliminar, theme, index }) {
    const { colors, spacing, radius } = theme;
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;
  
    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, delay: index * 60, useNativeDriver: true, tension: 90, friction: 11 }),
      ]).start();
    }, []);
  
    // ── Mapear campos del backend al display ──────────────────────────────────
    const datos = item.datos ?? {};
    console.log(datos)
  
    // Nombre principal según el tipo
    const nombre = {
      banco:   "Banco " + datos.nombreBanco    ?? 'Banco',
      tarjeta: "Tarjeta " + (datos.tipoTarjeta ? ` (${datos.tipoTarjeta})` : 'Tarjeta'),
      cheque:  'Cheque ',
    }[item.tipo] ?? item.tipo;
  
    // Detalle secundario (dígitos enmascarados o titular)
    const detalle = {
      banco:   datos.numeroCuenta   ? `${datos.nombreTitular}  •  ${datos.numeroCuenta}` : datos.nombreTitular,
      tarjeta: datos.numeroTarjeta  ? `${datos.nombreTitular}  •  ${datos.numeroTarjeta}` : datos.nombreTitular,
      cheque:  datos.numeroCheque   ? `Cheque N° ${datos.numeroCheque}` : '',
    }[item.tipo] ?? '';
  
    // Expira (solo tarjeta)
    const expira = item.tipo === 'tarjeta' && datos.fechaVencimiento
      ? datos.fechaVencimiento
      : null;
  
    // Badge de estado
    const estadoConfig = {
      verificado:  { label: 'Verificado',   bg: '#4CAF9A' },
      en_revision: { label: 'En revisión',  bg: '#F59E0B' },
      rechazado:   { label: 'Rechazado',    bg: '#EF4444' },
    };
    const estadoBadge = estadoConfig[item.estado] ?? null;
  
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: spacing.sm }}>
        <View style={[card.wrap, { backgroundColor: colors.primary, borderRadius: radius.sm }]}>
  
          {/* Fila superior: nombre + badge estado */}
          <View style={card.topRow}>
            <Text style={card.nombre}>{nombre}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {estadoBadge && (
                <View style={[card.badge, { backgroundColor: estadoBadge.bg }]}>
                  <Text style={card.badgeText}>{estadoBadge.label}</Text>
                </View>
              )}
              {expira && (
                <View style={[card.badge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text style={card.badgeText}>Expira {expira}</Text>
                </View>
              )}
            </View>
          </View>
  
          {/* Detalle */}
          {detalle ? <Text style={card.detalle}>{detalle}</Text> : null}
  
          {/* Divider */}
          <View style={card.divider} />
  
          {/* Acciones */}
          <View style={card.actions}>
            <TouchableOpacity style={card.actionBtn} onPress={() => onEditar(item)}>
              <Text style={card.actionIcon}>✏️</Text>
              <Text style={card.actionLabel}>Editar</Text>
            </TouchableOpacity>
  
            <View style={card.actionSep} />
  
            <TouchableOpacity style={card.actionBtn} onPress={() => onEliminar(item)}>
              <Text style={card.actionIcon}>🗑️</Text>
              <Text style={[card.actionLabel, { color: '#FF8A80' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }
 
const card = StyleSheet.create({
  wrap:        { padding: 16, shadowColor: '#183B70', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  topRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  nombre:      { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  detalle:     { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 12 },
  badge:       { backgroundColor: '#4CAF9A', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  badgeText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  actions:     { flexDirection: 'row', alignItems: 'center' },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionSep:   { width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.2)' },
  actionIcon:  { fontSize: 14 },
  actionLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
});
 
// ─── Modal confirmacion eliminar ──────────────────────────────────────────────
function ModalEliminar({ item, onConfirmar, onCancelar, theme }) {
  const { colors, radius } = theme;
  if (!item) return null;
 
  const datos = item.datos ?? {};
  const nombreDisplay = {
    banco:   datos.nombreBanco ?? 'este banco',
    tarjeta: datos.tipoTarjeta ? `Tarjeta ${datos.tipoTarjeta}` : 'esta tarjeta',
    cheque:  `Cheque N° ${datos.numeroCheque ?? ''}`,
  }[item.tipo] ?? 'este método de pago';
 
  return (
    <Modal transparent animationType="fade" visible={!!item} onRequestClose={onCancelar}>
      <View style={del.overlay}>
        <View style={[del.box, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
          <TouchableOpacity onPress={onCancelar} style={del.closeBtn}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
          <Text style={[del.titulo, { color: colors.text }]}>Eliminar metodo de pago</Text>
          <Text style={[del.cuerpo, { color: colors.muted }]}>
            ¿Seguro que querés eliminar{' '}
            <Text style={{ fontWeight: '700', color: colors.text }}>{nombreDisplay}</Text>?
            {' '}Esta accion no se puede deshacer.
          </Text>
          <View style={del.btnRow}>
            <TouchableOpacity onPress={onCancelar} style={[del.btn, { backgroundColor: colors.primarySoft, borderRadius: radius.round }]}>
              <Text style={[del.btnLabel, { color: colors.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirmar} style={[del.btn, { backgroundColor: '#C62828', borderRadius: radius.round }]}>
              <Text style={del.btnLabel}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
 
const del = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  box:      { width: '100%', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  closeBtn: { position: 'absolute', top: 12, right: 14, zIndex: 1 },
  titulo:   { fontSize: 16, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  cuerpo:   { fontSize: 13, lineHeight: 19, marginBottom: 20 },
  btnRow:   { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  btn:      { paddingHorizontal: 18, paddingVertical: 9 },
  btnLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
 
// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function MetodosDePago() {
  const theme = useAppTheme();
  const { colors, spacing, radius } = theme;
  const navigation = useNavigation();

  const { metodosPago, loading, cargarTodos, borrarMetodoPago } = useMetodosPagoViewModel();

  const [paraEliminar, setParaEliminar] = useState(null); 
  
  const route = useRoute();

  // 2. Disparamos la carga inicial al entrar a la pantalla.
  //    El cliente lo deriva el back del token (Authorization), no hace falta clienteId.
  useEffect(() => {
    cargarTodos();
  }, [route.params?.refresh]);

    async function confirmarEliminar() {

      const idReal = paraEliminar.id || paraEliminar.identificador;
      if (!idReal) {
        Alert.alert('Error', 'No se encontró el ID de este método de pago.');
        setParaEliminar(null);
        return;
      }
      
      if (!paraEliminar) return;
      try {
        await borrarMetodoPago(idReal, paraEliminar.tipo); // ← id + tipo: el clienteId lo agrega el ViewModel
      } catch (e) {
        Alert.alert('Error', 'No se pudo eliminar el metodo de pago.');
      } finally {
        setParaEliminar(null);
      }
    }

  // ── Editar → navega a AgregarMetodoPago en modo edicion ──────────────────
  function handleEditar(item) {
    navigation.navigate('AgregarMetodoPago', { metodoExistente: item });
  }

  // Nos aseguramos de que siempre sea un array para evitar errores al hacer .length
  const listaMetodos = metodosPago || [];
  const activos = listaMetodos.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ModalEliminar
        item={paraEliminar}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setParaEliminar(null)}
        theme={theme}
      />

      {/* Header */}
      <View style={[h.wrap, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[h.back, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[h.arrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Pill header: Metodos Guardados + X activos */}
      <View style={[h.pillRow, { paddingHorizontal: spacing.md, marginBottom: spacing.md }]}>
        <View style={[h.pill, { backgroundColor: colors.primary, borderRadius: radius.round }]}>
          <Text style={h.pillLabel}>Metodos Guardados</Text>
        </View>
        <TouchableOpacity>
          <Text style={[h.activosLabel, { color: colors.primary }]}>{activos} activos</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {activos === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ color: colors.muted, fontSize: 14, fontStyle: 'italic' }}>
                No tenés metodos de pago guardados.
              </Text>
            </View>
          ) : (
            listaMetodos.map((item, i) => (
              <MetodoCard
                key={`metodo-${item.tipo}-${item.id}`}
                item={item}
                index={i}
                theme={theme}
                onEditar={handleEditar}
                onEliminar={setParaEliminar}
              />
            ))
          )}
        </ScrollView>
      )}

      <View style={[fab.wrap, { bottom: 68, left: spacing.md, right: spacing.md }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AgregarMetodoPago')}
          style={[fab.btn, { backgroundColor: colors.primary, borderRadius: radius.lg }]}
        >
          <Text style={[fab.icon, { color: colors.accent }]}>+</Text>
          <Text style={fab.label}>Agregar nuevo metodo de pago</Text>
        </TouchableOpacity>

        <Text style={[fab.disclaimer, { color: colors.muted }]}>
          Sus datos estan cifrados. Al agregar un nuevo metodo de pago acepta nuestros{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>terminos y condiciones</Text>.
        </Text>
      </View>

      <View style={{ backgroundColor: colors.surface}}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="MetodosDePago" />
      </View>
    </SafeAreaView>
  );
}
 
const h = StyleSheet.create({
  wrap:        { flexDirection: 'row', alignItems: 'center' },
  back:        { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  arrow:       { fontSize: 22, lineHeight: 26, marginTop: -1 },
  pillRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill:        { paddingHorizontal: 16, paddingVertical: 8 },
  pillLabel:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  activosLabel:{ fontSize: 13, fontWeight: '600' },
});
 
const fab = StyleSheet.create({
  wrap:       { position: 'absolute' },
  btn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10, marginBottom: 8, shadowColor: '#183B70', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  icon:       { fontSize: 20, fontWeight: '300', lineHeight: 22 },
  label:      { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  disclaimer: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
 
const nav = StyleSheet.create({
  bar:   { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 8, paddingTop: 10, position: 'absolute', bottom: 0, left: 0, right: 0 },
  item:  { flex: 1, alignItems: 'center', gap: 3 },
  icon:  { fontSize: 20 },
  label: { fontSize: 10, letterSpacing: 0.2 },
});