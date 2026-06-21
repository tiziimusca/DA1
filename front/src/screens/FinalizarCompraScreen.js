import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';

export default function FinalizarCompraScreen({ route, navigation }) {
  const { colors, spacing, radius } = useAppTheme();
  
  // Params passed from ProductDetailsScreen:
  // { productoId, opcion, costoEnvio, costoVerificacion, tituloProducto }
  const { opcion, costoEnvio, costoVerificacion, tituloProducto } = route.params || {};

  const resolvedOpcion = opcion || '';
  const resolvedCostoEnvio = costoEnvio ? parseFloat(costoEnvio) : 0;
  const resolvedCostoVerif = costoVerificacion ? parseFloat(costoVerificacion) : 0;
  const total = resolvedCostoEnvio + resolvedCostoVerif;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Resumen del Proceso</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Icon / Success Illustration */}
        <View style={styles.iconBox}>
          <View style={[styles.successCircle, { backgroundColor: '#1AAE6F' }]}>
            <Icon name="checkmark" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Cancelación Exitosa</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            El proceso de devolución del artículo se ha iniciado correctamente.
          </Text>
        </View>

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Detalles del Artículo</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.muted }]}>Artículo</Text>
            <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{tituloProducto || 'Producto'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.muted }]}>Método de Retorno</Text>
            <Text style={[styles.value, { color: colors.text, fontWeight: '700' }]}>
              {resolvedOpcion === 'envio' 
                ? 'Envío a domicilio' 
                : resolvedOpcion === 'retiro' 
                  ? 'Retiro en persona' 
                  : 'Ninguno (sin inspección)'}
            </Text>
          </View>
        </View>

        {/* Billing Breakdown Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Desglose de Costos</Text>
          
          {resolvedCostoVerif > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Costo de Verificación</Text>
              <Text style={[styles.value, { color: colors.text }]}>${resolvedCostoVerif.toFixed(2)}</Text>
            </View>
          )}

          {resolvedOpcion === 'envio' && resolvedCostoEnvio > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Costo de Envío / Traslado</Text>
              <Text style={[styles.value, { color: colors.text }]}>${resolvedCostoEnvio.toFixed(2)}</Text>
            </View>
          )}

          {total === 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Costos Pendientes</Text>
              <Text style={[styles.value, { color: '#1AAE6F', fontWeight: '700' }]}>Sin costos asociados</Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total a abonar</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.btnConfirm, { backgroundColor: colors.primary, borderRadius: radius.round }]} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnConfirmText}>Volver al Inicio</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 20 },
  iconBox: { alignItems: 'center', marginBottom: 28 },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1AAE6F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },
  detailsCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '600', maxWidth: '60%' },
  divider: { height: 1, marginVertical: 12 },
  totalLabel: { fontSize: 15, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  btnConfirm: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  btnConfirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
